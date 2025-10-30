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
    
    const hashedPassword = await bcrypt.hash(password, 10);

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
        }
    });

    try {
        const user = await Services.registerService(newUser);
        res.status(201).json({
            status: httpStatus.SUCCESS,
            data: user
        });
    } catch (err) {
        if (err.code === 11000) {
            return next(new AppError("The email is already signed", 400, httpStatus.FAIL));
        }
        next(err);
    }
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await Services.loginService(email);

    if (!user) {
        return next(new AppError("email and password doesn't match", 400, httpStatus.FAIL));
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (passwordMatched) {
        const token = Jwt.sign({ email: user.email, id: user.id, role: user.role }, process.env.JWT_KEY);
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
    deleteUser
};