const docClient = require('../config/dbConfig');
const { GetCommand, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

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

// 상품 키워드 검색 함수
const queryProductsByName = async (name) => {
  const params = {
    TableName: PRODUCTS_TABLE,
    FilterExpression: 'contains(product_name, :partialName)', // 부분 일치 검색
    ExpressionAttributeValues: {
      ':partialName': name, // 부분 일치를 위한 값
    },
  };

  try {
    const command = new ScanCommand(params); // ScanCommand로 변경
    const result = await docClient.send(command);
    return result.Items; // 검색된 제품 반환
  } catch (error) {
    console.error("Unable to scan products. Error JSON:", JSON.stringify(error, null, 2));
    throw new Error('Could not scan products');
  }
};

module.exports = { createProduct, getProductById, queryProductsByName };