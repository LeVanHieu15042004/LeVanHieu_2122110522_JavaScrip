const db = require("../config/db");
const PageService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_pages WHERE 1=1";
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
        const [rows] = await db.query("SELECT * FROM db_pages WHERE page_id=?", [id]);
        return rows;
    },

    create: async (page) => {
        const { title, content, created_by, status } = page;
        const [r] = await db.query(
            "INSERT INTO db_pages (title, content, created_by, status) VALUES (?, ?, ?, ?)",
            [title, content, created_by, status]
        );
        return r.insertId;
    },

    update: async (id, page) => {
        const { title, content, created_by, status } = page;
        await db.query(
            "UPDATE db_pages SET title=?, content=?, created_by=?, status=? WHERE page_id=?",
            [title, content, created_by, status, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_pages SET trash=1 WHERE page_id=?", [id]);
    }
}
module.exports = PageService;