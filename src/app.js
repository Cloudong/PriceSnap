const express = require("express");
const userRoutes = require("./routes/userRoutes"); // 라우트 임포트
const productRoutes = require("./routes/productRoutes"); // 라우트 임포트

const app = express();
app.use(express.json());

// 라우트 설정
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

app.use("/api/test", async (req, res) => {
    res.status(200).json({"message": "testMessage"});
});
  
app.use((req, res) => {
  return res.status(404).json({ error: "Not Found" });
});

module.exports = app;
