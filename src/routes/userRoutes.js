const express = require("express");
const userHandler = require("../handlers/userHandler");

const router = express.Router();

// 사용자 조회 라우트
router.get("/:userId", userHandler.getUser);

// 사용자 생성 라우트
router.post("/", userHandler.createUser);

module.exports = router;
