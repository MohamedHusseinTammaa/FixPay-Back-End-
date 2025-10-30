import {validationResult } from "express-validator";
import User from "../../Models/User.model.js";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config';
import { asyncWrapper } from "../../Utils/Errors/ErrorWrapper.js";
import * as httpStatus from "../../Utils/Http/httpStatusText.js";
import * as httpMessage from "../../Utils/Http/HttpDataText.js";
import { AppError } from "../../Utils/Errors/AppError.js";
import * as Services from "./user.service.js";
import { customAlphabet } from "nanoid";
import {generateHash} from '../../Utils/Encrypt/hashing.js'
import {OtpTypesEnum} from '../../Utils/enums/usersRoles.js'
import {localEmmiter} from '../../Utils/Services/sendEmail.service.js'
import{htmlOtpTemp} from '../../Utils/Services/sendEmail.service.js'
import blackListedTokenModel from'../../Models/blackListedToken.model.js'
import { v4 as uuidv4 } from 'uuid';

const generateOtp = customAlphabet('0123456789', 6)

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

    let parsedDateOfBirth = dateOfBirth;
    if (dateOfBirth) {
        const [day, month, year] = dateOfBirth.split("-");
        parsedDateOfBirth = new Date(year, month - 1, day);
    }

    const isEmailExist =await User.findOne({filter:email})
    if(isEmailExist)
    {
        return res.status(409).JSON({message:`${email} is Already Exist`})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp()
    const hashOtp = generateHash(otp)
    console.log(otp);
    const confirmationOtp = {
        value: hashOtp,
        expiresAt: new Date(Date.now() + 600000),
        otpType: OtpTypesEnum.CONFIRMATION
    }
    localEmmiter.emit('sendEmail', { to: email, subject: "OTP for sign Up", content: htmlOtpTemp(otp) })
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
        otp:confirmationOtp
    });

    try {
        const user = await Services.registerService(newUser);
        res.status(201).json({
            status: httpStatus.SUCCESS,
            data: user
        });
    } catch (err) {
       
        next(err);
    }
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array()));
    }
    const user = await Services.loginService(email);

    if (!user) {
        return next(new AppError("email and password doesn't match", 400, httpStatus.FAIL));
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (passwordMatched) {
        const token = Jwt.sign({ email: user.email, id: user.id, role: user.role ,jti: uuidv4()}, process.env.JWT_KEY);
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
    const {otp}=req.body
    const user= req.currentUser
await User.findByIdAndUpdate(user._id, { verifiedAt: Date.now() });
    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: "Your Email is verified Now ",
    });
});

const logout = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new AppError(httpMessage.BAD_REQUEST, 400, httpStatus.FAIL, errors.array())
        );
    }
    const token=req.currentUser
    console.log({tokenJTI:token.jti});
    
  const data=  await blackListedTokenModel.create({
    tokenId: req.currentUser.jti,
    expiresAt: new Date(Date.now())
});

    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: data,
        message:"logged out successfully"
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

export {
    getAllUsers,
    getUserById,
    register,
    editUser,
    login,
    deleteUser,
    confirmEmail,
    logout
};