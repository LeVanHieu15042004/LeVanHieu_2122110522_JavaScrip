// src/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');


// ===============================
// UPLOAD 1 FILE
// ===============================
router.post(
    '/single',
    authMiddleware,
    adminMiddleware,
    upload.single('image'),
    (req, res) => {
        try {

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const filePath =
                `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

            res.json({
                message: 'Upload successful',
                file: filePath
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }
    }
);


// ===============================
// UPLOAD MULTIPLE FILES
// ===============================
router.post(
    '/multiple',
    authMiddleware,
    adminMiddleware,
    upload.array('images', 5),
    (req, res) => {

        try {

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    message: 'No files uploaded'
                });
            }

            const files = req.files.map(file =>
                `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
            );

            res.json({
                message: 'Upload successful',
                files
            });

        } catch (err) {

            res.status(500).json({
                error: err.message
            });

        }

    }
);

module.exports = router;