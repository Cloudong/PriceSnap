const { addProductToCart, getCart, updateCart } = require("../services/cartService");

const addProductToCartHandler = async (req, res) => {
    try {
        // JWT에서 userId 가져오기
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userId = req.user.userId; // JWT에서 userId 가져옴

        const { product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedCart = await addProductToCart(userId, product_id, quantity);
        res.status(200).json({ message: "Product added to cart", updatedCart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getCartHandler = async (req, res) => {
    try {
        // JWT에서 userId 가져오기
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userId = req.user.userId; // JWT에서 userId 가져옴

        const cartResponse = await getCart(userId);
        res.status(200).json(cartResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateCartHandler = async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: "Invalid items format",
        });
    }

    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userId = req.user.userId;

        const result = await updateCart(userId, items);

        res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addProductToCartHandler,
    getCartHandler,
    updateCartHandler,
};
