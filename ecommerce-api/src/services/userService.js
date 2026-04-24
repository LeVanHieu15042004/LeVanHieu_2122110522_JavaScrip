const db = require("../config/db");
const bcrypt = require("bcrypt");

const UserService = {
    getAll: async (filters = {}) => {
        let sql = "SELECT * FROM db_users WHERE 1=1";
        const params = [];

        if (filters.trash !== undefined) {
            sql += " AND IFNULL(trash,0) = ?";
            params.push(filters.trash);
        }

        if (filters.status !== undefined && filters.status !== "") {
            sql += " AND status = ?";
            params.push(filters.status);
        }

        if (filters.user_type !== undefined && filters.user_type !== "") {
            sql += " AND user_type = ?";
            params.push(filters.user_type);
        }

        sql += " ORDER BY user_id DESC";

        const [rows] = await db.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM db_users WHERE user_id=?", [id]);
        return rows;
    },

    create: async (user) => {
        const { username, fullname, pass, email, user_type = "user", status = 1 } = user;
        if (!username || !email || !pass) {
            throw new Error("Missing username, email or password");
        }
        const hashedPass = await bcrypt.hash(String(pass), 10);
        const [result] = await db.execute(
            `INSERT INTO db_users (username, fullname, email, pass, user_type, status, trash)
             VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [username, fullname || "", email, hashedPass, user_type, Number(status) === 0 ? 0 : 1]
        );
        return [result];
    },

    update: async (id, user) => {
        const [rows] = await db.query("SELECT * FROM db_users WHERE user_id=?", [id]);
        if (!rows.length) throw new Error("User not found");
        const cur = rows[0];

        const username = user.username !== undefined ? user.username : cur.username;
        const fullname = user.fullname !== undefined ? user.fullname : cur.fullname;
        const email = user.email !== undefined ? user.email : cur.email;
        const user_type = user.user_type !== undefined ? user.user_type : cur.user_type;
        const status = user.status !== undefined ? user.status : cur.status;
        const trash = user.trash !== undefined ? user.trash : cur.trash;

        let pass = cur.pass;
        if (user.pass !== undefined && user.pass !== null && String(user.pass).trim() !== "") {
            pass = await bcrypt.hash(String(user.pass), 10);
        }

        await db.execute(
            `UPDATE db_users SET username=?, fullname=?, email=?, pass=?, user_type=?, status=?, trash=? WHERE user_id=?`,
            [username, fullname, email, pass, user_type, status, trash, id]
        );
    },

    delete: async (id) => {
        await db.query("UPDATE db_users SET trash=1 WHERE user_id=?", [id]);
    }
};

module.exports = UserService;
