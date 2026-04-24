const express = require('express');
const router = express.Router();

const orderDetailController = require('../controllers/orderDetailController');
const { authMiddleware, adminMiddleware } = require('../middleware');

// =======================
// ORDER DETAIL ROUTES
// =======================

// User routes (yêu cầu đăng nhập)
router.get('/', authMiddleware, orderDetailController.getAll);
router.get('/order/:order_id', authMiddleware, orderDetailController.getByOrderId);
router.get('/:id', authMiddleware, orderDetailController.getById);

// Admin routes (yêu cầu đăng nhập + quyền admin)
const adminOnly = [authMiddleware, adminMiddleware];

router.post('/', adminOnly, orderDetailController.create);
router.put('/:id', adminOnly, orderDetailController.update);
router.delete('/:id', adminOnly, orderDetailController.delete);

module.exports = router;