const db = require("../config/db");
const OrderDetailService = {
    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM db_order_details");
        return rows;
    },
    getByOrderId: async (order_id) => {
        const [rows] = await db.query(
            "SELECT * FROM db_order_details WHERE order_id=?",
            [order_id]
        );
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query(
            "SELECT * FROM db_order_details WHERE order_detail_id=?",
            [id]
        );
        return rows;
    },

    create: async (detail) => {
        const { order_id, product_id, product_name, product_image, price, quantity } = detail;
        const [result] = await db.query(
            "INSERT INTO db_order_details (order_id, product_id, product_name, product_image, price, quantity) VALUES (?, ?, ?, ?,?,?)",
            [order_id, product_id, product_name, product_image, price, quantity]
        );
        return result.insertId;
    },

    update: async (id, detail) => {
        const { order_id, product_id, product_name, product_image, price, quantity } = detail;
        await db.query(
            "UPDATE db_order_details SET order_id=?, product_id=?,product_name=?, product_image=?, price=?, quantity=? WHERE order_detail_id=?",
            [order_id, product_id, product_name, product_image, price, quantity, id]
        );
    },

    delete: async (id) => {
        await db.query("DELETE FROM db_order_details WHERE order_detail_id=?", [id]);
    }
}
module.exports = OrderDetailService;