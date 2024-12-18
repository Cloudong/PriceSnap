const bcrypt = require("bcryptjs");
const { connectToCollection } = require("../config/dbConfig"); // MongoDB 연결 함수

const collectionName = process.env.USERS_COLLECTION; // 사용할 컬렉션 이름

const getUserById = async (userId) => {
    const collection = await connectToCollection(collectionName);
    const user = await collection.findOne({ userId }, { projection: { _id: 0 } }); // 사용자 ID로 조회
    return user;
};

const createUser = async (userId, name, user_password) => {
    try {
        // 비밀번호 해싱 (솔트 값: 10)
        const hashedPassword = await bcrypt.hash(user_password, 10);
        const user = {
            userId,
            name,
            user_password: hashedPassword.toString(),
            created_at: new Date().toISOString(),
        };
        const collection = await connectToCollection(collectionName);
        await collection.insertOne(user); // MongoDB에 사용자 추가
        return user;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Could not create user");
    }
};

const updateNameById = async (userId, newName) => {
    const collection = await connectToCollection(collectionName);
    await collection.updateOne(
        { userId: userId }, // 조건
        { $set: { name: newName } } // 업데이트 내용
    ); 
};

// 사용자의 cart를 업데이트
const updateCartById = async (user) => {
    const collection = await connectToCollection(collectionName);
    await collection.updateOne(
        { userId: user.userId }, // 조건
        { $set: { cart: user.cart } } // 업데이트 내용
    ); 
};

// 사용자의 budget을 업데이트
const updateBudgetById = async (user) => {
    const collection = await connectToCollection(collectionName);
    await collection.updateOne(
        { userId: user.userId }, // 조건
        { $set: { budget: user.budget } } // 업데이트 내용
    );
};

module.exports = {
    getUserById,
    createUser,
    updateNameById,
    updateCartById,
    updateBudgetById,
};

// 테스트 데이터
const testUserId = 'test_user_123';
const testName = '테스트 사용자';
const testPassword = 'password123';
const testCart = ['item1', 'item2'];
const testBudget = 10000;

const runTests = async () => {
    try {
        // 사용자 생성 테스트
        console.log("Creating user...");
        const newUser = await createUser(testUserId, testName, testPassword);
        console.log("User created:", newUser);

        // 사용자 조회 테스트
        console.log("Fetching user...");
        const fetchedUser = await getUserById(testUserId);
        console.log("Fetched user:", fetchedUser);

        // 사용자 이름 업데이트 테스트
        const newName = '업데이트된 사용자';
        console.log("Updating user name...");
        await updateNameById(testUserId, newName);
        const updatedUser = await getUserById(testUserId);
        console.log("Updated user:", updatedUser);

        // 사용자 cart 업데이트 테스트
        console.log("Updating user cart...");
        await updateCartById({ userId: testUserId, cart: testCart });
        const userWithUpdatedCart = await getUserById(testUserId);
        console.log("User with updated cart:", userWithUpdatedCart);

        // 사용자 budget 업데이트 테스트
        console.log("Updating user budget...");
        await updateBudgetById({ userId: testUserId, budget: testBudget });
        const userWithUpdatedBudget = await getUserById(testUserId);
        console.log("User with updated budget:", userWithUpdatedBudget);

    } catch (error) {
        console.error("Error during tests:", error);
    }
};

// 테스트 실행
runTests();