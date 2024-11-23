const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION, // 환경 변수에서 리전 가져오기
});
const docClient = DynamoDBDocumentClient.from(client);

module.exports = docClient;
