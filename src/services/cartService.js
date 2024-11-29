const docClient = require("../config/dbConfig");
const { getUserById, updateCartById } = require("../models/userModel");

const USERS_TABLE = process.env.USERS_TABLE; // 환경변수에서 테이블 이름 가져오기

const addProductToCart = async (userId, product_id, quantity) => {
    try{
        // 사용자의 장바구니 조회
        const user = await getUserById(userId); // 사용자 정보를 가져오는 함수

        // 장바구니가 없는 경우 새로 생성
        if (!user.cart) {
        user.cart = {
            cart_id: generateCartId(), // 장바구니 ID 생성 함수
            created_at: new Date().toISOString(),
            cart_items: []
            };
        }

        // 기존에 같은 product_id를 가진 아이템 확인
        const existingItem = user.cart.cart_items.find(item => item.product_id === product_id);

        if (existingItem) {
            // 이미 존재하는 경우 수량 추가
            existingItem.quantity += quantity;
        } else {
            // 새로운 아이템 객체 생성
            const newItem = {
                product_id,
                quantity,
                priority: 1, // 기본 우선순위 설정
            };
            // 장바구니에 새로운 아이템 추가
            user.cart.cart_items.push(newItem);
        }

        // 사용자 정보 업데이트 (DB에 저장)
        await updateCartById(user); // 사용자 정보를 DB에 저장하는 함수

        return { cart: user.cart };

    } catch (error) {
        console.error("Error adding item to cart:", error);
        throw new Error('Could not add item to cart');
    }
};

// 장바구니 ID 생성 함수 (예시)
const generateCartId = () => {
    return `cart_${Date.now()}`; // 단순한 예시로 현재 시간을 기반으로 ID 생성
};

module.exports = {
    addProductToCart
};