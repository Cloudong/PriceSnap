const axios = require("axios");
const { connectToCollection } = require("../config/dbConfig"); 
const categoryRanges = require("../categories.js");

const collectionName = process.env.PRODUCTS_COLLECTION; // 사용할 컬렉션 이름

const apiStartUrl = process.env.API_START_URL;
const apiKey = process.env.API_KEY;
const type = process.env.API_TYPE;
const language = process.env.API_LANGUAGE;
const requestStart = process.env.API_REQUEST_START;
const requestEnd = process.env.API_REQUEST_END;
const statCode = process.env.API_STATCODE;
const period = process.env.API_PERIOD;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getDate(offset = 0, format = "YYYYMM") {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    if (format === "YYYYMM") {
        return `${year}${month}`;
    }
}

function splitIntoBatches(categories, maxCallsPerBatch = 100) {
    const categoryEntries = Object.entries(categories);
    const batches = [];
    let currentBatch = [];
    let currentBatchCalls = 0;

    for (const [category, { start, end }] of categoryEntries) {
        const calls = end - start + 1;

        // 현재 배치에 추가하면 최대 호출 횟수를 초과하는지 확인
        if (currentBatchCalls + calls > maxCallsPerBatch) {
            // 현재 배치를 저장하고 새 배치 시작
            batches.push(currentBatch);
            currentBatch = [];
            currentBatchCalls = 0;
        }

        // 카테고리를 현재 배치에 추가
        currentBatch.push([category, { start, end }]);
        currentBatchCalls += calls;
    }

    // 마지막 배치를 추가
    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }

    return batches;
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
    const collection = await connectToCollection(collectionName);
    console.log("저장할 아이템:", item); // 데이터 확인용 로그
    
    try {
        await collection.updateOne(
            { productId: item.productId }, // productId로 고유하게 업데이트
            { $set: item },
            { upsert: true } // 없으면 추가, 있으면 업데이트
        );
        console.log(`MongoDB에 데이터 저장 성공: ${item.product_name}`);
    } catch (error) {
        console.error("MongoDB에 데이터 저장 실패:", error);
    }
}

function transformData(apiDataCurrent, apiDataPrevious, apiDataTwoMonthsAgo, category) {
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

    const twoMonthsAgoPriceInfo = apiDataTwoMonthsAgo
        .filter((entry) => entry.TIME !== apiDataCurrent[0].TIME && entry.TIME !== apiDataPrevious[0]?.TIME)
        .map((entry) => ({
            price: parseFloat(entry.DATA_VALUE),
            price_type: "전전월",
            price_date: entry.TIME,
        }));

    const priceInfo = [...currentPriceInfo, ...previousPriceInfo, ...twoMonthsAgoPriceInfo];

    // 현재 및 전월 가격 추출 (마지막 항목 기준)
    const currentPrice = parseFloat(apiDataCurrent[apiDataCurrent.length - 1]?.DATA_VALUE || 0);
    const previousPrice = previousPriceInfo.length > 0 ? parseFloat(previousPriceInfo[previousPriceInfo.length - 1]?.price || 0) : null;
    const twoMonthsAgoPrice = twoMonthsAgoPriceInfo.length > 0 ? parseFloat(twoMonthsAgoPriceInfo[twoMonthsAgoPriceInfo.length - 1]?.price || 0) : null;

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
            previous_two_months_price: twoMonthsAgoPrice || "없음",
            price_change: priceChange,
            price_decline: priceDecline,
        },
    };
}

async function fetchBatch(categories) {
    for (const [category, { start, end }] of categories) {
        for (let i = start; i <= end; i++) {
            const itemCode = `${category}${String(i).padStart(2, "0")}`;
            console.log(`API 호출: ${itemCode}`);

            const apiDataCurrent = await fetchData(itemCode);
            const apiDataPrevious = await fetchData(itemCode, -1);
            const apiDataTwoMonthsAgo = await fetchData(itemCode, -2);
            const transformedData = transformData(apiDataCurrent, apiDataPrevious, apiDataTwoMonthsAgo, category);

            if (transformedData) {
                await saveOrUpdateDynamoDB(transformedData);
            } else {
                console.log(`변환된 데이터 없음: ${category} - ${itemCode}`);
            }
        }
    }
}

async function startFetch() {
    const batches = splitIntoBatches(categoryRanges, 100);

    for (let i = 0; i < batches.length; i++) {
        console.log(`배치 ${i + 1} 실행 (총 ${batches[i].length}개의 카테고리)`);
        await fetchBatch(batches[i]);

        if (i < batches.length - 1) {
            console.log("5분 대기");
            await delay(5 * 60 * 1000); // 5분 대기
        }
    }

    console.log("startFetch 완료");
}

module.exports = { startFetch };
