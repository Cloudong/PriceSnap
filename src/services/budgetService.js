const { getUserById, updateBudgetById } = require("../models/userModel");

const setBudget = async (userId, budget) => {
    // 사용자 정보를 가져오기
    const user = await getUserById(userId);

    // 예산이 없는 경우 초기화
    if (!user.budget) {
        user.budget = {
            amount: budget,
            created_at: new Date().toISOString(), // 생성 날짜
        };
    } else {
        // 예산이 있는 경우 업데이트
        user.budget.amount = budget;
        user.budget.created_at = new Date().toISOString(); // 생성 날짜 업데이트
    }

    // 사용자 정보 업데이트 (DB에 저장)
    await updateBudgetById(user); // 사용자 정보를 DB에 저장하는 함수
    return(user.budget);
};

module.exports = {
    setBudget
};