const db = require('../config/db');

const TopicService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_topics WHERE 1=1";
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
        const [rows] = await db.query('SELECT * FROM db_topics WHERE topic_id=?', [id]);
        return rows;
    },

    create: async (data) => {
        const { name, description, image } = data;
        return await db.query(
            'INSERT INTO db_topics (name, description, image) VALUES (?, ?, ?)',
            [name, description, image || null]
        );
    },

    update: async (id, data) => {
        const { name, description, image } = data;
        return await db.query(
            'UPDATE db_topics SET name=?, description=?, image=? WHERE topic_id=?',
            [name, description, image || null, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_topics SET trash=1 WHERE topic_id=?", [id]);
    }
};

module.exports = TopicService;