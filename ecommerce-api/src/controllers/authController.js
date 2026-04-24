const AuthService = require('../services/authService');
const jwt = require("jsonwebtoken");
const UserService = require('../services/userService');

const AuthController = {

    // REGISTER
    register: async (req, res) => {
        try {
            console.log("REGISTER BODY:", req.body);

            const user = await AuthService.register(req.body);

            res.status(201).json({
                message: "Register successful",
                user
            });

        } catch (err) {
            console.error("❌ REGISTER ERROR:", err.message);

            res.status(400).json({
                message: err.message
            });
        }
    },

    // GET ME
    me: async (req, res) => {
        try {
            const userId = req.user?.user_id;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });
            const users = await UserService.getById(userId);
            if (!Array.isArray(users) || users.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            const u = users[0];
            res.json({
                user_id: u.user_id,
                username: u.username,
                fullname: u.fullname,
                email: u.email,
                avatar: u.avatar,
                user_type: u.user_type,
                status: u.status,
                province_code: u.province_code || null,
                province_name: u.province_name || null,
                district_code: u.district_code || null,
                district_name: u.district_name || null,
                ward_code: u.ward_code || null,
                ward_name: u.ward_name || null,
                street_address: u.street_address || null,
                full_address: u.full_address || null
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // LOGIN
    login: async (req, res) => {
        try {
            console.log("LOGIN BODY:", req.body);

            const username = req.body.username?.trim();
            const password = req.body.password?.trim();

            if (!username || !password) {
                return res.status(400).json({
                    message: "Missing username or password"
                });
            }

            const user = await AuthService.login({ username, password });

            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    username: user.username,
                    user_type: user.user_type
                },
                process.env.JWT_SECRET || "mysecretkey",
                { expiresIn: "7d" }
            );

            res.json({
                message: "Login successful",
                user,
                token
            });

        } catch (err) {
            console.error("❌ LOGIN ERROR:", err.message);

            res.status(401).json({
                message: err.message
            });
        }
    }

};

module.exports = AuthController;