class ProductDTO {
    constructor(productId, product_name, price_info) {
      this.product_id = productId;
      this.product_name = product_name;
      this.price_info = price_info;
    }
  }
  
  module.exports = ProductDTO;