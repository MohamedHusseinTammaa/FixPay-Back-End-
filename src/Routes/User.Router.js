import { Router } from "express";
// import {checkSchema} from "express-validator";
import { verifyToken } from "../Middlewares/verifytoken.js";
// import { loginUserSchema ,addUserSchema} from "../Middlewares/validationSchemas.ts";
// import {checkIndex} from "../Middlewares/checkIndex.ts"
import { editUser, getAllUsers, getUserById ,deleteUser, register, login} from "../Modules/User/user.controller.js";
// import { allowedTo } from "../Middlewares/allowedTo.ts";
// import { Roles } from "../Utils/usersRoles.ts";
// import {upload} from "../Middlewares/upload.ts";

const router = Router();

router.get(("/"),verifyToken,getAllUsers);
router.get("/:id",verifyToken,getUserById);
router.post("/register",register);
router.post("/login",login);
router.patch('/:id',verifyToken,editUser);
router.delete('/:id',verifyToken,deleteUser);
export default router 
