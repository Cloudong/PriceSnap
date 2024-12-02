const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization, Set-Cookie',
    credentials: true // 쿠키 및 인증 정보 포함
};
app.use(cors(corsOptions));

// OPTIONS 요청에 대한 응답 설정
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://d6rlnxefknq73.cloudfront.net');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); 
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Set-Cookie');
    res.sendStatus(200);
});

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }, // 로컬은 HTTP이므로 로컬 테스트 시 false로 변경
    })
);

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

app.listen("4000", () => {
    console.log(`Server is running on port 4000`);
});

module.exports = app;
