const { fetchProduct, createProductInDB, searchProductsInDB, searchCategoryInDB } = require('../services/productService'); // 서비스에서 제품 관련 함수 가져오기

const getProduct = async (req, res) => {
  const productId = req.params.productId; // URL에서 productId 가져오기
  try {
    const product = await fetchProduct(productId); // 제품 조회
    if (product) {
      res.json(product); // 조회된 제품 반환
      console.log(`제품 ID ${productId}를 조회했습니다.`);
    } else {
      res.status(404).json({ error: 'Could not find product with provided "product_id"' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve product" });
  }
};

const createProduct = async (req, res) => {
  const { productId, product_name, category, price_info, price_trend } = req.body; // 요청 본문에서 제품 정보 가져오기
  if (typeof productId !== "string") {
    return res.status(400).json({ error: '"productId" must be a string' });
  } else if (typeof product_name !== "string") {
    return res.status(400).json({ error: '"product_name" must be a string' });
  } else if (typeof category !== "string") {
    return res.status(400).json({ error: '"category" must be a string' });
  }

  try {
    await createProductInDB({ productId, product_name, category, price_info, price_trend }); // 데이터베이스에 제품 추가
    res.status(201).json({ productId, product_name, category, price_info, price_trend }); // 생성된 제품 반환
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create product" });
  }
};

// 상품 키워드 검색 핸들러
const searchProductsHandler = async (req, res) => {
  const { name } = req.query; // 쿼리 파라미터에서 name 가져오기
  if (!name) {
    return res.status(400).json({ error: 'Query parameter "name" is required' });
  }

  try {
    // 데이터베이스에서 제품 검색
    const products = await searchProductsInDB(name);
    res.json(products); // 결과 반환
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve products" });
  }
};

// 상품 카테고리 검색 핸들러
const searchCategoryHandler = async (req, res) => {
  const { category } = req.query; // 쿼리 파라미터에서 name 가져오기
  if (!category) {
    return res.status(400).json({ error: 'Query parameter "category" is required' });
  }

  try {
    // 데이터베이스에서 제품 검색
    const products = await searchCategoryInDB(category);
    res.json(products); // 결과 반환
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve products" });
  }
};

module.exports = { getProduct, createProduct, searchProductsHandler, searchCategoryHandler }; // 함수 내보내기
