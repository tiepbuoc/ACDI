// acdi-api-config.js
// Cấu hình gọi API AI dùng RIÊNG cho hệ thống ACDI Check (soạn đề + viết nhận xét cá nhân hoá).
// Tách biệt hoàn toàn khỏi AI SMART (không import từ auth-web.js), để 2 hệ thống độc lập nhau.
const FIXED_ACDI_API_CONFIG = {
  endpoint: "https://api.shopaikey.com/v1",
  model: "gpt-4.1-mini",
  apiKey: "sk-4150297863e3eee405805e8609648e6c5cebb1b502ffb46e",
};

export async function getAcdiApiConfig() {
  return FIXED_ACDI_API_CONFIG;
}
