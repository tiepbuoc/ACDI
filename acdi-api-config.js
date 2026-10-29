// acdi-api-config.js
// Cấu hình kết nối tới ACDI AI Gateway (n8n) — dùng RIÊNG cho ACDI Check, tách biệt với POP-AI.
// KHÔNG có API key LLM ở đây: key thật chỉ nằm trong Credentials của n8n, system prompt/model do n8n quyết định.
// Xem n8n/HUONG-DAN-N8N-GATEWAY.md.

// URL gốc của webhook n8n (không có dấu "/" ở cuối).
export const ACDI_GATEWAY_BASE_URL = "https://n8nhosting-67079049.phoaify.com/webhook";
