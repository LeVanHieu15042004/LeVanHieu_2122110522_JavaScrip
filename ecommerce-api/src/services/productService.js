const db = require('../config/db');
const { slugify } = require('../utils/slugify');

const ProductService = {
    countByAlias: async (alias, excludeProductId = null) => {
        let sql = 'SELECT COUNT(*) AS cnt FROM db_products WHERE alias = ? AND IFNULL(trash,0) = 0';
        const params = [alias];
        if (excludeProductId != null && excludeProductId !== '') {
            sql += ' AND product_id != ?';
            params.push(excludeProductId);
        }
        const [[row]] = await db.query(sql, params);
        return Number(row.cnt);
    },

    /** Trả về alias chưa bị trùng (thêm -2, -3, … nếu cần). */
    allocateAlias: async (base, excludeProductId = null) => {
        const slug = slugify(String(base || '')) || 'san-pham';
        let candidate = slug;
        for (let i = 2; ; i++) {
            const n = await ProductService.countByAlias(candidate, excludeProductId);
            if (n === 0) return candidate;
            candidate = `${slug}-${i}`;
        }
    },

    getAll: async (filters) => {
        try {
            let {
                page = 1,
                limit = 10,
                name,
                category,
                brand,
                tag,
                status,
                view,
                price_min,
                price_max,
                trash
            } = filters;

            name = name ? decodeURIComponent(name) : name;
            category = category ? decodeURIComponent(category) : category;
            brand = brand ? decodeURIComponent(brand) : brand;
            tag = tag ? decodeURIComponent(tag) : tag;

            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const offset = (page - 1) * limit;

            let where = 'WHERE 1';
            const params = [];

            if (name) {
                where += ' AND p.product_name LIKE ?';
                params.push(`%${name}%`);
            }
            if (category) {
                where += ' AND c.cat_name LIKE ?';
                params.push(`%${category}%`);
            }
            if (brand) {
                where += ' AND b.brand_name LIKE ?';
                params.push(`%${brand}%`);
            }
            if (tag) {
                where += ' AND p.tag LIKE ?';
                params.push(`%${tag}%`);
            }
            if (status !== undefined) {
                where += ' AND p.status = ?';
                params.push(status);
            }
            if (view !== undefined) {
                where += ' AND p.view >= ?';
                params.push(view);
            }
            if (price_min !== undefined) {
                where += ' AND p.price >= ?';
                params.push(price_min);
            }
            if (price_max !== undefined) {
                where += ' AND p.price <= ?';
                params.push(price_max);
            }
            if (trash !== undefined) {
                where += " AND IFNULL(p.trash,0) = ?";
                params.push(filters.trash);
            }

            const shopOn = filters.shop === '1' || filters.shop === 1 || filters.shop === true;
            if (shopOn) {
                where += ' AND (p.cat_id IS NULL OR (IFNULL(c.trash,0) = 0 AND c.status = 1))';
                where += ' AND (p.brand_id IS NULL OR (IFNULL(b.trash,0) = 0 AND b.status = 1))';
            }

            const countSql = `
        SELECT COUNT(*) AS total
        FROM db_products p
        LEFT JOIN db_categories c ON p.cat_id = c.cat_id
        LEFT JOIN db_brands b ON p.brand_id = b.brand_id
        ${where}
      `;
            const [countResult] = await db.query(countSql, params);
            const totalItems = countResult[0].total;
            const totalPage = Math.ceil(totalItems / limit);

            const dataSql = `
        SELECT p.*, c.cat_id, c.cat_name, b.brand_id, b.brand_name
        FROM db_products p
        LEFT JOIN db_categories c ON p.cat_id = c.cat_id
        LEFT JOIN db_brands b ON p.brand_id = b.brand_id
        ${where}
        ORDER BY p.product_id DESC
        LIMIT ? OFFSET ?
      `;
            const dataParams = [...params, limit, offset];
            const [rows] = await db.query(dataSql, dataParams);

            return {
                currentPage: page,
                totalPage,
                totalItems,
                limit,
                data: rows
            };
        } catch (err) {
            throw err;
        }
    },
    getById: async (id, options = {}) => {
        let extra = '';
        const params = [id];
        if (options.shop) {
            extra = ' AND IFNULL(p.trash,0) = 0 AND p.status = 1'
                + ' AND (p.cat_id IS NULL OR (IFNULL(c.trash,0) = 0 AND c.status = 1))'
                + ' AND (p.brand_id IS NULL OR (IFNULL(b.trash,0) = 0 AND b.status = 1))';
        }
        const [rows] = await db.query(
            `SELECT p.*, c.cat_id, c.cat_name, b.brand_id, b.brand_name
       FROM db_products p
       LEFT JOIN db_categories c ON p.cat_id = c.cat_id
       LEFT JOIN db_brands b ON p.brand_id = b.brand_id
       WHERE p.product_id = ?${extra}`,
            params
        );
        return rows;
    },

    create: async (data) => {
        const result = await db.query(`INSERT INTO db_products SET ?`, [data]);
        return result;
    },

    update: async (id, data) => {
        const result = await db.query(`UPDATE db_products SET ? WHERE product_id = ?`, [data, id]);
        return result;
    },

    delete: async (id) => {
        await db.query("UPDATE db_products SET trash=1 WHERE product_id=?", [id]);
    },
    getNewProducts: async (limit = 10) => {

        const [rows] = await db.query(
            `SELECT p.*, c.cat_name, b.brand_name
             FROM db_products p
             LEFT JOIN db_categories c ON p.cat_id = c.cat_id
             LEFT JOIN db_brands b ON p.brand_id = b.brand_id
             WHERE IFNULL(p.trash,0) = 0 AND p.status = 1
             ORDER BY p.created_at DESC
             LIMIT ?`,
            [parseInt(limit)]
        );

        return rows;
    },

    getBestSeller: async (limit = 10) => {

        const [rows] = await db.query(
            `SELECT p.*, SUM(od.quantity) AS total_sold
             FROM db_products p
             JOIN db_order_details od ON p.product_id = od.product_id
             WHERE IFNULL(p.trash,0) = 0 AND p.status = 1
             GROUP BY p.product_id
             ORDER BY total_sold DESC
             LIMIT ?`,
            [parseInt(limit)]
        );

        return rows;
    },

    getRelatedProducts: async (productId, limit = 6) => {
        const [[ref]] = await db.query(
            `SELECT cat_id FROM db_products WHERE product_id = ?`,
            [productId]
        );
        if (!ref || ref.cat_id == null) {
            return [];
        }
        const [rows] = await db.query(
            `SELECT *
             FROM db_products
             WHERE cat_id = ?
             AND product_id != ?
             AND IFNULL(trash,0) = 0
             AND status = 1
             LIMIT ?`,
            [ref.cat_id, productId, parseInt(limit)]
        );

        return rows;
    }
};

module.exports = ProductService;
