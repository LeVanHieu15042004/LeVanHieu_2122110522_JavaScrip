const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Kiểm tra đúng server: mở http://localhost:5000/api/__health (phải JSON, không phải 404)
app.get('/api/__health', (req, res) => {
    res.json({
        ok: true,
        service: 'ecommerce-api',
        bannersPath: '/api/banners',
        hint: 'Nếu /admin/banners lỗi 404, bạn đang chạy nhầm tiến trình khác trên cổng 5000 — tắt hết rồi chạy: node server.js',
    });
});

// ── Routes ──
app.use('/api/auth',     require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/product-sales', require('./src/routes/productSaleRoutes'));
app.use('/api/brands',   require('./src/routes/brandRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/orders',   require('./src/routes/orderRoutes'));
app.use('/api/users',    require('./src/routes/userRoutes'));
app.use('/api/uploads',  require('./src/routes/uploadRoutes'));
app.use('/api/products', require('./src/routes/productUploadRoutes'));
app.use('/api/banners',  require('./src/routes/bannerRoutes'));
app.use('/api/pages',    require('./src/routes/pageRoutes'));
app.use('/api/posts',    require('./src/routes/postRoutes'));
app.use('/api/links',    require('./src/routes/linkRoutes'));
app.use('/api/topics',   require('./src/routes/topicRoutes'));
app.use('/api/contacts', require('./src/routes/contactRoutes'));
app.use('/api/address', require('./src/routes/addressRoutes'));

app.listen(5000, () => {
    console.log('Server running http://localhost:5000');
    console.log('CMS routes: /api/banners /api/links /api/pages /api/topics /api/posts /api/contacts');
});
