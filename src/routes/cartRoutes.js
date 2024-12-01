const express = require("express");
const cartHandler = require("../handlers/cartHandler");

const router = express.Router();

// 장바구니에 상품 추가 API 라우트
router.post("/items", cartHandler.addProductToCartHandler);

// 장바구니 조회 API 라우트
router.get("/", cartHandler.getCartHandler);

module.exports = router;