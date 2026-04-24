const express = require('express');
const router = express.Router();

const PostController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ======================
// PUBLIC
// ======================

// lấy tất cả bài viết
router.get('/', PostController.getAll);

// lấy bài viết theo id
router.get('/:id', PostController.getById);


// ======================
// ADMIN
// ======================

// tạo bài viết
router.post('/', authMiddleware, adminMiddleware, PostController.create);

// cập nhật bài viết
router.put('/:id', authMiddleware, adminMiddleware, PostController.update);

// xóa bài viết
router.delete('/:id', authMiddleware, adminMiddleware, PostController.delete);

module.exports = router;