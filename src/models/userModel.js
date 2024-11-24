const docClient = require('../config/dbConfig');
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const USERS_TABLE = process.env.USERS_TABLE;

const getUserById = async (userId) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { userId },
  };
  const command = new GetCommand(params);
  const { Item } = await docClient.send(command);
  return Item;
};

const createUser = async (user) => {
  const params = {
    TableName: USERS_TABLE,
    Item: user,
  };
  const command = new PutCommand(params);
  await docClient.send(command);
};

module.exports = { getUserById, createUser };
