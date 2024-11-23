const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

require('dotenv').config();

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

module.exports = docClient;
