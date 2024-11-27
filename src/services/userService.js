const { getUserById, createUser, updateName } = require("../models/userModel");

const fetchUser = async (userId) => {
    return await getUserById(userId);
};

const registerUser = async (userId, name, user_password) => {
    await createUser(userId, name, user_password);
};

const updateName = async (userId, newName) => {
    await updateName(userId, newName);
};

module.exports = { fetchUser, registerUser, updateName };
