const express = require("express");
const router = express.Router();
const productSaleController = require("../controllers/productSaleController");

router.get("/shop", productSaleController.getShop);

module.exports = router;
