const db = require("../config/db");

const CategoryService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_categories WHERE 1=1";
        const params = [];

        if (filters.trash !== undefined) {
            sql += " AND IFNULL(trash,0) = ?";
            params.push(filters.trash);
        }

        if (filters.status !== undefined && filters.status !== "") {
            sql += " AND status = ?";
            params.push(filters.status);
        }

        const featuredOn =
            filters.featured === 1 ||
            filters.featured === "1" ||
            filters.featured === true;
        if (featuredOn) {
            sql += " AND IFNULL(is_featured,0) = 1";
        }

        sql += featuredOn
            ? " ORDER BY IFNULL(parent_id,0) ASC, cat_name ASC"
            : " ORDER BY cat_id DESC";

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM db_categories WHERE cat_id = ?", [id]);
        return rows;
    },

    create: async (cat) => {
        const { cat_name, alias, parent_id = 0, status = 1, is_featured = 0 } = cat;
        const feat = Number(is_featured) === 1 ? 1 : 0;
        const [result] = await db.query(
            "INSERT INTO db_categories (cat_name, alias, parent_id, status, is_featured) VALUES (?, ?, ?, ?, ?)",
            [cat_name, alias, parent_id, status, feat]
        );
        return result.insertId;
    },

    update: async (id, cat) => {
        const { cat_name, alias, parent_id, status, is_featured } = cat;
        const feat = is_featured === undefined ? undefined : Number(is_featured) === 1 ? 1 : 0;
        if (feat === undefined) {
            await db.query(
                "UPDATE db_categories SET cat_name=?, alias=?, parent_id=?, status=? WHERE cat_id=?",
                [cat_name, alias, parent_id, status, id]
            );
        } else {
            await db.query(
                "UPDATE db_categories SET cat_name=?, alias=?, parent_id=?, status=?, is_featured=? WHERE cat_id=?",
                [cat_name, alias, parent_id, status, feat, id]
            );
        }
    },

    delete: async (id) => {
        await db.query("UPDATE db_categories SET trash=1 WHERE cat_id=?", [id]);
    }
};

module.exports = CategoryService;
