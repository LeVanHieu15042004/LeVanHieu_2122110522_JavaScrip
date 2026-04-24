const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // bắt buộc
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: "", // nếu không có ảnh
  },
}, {
  timestamps: true // thêm createdAt, updatedAt
});

module.exports = mongoose.model("Product", productSchema);