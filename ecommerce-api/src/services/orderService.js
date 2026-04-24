const db = require('../config/db');
const { ensureOrderAddressColumns } = require("../utils/addressColumns");

const OrderService = {

    // ===============================
    // GET ALL ORDERS
    // ===============================
    getAll: async (filters) => {

        let query = `SELECT * FROM db_orders WHERE 1=1`;
        let params = [];

        if (filters.trash !== undefined) {
            query += ` AND IFNULL(trash,0) = ?`;
            params.push(filters.trash);
        }

        if (filters.status !== undefined) {
            query += ` AND status = ?`;
            params.push(filters.status);
        }

        query += ` ORDER BY created_at DESC`;

        const [rows] = await db.query(query, params);
        return rows;
    },

    // ===============================
    // GET ORDER BY ID
    // ===============================
    getById: async (id) => {

        const [orders] = await db.query(
            `SELECT * FROM db_orders WHERE order_id = ?`,
            [id]
        );

        if (!orders.length) return null;

        const [details] = await db.query(
            `SELECT * FROM db_order_details WHERE order_id = ?`,
            [id]
        );

        return {
            ...orders[0],
            details
        };
    },

    getByUserId: async (userId) => {
        const [orders] = await db.query(
            `SELECT * FROM db_orders WHERE user_id = ? AND IFNULL(trash,0) = 0 ORDER BY created_at DESC`,
            [userId]
        );

        const mapped = await Promise.all(
            orders.map(async (order) => {
                const [details] = await db.query(
                    `SELECT * FROM db_order_details WHERE order_id = ?`,
                    [order.order_id]
                );
                return {
                    ...order,
                    details
                };
            })
        );

        return mapped;
    },

    getByUser: async ({ userId, email }) => {
        const params = [];
        let where = "WHERE IFNULL(trash,0) = 0";
        const ownershipConditions = [];

        if (userId != null && String(userId).trim() !== "") {
            ownershipConditions.push("user_id = ?");
            params.push(userId);
        }

        if (email && String(email).trim() !== "") {
            ownershipConditions.push("LOWER(TRIM(email)) = LOWER(TRIM(?))");
            params.push(String(email).trim());
        }

        if (ownershipConditions.length > 0) {
            where += ` AND (${ownershipConditions.join(" OR ")})`;
        } else {
            return [];
        }

        const [orders] = await db.query(
            `SELECT * FROM db_orders ${where} ORDER BY created_at DESC`,
            params
        );

        const mapped = await Promise.all(
            orders.map(async (order) => {
                const [details] = await db.query(
                    `SELECT * FROM db_order_details WHERE order_id = ?`,
                    [order.order_id]
                );
                return {
                    ...order,
                    details
                };
            })
        );

        return mapped;
    },

    // ===============================
    // CREATE ORDER + DETAILS
    // ===============================
    create: async (order, details) => {

        const conn = await db.getConnection();
        try {

            await ensureOrderAddressColumns();
            await conn.beginTransaction();

            const composedAddress = order.address || [
                order.street_address,
                order.ward_name,
                order.district_name,
                order.province_name
            ].filter(Boolean).join(", ");

            const [result] = await conn.query(
                `INSERT INTO db_orders 
                (user_id, customer_name, address, phone, email, total, note, status, trash, province_code, province_name, district_code, district_name, ward_code, ward_name, street_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order.user_id,
                    order.customer_name,
                    composedAddress,
                    order.phone,
                    order.email,
                    order.total,
                    order.note || '',
                    order.status || 0,
                    0,
                    order.province_code || null,
                    order.province_name || null,
                    order.district_code || null,
                    order.district_name || null,
                    order.ward_code || null,
                    order.ward_name || null,
                    order.street_address || null
                ]
            );
            const orderId = result.insertId;

            if (details && details.length > 0) {

                for (const item of details) {

                    await conn.query(
                        `INSERT INTO db_order_details
                        (order_id, product_id, product_name, product_image, price, quantity)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            orderId,
                            item.product_id,
                            item.product_name,
                            item.product_image,
                            item.price,
                            item.quantity
                        ]
                    );

                }

            }

            await conn.commit();

            return orderId;

        } catch (err) {

            await conn.rollback();
            throw err;

        } finally {

            conn.release();

        }
    },

    // ===============================
    // UPDATE ORDER
    // ===============================
    update: async (id, data) => {

        const fields = [];
        const values = [];

        for (const key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }

        values.push(id);

        const query = `UPDATE db_orders SET ${fields.join(', ')} WHERE order_id = ?`;

        await db.query(query, values);
    },

    // ===============================
    // UPDATE STATUS
    // ===============================
    updateStatus: async (id, status) => {

        await db.query(
            `UPDATE db_orders SET status = ? WHERE order_id = ?`,
            [status, id]
        );

    },

    cancelByUser: async ({ orderId, userId, email }) => {
        const [orders] = await db.query(
            `SELECT order_id, status, user_id, email
             FROM db_orders
             WHERE order_id = ? AND IFNULL(trash,0) = 0
             LIMIT 1`,
            [orderId]
        );

        if (!orders.length) {
            return { ok: false, reason: "not_found" };
        }

        const order = orders[0];
        const ownerByUserId = userId != null && Number(order.user_id) === Number(userId);
        const ownerByEmail = !!email && order.email && String(order.email).toLowerCase() === String(email).toLowerCase();

        if (!ownerByUserId && !ownerByEmail) {
            return { ok: false, reason: "forbidden" };
        }

        const currentStatus = Number(order.status);
        if (![0, 1].includes(currentStatus)) {
            return { ok: false, reason: "invalid_status", status: currentStatus };
        }

        await db.query(
            `UPDATE db_orders SET status = 4 WHERE order_id = ?`,
            [orderId]
        );

        return { ok: true };
    },

    // ===============================
    // DELETE ORDER
    // ===============================
    delete: async (id) => {

        await db.query(
            `UPDATE db_orders SET trash = 1 WHERE order_id = ?`,
            [id]
        );

    }

};

module.exports = OrderService;