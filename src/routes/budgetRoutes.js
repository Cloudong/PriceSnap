const express = require("express");
const cartHandler = require("../handlers/budgetHandler");
const userHandler = require("../handlers/userHandler");

const router = express.Router();

// 예산 설정 API 라우트
router.post("/", userHandler.authenticateToken, cartHandler.setBudgetHandler);

module.exports = router;