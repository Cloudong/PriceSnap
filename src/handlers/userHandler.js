const bcrypt = require("bcrypt");
const { fetchUser, registerUser, updateName } = require("../services/userService");

const getUser = async (req, res) => {
    const { userId, user_password } = req.body;
    try {
        const user = await fetchUser(userId);
        if (user) {
            const isMatch = await bcrypt.compare(user_password, user.user_password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // 세션
            req.session.user = { userId: user.userId, name: user.name };

            res.status(200).json({ message: "Login successful", user: user });
        } else {
            res.status(404).json({ error: 'Could not find user with provided "userId"' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not retrieve user" });
    }
};

const createUser = async (req, res) => {
    const { userId, name, user_password } = req.body;
    if (typeof userId !== "string") {
        return res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== "string") {
        return res.status(400).json({ error: '"name" must be a string' });
    }

    // 입력값 검증
    if (!userId || !name || !user_password) {
        return res.status(400).json({ error: "userId, name, and user_password ard required" });
    }

    try {
        const newUser = await registerUser(userId, name, user_password);
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not create user" });
    }
};

const logoutUser = async (req, res) => {
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Logout Failed" });
            }
            res.status(200).json({ message: "Logout successful" });
        });
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
};

const updateUserName = async (req, res) => {
    const { newName } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const userId = req.session.user.userId;
        await updateName(userId, newName);

        // 세션에 저장된 닉네임도 업데이트
        req.session.user.name = newName;

        res.status(200).json({ message: "Name updated successfully", newName });
    } catch (error) {
        res.status(500).json({ message: "Error updating nickname", error });
    }
};

module.exports = { getUser, createUser, logoutUser, updateUserName };
