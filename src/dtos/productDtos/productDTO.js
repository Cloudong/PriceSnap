class ProductDTO {
    constructor(productId, product_name, current_month_price, previous_month_price, previous_week_price) {
      this.product_id = productId;
      this.product_name = product_name;
      this.current_month_price = current_month_price;
      this.previous_month_price = previous_month_price;
      this.previous_week_price = previous_week_price;
    }
  }
  
  module.exports = ProductDTO;