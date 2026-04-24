const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const db = require("../src/config/db");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function getTableColumns(tableName) {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  return new Set(rows.map((r) => r.Field));
}

function pickExistingFields(data, columns) {
  return Object.fromEntries(Object.entries(data).filter(([k]) => columns.has(k)));
}

async function softDeleteCurrentData() {
  const tables = [
    "db_categories",
    "db_brands",
    "db_products",
    "db_topics",
    "db_posts",
    "db_banners",
    "db_links",
    "db_pages",
    "db_contacts",
  ];

  for (const table of tables) {
    const columns = await getTableColumns(table);
    if (!columns.has("trash")) continue;
    if (columns.has("status")) {
      await db.query(`UPDATE ${table} SET trash = 1, status = 0 WHERE IFNULL(trash,0) = 0`);
    } else {
      await db.query(`UPDATE ${table} SET trash = 1 WHERE IFNULL(trash,0) = 0`);
    }
  }
}

async function getAdminId() {
  const [admins] = await db.query(
    "SELECT user_id FROM db_users WHERE user_type='admin' AND IFNULL(trash,0)=0 ORDER BY user_id ASC LIMIT 1"
  );
  if (admins.length) return admins[0].user_id;
  const [users] = await db.query("SELECT user_id FROM db_users ORDER BY user_id ASC LIMIT 1");
  return users.length ? users[0].user_id : 1;
}

async function insertCategories() {
  const columns = await getTableColumns("db_categories");
  const categorySeeds = [
    { cat_name: "Sofa phòng khách", is_featured: 1 },
    { cat_name: "Bàn ăn", is_featured: 1 },
    { cat_name: "Giường ngủ", is_featured: 1 },
    { cat_name: "Tủ quần áo", is_featured: 0 },
    { cat_name: "Bàn làm việc", is_featured: 0 },
    { cat_name: "Trang trí nội thất", is_featured: 0 },
  ];

  const catMap = new Map();
  for (const seed of categorySeeds) {
    const payload = pickExistingFields(
      {
        cat_name: seed.cat_name,
        alias: slugify(seed.cat_name),
        parent_id: 0,
        status: 1,
        trash: 0,
        is_featured: seed.is_featured,
      },
      columns
    );
    const [r] = await db.query("INSERT INTO db_categories SET ?", [payload]);
    catMap.set(seed.cat_name, r.insertId);
  }
  return catMap;
}

async function insertBrands() {
  const columns = await getTableColumns("db_brands");
  const brandSeeds = [
    "DinhLePhat Home",
    "Cozy Living",
    "Nordic Casa",
    "WoodNest",
    "Maison Viet",
  ];

  const brandMap = new Map();
  for (const name of brandSeeds) {
    const payload = pickExistingFields(
      {
        brand_name: name,
        alias: slugify(name),
        status: 1,
        trash: 0,
      },
      columns
    );
    const [r] = await db.query("INSERT INTO db_brands SET ?", [payload]);
    brandMap.set(name, r.insertId);
  }
  return brandMap;
}

