const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo pool kết nối để tái sử dụng
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotensv_mssv',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00', // đồng bộ timezone với csdl
});

module.exports = pool;