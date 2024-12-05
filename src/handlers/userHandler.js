const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { fetchUser, registerUser, updateName } = require("../services/userService");

const SECRET_KEY = process.env.SECRET_KEY;

function generateToken(userId) {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "1h" });
}

function authenticateToken(req, res, next) {
    const token = req.cookies.token; // 또는 Authorization 헤더에서 토큰 추출

    if (!token) {
        console.error("Token not found");
        return res.status(401).send({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(403).send({ message: "Unauthorized: Invalid token" });
        }

        console.log("Decoded JWT:", decoded);
        req.user = decoded;
        next();
    });
}

const getUser = async (req, res) => {
    const { userId, user_password } = req.body;
    try {
        const user = await fetchUser(userId);
        if (user) {
            const isMatch = await bcrypt.compare(user_password, user.user_password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // 토큰
            const token = generateToken(userId);
            res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 3600000 });

            res.status(200).json({ message: "Login successful", user: user, token: token });
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
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
};

const updateUserName = async (req, res) => {
    const { newName } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userId = req.user.userId;
        await updateName(userId, newName);

        res.status(200).json({ message: "Name updated successfully", newName });
    } catch (error) {
        res.status(500).json({ message: "Error updating nickname", error });
    }
};

const getSession = async (req, res) => {
    if (req.user) {
        res.status(200).json({ user: req.user });
    } else {
        res.status(401).json({ message: "Not logged in " });
    }
};

module.exports = { getUser, createUser, logoutUser, updateUserName, getSession, authenticateToken };
