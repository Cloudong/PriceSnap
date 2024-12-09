const { getUserById, updateCartById } = require("../models/userModel");
const { getProductById } = require("../models/productModel");

const CartItemDTO = require("../dtos/cartDtos/CartItemDTO"); // CartItemDTO 정의
const CartDTO = require("../dtos/cartDtos/CartDTO"); // CartDTO 정의

const addProductToCart = async (userId, product_id, quantity) => {
    try {
        // 사용자의 장바구니 조회
        const user = await getUserById(userId); // 사용자 정보를 가져오는 함수

        // 장바구니가 없는 경우 새로 생성
        if (!user.cart) {
            user.cart = {
                cart_id: generateCartId(), // 장바구니 ID 생성 함수
                created_at: new Date().toISOString(),
                cart_items: [],
            };
        }

        // 기존에 같은 product_id를 가진 아이템 확인
        const existingItem = user.cart.cart_items.find((item) => item.product_id === product_id);

        if (existingItem) {
            // 이미 존재하는 경우 수량 추가
            existingItem.quantity += quantity;

            // priority가 1이 아닌 경우: 현재 추가하려는 상품의 priority를 1로 설정
            if (existingItem.priority !== 1) {
                const currentPriority = existingItem.priority;
                existingItem.priority = 1;

                // 현재 추가하려는 상품의 기존 priority보다 작은 priority를 가진 상품의 priority를 +1
                user.cart.cart_items.forEach((item) => {
                    if (item.product_id !== product_id && item.priority < currentPriority) {
                        item.priority += 1;
                    }
                });
            }
        } else {
            // 새로운 아이템 객체 생성
            const newItem = {
                product_id,
                quantity,
                priority: 0, // 기본 우선순위 = 1
            };
            // 장바구니에 새로운 아이템 추가
            user.cart.cart_items.push(newItem);

            // 모든 기존 아이템의 priority를 1씩 증가
            user.cart.cart_items.forEach((item) => {
                item.priority += 1;
            });
        }

        // 사용자 정보 업데이트 (DB에 저장)
        await updateCartById(user); // 사용자 정보를 DB에 저장하는 함수

        return { cart: user.cart };
    } catch (error) {
        console.error("Error adding item to cart:", error);
        throw new Error("Could not add item to cart");
    }
};

// 장바구니 ID 생성 함수
const generateCartId = () => {
    return `cart_${Date.now()}`; // 단순한 예시로 현재 시간을 기반으로 ID 생성
};

// 장바구니 상품 조회 함수
const getCart = async (userId) => {
    try {
        // 사용자의 장바구니 조회
        const user = await getUserById(userId);

        // 예산 가져오기
        const budget = user.budget ? user.budget.amount : null; // budget이 없을 경우 null 반환

        // 장바구니 아이템 조회
        const cartItems = user.cart && user.cart.cart_items ? user.cart.cart_items : null; // cart_items가 없을 경우 null 반환

        const items = [];
        let total_price = 0;

        // cart_items가 존재하는 경우에만 제품 정보 조회
        if (cartItems) {
            for (const item of cartItems) {
                const product = await getProductById(item.product_id); // product 테이블에서 제품 정보 조회

                if (product) {
                    const productName = product.product_name;
                    const price = product.price_trend.current_month_price; // 가격 가져오기
                    const quantity = item.quantity;

                    // CartItemDTO 생성
                    const cartItemDTO = new CartItemDTO(
                        item.product_id,
                        productName,
                        quantity,
                        price,
                        item.priority
                    );
                    items.push(cartItemDTO); // CartItemDTO 배열에 추가
                    total_price += price * quantity; // 총 가격 계산
                }
            }
            // total_price 소수점 세 번째 자리에서 반올림
            total_price = Math.round(total_price * 100) / 100;
        }

        // CartDTO 생성
        const cartDTO = new CartDTO(items.length > 0 ? items : null, total_price, budget);

        // 응답 반환
        return { cart: cartDTO };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to get items from cart");
    }
};

const updateCart = async (userId, items) => {
    try {
        // DynamoDB에서 사용자 데이터 가져오기
        const user = await getUserById(userId);

        // 장바구니 데이터 초기화 (기존 데이터를 가져오거나 새로 생성)
        if (!user.cart) {
            user.cart = {
                cart_id: generateCartId(),
                created_at: new Date().toISOString(),
                cart_items: [],
            };
        }

        // 클라이언트에서 넘어온 데이터를 기반으로 장바구니 갱신
        const updatedCartItems = items.map(({ product_id, quantity, priority }) => ({
            product_id,
            quantity,
            priority,
        }));

        // 기존 cart_items를 새로운 데이터로 덮어씀
        user.cart.cart_items = updatedCartItems;

        // DynamoDB에 갱신된 데이터 저장
        await updateCartById(user);

        return { success: true, cart: user.cart };
    } catch (error) {
        console.error("Error updating cart:", error);
        throw new Error("Failed to update cart");
    }
};

module.exports = {
    addProductToCart,
    getCart,
    updateCart,
};
