import { Router } from "express";
import { checkSchema } from "express-validator";
import { verifyToken } from "../Middlewares/verifytoken.js";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../Middlewares/validationSchema.js";


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
    resetPassword
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


router.post("/forgotPassword", checkSchema(forgotPasswordSchema), forgotPassword); 
router.post("/resetPassword", checkSchema(resetPasswordSchema), resetPassword);


export default router;
