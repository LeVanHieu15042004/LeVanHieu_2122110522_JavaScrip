const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/',    productController.getAll);
router.get('/best-seller', productController.getBestSeller);
router.get('/:id', productController.getById);
router.post('/',   authMiddleware, adminMiddleware, ...productController.create);
router.put('/:id', authMiddleware, adminMiddleware, ...productController.update);
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);

module.exports = router;
