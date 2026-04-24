const express = require('express');
const router = express.Router();
const TopicController = require('../controllers/topicController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ===============================
// PUBLIC API
// ===============================

// lấy danh sách topic
router.get('/', TopicController.getAll);

// lấy topic theo id
router.get('/:id', TopicController.getById);


// ===============================
// ADMIN API
// ===============================

// tạo topic
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    TopicController.create
);

// cập nhật topic
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    TopicController.update
);

// xoá topic
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    TopicController.delete
);

module.exports = router;