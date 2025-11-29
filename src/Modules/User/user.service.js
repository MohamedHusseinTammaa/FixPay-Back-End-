import User from "../../Models/User.model.js";
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs'; 
import { generateHash, CompareHash } from "../../Utils/Encrypt/hashing.js";

const getAllUsersService = async () => {
    return await User.find().lean();
};

const getUserByIdService = async (id) => {
    return await User.findById(id).lean();
};

const registerService = async (newUser) => {
    await newUser.save();
    const user = await User.find({ _id: newUser.id }, { password: 0, __v: 0 });
    return user;
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

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = generateHash(resetOtp);

    user.resetPassword = {
        otp: hashedOtp,
        expiresAt: Date.now() + 15 * 60 * 1000 
    };

    await user.save();

    return { resetOtp, user };
};

const resetPasswordService = async (email, otp, newPassword) => {
    const user = await User.findOne({ email });

    if (!user || !user.resetPassword?.otp) {
        throw new Error("Invalid or expired OTP");
    }

    if (user.resetPassword.expiresAt < Date.now()) {
        throw new Error("OTP has expired");
    }

    const isValidOtp = await CompareHash(otp, user.resetPassword.otp);
    
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