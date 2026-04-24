/**
 * Chèn mẫu db_topics, db_posts, db_contacts (idempotent theo title/email+title).
 * Chạy từ thư mục ecommerce-api: node scripts/seed-posts-contacts.js
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const db = require("../src/config/db");

async function getAdminId() {
  const [admins] = await db.query(
    "SELECT user_id FROM db_users WHERE user_type = 'admin' AND IFNULL(trash,0)=0 ORDER BY user_id ASC LIMIT 1"
  );
  if (admins.length) return admins[0].user_id;
  const [any] = await db.query(
    "SELECT user_id FROM db_users WHERE IFNULL(trash,0)=0 ORDER BY user_id ASC LIMIT 1"
  );
  if (any.length) return any[0].user_id;
  return 1;
}

async function ensureTopic(name, description) {
  const [exists] = await db.query(
    "SELECT topic_id FROM db_topics WHERE name = ? AND IFNULL(trash,0)=0 LIMIT 1",
    [name]
  );
  if (exists.length) return { id: exists[0].topic_id, created: false };
  const [r] = await db.query(
    "INSERT INTO db_topics (name, description) VALUES (?, ?)",
    [name, description]
  );
  return { id: r.insertId, created: true };
}

async function ensurePost(title, content, topicId, authorId) {
  const [exists] = await db.query(
    "SELECT post_id FROM db_posts WHERE title = ? AND IFNULL(trash,0)=0 LIMIT 1",
    [title]
  );
  if (exists.length) return { id: exists[0].post_id, created: false };
  const [r] = await db.query(
    "INSERT INTO db_posts (title, content, topic_id, author_id, trash) VALUES (?, ?, ?, ?, 0)",
    [title, content, topicId, authorId]
  );
  return { id: r.insertId, created: true };
}

async function ensureContact(email, title, content, status) {
  const [exists] = await db.query(
    "SELECT contact_id FROM db_contacts WHERE email = ? AND title = ? AND IFNULL(trash,0)=0 LIMIT 1",
    [email, title]
  );
  if (exists.length) return { id: exists[0].contact_id, created: false };
  const [r] = await db.query(
    "INSERT INTO db_contacts (email, title, content, status, trash) VALUES (?, ?, ?, ?, 0)",
    [email, title, content, status]
  );
  return { id: r.insertId, created: true };
}

async function main() {
  const adminId = await getAdminId();
  const tNews = await ensureTopic("Tin tức", "Tin khuyến mãi và cập nhật sản phẩm");
  const tGuide = await ensureTopic("Hướng dẫn", "Mẹo sử dụng thiết bị và bảo hành");
  console.log(
    `Topics: Tin tức #${tNews.id} (${tNews.created ? "mới" : "đã có"}), Hướng dẫn #${tGuide.id} (${tGuide.created ? "mới" : "đã có"})`
  );

  const posts = [
    [
      "Khai trương chương trình thu cũ đổi mới",
      '<p><img src="https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800" alt="iPhone" style="max-width:100%;border-radius:12px;margin-bottom:12px" /></p><p>Thu máy cũ <strong>giá tốt</strong>, hỗ trợ lên đời iPhone mới. Gửi tin qua <a href="/contact">Liên hệ</a>.</p>',
      tNews.id,
    ],
    [
      "Mẹo kéo dài pin iPhone",
      "<ol><li>Bật tối ưu pin trong Cài đặt.</li><li>Giảm độ sáng màn hình.</li><li>Tắt làm mới nền cho app ít dùng.</li></ol>",
      tGuide.id,
    ],
    [
      "So sánh nhanh iPhone 15 và iPhone 16",
      '<p><img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800" alt="iPhone so sánh" style="max-width:100%;border-radius:12px;margin-bottom:12px" /></p><p>Bài viết demo cho trang <strong>/admin/posts</strong>. Nội dung có thể chỉnh sau.</p>',
      tNews.id,
    ],
  ];

  for (const [title, content, topicId] of posts) {
    const r = await ensurePost(title, content, topicId, adminId);
    console.log(r.created ? `  + Post #${r.id}: ${title}` : `  = Post đã có: ${title}`);
  }

  const contacts = [
    ["demo1@example.com", "Hỏi giá iPhone 16 Pro", "Cho mình xin giá và tình trạng hàng.", 0],
    ["demo2@example.com", "Giao hàng Hà Nội", "Shop có ship COD trong ngày không?", 2],
    ["khach.le@example.com", "Hỗ trợ bảo hành", "Máy lỗi màn sau vài tháng, cần tư vấn.", 1],
  ];

  for (const [email, title, content, status] of contacts) {
    const r = await ensureContact(email, title, content, status);
    console.log(r.created ? `  + Contact #${r.id}: ${title}` : `  = Contact đã có: ${title}`);
  }

  console.log("Xong. Mở /admin/posts và /admin/contacts để xem.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.end());
