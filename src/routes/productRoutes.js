const express = require("express");
const productHandler = require("../handlers/productHandler");

const router = express.Router();

// 상품 조회 라우트 - 사용X (테스트 위함)
router.get("/info/:productId", productHandler.getProduct);

// 상품 생성 라우트 - 사용X (테스트 위함)
router.post("/", productHandler.createProduct);

// 상품 검색 메인페이지 API 라우트
router.get("/search", productHandler.searchMainHandler);

// 상품 키워드 검색 API 라우트
router.get("/search/name", productHandler.searchProductsHandler);

// 상품 카테고리 검색 API 라우트
router.get("/search/category", productHandler.searchCategoryHandler);

// 물가 동향 조회 API 라우트
router.get("/trend", productHandler.getProductTrendHandler);

module.exports = router;
