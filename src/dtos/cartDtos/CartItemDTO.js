class CartItemDTO {
    constructor(product_id, product_name, quantity, price) {
        this.product_id = product_id; // 상품 ID
        this.product_name = product_name; // 상품 이름
        this.quantity = quantity; // 수량
        this.price = price; // 가격
    }
}

module.exports = CartItemDTO;