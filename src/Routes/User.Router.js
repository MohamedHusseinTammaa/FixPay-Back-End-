import { Router } from "express";
import { checkSchema } from "express-validator";
import { verifyToken } from "../Middlewares/verifytoken.js";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../Middlewares/validationSchema.js";
import {localFileUpload} from '../multer/multer.js'
import express from "express"
import {
    editUser,
    getAllUsers,
    getUserById,
    deleteUser,
    register,
    login,
    confirmEmail,
    logout,
    forgotPassword,
    resetPassword,
    profileImage
} from "../Modules/User/user.controller.js";

const router = Router();


router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.patch("/:id", verifyToken, editUser);
router.delete("/:id", verifyToken, deleteUser);


router.post("/register", checkSchema(registerSchema), register);
router.post("/login", checkSchema(loginSchema), login);
router.post("/logout", verifyToken, logout);
router.post("/confirmEmail", verifyToken, confirmEmail);
router.post(
  "/upload",
verifyToken,
  localFileUpload({ customPath: "user" }).single("file",1),
  profileImage
);


router.post("/forgotPassword", checkSchema(forgotPasswordSchema), forgotPassword); 
router.post("/resetPassword", checkSchema(resetPasswordSchema), resetPassword);


export default router;