async function insertProducts(catMap, brandMap) {
  const columns = await getTableColumns("db_products");
  const now = new Date();
  const productSeeds = [
    {
      product_name: "Sofa nỉ 3 chỗ Luna",
      category: "Sofa phòng khách",
      brand: "Cozy Living",
      price: 12900000,
      price_sale: 11490000,
      tag: "sofa ni, 3 cho, phong khach hien dai",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200",
    },
    {
      product_name: "Sofa góc chữ L Oslo",
      category: "Sofa phòng khách",
      brand: "Nordic Casa",
      price: 18500000,
      price_sale: 16900000,
      tag: "sofa goc, phong khach, bac au",
      image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200",
    },
    {
      product_name: "Bàn ăn gỗ sồi 6 ghế",
      category: "Bàn ăn",
      brand: "WoodNest",
      price: 15800000,
      price_sale: 14200000,
      tag: "ban an go soi, 6 ghe",
      image: "https://images.unsplash.com/photo-1617098474202-0d0d7f60f7f2?w=1200",
    },
    {
      product_name: "Bàn ăn mặt đá Verona",
      category: "Bàn ăn",
      brand: "Maison Viet",
      price: 21400000,
      price_sale: 19800000,
      tag: "ban an mat da, cao cap",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    },
    {
      product_name: "Giường ngủ gỗ óc chó 1m8",
      category: "Giường ngủ",
      brand: "DinhLePhat Home",
      price: 16800000,
      price_sale: 14900000,
      tag: "giuong ngu go oc cho, 180x200",
      image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200",
    },
    {
      product_name: "Giường bọc nệm Stella",
      category: "Giường ngủ",
      brand: "Cozy Living",
      price: 14200000,
      price_sale: 12900000,
      tag: "giuong boc nem, toi gian",
      image: "https://images.unsplash.com/photo-1616594039964-3f3f5d2f9a83?w=1200",
    },
    {
      product_name: "Tủ quần áo cánh lùa 2m",
      category: "Tủ quần áo",
      brand: "WoodNest",
      price: 13500000,
      price_sale: 11900000,
      tag: "tu quan ao canh lua, go cong nghiep",
      image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=1200",
    },
    {
      product_name: "Bàn làm việc thông minh LiftDesk",
      category: "Bàn làm việc",
      brand: "Nordic Casa",
      price: 9800000,
      price_sale: 8990000,
      tag: "ban lam viec nang ha, home office",
      image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200",
    },
    {
      product_name: "Kệ trang trí treo tường Frame",
      category: "Trang trí nội thất",
      brand: "Maison Viet",
      price: 1850000,
      price_sale: 1490000,
      tag: "ke trang tri, treo tuong",
      image: "https://images.unsplash.com/photo-1617104551722-3b2d51366455?w=1200",
    },
    {
      product_name: "Đèn sàn decor Aurora",
      category: "Trang trí nội thất",
      brand: "DinhLePhat Home",
      price: 2650000,
      price_sale: 2190000,
      tag: "den san, decor phong khach",
      image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=1200",
    },
    {
      product_name: "Sofa băng 2.5 chỗ Kyoto",
      category: "Sofa phòng khách",
      brand: "Maison Viet",
      price: 10900000,
      price_sale: 9650000,
      tag: "sofa bang, 2.5 cho, toi gian",
      image: "https://images.unsplash.com/photo-1507149833265-60c372daea22?w=1200",
    },
    {
      product_name: "Sofa da công nghiệp Milan",
      category: "Sofa phòng khách",
      brand: "Nordic Casa",
      price: 23900000,
      price_sale: 21500000,
      tag: "sofa da, phong cach y, phong khach",
      image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200",
    },
    {
      product_name: "Bàn ăn tròn gỗ tự nhiên Nara",
      category: "Bàn ăn",
      brand: "Cozy Living",
      price: 12200000,
      price_sale: 10900000,
      tag: "ban an tron, go tu nhien, 4 ghe",
      image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200",
    },
    {
      product_name: "Bàn ăn mở rộng Extend Pro",
      category: "Bàn ăn",
      brand: "DinhLePhat Home",
      price: 17900000,
      price_sale: 15900000,
      tag: "ban an mo rong, 6-8 ghe",
      image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200",
    },
    {
      product_name: "Giường ngủ bọc vải Linen 1m6",
      category: "Giường ngủ",
      brand: "Maison Viet",
      price: 13600000,
      price_sale: 12100000,
      tag: "giuong boc vai, linen, 160x200",
      image: "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=1200",
    },
    {
      product_name: "Giường ngủ tối giản Tokyo 1m8",
      category: "Giường ngủ",
      brand: "WoodNest",
      price: 15100000,
      price_sale: 13400000,
      tag: "giuong toi gian, go soi, 180x200",
      image: "https://images.unsplash.com/photo-1616627981459-2f194d65234a?w=1200",
    },
    {
      product_name: "Tủ quần áo 3 cánh Modern Oak",
      category: "Tủ quần áo",
      brand: "Nordic Casa",
      price: 14900000,
      price_sale: 13100000,
      tag: "tu quan ao 3 canh, go soi, hien dai",
      image: "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?w=1200",
    },
    {
      product_name: "Tủ quần áo âm tường Slim Fit",
      category: "Tủ quần áo",
      brand: "Cozy Living",
      price: 17200000,
      price_sale: 15400000,
      tag: "tu am tuong, tiet kiem dien tich",
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200",
    },
    {
      product_name: "Bàn làm việc chân sắt LoftDesk",
      category: "Bàn làm việc",
      brand: "Maison Viet",
      price: 5250000,
      price_sale: 4690000,
      tag: "ban lam viec chan sat, phong cach loft",
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200",
    },
    {
      product_name: "Gương decor viền gỗ Oval",
      category: "Trang trí nội thất",
      brand: "DinhLePhat Home",
      price: 2290000,
      price_sale: 1890000,
      tag: "guong decor, vien go, treo tuong",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200",
    },
  ];

  for (const item of productSeeds) {
    const payload = pickExistingFields(
      {
        product_name: item.product_name,
        alias: slugify(item.product_name),
        price: item.price,
        price_sale: item.price_sale,
        cat_id: catMap.get(item.category) || null,
        brand_id: brandMap.get(item.brand) || null,
        status: 1,
        trash: 0,
        tag: item.tag,
        image: item.image,
        description: item.tag,
        created_at: now,
      },
      columns
    );
    await db.query("INSERT INTO db_products SET ?", [payload]);
  }
}

