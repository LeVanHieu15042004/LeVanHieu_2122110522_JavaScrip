const LinkService = require('../services/linkService');

const LinkController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const links = await LinkService.getAll(filters);
            res.json(links);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const link = await LinkService.getById(req.params.id);
            if (!link.length) return res.status(404).json({ message: 'Link not found' });
            res.json(link[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const insertId = await LinkService.create(req.body);
            res.status(201).json({ id: insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await LinkService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await LinkService.delete(req.params.id);
            res.json({ message: 'Link deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = LinkController;