const CategoryService = require("../services/categoryService");

const categoryController = {
    getAll: async (req, res) => {
        try {
            const filters = {
                trash: req.query.trash,
                status: req.query.status,
                featured: req.query.featured
            };
            const categories = await CategoryService.getAll(filters);
            res.json(categories);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const category = await CategoryService.getById(req.params.id);
            if (!category.length) return res.status(404).json({ message: "Category not found" });
            res.json(category[0]);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const id = await CategoryService.create(req.body);
            res.status(201).json({ id, ...req.body });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await CategoryService.update(req.params.id, req.body);
            res.json({ message: "Category updated" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await CategoryService.delete(req.params.id);
            res.json({ message: "Category deleted" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = categoryController;
