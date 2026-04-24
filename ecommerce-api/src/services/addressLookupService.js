const BASE_URL = "https://tinhthanhpho.com/api/v1";

async function requestJson(path, params = {}) {
    const url = new URL(`${BASE_URL}${path}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            url.searchParams.set(key, String(value));
        }
    });

    const response = await fetch(url.toString(), {
        headers: { Accept: "application/json" }
    });

    if (!response.ok) {
        throw new Error(`Address API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.success) {
        throw new Error(data?.message || "Address API request failed");
    }
    return data;
}

const AddressLookupService = {
    getProvinces: async ({ keyword, limit = 100, page = 1 }) => {
        return requestJson("/provinces", { keyword, limit, page });
    },

    getDistrictsByProvince: async ({ provinceCode, keyword, limit = 100, page = 1 }) => {
        if (!provinceCode) throw new Error("Missing provinceCode");
        return requestJson(`/provinces/${provinceCode}/districts`, { keyword, limit, page });
    },

    getWardsByDistrict: async ({ districtCode, keyword, limit = 200, page = 1 }) => {
        if (!districtCode) throw new Error("Missing districtCode");
        return requestJson(`/districts/${districtCode}/wards`, { keyword, limit, page });
    },

    getFullAddress: async ({ provinceCode, districtCode, wardCode }) => {
        return requestJson("/full-address", { provinceCode, districtCode, wardCode });
    }
};

module.exports = AddressLookupService;
