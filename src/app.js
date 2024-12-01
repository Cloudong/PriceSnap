const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes"); // 라우트 임포트
const productRoute = require("./routes/productRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정 부분
const corsOptions = {
    origin: ["https://d6rlnxefknq73.cloudfront.net", "http://localhost:3000"],
    credentials: true,
};
app.use(cors(corsOptions));

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

app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.url}`);
    next();
});

// 라우트 설정
app.use("/api/users", userRoutes);
app.use("/api/products", productRoute);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
