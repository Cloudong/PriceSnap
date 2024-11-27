const bcrypt = require("bcrypt");
const docClient = require("../config/dbConfig");
const { GetCommand, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

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

const createUser = async (userId, name, user_password) => {
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const user = {
        userId,
        name,
        user_password: hashedPassword,
        create_at: new Date().toISOString(),
    };
    const params = {
        TableName: USERS_TABLE,
        Item: user,
    };
    const command = new PutCommand(params);
    await docClient.send(command);

    return user;
};

const updateName = async (userId, newName) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: userId,
        },
        UpdateExpression: "SET name = :newName",
        ExpressionAttributeValues: {
            ":newName": newName,
        },
        ReturnValues: "UPDATED_NEW",
    };
    const command = new UpdateCommand(params);
    await docClient.send(command);
};

module.exports = { getUserById, createUser, updateName };
