const { getUserById, createUser } = require('../models/userModel');

const fetchUser = async (userId) => {
  return await getUserById(userId);
};

const registerUser = async (user) => {
  await createUser(user);
};

module.exports = { fetchUser, registerUser };
