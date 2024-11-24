const { getProductById, createProduct } = require('../models/productModel'); // 제품 모델에서 함수 가져오기
const docClient = require('../config/dbConfig');
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE; // 환경변수에서 테이블 이름 가져오기

// 제품 ID로 제품 정보를 조회하는 함수
const fetchProduct = async (productId) => {
  return await getProductById(productId); // 모델에서 제품 ID로 제품 정보 조회
};

// 제품 정보를 데이터베이스에 추가하는 함수
const createProductInDB = async (product) => {
  await createProduct(product); // 모델에서 제품 생성 함수 호출
};

// 상품 키워드 검색 함수
const searchProductsInDB = async (name) => {
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

module.exports = { fetchProduct, createProductInDB, searchProductsInDB }; // 함수 내보내기
