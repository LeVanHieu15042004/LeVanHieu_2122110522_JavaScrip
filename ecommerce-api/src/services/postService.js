const db = require('../config/db');

const PostService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_posts WHERE 1=1";
        let params = [];

        if (filters.trash !== undefined) {
            sql += " AND IFNULL(trash,0) = ?";
            params.push(filters.trash);
        }

        if (filters.status !== undefined) {
            sql += " AND status = ?";
            params.push(filters.status);
        }

        if (filters.topic_id !== undefined && filters.topic_id !== "") {
            sql += " AND topic_id = ?";
            params.push(filters.topic_id);
        }

        sql += " ORDER BY post_id DESC";
        const [rows] = await db.query(sql, params);
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM db_posts WHERE post_id=?', [id]);
        return rows;
    },

    create: async (data) => {
        const { title, content, topic_id, author_id, image } = data;
        return await db.query(
            'INSERT INTO db_posts (title, content, topic_id, author_id, image) VALUES (?, ?, ?, ?, ?)',
            [title, content, topic_id, author_id, image || null]
        );
    },

    update: async (id, data) => {
        const { title, content, topic_id, author_id, image } = data;
        return await db.query(
            'UPDATE db_posts SET title=?, content=?, topic_id=?, author_id=?, image=? WHERE post_id=?',
            [title, content, topic_id, author_id, image || null, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_posts SET trash=1 WHERE post_id=?", [id]);
    }
};

module.exports = PostService;