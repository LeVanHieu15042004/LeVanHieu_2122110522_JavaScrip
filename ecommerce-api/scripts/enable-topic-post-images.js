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
  await safeAlter("ALTER TABLE db_topics ADD COLUMN image VARCHAR(255) NULL AFTER description");
  await safeAlter("ALTER TABLE db_posts ADD COLUMN image VARCHAR(255) NULL AFTER content");

  await db.query(
    `UPDATE db_topics
     SET image = CASE topic_id
       WHEN 1 THEN 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800'
       WHEN 2 THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
       ELSE image
     END
     WHERE IFNULL(trash,0)=0 AND (image IS NULL OR image='')`
  );

  await db.query(
    `UPDATE db_posts
     SET image = CASE post_id
       WHEN 1 THEN 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=900'
       WHEN 2 THEN 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900'
       WHEN 3 THEN 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900'
       ELSE image
     END
     WHERE IFNULL(trash,0)=0 AND (image IS NULL OR image='')`
  );

  console.log("Done: db_topics/db_posts support image + seeded sample URLs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.end());
