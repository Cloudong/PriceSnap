const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// 1달 간격으로 데이터 불러오기 위한 라이브러리
const cron = require("node-cron");
const { startFetch } = require("../src/services/publicDataService");

// 라우트 임포트
const userRoutes = require("./routes/userRoutes");
const productRoute = require("./routes/productRoutes");
const cartRoute = require("./routes/cartRoutes");
const budgetRoute = require("./routes/budgetRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정 부분
const corsOptions = {
    origin: ["https://d6rlnxefknq73.cloudfront.net", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: "Content-Type, Authorization, Set-Cookie",
    credentials: true, // 쿠키 및 인증 정보 포함
};
app.use(cors(corsOptions));

// OPTIONS 요청에 대한 응답 설정
// app.options("*", (req, res) => {
//     res.header("Access-Control-Allow-Origin", "https://d6rlnxefknq73.cloudfront.net");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Set-Cookie");
//     res.sendStatus(200);
// });

// 쿠키 미들웨어 설정
app.use(cookieParser());

// body-parser 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 라우트 설정
app.use("/api/users", userRoutes);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/budgets", budgetRoute);

app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url}`);
    next();
});

// 스케줄링 부분 (매달 10일 자정)
cron.schedule("0 0 10 * *", async () => {
    console.log("스케줄링 실행: startFetch 함수 호출");
    try {
        await startFetch();
        console.log("startFetch 실행 완료");
    } catch (error) {
        console.error("startFetch 실행 중 오류 발생: ", error.message);
    }
});

app.listen("4000", () => {
    console.log(`Server is running on port 4000`);
});

module.exports = app;
