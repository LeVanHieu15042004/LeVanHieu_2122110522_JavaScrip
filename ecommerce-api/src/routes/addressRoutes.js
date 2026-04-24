const express = require("express");
const AddressController = require("../controllers/addressController");

const router = express.Router();

router.get("/provinces", AddressController.provinces);
router.get("/provinces/:provinceCode/districts", AddressController.districtsByProvince);
router.get("/districts/:districtCode/wards", AddressController.wardsByDistrict);
router.get("/full-address", AddressController.fullAddress);

module.exports = router;
