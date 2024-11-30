const express = require("express");
const cartHandler = require("../handlers/budgetHandler");

const router = express.Router();

// 예산 설정 API 라우트
router.post("/", cartHandler.setBudgetHandler);

module.exports = router;