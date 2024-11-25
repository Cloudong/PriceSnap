const express = require("express");
const productHandler = require("../handlers/productHandler");

const router = express.Router();

// 상품 생성
router.post("/products", productHandler.createProduct);

// 상품 조회
router.get("/products/:productId", productHandler.getProduct);

// 모든 상품 조회
router.get("/products", productHandler.getAllProducts);

module.exports = router;
