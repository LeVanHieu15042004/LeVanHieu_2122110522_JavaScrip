const BannerService = require('../services/bannerService');

const BannerController = {
    getAll: async (req, res) => {
        const filters = {};
        if (req.query.trash !== undefined && String(req.query.trash) !== "") {
            filters.trash = req.query.trash;
        }
        if (req.query.status !== undefined && String(req.query.status) !== "") {
            filters.status = req.query.status;
        }
        if (req.query.is_active !== undefined && String(req.query.is_active) !== "") {
            filters.is_active = req.query.is_active;
        }
        try {
            const banners = await BannerService.getAll(filters);
            res.json(banners);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const banner = await BannerService.getById(req.params.id);
            if (!banner.length) return res.status(404).json({ message: 'Banner not found' });
            res.json(banner[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const result = await BannerService.create(req.body);
            res.status(201).json({ id: result[0].insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await BannerService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await BannerService.delete(req.params.id);
            res.json({ message: 'Banner deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = BannerController;