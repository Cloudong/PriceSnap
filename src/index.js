const serverless = require("serverless-http");
const app = require("./app");
require('dotenv').config(); // 환경 변수를 로드합니다.

exports.handler = serverless(app);
