const { getProductById, createProduct } = require("../models/productModel"); // 제품 모델에서 함수 가져오기
const docClient = require("../config/dbConfig");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

// DTO 가져오기
const ProductDTO = require("../dtos/productDtos/productDTO");
const ProductCategoryDTO = require("../dtos/productDtos/productCategoryDTO");
const ProductTrendDTO = require("../dtos/productDtos/productTrendDTO");

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE; // 환경변수에서 테이블 이름 가져오기

// 제품 ID로 제품 정보를 조회하는 함수
const fetchProduct = async (productId) => {
    return await getProductById(productId); // 모델에서 제품 ID로 제품 정보 조회
};

// 제품 정보를 데이터베이스에 추가하는 함수
const createProductInDB = async (product) => {
    await createProduct(product); // 모델에서 제품 생성 함수 호출
};

// 모든 상품을 가져오는 함수
const getAllProductsInDB = async () => {
    const params = {
        TableName: PRODUCTS_TABLE,
    };

    try {
        const command = new ScanCommand(params); // ScanCommand 사용
        const result = await docClient.send(command);

        // 최종 응답 형식에 맞게 변환
        const products = result.Items.map((item) => {
            const priceInfo = item.price_info.reduce((acc, price) => {
                // price_type에 따라 적절한 키에 가격을 매핑
                if (price.price_type === "현재") {
                    acc.current_month_price = price.price;
                } else if (price.price_type === "전월") {
                    acc.previous_month_price = price.price;
                } else if (price.price_type === "전전월") {
                    acc.previous_two_months_price = price.price;
                }
                return acc;
            }, {});

            // ProductDTO 인스턴스 생성
            return new ProductDTO(
                item.productId,
                item.product_name,
                priceInfo.current_month_price || null, // 기본값 설정
                priceInfo.previous_month_price || null, // 기본값 설정
                priceInfo.previous_two_months_price || null // 기본값 설정
            );
        });

        // 최종 응답 형식
        return { products };
    } catch (error) {
        console.error("Unable to scan products. Error JSON:", JSON.stringify(error, null, 2));
        throw new Error("Could not scan products");
    }
};

// 상품 키워드 검색 함수
const searchProductsInDB = async (name) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        FilterExpression: "contains(product_name, :partialName)", // 부분 일치 검색
        ExpressionAttributeValues: {
            ":partialName": name, // 부분 일치를 위한 값
        },
    };

    try {
        const command = new ScanCommand(params); // ScanCommand로 변경
        const result = await docClient.send(command);

        // 최종 응답 형식에 맞게 변환
        const products = result.Items.map((item) => {
            const priceInfo = item.price_info.reduce((acc, price) => {
                // price_type에 따라 적절한 키에 가격을 매핑
                if (price.price_type === "현재") {
                    acc.current_month_price = price.price;
                } else if (price.price_type === "전월") {
                    acc.previous_month_price = price.price;
                } else if (price.price_type === "전전월") {
                    acc.previous_two_months_price = price.price;
                }
                return acc;
            }, {});

            // ProductDTO 인스턴스 생성
            return new ProductDTO(
                item.productId,
                item.product_name,
                priceInfo.current_month_price || null, // 기본값 설정
                priceInfo.previous_month_price || null, // 기본값 설정
                priceInfo.previous_two_months_price || null // 기본값 설정
            );
        });

        // 최종 응답 형식
        return { products };
    } catch (error) {
        console.error("Unable to scan products. Error JSON:", JSON.stringify(error, null, 2));
        throw new Error("Could not scan products");
    }
};

// 상품 카테고리 검색 함수
const searchCategoryInDB = async (category) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        FilterExpression: "category = :categoryName", // 정확한 일치 검색
        ExpressionAttributeValues: {
            ":categoryName": category, // 정확한 일치를 위한 값
        },
    };

    try {
        const command = new ScanCommand(params); // ScanCommand로 변경
        const result = await docClient.send(command);

        // 최종 응답 형식에 맞게 변환
        const products = result.Items.map((item) => {
            const priceInfo = item.price_info.reduce((acc, price) => {
                // price_type에 따라 적절한 키에 가격을 매핑
                if (price.price_type === "현재") {
                    acc.current_month_price = price.price;
                } else if (price.price_type === "전월") {
                    acc.previous_month_price = price.price;
                } else if (price.price_type === "전전월") {
                    acc.previous_two_months_price = price.price;
                }
                return acc;
            }, {});

            // ProductCategoryDTO 인스턴스 생성
            return new ProductCategoryDTO(
                item.productId,
                item.product_name,
                item.category,
                priceInfo.current_month_price || null, // 기본값 설정
                priceInfo.previous_month_price || null, // 기본값 설정
                priceInfo.previous_two_months_price || null // 기본값 설정
            );
        });

        // 최종 응답 형식
        return { products };
    } catch (error) {
        console.error("Unable to scan products. Error JSON:", JSON.stringify(error, null, 2));
        throw new Error("Could not scan products");
    }
};

// price_change가 감소인 상품중에, 가격 하락폭이 가장 큰 5개의 상품을 가져오는 함수
const getTopDecliningProducts = async () => {
    const params = {
        TableName: PRODUCTS_TABLE,
    };

    try {
        const command = new ScanCommand(params);
        const result = await docClient.send(command);

        // 전월 년월 구하기 (YYYYMM 형식)
        const now = new Date();
        // 전월을 구하기 위해 현재 월에서 1을 뺌
        now.setMonth(now.getMonth() - 1);
        const previousYearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

        // 가격 하락폭이 가장 큰 상품을 찾기
        const productsWithDecline = result.Items.filter((item) => {
            // price_trend 존재 여부와 감소 여부 확인
            const hasPriceTrend = item.price_trend && item.price_trend.price_change === "감소" && item.price_trend.price_decline !== undefined;

            // product_id에서 날짜 부분 추출 (마지막 6자리)
            const itemDate = item.productId.slice(-6);

            // 전월의 데이터만 필터링
            return hasPriceTrend && itemDate === previousYearMonth;
        }).map((item) => ({
            product_id: item.productId,
            base_id: item.productId.split("_")[0], // product_id에서 '_' 앞부분 추출
            product_name: item.product_name,
            current_month_price: item.price_trend.current_month_price,
            price_decline: item.price_trend.price_decline,
        }));

        // base_id 기준으로 그룹화하고 각 그룹에서 price_decline이 가장 큰 항목만 선택
        const groupedProducts = productsWithDecline.reduce((acc, curr) => {
            if (!acc[curr.base_id] || acc[curr.base_id].price_decline < curr.price_decline) {
                acc[curr.base_id] = curr;
            }
            return acc;
        }, {});

        // 객체를 배열로 변환하고 가격 하락폭으로 정렬 후 상위 5개 선택
        const topDecliningProducts = Object.values(groupedProducts)
            .sort((a, b) => b.price_decline - a.price_decline)
            .slice(0, 5);

        // ProductTrendDTO 인스턴스 생성
        const productTrends = topDecliningProducts.map(
            (product) => new ProductTrendDTO(product.product_id, product.product_name, product.current_month_price, product.price_decline)
        );

        return { trend: productTrends };
    } catch (error) {
        console.error("Unable to scan products. Error JSON:", JSON.stringify(error, null, 2));
        throw new Error("Could not scan products");
    }
};

module.exports = {
    fetchProduct,
    createProductInDB,
    getAllProductsInDB,
    searchProductsInDB,
    searchCategoryInDB,
    getTopDecliningProducts,
}; // 함수 내보내기
