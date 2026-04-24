const AddressLookupService = require("../services/addressLookupService");

const AddressController = {
    provinces: async (req, res) => {
        try {
            const data = await AddressLookupService.getProvinces(req.query || {});
            res.json(data);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    districtsByProvince: async (req, res) => {
        try {
            const data = await AddressLookupService.getDistrictsByProvince({
                provinceCode: req.params.provinceCode,
                ...req.query
            });
            res.json(data);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    wardsByDistrict: async (req, res) => {
        try {
            const data = await AddressLookupService.getWardsByDistrict({
                districtCode: req.params.districtCode,
                ...req.query
            });
            res.json(data);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    fullAddress: async (req, res) => {
        try {
            const data = await AddressLookupService.getFullAddress(req.query || {});
            res.json(data);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = AddressController;
