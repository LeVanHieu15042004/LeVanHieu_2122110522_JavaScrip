const express = require('express');
const router = express.Router();

const brandController = require('../controllers/brandController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// =======================
// PUBLIC API
// =======================

// lấy tất cả brand
router.get('/', brandController.getAll);

// lấy brand theo id
router.get('/:id', brandController.getById);


// =======================
// ADMIN API
// =======================

// tạo brand
router.post('/', authMiddleware, adminMiddleware, brandController.create);

// cập nhật brand
router.put('/:id', authMiddleware, adminMiddleware, brandController.update);

// xóa brand
router.delete('/:id', authMiddleware, adminMiddleware, brandController.delete);


module.exports = router;