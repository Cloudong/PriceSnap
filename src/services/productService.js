const { getProductById, createProduct, queryProductsByName } = require('../models/productModel'); // 제품 모델에서 함수 가져오기

// 제품 ID로 제품 정보를 조회하는 함수
const fetchProduct = async (productId) => {
  return await getProductById(productId); // 모델에서 제품 ID로 제품 정보 조회
};

// 제품 정보를 데이터베이스에 추가하는 함수
const createProductInDB = async (product) => {
  await createProduct(product); // 모델에서 제품 생성 함수 호출
};

// 제품 이름으로 제품 검색하는 함수
const searchProductsInDB = async (name) => {
  return await queryProductsByName(name); // 모델에서 이름으로 제품 검색
};


module.exports = { fetchProduct, createProductInDB, searchProductsInDB }; // 함수 내보내기
