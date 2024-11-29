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
    try {
        // 비밀번호 해싱 (솔트 값: 10)
        const hashedPassword = await bcrypt.hash(user_password, 10);
        const user = {
            userId,
            name,
            user_password: hashedPassword.toString(),
            created_at: new Date().toISOString(),
        };
        const params = {
            TableName: USERS_TABLE,
            Item: user,
        };
        const command = new PutCommand(params);
        await docClient.send(command);
        return user;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Could not create user");
    }
};

const updateNameById = async (userId, newName) => {
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

module.exports = { getUserById, createUser, updateNameById };