async function insertTopicsPostsContacts(adminId) {
  const topicColumns = await getTableColumns("db_topics");
  const postColumns = await getTableColumns("db_posts");
  const contactColumns = await getTableColumns("db_contacts");

  const topics = [
    {
      name: "Xu hướng nội thất",
      description: "Xu hướng thiết kế không gian sống hiện đại",
      image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200",
    },
    {
      name: "Kinh nghiệm bố trí",
      description: "Mẹo chọn và sắp xếp nội thất theo diện tích",
      image: "https://images.unsplash.com/photo-1616486886892-7d94c91b7a3c?w=1200",
    },
  ];

  const topicMap = new Map();
  for (const t of topics) {
    const payload = pickExistingFields(
      { name: t.name, description: t.description, image: t.image, status: 1, trash: 0 },
      topicColumns
    );
    const [r] = await db.query("INSERT INTO db_topics SET ?", [payload]);
    topicMap.set(t.name, r.insertId);
  }

  const posts = [
    {
      title: "5 cách bố trí sofa giúp phòng khách rộng hơn",
      topic: "Kinh nghiệm bố trí",
      image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200",
      content:
        "<p>Chọn sofa tông sáng, ưu tiên chân cao và bố trí theo hình chữ L để tối ưu lưu thông.</p><p>Kết hợp bàn trà nhỏ và đèn sàn giúp không gian thông thoáng hơn.</p>",
    },
    {
      title: "Xu hướng nội thất 2026: tông gỗ ấm và vật liệu bền vững",
      topic: "Xu hướng nội thất",
      image: "https://images.unsplash.com/photo-1616594039964-3f3f5d2f9a83?w=1200",
      content:
        "<p>Năm 2026 nổi bật với tông nâu gỗ, be cát và chất liệu thân thiện môi trường.</p><p>Nội thất module linh hoạt tiếp tục được ưa chuộng cho căn hộ đô thị.</p>",
    },
    {
      title: "Checklist chọn bàn ăn cho gia đình 4-6 người",
      topic: "Kinh nghiệm bố trí",
      image: "https://images.unsplash.com/photo-1617098474202-0d0d7f60f7f2?w=1200",
      content:
        "<p>Ưu tiên kích thước phù hợp, bề mặt dễ vệ sinh và ghế có tựa lưng tốt.</p><p>Khoảng cách tối thiểu 80cm quanh bàn giúp thao tác thoải mái.</p>",
    },
  ];

  for (const p of posts) {
    const payload = pickExistingFields(
      {
        title: p.title,
        content: p.content,
        topic_id: topicMap.get(p.topic) || null,
        author_id: adminId,
        image: p.image,
        status: 1,
        trash: 0,
      },
      postColumns
    );
    await db.query("INSERT INTO db_posts SET ?", [payload]);
  }

  const contacts = [
    {
      email: "khachhang01@example.com",
      title: "Tư vấn set sofa phòng khách 25m2",
      content: "Nhờ shop gợi ý combo sofa + bàn trà phù hợp ngân sách 20 triệu.",
      status: 0,
    },
    {
      email: "khachhang02@example.com",
      title: "Hỏi lịch giao và lắp đặt",
      content: "Mình ở Bình Thạnh, cần giao trong tuần này được không?",
      status: 1,
    },
  ];

  for (const c of contacts) {
    const payload = pickExistingFields(
      { email: c.email, title: c.title, content: c.content, status: c.status, trash: 0 },
      contactColumns
    );
    await db.query("INSERT INTO db_contacts SET ?", [payload]);
  }
}

