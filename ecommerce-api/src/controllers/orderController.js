const OrderService = require('../services/orderService');
const { sendOrderConfirmationEmail } = require('../utils/mailer');
const UserService = require('../services/userService');

const OrderController = {

    // ===============================
    // GET ALL
    // ===============================
    getAll: async (req, res) => {

        try {

            const filters = {
                trash: req.query.trash,
                status: req.query.status
            };

            const orders = await OrderService.getAll(filters);

            res.json({
                success: true,
                data: orders
            });

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    },

    // ===============================
    // GET BY ID
    // ===============================
    getById: async (req, res) => {

        try {

            const order = await OrderService.getById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            res.json({
                success: true,
                data: order
            });

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    },

    // ===============================
    // GET MY ORDERS
    // ===============================
    getMine: async (req, res) => {
        try {
            const userId = req.user?.user_id ?? req.user?.id ?? null;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const users = await UserService.getById(userId);
            const user = Array.isArray(users) && users.length ? users[0] : null;
            const orders = await OrderService.getByUser({
                userId,
                email: user?.email || null
            });
            res.json({
                success: true,
                data: orders
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ===============================
    // CREATE ORDER
    // ===============================
    create: async (req, res) => {

        try {

            const { order, details } = req.body;

            const orderId = await OrderService.create(order, details);
            let emailSent = false;
            try {
                emailSent = await sendOrderConfirmationEmail({
                    to: order?.email,
                    orderId,
                    customerName: order?.customer_name,
                    details: Array.isArray(details) ? details : [],
                    total: order?.total
                });
            } catch (mailErr) {
                console.error("Send order email error:", mailErr.message);
            }

            res.status(201).json({
                success: true,
                order_id: orderId,
                email_sent: emailSent
            });

        } catch (err) {

            res.status(500).json({ error: err.message });

        };
    },

    // ===============================
    // UPDATE ORDER
    // ===============================
    update: async (req, res) => {

        try {

            await OrderService.update(req.params.id, req.body);

            res.json({
                success: true,
                message: "Order updated"
            });

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    },

    // ===============================
    // UPDATE STATUS
    // ===============================
    updateStatus: async (req, res) => {

        try {

            await OrderService.updateStatus(
                req.params.id,
                req.body.status
            );

            res.json({
                success: true,
                message: "Order status updated"
            });

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    },

    // ===============================
    // CANCEL MY ORDER
    // ===============================
    cancelMine: async (req, res) => {
        try {
            const userId = req.user?.user_id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const users = await UserService.getById(userId);
            const user = Array.isArray(users) && users.length ? users[0] : null;

            const result = await OrderService.cancelByUser({
                orderId: req.params.id,
                userId,
                email: user?.email || null
            });

            if (!result.ok) {
                if (result.reason === "not_found") {
                    return res.status(404).json({ message: "Order not found" });
                }
                if (result.reason === "forbidden") {
                    return res.status(403).json({ message: "You can only cancel your own orders" });
                }
                if (result.reason === "invalid_status") {
                    return res.status(400).json({
                        message: "Order cannot be cancelled at this stage"
                    });
                }
            }

            res.json({
                success: true,
                message: "Order cancelled"
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ===============================
    // DELETE
    // ===============================
    delete: async (req, res) => {

        try {

            await OrderService.delete(req.params.id);

            res.json({
                success: true,
                message: "Order deleted"
            });

        } catch (err) {

            res.status(500).json({ error: err.message });

        }
    }

};

module.exports = OrderController;