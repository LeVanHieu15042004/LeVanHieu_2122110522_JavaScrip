const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const username  = 'admin';
  const password  = 'admin123';
  const fullname  = 'Quản trị viên';
  const email     = 'admin@shop.com';
  const hash      = await bcrypt.hash(password, 10);

  await conn.execute(
    `INSERT INTO db_users (username, fullname, email, pass, user_type, status, trash)
     VALUES (?, ?, ?, ?, 'admin', 1, 0)
     ON DUPLICATE KEY UPDATE pass = VALUES(pass), user_type = 'admin', status = 1, trash = 0`,
    [username, fullname, email, hash]
  );

  console.log('✅ Tạo tài khoản admin thành công!');
  console.log('   Username : admin');
  console.log('   Password : admin123');
  await conn.end();
}

main().catch(console.error);
