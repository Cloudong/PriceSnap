const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");

// 라우트 임포트
const userRoutes = require("./routes/userRoutes"); 
const productRoute = require("./routes/productRoutes");
const cartRoute = require("./routes/cartRoutes");

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

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
        cookie: { secure: true }, // HTTPS 사용하나? 사용하면 true
    })
);

// body-parser 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 라우트 설정
app.use("/users", userRoutes);
app.use("/products", productRoute);
app.use("/products", cartRoute);

app.use("/test", async (req, res) => {
    res.status(200).json({ message: "testMessage" });
});

app.use((req, res) => {
    return res.status(404).json({ error: "Not Found" });
});

// 테스트
/*
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
*/
module.exports = app;
