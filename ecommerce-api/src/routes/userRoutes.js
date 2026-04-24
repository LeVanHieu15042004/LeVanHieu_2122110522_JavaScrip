const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// ===============================
// USER LIST
// ===============================

// Lấy tất cả user (admin)
router.get('/', authMiddleware, adminMiddleware, userController.getAll);


// ===============================
// USER DETAIL
// ===============================

// Lấy user theo id (admin)
router.get('/:id', authMiddleware, adminMiddleware, userController.getById);


// ===============================
// CRUD USER
// ===============================

// Tạo user (admin)
router.post('/', authMiddleware, adminMiddleware, userController.create);

// Cập nhật user (admin)
router.put('/:id', authMiddleware, adminMiddleware, userController.update);

// Xóa user (admin)
router.delete('/:id', authMiddleware, adminMiddleware, userController.delete);


module.exports = router;