import User from "../../Models/User.model.js";
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs'; 
import { generateHash, CompareHash, hashPII, comparePII } from '../../Utils/Encrypt/hashing.js';
import { OtpTypesEnum } from "../../Utils/enums/usersRoles.js";

const getAllUsersService = async () => {
    return await User.find().lean();
};

const getUserByIdService = async (id) => {
    return await User.findById(id).lean();
};

const registerService = async (newUserData) => {
    const user = await User.create(newUserData);
    const cleanUser = await User.findById(user._id, {
        password: 0,
        __v: 0
    }).lean();

    return cleanUser;
};

const loginService = async (email) => {
    return await User.findOne({ email });
};

const editUserService = async (id, user) => {
    return await User.findByIdAndUpdate(id, { $set: user }, { new: true }).lean();
};

const deleteUserService = async (id) => {
    return await User.findByIdAndDelete(id).lean();
};

const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email });
    
    if (!user) {
        return { resetOtp: null, user: null };
    }

    if (!user.verifiedAt) {
        throw new Error("Email must be verified before requesting password reset");
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = generateHash(resetOtp);

    user.resetPassword = {
        value: hashedOtp,
        createdAt: new Date(),  
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        otpType: OtpTypesEnum.RESET_PASSWORD
    };

    await user.save();
    return { resetOtp, user };
};


const resetPasswordService = async (email, otp, newPassword) => {
    const user = await User.findOne({ email });
    
    if (!user || !user.resetPassword?.value) {
        throw new Error("Invalid or expired OTP");
    }
    
    if (user.resetPassword.expiresAt < Date.now()) {
        throw new Error("OTP has expired");
    }
    
    if (user.resetPassword.otpType !== OtpTypesEnum.RESET_PASSWORD) {
        throw new Error("Invalid OTP type");
    }
    
    const isValidOtp = await CompareHash(otp, user.resetPassword.value);
    
    if (!isValidOtp) {
        throw new Error("Invalid OTP");
    }
    
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
        throw new Error("New password must be different from the old password");
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    
    user.resetPassword = undefined;
    
    await user.save();
    
    return user;
};

export {
    getAllUsersService,
    getUserByIdService,
    registerService,
    loginService,
    editUserService,
    deleteUserService,
    forgotPasswordService,
    resetPasswordService
};