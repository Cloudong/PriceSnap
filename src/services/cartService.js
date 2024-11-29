const docClient = require("../config/dbConfig");

const USERS_TABLE = process.env.USERS_TABLE; // 환경변수에서 테이블 이름 가져오기

const addProductToCart = async (userId, product_id, quantity) => {

};

module.exports = {
    addProductToCart
};