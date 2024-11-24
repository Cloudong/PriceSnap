const docClient = require('../config/dbConfig');
const { GetCommand, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

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

// 제품 이름으로 제품 검색하는 함수
const queryProductsByName = async (name) => {
  const params = {
    TableName: PRODUCTS_TABLE,
    IndexName: 'product_name-index', // GSI 이름
    KeyConditionExpression: 'product_name = :name', // 정확한 일치 검색
    FilterExpression: 'contains(product_name, :partialName)', // 부분 일치 검색
    ExpressionAttributeValues: {
      ':name': name,           // 정확한 일치를 위한 값
      ':partialName': name,    // 부분 일치를 위한 값
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await docClient.send(command);
    return result.Items; // 검색된 제품 반환
  } catch (error) {
    console.error("Unable to query products. Error JSON:", JSON.stringify(error, null, 2));
    throw new Error('Could not query products');
  }
};

module.exports = { createProduct, getProductById, queryProductsByName };