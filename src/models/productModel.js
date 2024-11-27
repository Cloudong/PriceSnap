const docClient = require("../config/dbConfig");
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE; // 환경변수에서 테이블 이름 가져오기

// 상품 조회 함수
const getProductById = async (productId) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        Key: { productId },
    };
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    return Item;
};

// 상품 생성 함수
const createProduct = async (product) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        Item: product,
    };
    const command = new PutCommand(params);
    await docClient.send(command);
};

module.exports = { createProduct, getProductById };
