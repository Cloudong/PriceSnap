class ProductCategoryDTO {
    constructor(productId, product_name, category, current_week_price, previous_month_price, previous_week_price) {
      this.product_id = productId;
      this.product_name = product_name;
      this.category = category;
      this.current_week_price = current_week_price;
      this.previous_month_price = previous_month_price;
      this.previous_week_price = previous_week_price;
    }
  }
  
  module.exports = ProductCategoryDTO;