async function insertBannersLinksPages(adminId) {
  const bannerColumns = await getTableColumns("db_banners");
  const linkColumns = await getTableColumns("db_links");
  const pageColumns = await getTableColumns("db_pages");

  const banners = [
    {
      title: "Bộ sưu tập phòng khách hiện đại",
      image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600",
      link: "/products?category=Sofa%20ph%C3%B2ng%20kh%C3%A1ch",
      is_active: 1,
      position: 1,
      status: 1,
      trash: 0,
    },
    {
      title: "Giảm đến 20% cho combo phòng ngủ",
      image_url: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1600",
      link: "/products?category=Gi%C6%B0%E1%BB%9Dng%20ng%E1%BB%A7",
      is_active: 1,
      position: 2,
      status: 1,
      trash: 0,
    },
  ];
  for (const b of banners) {
    await db.query("INSERT INTO db_banners SET ?", [pickExistingFields(b, bannerColumns)]);
  }

  const links = [
    { title: "Trang chủ", position: "mainmenu", image: "", link: "/", display_order: 1, status: 1, trash: 0 },
    { title: "Sản phẩm", position: "mainmenu", image: "", link: "/products", display_order: 2, status: 1, trash: 0 },
    { title: "Cẩm nang nội thất", position: "mainmenu", image: "", link: "/posts", display_order: 3, status: 1, trash: 0 },
    { title: "Liên hệ", position: "mainmenu", image: "", link: "/contact", display_order: 4, status: 1, trash: 0 },
  ];
  for (const l of links) {
    await db.query("INSERT INTO db_links SET ?", [pickExistingFields(l, linkColumns)]);
  }

  const pages = [
    {
      title: "Chính sách giao hàng & lắp đặt",
      content:
        "<p>DinhLePhat Home hỗ trợ giao hàng toàn quốc và lắp đặt tận nơi tại khu vực áp dụng.</p><p>Thời gian giao trung bình từ 2-5 ngày làm việc.</p>",
      created_by: adminId,
      status: 1,
      trash: 0,
    },
    {
      title: "Chính sách bảo hành nội thất",
      content:
        "<p>Sản phẩm được bảo hành theo từng danh mục từ 12 đến 60 tháng.</p><p>Liên hệ hotline để được hỗ trợ kỹ thuật nhanh chóng.</p>",
      created_by: adminId,
      status: 1,
      trash: 0,
    },
  ];
  for (const p of pages) {
    await db.query("INSERT INTO db_pages SET ?", [pickExistingFields(p, pageColumns)]);
  }
}

async function main() {
  console.log("Seeding furniture data...");
  const adminId = await getAdminId();
  await softDeleteCurrentData();
  const catMap = await insertCategories();
  const brandMap = await insertBrands();
  await insertProducts(catMap, brandMap);
  await insertTopicsPostsContacts(adminId);
  await insertBannersLinksPages(adminId);
  console.log("Done: replaced old seeded data with furniture seed data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.end());

