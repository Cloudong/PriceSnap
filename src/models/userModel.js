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

// 사용자의 cart를 업데이트
const updateCartById = async (user) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: user.userId, // user 객체에서 userId를 가져옵니다.
        },
        UpdateExpression: "SET #cart = :cart",
        ExpressionAttributeNames: {
            "#cart": "cart", // 예약어 처리
        },
        ExpressionAttributeValues: {
            ":cart": user.cart, // 업데이트할 cart 정보
        },
        ReturnValues: "UPDATED_NEW",
    };

    const command = new UpdateCommand(params);
    await docClient.send(command);
};

// 사용자의 budget을 업데이트
const updateBudgetById = async (user) => {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            userId: user.userId, // user 객체에서 userId를 가져옵니다.
        },
        UpdateExpression: "SET #budget = :budget",
        ExpressionAttributeNames: {
            "#budget": "budget", // 예약어 처리
        },
        ExpressionAttributeValues: {
            ":budget": user.budget, // 업데이트할 budget 정보
        },
        ReturnValues: "UPDATED_NEW",
    };

    const command = new UpdateCommand(params);
    await docClient.send(command);
};

module.exports = { 
    getUserById, 
    createUser, 
    updateNameById, 
    updateCartById, 
    updateBudgetById 
};
