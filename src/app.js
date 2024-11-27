const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes"); // 라우트 임포트
const productRoute = require("./routes/productRoute");

// CORS 설정 부분
/*

*/

// 세션 설정
app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // HTTPS 사용하나? 사용하면 true
    })
);

// body-parser 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 테스트
const publicDataService = require("./services/publicDataService");
publicDataService.startFetch();

const app = express();
app.use(express.json());

// 라우트 설정
app.use("/users", userRoutes);
app.use("/products", productRoute);

app.use("/test", async (req, res) => {
    res.status(200).json({ message: "testMessage" });
});

app.use((req, res) => {
    return res.status(404).json({ error: "Not Found" });
});

module.exports = app;
