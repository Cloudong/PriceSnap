const { fetchUser, registerUser } = require("../services/userService");

const getUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await fetchUser(userId);
        if (user) {
            const { userId, name } = user;
            res.json({ userId, name });

            // 세션
            req.session.user = { user_id: user.user_id, user_name: user.user_name };

            console.log(`${userId}님이 입장하셨습니다람쥐`);
        } else {
            res.status(404).json({ error: 'Could not find user with provided "userId"' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not retrieve user" });
    }
};

const createUser = async (req, res) => {
    const { userId, name } = req.body;
    if (typeof userId !== "string") {
        return res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== "string") {
        return res.status(400).json({ error: '"name" must be a string' });
    }

    try {
        await registerUser({ userId, name });
        res.json({ userId, name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not create user" });
    }
};

const logoutUser = async (req, res) => {
    if (req.session.user) {
        req.session.destory((error) => {
            if (err) return res.status(500).json({ error: "Logout Failed" });
        });
    }
};

module.exports = { getUser, createUser };
