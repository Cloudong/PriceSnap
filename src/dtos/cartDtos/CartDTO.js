class CartDTO {
    constructor(items, total_price, budgets) {
        this.items = items; // CartItemDTO 배열
        this.total_price = total_price; // 총 가격
        this.budgets = budgets; // 예산
    }
}

module.exports = CartDTO;