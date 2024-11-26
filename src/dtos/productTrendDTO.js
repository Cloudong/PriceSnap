class productTrendDTO{
    constructor(productId, product_name, current_week_price, price_decline) {
        this.product_id = productId;
        this.product_name = product_name;
        this.current_week_price = current_week_price;
        this.price_decline = price_decline;
      }
    }

    module.exports = ProductDTO;