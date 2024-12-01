const express = require("express");
const userHandler = require("../handlers/userHandler");

const router = express.Router();

// 사용자 조회 라우트
// router.get("/:userId", userHandler.getUser);

// 사용자 생성 라우트
router.post("/register", userHandler.createUser);

// 사용자 로그인 라우트
router.post("/login", userHandler.getUser);

// 사용자 로그아웃 라우트
router.delete("/logout", userHandler.logoutUser);

// 사용자 세션 정보 반환 필요한가?
router.get("/session", userHandler.getSession);

// 이름 업데이트 라우트
router.patch("/update-name", userHandler.updateUserName);

module.exports = router;
