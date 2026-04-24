const db = require("../config/db");

let usersColumnsReady = false;
let ordersColumnsReady = false;

async function columnExists(tableName, columnName) {
    const [rows] = await db.query(
        `SELECT 1
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
         LIMIT 1`,
        [tableName, columnName]
    );
    return rows.length > 0;
}

async function addColumnIfMissing(tableName, definition) {
    const columnName = definition.trim().split(/\s+/)[0].replace(/`/g, "");
    const exists = await columnExists(tableName, columnName);
    if (!exists) {
        await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
    }
}

async function ensureUserAddressColumns() {
    if (usersColumnsReady) return;
    await addColumnIfMissing("db_users", "province_code varchar(20) NULL");
    await addColumnIfMissing("db_users", "province_name varchar(150) NULL");
    await addColumnIfMissing("db_users", "district_code varchar(20) NULL");
    await addColumnIfMissing("db_users", "district_name varchar(150) NULL");
    await addColumnIfMissing("db_users", "ward_code varchar(20) NULL");
    await addColumnIfMissing("db_users", "ward_name varchar(150) NULL");
    await addColumnIfMissing("db_users", "street_address varchar(255) NULL");
    await addColumnIfMissing("db_users", "full_address varchar(500) NULL");
    usersColumnsReady = true;
}

async function ensureOrderAddressColumns() {
    if (ordersColumnsReady) return;
    await addColumnIfMissing("db_orders", "province_code varchar(20) NULL");
    await addColumnIfMissing("db_orders", "province_name varchar(150) NULL");
    await addColumnIfMissing("db_orders", "district_code varchar(20) NULL");
    await addColumnIfMissing("db_orders", "district_name varchar(150) NULL");
    await addColumnIfMissing("db_orders", "ward_code varchar(20) NULL");
    await addColumnIfMissing("db_orders", "ward_name varchar(150) NULL");
    await addColumnIfMissing("db_orders", "street_address varchar(255) NULL");
    ordersColumnsReady = true;
}

module.exports = {
    ensureUserAddressColumns,
    ensureOrderAddressColumns
};
