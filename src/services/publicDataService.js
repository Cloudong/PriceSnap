const axios = require("axios");
const docClient = require("../config/dbConfig");
const { GetCommand, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

const apiStartUrl = process.env.API_START_URL;
const apiKey = process.env.API_KEY;
const type = process.env.API_FORMAT;
const language = process.env.API_LANGUAGE;
const requestStart = process.env.API_REQUEST_START;
const requestEnd = process.env.API_REQUEST_END;
const statCode = process.env.API_STATCODE;
const period = process.env.API_PERIOD;

const categoryRanges = {
    A011: { start: 1, end: 18 },
    A012: { start: 1, end: 7 },
    A013: { start: 1, end: 19 },
    A014: { start: 1, end: 5 },
    A015: { start: 1, end: 2 },
    A016: { start: 1, end: 20 },
    A017: { start: 1, end: 30 },
    A018: { start: 1, end: 11 },
    A019: { start: 1, end: 20 },
};

function getDate(offset = 0, format = "YYYYMM") {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    if (format === "YYYYMM") {
        return `${year}${month}`;
    }
}

async function fetchData(itemCode) {
    try {
        const searchEnd = getDate();
        const searchStart = getDate(-1);
        const url = `${apiStartUrl}/${apiKey}/${type}/${language}/${requestStart}/${requestEnd}/${statCode}/${period}/${searchStart}/${searchEnd}/${itemCode}/?/`;
        const response = await axios.get(url);

        // 응답 확인
        console.log(response.data); // 응답 데이터 구조 확인
        const apiData = response.data.StatisticSearch.row || [];
        if (!apiData || apiData.length === 0) {
            console.log("API 응답에 데이터가 없습니다.");
            return [];
        }

        return apiData;
    } catch (error) {
        console.error("API 호출 중 오류 발생:", error.message);
        return [];
    }
}

async function saveOrUpdateDynamoDB(item) {
    const params = {
        TableName: PRODUCTS_TABLE,
        Item: item,
    };

    const command = new PutCommand(params);
    try {
        await docClient.send(command);
        console.log(`DynamoDB에 데이터 저장 성공: ${item.product_name}`);
    } catch (error) {
        console.error("DynamoDB에 데이터 저장 실패:", error);
    }
}

function transformData(apiData, category) {
    if (apiData.length === 0) return null;

    const productId = `${apiData[0].ITEM_CODE1}_${apiData[0].TIME}`;
    const priceInfo = apiData.map((entry) => ({
        price: parseFloat(entry.DATA_VALUE),
        price_type: "현재",
        price_date: entry.TIME,
    }));

    // const currentPrice = parseFloat(apiData[apiData.length - 1].DATA_VALUE);
    // const previousPrice = parseFloat(apiData[apiData.length - 2]?.DATA_VALUE || currentPrice);
    // const priceChange = currentPrice > previousPrice ? "증가" : "감소";
    // const priceDecline = Math.abs(currentPrice - previousPrice);

    return {
        _id: productId,
        product_id: apiData[0].ITEM_CODE1,
        product_name: apiData[0].ITEM_NAME1,
        category,
        price_info: priceInfo,
        price_trend: {
            current_week_price: null,
            previous_week_price: null,
            price_change: null,
            price_decline: null,
        },
    };
}

async function startFetch() {
    try {
        console.log("데이터 fetch 시작...");
        for (const [category, { start, end }] of Object.entries(categoryRanges)) {
            for (let i = start; i <= end; i++) {
                const itemCode = `${category}${String(i).padStart(2, "0")}`;
                console.log(`API 호출: ${itemCode}`);

                const apiData = await fetchData(itemCode);
                const transformedData = transformData(apiData, category);

                if (transformedData) {
                    await saveOrUpdateDynamoDB(transformedData);
                } else {
                    console.log(`변환된 데이터 없음: ${category} - ${itemCode}`);
                }
            }
        }
    } catch (error) {
        console.log("오류 발생:", error.message);
    }
}

startFetch();

module.exports = { startFetch };
