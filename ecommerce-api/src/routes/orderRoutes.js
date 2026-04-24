const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const OrderController = require('../controllers/orderController');

router.get('/', authMiddleware, adminMiddleware, OrderController.getAll);

router.get('/mine', authMiddleware, OrderController.getMine);

router.get('/:id', authMiddleware, adminMiddleware, OrderController.getById);

router.post('/', OrderController.create);

router.put('/:id', authMiddleware, OrderController.update);

router.patch('/:id/status', authMiddleware, adminMiddleware, OrderController.updateStatus);
router.patch('/:id/cancel', authMiddleware, OrderController.cancelMine);

router.delete('/:id', authMiddleware, adminMiddleware, OrderController.delete);

module.exports = router;