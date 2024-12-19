const {
  getUserById,
  createUser,
  updateNameById,
} = require("../models/userModel");

//user 관련
const fetchUser = async (userId) => {
  return await getUserById(userId);
};

const registerUser = async (userId, name, user_password) => {
  await createUser(userId, name, user_password);
};

const updateName = async (userId, newName) => {
  await updateNameById(userId, newName);
};

module.exports = { fetchUser, registerUser, updateName };
