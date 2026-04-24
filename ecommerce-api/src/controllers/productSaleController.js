const ProductSaleService = require("../services/productSaleService");

const ProductSaleController = {
  getShop: async (req, res) => {
    try {
      const rows = await ProductSaleService.getActiveShop();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = ProductSaleController;
