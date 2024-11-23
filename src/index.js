const serverless = require("serverless-http");
const app = require("./app");
require('dotenv').config(); // 환경 변수를 로드합니다.

exports.handler = serverless(app);

// 로컬 개발을 위한 서버 실행
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }