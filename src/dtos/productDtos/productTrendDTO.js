class productTrendDTO{
    constructor(productId, product_name, current_month_price, price_decline) {
        this.product_id = productId;
        this.product_name = product_name;
        this.current_month_price = current_month_price;
        this.price_decline = price_decline;
      }
    }

    module.exports = productTrendDTO;