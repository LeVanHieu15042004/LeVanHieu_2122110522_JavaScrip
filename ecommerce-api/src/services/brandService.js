const db = require("../config/db");
const BrandService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_brands WHERE 1=1";
        let params = [];

        if (filters.trash !== undefined) {
            sql += " AND IFNULL(trash,0) = ?";
            params.push(filters.trash);
        }

        if (filters.status !== undefined) {
            sql += " AND status = ?";
            params.push(filters.status);
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM db_brands WHERE brand_id = ?", [id]);
        return rows;
    },

    create: async (brand) => {
        const { brand_name, alias, status } = brand;
        const [result] = await db.query(
            "INSERT INTO db_brands (brand_name, alias, status) VALUES (?, ?, ?)",
            [brand_name, alias, status]
        );
        return result.insertId;
    },

    update: async (id, brand) => {
        const { brand_name, alias, status } = brand;
        await db.query(
            "UPDATE db_brands SET brand_name=?, alias=?, status=? WHERE brand_id=?",
            [brand_name, alias, status, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_brands SET trash=1 WHERE brand_id=?", [id]);
    }
}
module.exports = BrandService;