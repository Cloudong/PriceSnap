const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

require("dotenv").config();

const client = new DynamoDBClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION, // 환경 변수에서 리전 가져오기
});
const docClient = DynamoDBDocumentClient.from(client);

module.exports = docClient;
