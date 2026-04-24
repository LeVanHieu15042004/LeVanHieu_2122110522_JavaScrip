const OrderDetailService = require('../services/orderDetailService');

const OrderDetailController = {
    getAll: async (req, res) => {
        const filters = {
            trash: req.query.trash,
            status: req.query.status
        };
        try {
            const details = await OrderDetailService.getAll(filters);
            res.json(details);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const detail = await OrderDetailService.getById(req.params.id);
            if (!detail.length) return res.status(404).json({ message: 'Order detail not found' });
            res.json(detail[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getByOrderId: async (req, res) => {
        try {
            const details = await OrderDetailService.getByOrderId(req.params.orderId);
            res.json(details);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const { order_id, product_id, product_name, product_image, price, quantity } = req.body;
            const result = await OrderDetailService.create({ order_id, product_id, product_name, product_image, price, quantity });
            res.status(201).json({ id: result[0].insertId, order_id, product_id, product_name, product_image, price, quantity });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await OrderDetailService.update(req.params.id, req.body);
            res.json({ id: req.params.id, ...req.body });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await OrderDetailService.delete(req.params.id);
            res.json({ message: 'Order detail deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = OrderDetailController;