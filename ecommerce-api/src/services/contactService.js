const db = require("../config/db");
const ContactService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_contacts WHERE 1=1";
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
        const [rows] = await db.query("SELECT * FROM db_contacts WHERE contact_id=?", [id]);
        return rows;
    },

    create: async (contact) => {
        const { email, title, content, status } = contact;
        const st = status !== undefined && status !== null ? status : 0;
        const [result] = await db.query(
            "INSERT INTO db_contacts (email, title, content, status) VALUES (?, ?, ?, ?)",
            [email, title, content, st]
        );
        return result.insertId;
    },

    update: async (id, contact) => {
        const { email, title, content, status } = contact;
        await db.query(
            "UPDATE db_contacts SET email=?, title=?, content=?, status=? WHERE contact_id=?",
            [email, title, content, status, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_contacts SET trash=1 WHERE contact_id=?", [id]);
    }
}
module.exports = ContactService;