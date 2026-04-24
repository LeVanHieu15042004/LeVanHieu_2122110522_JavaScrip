const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ======================
// PUBLIC
// ======================

// lấy tất cả page
router.get('/', pageController.getAll);

// lấy page theo id
router.get('/:id', pageController.getById);


// ======================
// ADMIN
// ======================

// tạo page
router.post('/', authMiddleware, adminMiddleware, pageController.create);

// cập nhật page
router.put('/:id', authMiddleware, adminMiddleware, pageController.update);

// xóa page
router.delete('/:id', authMiddleware, adminMiddleware, pageController.delete);


module.exports = router;