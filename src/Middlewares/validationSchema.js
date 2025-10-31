// import * as httpStatus from "../Utils/HttpStatusText.ts";
import validator from "validator";
import { Roles } from "../Utils/enums/usersRoles.js";
// import { AppError } from "../Utils/AppError.ts";


export const registerSchema = {
    "name.first": {
        isString: { errorMessage: "user's first name must be string!" },
        notEmpty: { errorMessage: 'you need to enter a "first name"' },
        isLength: { options: { min: 2, max: 32 }, errorMessage: "first name must be from 2 to 32 chars" }
    },
    "name.last": {
        isString: { errorMessage: "user's last name must be string!" },
        notEmpty: { errorMessage: 'you need to enter a "last name"' },
        isLength: { options: { min: 2, max: 32 }, errorMessage: "last name must be from 2 to 32 chars" }
    },
    userName: {
        isString: { errorMessage: "username must be string!" },
        notEmpty: { errorMessage: 'you need to enter a "username"' },
        isLength: { options: { min: 5, max: 32 }, errorMessage: "username must be from 5 to 32 chars" }
    },
    dateOfBirth: {
        notEmpty: { errorMessage: 'you need to enter a "date"' },
        isDate: { options: { format: "DD-MM-YYYY", strictMode: true }, errorMessage: 'you need to enter date in form "dd-mm-yyyy"' }
    },
    gender: {
        isBoolean: { errorMessage: "you need to enter gender 0 for male and 1 for female" },
        notEmpty: { errorMessage: 'you need to enter a "gender"' }
    },
    phoneNumber: {
        notEmpty: { errorMessage: "you need to enter a phone number" },
        isLength: { options: { min: 5, max: 32 }, errorMessage: "phone must be from 5 to 32 chars" },
        isMobilePhone: {
            options: ["ar-EG"],
            errorMessage: "phone number must be a valid Egyptian mobile number"
        }
    },
    email: {
        isEmail: { errorMessage: "you need to enter Email format !" },
        notEmpty: { errorMessage: "you need to enter an Email !" },
        isLength: { options: { min: 5, max: 100 }, errorMessage: "email must be from 5 to 100 chars" }
    },
    password: {
        isString: { errorMessage: "password must be string!" },
        notEmpty: { errorMessage: "you need to enter a password !" },
        isLength: { options: { min: 8, max: 100 }, errorMessage: "password must be from 8 to 100 chars" }
    },
    role: {
        optional: true,
        isString: { errorMessage: "role must be string!" },
        isIn: { options: [Object.values(Roles)], errorMessage: `role must be one of: ${Object.values(Roles).join(', ')}` }
    },
    ssn: {
        notEmpty: { errorMessage: "you need to enter SSN" },
        isNumeric: { errorMessage: "SSN must be numeric" },
        isLength: { 
            options: { min: 9, max: 14 },
            errorMessage: "SSN must be between 9 and 14 digits" 
        }
    }
    "address.government": {
        optional: true,
        isString: { errorMessage: "government must be string!" }
    },
    "address.city": {
        optional: true,
        isString: { errorMessage: "city must be string!" }
    },
    "address.street": {
        optional: true,
        isString: { errorMessage: "street must be string!" }
    }
};

export const loginSchema = {
    email: {
        trim: true,
        normalizeEmail: true,
        isEmail: { errorMessage: "you need to enter Email format !" },
        notEmpty: { errorMessage: "you need to enter an Email !" },
        isLength: { options: { min: 5, max: 100 }, errorMessage: "email must be from 5 to 100 chars" }
    },
    password: {
        isString: { errorMessage: "password must be string!" },
        notEmpty: { errorMessage: "you need to enter a password !" },
        isLength: { options: { min: 8, max: 100 }, errorMessage: "password must be from 8 to 100 chars" }
    }
};
