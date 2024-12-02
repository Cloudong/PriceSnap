const { setBudget } = require('../services/budgetService');


const setBudgetHandler = async (req, res) => {
    try {
        // 세션에서 userId 가져오기
        if (!req.session.user || !req.session.user.userId) {
            return res.status(401).json({ message: "Not logged in" });
        }
        const userId = req.session.user.userId;

        // 요청 본문에서 예산 금액 가져오기
        const { budget } = req.body

        const userBudget = await setBudget(userId, budget);

        // 성공 메시지 반환
        res.status(200).json({ userBudget });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    setBudgetHandler
};
