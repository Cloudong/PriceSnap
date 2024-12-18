const { MongoClient, ServerApiVersion } = require('mongodb');

require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;


const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// MongoDB 클라이언트 연결 함수
const connectToCollection = async (collectionName) => {
    try {
        // 클라이언트가 연결되어 있지 않다면 연결 시도
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
            console.log("Connected to MongoDB");
        }
        
        const database = client.db(dbName);
        return database.collection(collectionName); // 선택한 컬렉션을 반환합니다.
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // 에러 발생 시 에러를 던집니다.
    }
};

// 연결 해제 함수
const closeDatabaseConnection = async () => {
    await client.close();
    console.log("MongoDB connection closed");
};

module.exports = {
    connectToCollection,
    closeDatabaseConnection,
};

// DynamoDB -> MongoDB로 데이터 옮기기
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const dynamoDB = new DynamoDBClient({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION, // 환경 변수에서 리전 가져오기
});
const docClient = DynamoDBDocumentClient.from(dynamoDB);


const migrateData = async () => {
    try {
        // MongoDB 연결
        await client.connect();
        console.log("Connected to MongoDB");
        const database = client.db(dbName);
        const collection = database.collection('users'); // 삽입할 컬렉션 이름

        // DynamoDB에서 데이터 가져오기
        const params = {
            TableName: process.env.USERS_TABLE, // DynamoDB 테이블 이름
        };

        const command = new ScanCommand(params); // ScanCommand 사용
        const data = await docClient.send(command);
        const items = data.Items;

        // MongoDB에 데이터 삽입
        if (items && items.length > 0) {
            const result = await collection.insertMany(items);
            console.log(`Inserted ${result.insertedCount} items into MongoDB.`);
        } else {
            console.log("No items found in DynamoDB.");
        }
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        // MongoDB 연결 종료
        await client.close();
        console.log("MongoDB connection closed");
    }
};