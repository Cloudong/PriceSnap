const express = require("express");
const cartHandler = require("../handlers/cartHandler");
const userHandler = require("../handlers/userHandler");

const router = express.Router();

// 장바구니에 상품 추가 API 라우트
router.post("/", userHandler.authenticateToken, cartHandler.addProductToCartHandler);

// 장바구니 조회 API 라우트
router.get("/", userHandler.authenticateToken, cartHandler.getCartHandler);

// 장바구니 상품 갱신 라우트
router.post("/update", userHandler.authenticateToken, cartHandler.updateCartHandler);

module.exports = router;
