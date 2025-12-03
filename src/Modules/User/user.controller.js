import { validationResult } from "express-validator";
import User from "../../Models/User.model.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config';
import { asyncWrapper } from "../../Utils/Errors/ErrorWrapper.js";
import * as httpStatus from "../../Utils/Http/httpStatusText.js";
import * as httpMessage from "../../Utils/Http/HttpDataText.js";
import { AppError } from "../../Utils/Errors/AppError.js";
import * as Services from "./user.service.js";
import { generateHash, CompareHash } from '../../Utils/Encrypt/hashing.js';
import { OtpTypesEnum, Roles } from '../../Utils/enums/usersRoles.js';
import { localEmmiter, htmlOtpTemp, htmlResetPasswordOtpTemp } from '../../Utils/Services/sendEmail.service.js';
import blackListedTokenModel from '../../Models/blackListedToken.model.js';
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from "nanoid";
import cloudinary from "../../Utils/cloud/cloudinary.js";
import fs from "fs";
const generateOtp = customAlphabet('0123456789', 6);

const getAllUsers = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }

    const users = await Services.getAllUsersService();

    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: { users },
    });
});

const getUserById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL));
    }
    const user = await Services.getUserByIdService(id);

    if (!user) {
        return next(new AppError(httpMessage.NOT_FOUND, 404, httpStatus.FAIL));
    }

    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: user,
    });
});

const register = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array()));
    }

    // Safer destructuring approach
    const { name, userName, dateOfBirth, gender, phoneNumber, email, password, role, avatar, ssn, address } = req.body;
    if (role === Roles.worker && !ssn) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, "worker must add his ssn"));
    }

    let parsedDateOfBirth = dateOfBirth;
    if (dateOfBirth) {
        const [day, month, year] = dateOfBirth.split("-");
        parsedDateOfBirth = new Date(year, month - 1, day);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashOtp = generateHash(otp);

    console.log('📧 Registration OTP:', otp);

    const confirmationOtp = {
        value: hashOtp,
        expiresAt: new Date(Date.now() + 600000),
        otpType: OtpTypesEnum.CONFIRMATION
    }

    const newUser = new User({
        name: {
            first: name.first,
            last: name.last
        },
        userName,
        dateOfBirth: parsedDateOfBirth,
        gender,
        phoneNumber,
        email,
        password: hashedPassword,
        role,
        avatar,
        ssn,
        address: {
            government: address.government,
            city: address.city,
            street: address.street
        },
        otp: confirmationOtp
    });

    try {
        const user = await Services.registerService(newUser);
        res.status(201).json({
            status: httpStatus.SUCCESS,
            data: user
        });
    } catch (err) {
        if (err.code === 11000) {

            return next(new AppError("the email is already registered", 400, httpStatus.FAIL))
        }
        next(err);
    }
    localEmmiter.emit('sendEmail', { to: email, subject: "OTP for sign Up", content: htmlOtpTemp(otp) })
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array()));
    }
    const user = await Services.loginService(email);
    console.log({ user })
    if (!user) {
        console.log("not found");

    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (passwordMatched) {
        const token = Jwt.sign(
            { email: user.email, _id: user._id, role: user.role, jti: uuidv4() },
            process.env.JWT_KEY,
            { expiresIn: '30m' } 
        );


        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: user.email,
            message: "successfully signed",
            token: token
        });
    }

    return res.status(400).json({
        status: httpStatus.FAIL,
        data: null,
        message: "email and password doesn't match",
        details: null
    });
});

const confirmEmail = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }
    const { otp } = req.body
    const user = await User.findById(req.currentUser._id)
    const otpValue = user.otp?.value

    console.log({ user });

    const isOtpMatch = await CompareHash(otp, otpValue
    )
    if (isOtpMatch) {
        await User.findByIdAndUpdate(user._id, { verifiedAt: Date.now() });
        return res.status(200).json({
            status: httpStatus.SUCCESS,
            data: "Your Email is verified Now ",
        });
    }
    res.status(401).json({
        status: httpStatus.FAIL,
        data: "Wrong Otp",
    });
});

const logout = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }
    const token = req.currentUser
    console.log({ tokenJTI: token.jti });

    const data = await blackListedTokenModel.create({
        tokenId: req.currentUser.jti,
        expiresAt: new Date(Date.now())
    });

    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: data,
        message: "logged out successfully"
    });
});

const editUser = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }

    const { id } = req.params;
    const { body } = req;
    if (!id || !body) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL));
    }
    const updated = await Services.editUserService(id, body);

    if (!updated) {
        return next(new AppError(httpMessage.NOT_FOUND, 404, httpStatus.FAIL));
    }

    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: updated,
    });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL));
    }
    const deleted = await Services.deleteUserService(id);

    if (!deleted) {
        return next(new AppError(httpMessage.NOT_FOUND, 404, httpStatus.FAIL));
    }

    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: deleted,
    });
});

const forgotPassword = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }

    const { email } = req.body;

    try {
        const { resetOtp, user } = await Services.forgotPasswordService(email);

        if (!user) {
            return res.status(200).json({
                status: httpStatus.SUCCESS,
                message: "If the email exists and is verified, a reset OTP has been sent"
            });
        }

        console.log('🔑 Reset Password OTP:', resetOtp);

        localEmmiter.emit('sendEmail', {
            to: email,
            subject: "إعادة تعيين كلمة المرور - Password Reset OTP",
            content: htmlResetPasswordOtpTemp(resetOtp)
        });

        return res.status(200).json({
            status: httpStatus.SUCCESS,
            message: "Reset OTP has been sent to your email"
        });

    } catch (error) {
        if (error.message === "Email must be verified before requesting password reset") {
            return next(new AppError("Please verify your email before requesting a password reset", 403, httpStatus.FAIL));
        }
        
        console.error("Forgot password error:", error);
        return next(new AppError("An error occurred while processing your request", 500, httpStatus.ERROR));
    }
});

const resetPassword = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return next(new AppError("Email, OTP and new password are required", 400, httpStatus.FAIL));
    }

    try {
        await Services.resetPasswordService(email, otp, newPassword);

        res.status(200).json({
            status: httpStatus.SUCCESS,
            message: "Password reset successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 400, httpStatus.FAIL));
    }
});




const profileImage = asyncWrapper(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("No file uploaded", 400, httpStatus.FAIL));
    }

    const localFilePath = req.file.path;
    const result = await cloudinary.uploader.upload(localFilePath, {
        folder: `FixPay/users/${req.currentUser._id}`

    });

    //  fs.unlink(localFilePath, () => {});

    console.log(result.secure_url);

    const user = await User.findByIdAndUpdate(
        req.currentUser._id,
        { avatar: result.secure_url },
        { new: true }
    );
    
    return res.status(200).json({
        message: "Profile image updated successfully",
        file: user
    });
});


export {
    getAllUsers,
    getUserById,
    register,
    editUser,
    login,
    deleteUser,
    confirmEmail,
    logout,
    forgotPassword,
    resetPassword,
    profileImage
};