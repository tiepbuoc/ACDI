// acdi-api-config.js
// Cấu hình gọi API AI dùng RIÊNG cho hệ thống ACDI Check (soạn đề + viết nhận xét cá nhân hoá).
// Tách biệt hoàn toàn khỏi AI SMART (không import từ auth-web.js), để 2 hệ thống độc lập nhau.
const FIXED_ACDI_API_CONFIG = {
  endpoint: "https://api.shopaikey.com/v1",
  model: "gpt-5.4-nano-2026-03-17",
  apiKey: "sk-uQmI5tk7o5FdWLq852gCLO2xZTd5OmG2K9RKy7C3raEqGx6v",
};

export async function getAcdiApiConfig() {
  return FIXED_ACDI_API_CONFIG;
}
