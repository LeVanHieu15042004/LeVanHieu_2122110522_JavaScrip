const db = require("../config/db");
const LinkService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_links WHERE 1=1";
        let params = [];

        if (filters.trash !== undefined) {
            sql += " AND IFNULL(trash,0) = ?";
            params.push(filters.trash);
        }

        if (filters.status !== undefined) {
            sql += " AND status = ?";
            params.push(filters.status);
        }

        sql += " ORDER BY display_order ASC, link_id ASC";

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM db_links WHERE link_id=?", [id]);
        return rows;
    },

    create: async (link) => {
        const { title, position, image, link: url, display_order, status } = link;
        const [result] = await db.query(
            "INSERT INTO db_links (title, position, image, link, display_order, status) VALUES (?, ?, ?, ?, ?, ?)",
            [title, position, image, url, display_order, status]
        );
        return result.insertId;
    },

    update: async (id, link) => {
        const { title, position, image, link: url, display_order, status } = link;
        await db.query(
            "UPDATE db_links SET title=?, position=?, image=?, link=?, display_order=?, status=? WHERE link_id=?",
            [title, position, image, url, display_order, status, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_links SET trash=1 WHERE link_id=?", [id]);
    }
}
module.exports = LinkService;