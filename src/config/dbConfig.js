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
