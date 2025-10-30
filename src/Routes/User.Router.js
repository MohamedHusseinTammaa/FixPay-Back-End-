import { Router } from "express";
import {checkSchema} from "express-validator";
import { verifyToken } from "../Middlewares/verifytoken.js";
import { loginSchema, registerSchema } from "../Middlewares/validationSchema.js";
// import {checkIndex} from "../Middlewares/checkIndex.ts"
import { editUser, getAllUsers, getUserById ,deleteUser, register, login,confirmEmail,logout} from "../Modules/User/user.controller.js";
// import { allowedTo } from "../Middlewares/allowedTo.ts";
// import { Roles } from "../Utils/usersRoles.ts";
// import {upload} from "../Middlewares/upload.ts";

const router = Router();

router.get(("/"),verifyToken,getAllUsers);
router.get("/:id",verifyToken,getUserById);
router.post("/register",checkSchema(registerSchema),register);
router.post("/login",checkSchema(loginSchema),login);
router.post('/logout',verifyToken,logout)
router.post('/confirmEmail',verifyToken,confirmEmail)
router.post('/logout',verifyToken,confirmEmail)
router.post('/logout',verifyToken,logout)
router.patch('/:id',verifyToken,editUser);
router.delete('/:id',verifyToken,deleteUser);
export default router 
