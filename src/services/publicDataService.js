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

async function fetchData(itemCode, offset = 0) {
    try {
        const searchEnd = getDate(offset); // 현재 또는 전월 마지막 날짜
        const searchStart = getDate(offset - 1); // 전월 시작 날짜

        const url = `${apiStartUrl}/${apiKey}/${type}/${language}/${requestStart}/${requestEnd}/${statCode}/${period}/${searchStart}/${searchEnd}/${itemCode}/?/`;
        const response = await axios.get(url);

        // 응답 데이터 처리
        const apiData = response.data.StatisticSearch?.row || [];
        if (!apiData || apiData.length === 0) {
            console.log(`API 응답에 데이터 없음: ${itemCode}, 기간: ${searchStart} - ${searchEnd}`);
            return [];
        }
        return apiData;
    } catch (error) {
        console.error(`API 호출 실패 (itemCode: ${itemCode}, offset: ${offset}):`, error.message);
        return [];
    }
}

async function saveOrUpdateDynamoDB(item) {
    console.log("저장할 아이템:", item); // 데이터 확인용 로그
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

function transformData(apiDataCurrent, apiDataPrevious, category) {
    if (apiDataCurrent.length === 0) return null;

    const productId = `${apiDataCurrent[0].ITEM_CODE1}_${apiDataCurrent[0].TIME}`;

    // 현재 데이터 가격 정보
    const currentPriceInfo = apiDataCurrent.map((entry) => ({
        price: parseFloat(entry.DATA_VALUE),
        price_type: "현재",
        price_date: entry.TIME,
    }));

    // 전월 데이터 가격 정보 (중복 데이터 제거)
    const previousPriceInfo = apiDataPrevious
        .filter((entry) => entry.TIME !== apiDataCurrent[0].TIME) // 현재 데이터와 중복 제거
        .map((entry) => ({
            price: parseFloat(entry.DATA_VALUE),
            price_type: "전월",
            price_date: entry.TIME,
        }));

    const priceInfo = [...currentPriceInfo, ...previousPriceInfo];

    // 현재 및 전월 가격 추출 (마지막 항목 기준)
    const currentPrice = parseFloat(apiDataCurrent[apiDataCurrent.length - 1]?.DATA_VALUE || 0);
    const previousPrice = previousPriceInfo.length > 0 ? parseFloat(previousPriceInfo[previousPriceInfo.length - 1]?.price || 0) : null;

    // 가격 변동 계산
    let priceChange = "데이터 없음";
    let priceDecline = 0;
    if (previousPrice !== null) {
        priceChange = currentPrice > previousPrice ? "증가" : currentPrice < previousPrice ? "감소" : "변화 없음";
        priceDecline = Math.abs(currentPrice - previousPrice);
        priceDecline = priceDecline.toFixed(2);
    }

    return {
        productId: productId,
        product_id: apiDataCurrent[0].ITEM_CODE1,
        product_name: apiDataCurrent[0].ITEM_NAME1,
        category,
        price_info: priceInfo,
        price_trend: {
            current_month_price: currentPrice,
            previous_month_price: previousPrice || "없음",
            price_change: priceChange,
            price_decline: priceDecline,
        },
    };
}

async function startFetch() {
    try {
        for (const [category, { start, end }] of Object.entries(categoryRanges)) {
            for (let i = start; i <= end; i++) {
                const itemCode = `${category}${String(i).padStart(2, "0")}`;
                console.log(`API 호출: ${itemCode}`);

                const apiDataCurrent = await fetchData(itemCode);
                const apiDataPrevious = await fetchData(itemCode, -1);
                const transformedData = transformData(apiDataCurrent, apiDataPrevious, category);

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

module.exports = { startFetch };
