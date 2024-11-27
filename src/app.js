const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes"); // 라우트 임포트
const productRoute = require("./routes/productRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// 라우트 설정
app.use("/users", userRoutes);
app.use("/products", productRoute);

app.use("/test", async (req, res) => {
    res.status(200).json({ message: "testMessage" });
});

app.use((req, res) => {
    return res.status(404).json({ error: "Not Found" });
});

// 테스트
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
