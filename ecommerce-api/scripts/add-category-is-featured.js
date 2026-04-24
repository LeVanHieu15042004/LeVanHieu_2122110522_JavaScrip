const db = require("../src/config/db");

async function safeAlter(sql) {
  try {
    await db.query(sql);
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") return;
    throw e;
  }
}

async function main() {
  await safeAlter(
    "ALTER TABLE db_categories ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER status"
  );
  console.log("Done: db_categories.is_featured (0/1). Bật nổi bật trong Admin → Danh mục → Sửa.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
