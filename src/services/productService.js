const { getProductById, createProduct } = require('../models/productModel'); // 제품 모델에서 함수 가져오기
const docClient = require('../config/dbConfig');
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const ProductDTO = require('../dtos/productDTO'); // DTO 가져오기

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
    
    // 최종 응답 형식에 맞게 변환
    const products = result.Items.map(item => {
      const priceInfo = item.price_info.reduce((acc, price) => {
        // price_type에 따라 적절한 키에 가격을 매핑
        if (price.price_type === "현재") {
          acc.current_week_price = price.price;
        } else if (price.price_type === "전월") {
          acc.previous_month_price = price.price;
        } else if (price.price_type === "전주") {
          acc.previous_week_price = price.price;
        }
        return acc;
      }, {});

      // ProductDTO 인스턴스 생성
      return new ProductDTO(
        item.productId,
        item.product_name,
        priceInfo.current_week_price || null, // 기본값 설정
        priceInfo.previous_month_price || null, // 기본값 설정
        priceInfo.previous_week_price || null // 기본값 설정
      );
    });

    // 최종 응답 형식
    return { products };
  } catch (error) {
    console.error("Unable to scan products. Error JSON:", JSON.stringify(error, null, 2));
    throw new Error('Could not scan products');
  }
};

module.exports = { fetchProduct, createProductInDB, searchProductsInDB }; // 함수 내보내기
