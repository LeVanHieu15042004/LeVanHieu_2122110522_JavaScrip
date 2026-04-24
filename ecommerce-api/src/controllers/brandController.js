const BrandService = require('../services/brandService');

const BrandController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const brands = await BrandService.getAll(filters);
            res.json(brands);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const brand = await BrandService.getById(req.params.id);
            if (!brand.length) return res.status(404).json({ message: 'Brand not found' });
            res.json(brand[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const insertId = await BrandService.create(req.body);
            res.status(201).json({ id: insertId, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await BrandService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await BrandService.delete(req.params.id);
            res.json({ message: 'Brand deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = BrandController;