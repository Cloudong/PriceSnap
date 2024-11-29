const { addProductToCart, getCart } = require('../services/cartService');

const addProductToCartHandler = async (req, res) => {
    try {
        // 세션에서 userId 가져오기
        //const userId = req.session.userId;

        userId = 'cartTest2'; // session 없이 테스트 위해 가상 user 설정

        // userId가 없는 경우 에러 처리
        if (!userId) {
            throw new Error('User not logged in');
        }

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
        //const userId = req.session.userId;

        userId = 'cartTest2'; // session 없이 테스트 위해 가상 user 설정

        // userId가 없는 경우 에러 처리
        if (!userId) {
            throw new Error('User not logged in');
        }

        const getCart = await getCart(userId);
        res.status(200).json({ cart: getCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addProductToCartHandler,
    getCartHandler
};