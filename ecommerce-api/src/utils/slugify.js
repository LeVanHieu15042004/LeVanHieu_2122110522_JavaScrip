/**
 * Slug ASCII từ tên (giống logic admin categories trên frontend).
 */
function slugify(str) {
  const s = String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "san-pham";
}

module.exports = { slugify };
