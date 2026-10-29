# ACDI Check

Khảo sát đo mức độ lệ thuộc nhận thức vào AI (ACDI). Web tĩnh (GitHub Pages) + Firebase Firestore (project `cdacdi-6df86`).

## Gọi AI qua n8n (ACDI AI Gateway)
Web **không còn API key LLM**. Hai chỗ dùng AI (nhận xét cá nhân hoá cho học sinh, soạn đề ở `admin.html`) đều gọi qua n8n:
`acdi-gateway.js` → đăng nhập Firebase ẩn danh → `/acdi-gw-token` → `/acdi-gw-chat` (mode `feedback` | `generate_test`).
Workflow và hướng dẫn cài: thư mục `n8n/` (`acdi-gateway.json`, `HUONG-DAN-N8N-GATEWAY.md`). Cấu hình URL: `acdi-api-config.js`.
Cần bật **Anonymous** trong Firebase Authentication của project `cdacdi-6df86`.
