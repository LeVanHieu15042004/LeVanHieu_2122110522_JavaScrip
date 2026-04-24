const express = require('express');
const router = express.Router();

const linkController = require('../controllers/linkController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// =======================
// PUBLIC (menu shop lấy từ db_links)
// =======================
router.get('/', linkController.getAll);
router.get('/:id', linkController.getById);

// =======================
// ADMIN
// =======================

// tạo link
router.post('/', authMiddleware, adminMiddleware, linkController.create);

// cập nhật link
router.put('/:id', authMiddleware, adminMiddleware, linkController.update);

// xóa link
router.delete('/:id', authMiddleware, adminMiddleware, linkController.delete);


module.exports = router;