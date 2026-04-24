// src/controllers/userController.js
const UserService = require('../services/userService.js');

const UserController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const users = await UserService.getAll(filters);
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const user = await UserService.getById(req.params.id);
            if (!user.length) return res.status(404).json({ message: 'User not found' });
            res.json(user[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const { username, fullname, pass, email, user_type, admin_level, avatar } = req.body;
            const result = await UserService.create({ username, fullname, pass, email, user_type, admin_level, avatar });
            res.status(201).json({ id: result[0].insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const { username, fullname, pass, email, user_type, admin_level, avatar, status, trash } = req.body;
            await UserService.update(req.params.id, { username, fullname, pass, email, user_type, admin_level, avatar, status, trash });
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await UserService.delete(req.params.id);
            res.json({ message: 'User deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = UserController;