const ProductService = require('../services/productService');
const upload = require('../middleware/uploadMiddleware');

const ProductController = {

    getAll: async (req, res) => {
        try {
            const data = await ProductService.getAll(req.query || {});
            res.json(data);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const shop = req.query.shop === '1' || req.query.shop === 'true';
            const data = await ProductService.getById(req.params.id, { shop });
            if (!data || data.length === 0)
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            res.json(data[0]);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getBestSeller: async (req, res) => {
        try {
            const limit = req.query.limit || 8;
            const rows = await ProductService.getBestSeller(limit);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // POST /api/products  (multipart/form-data with optional image)
    create: [
        upload.single('image'),
        async (req, res) => {
            try {
                const { product_name, price, cat_id, brand_id, status = 1, image_url, tag, alias } = req.body;
                if (!product_name || !price)
                    return res.status(400).json({ message: 'Thiếu tên hoặc giá' });

                let imageValue = null;
                if (req.file) {
                    imageValue = req.file.filename;
                } else if (image_url != null && String(image_url).trim() !== '') {
                    imageValue = String(image_url).trim();
                }

                const tagValue = tag != null && String(tag).trim() !== '' ? String(tag).trim() : 'san-pham';

                const aliasBase =
                    alias != null && String(alias).trim() !== ''
                        ? String(alias).trim()
                        : product_name;
                const aliasValue = await ProductService.allocateAlias(aliasBase, null);

                const data = {
                    product_name,
                    alias: aliasValue,
                    price: parseFloat(price),
                    cat_id: cat_id || null,
                    brand_id: brand_id || null,
                    status: parseInt(status),
                    trash: 0,
                    tag: tagValue,
                    image: imageValue,
                    created_at: new Date()
                };

                const result = await ProductService.create(data);
                res.status(201).json({ success: true, product_id: result[0].insertId });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
    ],

    // PUT /api/products/:id
    update: [
        upload.single('image'),
        async (req, res) => {
            try {
                const { product_name, price, cat_id, brand_id, status, image_url, tag, alias } = req.body;
                const data = {};

                if (product_name !== undefined) data.product_name = product_name;
                if (alias !== undefined && String(alias).trim() !== '') {
                    data.alias = await ProductService.allocateAlias(String(alias).trim(), req.params.id);
                }
                if (price !== undefined)        data.price = parseFloat(price);
                if (cat_id !== undefined)       data.cat_id = cat_id || null;
                if (brand_id !== undefined)     data.brand_id = brand_id || null;
                if (status !== undefined)       data.status = parseInt(status);
                if (tag !== undefined) {
                    const t = String(tag || '').trim();
                    data.tag = t !== '' ? t : 'san-pham';
                }
                if (req.file) {
                    data.image = req.file.filename;
                } else if (image_url !== undefined) {
                    const u = String(image_url || '').trim();
                    if (u) data.image = u;
                }

                await ProductService.update(req.params.id, data);
                res.json({ success: true, message: 'Cập nhật thành công' });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
    ],

    delete: async (req, res) => {
        try {
            await ProductService.delete(req.params.id);
            res.json({ success: true, message: 'Đã xóa sản phẩm' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = ProductController;
