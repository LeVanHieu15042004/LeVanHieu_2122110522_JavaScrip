const db = require('../config/db');
const bcrypt = require('bcrypt');
const { ensureUserAddressColumns } = require("../utils/addressColumns");

const AuthService = {

    // REGISTER
    register: async (userData) => {

        const {
            username,
            fullname,
            email,
            password,
            province_code,
            province_name,
            district_code,
            district_name,
            ward_code,
            ward_name,
            street_address
        } = userData;

        if (!username || !email || !password) {
            throw new Error("Missing register data");
        }

        const [exist] = await db.execute(
            'SELECT user_id FROM db_users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (exist.length) {
            throw new Error('Username or email already exists');
        }

        const hashedPass = await bcrypt.hash(password, 10);

        await ensureUserAddressColumns();

        const fullAddress = [street_address, ward_name, district_name, province_name]
            .filter(Boolean)
            .join(", ");

        await db.execute(
            `INSERT INTO db_users
            (username, fullname, email, pass, status, trash, user_type, province_code, province_name, district_code, district_name, ward_code, ward_name, street_address, full_address)
            VALUES (?, ?, ?, ?, 1, 0, 'user', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username, fullname, email, hashedPass,
                province_code || null,
                province_name || null,
                district_code || null,
                district_name || null,
                ward_code || null,
                ward_name || null,
                street_address || null,
                fullAddress || null
            ]
        );

        return {
            username,
            email,
            full_address: fullAddress || null
        };
    },

    // LOGIN
    login: async ({ username, password }) => {

        if (!username || !password) {
            throw new Error("Missing credentials");
        }

        const [users] = await db.execute(
            'SELECT * FROM db_users WHERE username = ? AND trash = 0',
            [username]
        );

        if (!users.length) {
            throw new Error('User not found');
        }

        const user = users[0];

        const match = await bcrypt.compare(password, user.pass);

        if (!match) {
            throw new Error('Invalid password');
        }

        return {
            user_id: user.user_id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            avatar: user.avatar,
            user_type: user.user_type,
            province_code: user.province_code || null,
            province_name: user.province_name || null,
            district_code: user.district_code || null,
            district_name: user.district_name || null,
            ward_code: user.ward_code || null,
            ward_name: user.ward_name || null,
            street_address: user.street_address || null,
            full_address: user.full_address || null
        };
    }

};

module.exports = AuthService;