const express = require("express");
const cartHandler = require("../handlers/cartHandler");

const router = express.Router();

// 장바구니에 상품 추가 API 라우트
router.post("/", cartHandler.addProductToCartHandler);

module.exports = router;