const { connectToCollection } = require('../config/dbConfig');
const collectionName = process.env.PRODUCTS_COLLECTION; // 사용할 컬렉션 이름

// 상품 조회 함수
const getProductById = async (product_id) => {
    const collection = await connectToCollection(collectionName);
    try {
        const product = await collection.findOne(
            { product_id },
            { projection: { _id: 0 } } // _id 필드를 제외
        );
        return product; // 조회된 상품 반환
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

// 상품 생성 함수
const createProduct = async (product) => {
    const collection = await connectToCollection(collectionName);
    try {
        const result = await collection.insertOne(product); // 상품 추가
        return result.insertedId; // 삽입된 상품의 ID 반환
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

module.exports = { createProduct, getProductById };
