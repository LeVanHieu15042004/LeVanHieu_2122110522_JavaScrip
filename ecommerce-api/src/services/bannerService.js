const db = require('../config/db');

const BannerService = {
    getAll: async (filters = {}) => {
        const clauses = [];
        const params = [];

        if (filters.trash !== undefined && filters.trash !== null && String(filters.trash) !== "") {
            clauses.push("IFNULL(trash,0) = ?");
            params.push(Number(filters.trash));
        }
        if (filters.status !== undefined && String(filters.status) !== "") {
            clauses.push("IFNULL(status,1) = ?");
            params.push(filters.status);
        }
        if (filters.is_active !== undefined && String(filters.is_active) !== "") {
            clauses.push("IFNULL(is_active,1) = ?");
            params.push(filters.is_active);
        }

        const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
        let sql = `SELECT * FROM db_banners ${where}`;
        try {
            sql += " ORDER BY IFNULL(position,0) ASC, banner_id ASC";
            const [rows] = await db.query(sql, params);
            return rows;
        } catch (err) {
            console.error("[BannerService.getAll]", err.message);
            try {
                const [rows] = await db.query(
                    "SELECT * FROM db_banners ORDER BY IFNULL(position,0) ASC, banner_id ASC"
                );
                return rows;
            } catch (err2) {
                console.error("[BannerService.getAll] fallback", err2.message);
                const [rows] = await db.query("SELECT * FROM db_banners");
                return rows;
            }
        }
    },



    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM db_banners WHERE banner_id=?', [id]);
        return rows;
    },


    create: async (data) => {
        const { title, image_url, link, is_active, position } = data;
        return await db.query(
            'INSERT INTO db_banners (title, image_url, link, is_active, position) VALUES (?, ?, ?, ?, ?)',
            [title, image_url, link, is_active ?? 1, position ?? 0]
        );
    },
    /**
     * @swagger
     * /api/banners/{id}:
     *   put:
     *     summary: Update banner
     *     tags: [Banners]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Banner'
     *     responses:
     *       200:
     *         description: Banner updated
     */
    update: async (id, data) => {
        const { title, image_url, link, is_active, position } = data;
        return await db.query(
            'UPDATE db_banners SET title=?, image_url=?, link=?, is_active=?, position=? WHERE banner_id=?',
            [title, image_url, link, is_active, position, id]
        );
    },
    /**
     * @swagger
     * /api/banners/{id}:
     *   delete:
     *     summary: Delete banner
     *     tags: [Banners]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Banner deleted
     */
    delete: async (id) => {
        await db.query("UPDATE db_banners SET trash=1 WHERE banner_id=?", [id]);
    }
};

module.exports = BannerService;