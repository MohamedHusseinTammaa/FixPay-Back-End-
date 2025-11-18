import mongoose from "mongoose";
import validator from "validator";
import { Roles } from "../Utils/enums/usersRoles.js";
import{OtpTypesEnum} from '../Utils/enums/usersRoles.js'
const usersSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    userName: {
        type: String,
        unique: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: Boolean // false = male, true = female
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        validate : [validator.isEmail,"field must be a valid email"]
    },
    password: {
        type: String,

    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role:{
        type: String,
        enum : [...Object.values(Roles)],
        default :Roles.user
    },
    avatar :{
        type : String,
        default: "uploads/default.png"
    },
    rating : {
        type :Number, //{1->5}
        default : 5
    },
    ssn : {
        type: Number,
        unique: true,
        sparse: true,
    },
    address :{
        government:String,
        city :String,
        street:String,
    }
    ,
    otp: {
        value: String,
        expiresAt: Date,
        otpType: {
            type:String,
            enum:[...Object.values(OtpTypesEnum)]
        }
    }
    ,
    verifiedAt:Date
});

const User = mongoose.model("Users", usersSchema, "Users");
export default User;
