import mongoose from "mongoose";
import validator from "validator";
import { Roles } from "../../Utils/usersRoles.ts";
const usersSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    userName: {
        type: String,
        required: true
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
        required: true,
        unique: true,
        validate : [validator.isEmail,"field must be a valid email"]
    },
    password: {
        type: String,
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role:{
        type: String,
        enum : [...Object.values(Roles)],
        default :Roles.USER
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
        type:Number,
        required:true
    },
    address :{
        government:String,
        city :String,
        street:String,
        required:true
    }
});

const User = mongoose.model("Users", usersSchema, "Users");
export default User;
