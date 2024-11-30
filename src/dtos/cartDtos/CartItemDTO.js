class CartItemDTO {
    constructor(item_id, product_id, quantity, price) {
        this.product_id = product_id; // 상품 ID
        this.quantity = quantity; // 수량
        this.price = price; // 가격
    }
}

module.exports = CartItemDTO;