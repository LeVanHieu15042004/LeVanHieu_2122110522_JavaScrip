const db = require("../config/db");

const ProductSaleService = {
  /** Sản phẩm đang khuyến mãi (trong khoảng ngày, shop). Bảng chưa tồn tại → []. */
  getActiveShop: async () => {
    try {
      const [rows] = await db.query(
        `SELECT p.*, c.cat_name, b.brand_name,
          s.sale_id, s.price_sale, s.date_begin, s.date_end
        FROM db_product_sale s
        INNER JOIN db_products p ON s.product_id = p.product_id AND IFNULL(p.trash,0)=0 AND p.status=1
        LEFT JOIN db_categories c ON p.cat_id = c.cat_id
        LEFT JOIN db_brands b ON p.brand_id = b.brand_id
        WHERE IFNULL(s.trash,0)=0
          AND (p.cat_id IS NULL OR (IFNULL(c.trash,0)=0 AND c.status=1))
          AND (p.brand_id IS NULL OR (IFNULL(b.trash,0)=0 AND b.status=1))
          AND (s.date_begin IS NULL OR s.date_begin <= NOW())
          AND (s.date_end IS NULL OR s.date_end >= NOW())
        ORDER BY s.sale_id DESC
        LIMIT 24`
      );
      return rows;
    } catch (e) {
      if (e.code === "ER_NO_SUCH_TABLE") return [];
      throw e;
    }
  },
};

module.exports = ProductSaleService;
