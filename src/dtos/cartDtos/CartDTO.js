class CartDTO {
    constructor(cart_items, total_price, budget) {
        this.cart_items = cart_items; // CartItemDTO 배열
        this.total_price = total_price; // 총 가격
        this.budget = budget; // 예산
    }
}

module.exports = CartDTO;