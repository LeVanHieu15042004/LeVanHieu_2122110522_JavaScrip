const PageService = require('../services/pageService');

const PageController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const pages = await PageService.getAll(filters);
            res.json(pages);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const page = await PageService.getById(req.params.id);
            if (!page.length) return res.status(404).json({ message: 'Page not found' });
            res.json(page[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await PageService.create(req.body);
            res.status(201).json({ id: result, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await PageService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await PageService.delete(req.params.id);
            res.json({ message: 'Page deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = PageController;