const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const ProductService = require('../services/productService');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// upload ảnh cho product
router.post(
    '/:id/image',
    authMiddleware,
    adminMiddleware,
    upload.single('image'),
    async (req, res) => {

        try {

            const productId = req.params.id;

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const imageUrl = req.file.filename;

            await ProductService.update(productId, {
                product_image: imageUrl
            });

            res.json({
                message: 'Image uploaded successfully',
                image: imageUrl
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    }
);

module.exports = router;