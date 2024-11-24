const express = require("express");
const productHandler = require("../handlers/productHandler");

const router = express.Router();

// 상품 조회 라우트
router.get("/:productId", productHandler.getProduct);

// 상품 생성 라우트
router.post("/", productHandler.createProduct);

// 상품 키워드 검색 라우트
router.get("/search", productHandler.createProduct);

module.exports = router;
