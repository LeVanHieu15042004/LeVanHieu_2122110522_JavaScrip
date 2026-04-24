const nodemailer = require("nodemailer");

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendOrderConfirmationEmail({ to, orderId, customerName, details = [], total }) {
  const transporter = getTransport();
  if (!transporter || !to) return false;

  const rows = details
    .map((x) => `- ${x.product_name} x${x.quantity}: ${Number(x.price * x.quantity).toLocaleString("vi-VN")}đ`)
    .join("\n");

  const subject = `Xac nhan don hang #${orderId}`;
  const text =
    `Cam on ${customerName || "quy khach"} da dat hang.\n` +
    `Ma don hang: #${orderId}\n\n` +
    `San pham:\n${rows}\n\n` +
    `Tong thanh toan: ${Number(total || 0).toLocaleString("vi-VN")}đ\n` +
    `Chung toi se lien he xac nhan trong thoi gian som nhat.`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });

  return true;
}

module.exports = {
  sendOrderConfirmationEmail,
};
