const { addProductToCart, getCart } = require('../services/cartService');

const addProductToCartHandler = async (req, res) => {
    try {
        // 세션에서 userId 가져오기
        if (!req.session.user || !req.session.user.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userId = req.session.user.userId;

        const {product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const updatedCart = await addProductToCart(userId, product_id, quantity);
        res.status(200).json({ message: 'Product added to cart', updatedCart});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getCartHandler = async (req, res) => {
    try {
        // 세션에서 userId 가져오기
        if (!req.session.user || !req.session.user.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userId = req.session.user.userId;

        const cartResponse = await getCart(userId);
        res.status(200).json( cartResponse );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addProductToCartHandler,
    getCartHandler
};