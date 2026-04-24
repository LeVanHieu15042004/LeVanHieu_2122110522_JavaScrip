const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// =======================
// PUBLIC API
// =======================

// gửi liên hệ
router.post('/', contactController.create);


// =======================
// ADMIN API
// =======================

// xem tất cả contact
router.get('/', authMiddleware, adminMiddleware, contactController.getAll);

// xem chi tiết contact
router.get('/:id', authMiddleware, adminMiddleware, contactController.getById);

// cập nhật trạng thái (đã xử lý / chưa xử lý)
router.put('/:id', authMiddleware, adminMiddleware, contactController.update);

// xóa contact
router.delete('/:id', authMiddleware, adminMiddleware, contactController.delete);


module.exports = router;