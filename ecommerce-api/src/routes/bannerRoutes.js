const express = require('express');
const router = express.Router();

const BannerController = require('../controllers/bannerController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// =========================
// PUBLIC API
// =========================

// lấy tất cả banner
router.get('/', BannerController.getAll);

// lấy banner theo id
router.get('/:id', BannerController.getById);


// =========================
// ADMIN API
// =========================

// tạo banner
router.post('/', authMiddleware, adminMiddleware, BannerController.create);

// cập nhật banner
router.put('/:id', authMiddleware, adminMiddleware, BannerController.update);

// xóa banner
router.delete('/:id', authMiddleware, adminMiddleware, BannerController.delete);


module.exports = router;