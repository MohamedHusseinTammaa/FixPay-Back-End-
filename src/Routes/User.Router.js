import { Router } from "express";
import { checkSchema } from "express-validator";
import { verifyToken } from "../Middlewares/verifytoken.js";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../Middlewares/validationSchema.js";
import { localFileUpload, memoryFileUpload } from '../multer/multer.js';
import * as UserInController from "../Modules/User/user.controller.js";
import { normalizeAuthFields } from "../Middlewares/normalizeInput.js";
import multer from "multer";
import express from "express"
import {
    editUser,
    getAllUsers,
    getUserById,
    deleteUser,
    register,
    login,
    confirmEmail,
    resendConfirmationOtp,
    logout,
    forgotPassword,
    resetPassword,
    resendResetPasswordOtp,
    profileImage,
    restoreDeletedAccount,
    googleLogin,
    completeProfile,
    verifyIdentity
} from "../Modules/User/user.controller.js";

const router = Router();


router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.patch("/:id", verifyToken, editUser);
router.delete("/:id", verifyToken, deleteUser);
router.post("/google", googleLogin );
router.post('/completeProfile',verifyToken,completeProfile)
router.post("/register", normalizeAuthFields, checkSchema(registerSchema), register);
router.post("/login", normalizeAuthFields, checkSchema(loginSchema), login);
router.post("/logout", verifyToken, logout);
router.post("/confirmEmail", verifyToken, confirmEmail);
router.post("/resend-confirmation-otp", verifyToken, resendConfirmationOtp);
localFileUpload({ customPath: "user" }).array("files", 1)
router.post("/verify-identity", 
    verifyToken,
    memoryFileUpload().fields([
        { name: "id_image", maxCount: 1 },
        { name: "live_image", maxCount: 1 }
    ]), 
    verifyIdentity
);
router.post("/forgotPassword", normalizeAuthFields, checkSchema(forgotPasswordSchema), forgotPassword); 
router.post("/resend-resetpassword-otp", normalizeAuthFields,checkSchema(forgotPasswordSchema), resendResetPasswordOtp);
router.post("/resetPassword", normalizeAuthFields, checkSchema(resetPasswordSchema), resetPassword);


export default router;
