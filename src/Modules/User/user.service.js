import User from "../../Models/User.model.js";

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

export {
    getAllUsersService,
    getUserByIdService,
    registerService,
    loginService,
    editUserService,
    deleteUserService
};