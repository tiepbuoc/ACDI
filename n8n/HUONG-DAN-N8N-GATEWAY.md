# ACDI AI Gateway — gọi AI qua n8n (tách biệt với POP-AI)

```
Web ──(Firebase ID token ẩn danh + page_url)──► n8n /acdi-gw-token ──► token 5 phút
Web ──(token + mode + params)─────────────────► n8n /acdi-gw-chat  ──► LLM ──► {reply}
Bạn ──(header x-admin-key)────────────────────► n8n /acdi-gw-admin ──► thống kê / log / bật-tắt
```

Workflow `acdi-gateway.json` ("ACDI AI Gateway") là **workflow riêng**, đường dẫn `acdi-gw-*`; cấu hình, bộ đếm, khoá ký token, log đều nằm trong static data của workflow này, không dùng chung gì với POP-AI (hay Duck).

## ACDI gọi AI ở đâu
| `mode` | Ai gọi | Việc | Prompt |
|---|---|---|---|
| `feedback` | học sinh, sau khi chấm xong | viết nhận xét cá nhân hoá (trả JSON) | nằm trong node **Chat Gate** |
| `generate_test` | admin (`admin.html`) | soạn 1 đề 25 câu Likert + 5 tình huống | nằm trong node **Chat Gate** |

Trình duyệt **chỉ gửi dữ liệu** (`params`: điểm số, nhóm cao/thấp nhất; hoặc cấp học/khối/môn), không gửi prompt. Điểm số vẫn do công thức JS chốt, AI chỉ viết nhận xét. Nội dung đề và bài làm của học sinh không gửi lên n8n.

## Khác POP-AI
- Học sinh không đăng nhập → dùng **Firebase Anonymous Auth** (ẩn danh); n8n vẫn xác minh ID token qua Firebase.
- Chế độ `generate_test` **bắt buộc mật khẩu admin**, kiểm tra ở phía n8n (`generateKey` trong `Config`, mặc định `nhat1234` = `ADMIN_PASSWORD` trong `admin.html`). Admin nhập mật khẩu ở `admin.html` thì web tự gửi kèm khi soạn đề. Đổi mật khẩu thì **đổi cả hai nơi**.
- Có hạn mức riêng theo chế độ (`modes` trong `Config`): `feedback` 30 lượt/người/ngày, `generate_test` 300 lượt/người/ngày (tạo hàng loạt cần nhiều). Trần ngày toàn hệ thống: 1500 lượt / 1.000.000 token.
- Timeout gọi LLM 100 giây (soạn đề dài ~8000 token). Nếu n8n đặt sau proxy cắt kết nối ở ~100s thì đề rất dài có thể bị lỗi → thử lại.

## Cài đặt
1. **Firebase Console** (project `cdacdi-6df86`) → Authentication → Sign-in method → bật **Anonymous**. Không bật thì nhận xét AI báo lỗi `anon_auth_disabled` và web tự dùng nhận xét dự phòng.
2. **Credential LLM**: n8n → Credentials → Header Auth tên `LLM API Key` (Name `Authorization`, Value `Bearer <API key>`). Dùng lại credential của POP-AI được.
3. **Import** `acdi-gateway.json`; ở 3 node `LLM 1/2/3` chọn credential `LLM API Key`.
4. **Sửa node `Config`**: `allowedOrigins` (**đổi thành origin GitHub Pages của ACDI**; hiện đặt `https://tiepbuoc.github.io`), `adminKey` (≥ 16 ký tự ngẫu nhiên, hoặc để rỗng để tắt endpoint admin), `generateKey`, hạn mức, `models`.
5. **Bật workflow** (Active/Publish). URL: `https://<n8n-host>/webhook/acdi-gw-token`, `/acdi-gw-chat`, `/acdi-gw-admin`.
6. **Web**: `acdi-api-config.js` → `ACDI_GATEWAY_BASE_URL` (đã điền sẵn), đẩy code lên GitHub Pages.
7. **Thu hồi API key cũ** `sk-4150…` đã lộ trong `acdi-api-config.js` cũ.

## Xem log, thống kê, tắt khẩn cấp
```bash
A="https://<n8n-host>/webhook/acdi-gw-admin"; K="<adminKey>"
curl -s -X POST $A -H "x-admin-key: $K" -H "Content-Type: application/json" -d '{"action":"stats"}'
curl -s -X POST $A -H "x-admin-key: $K" -H "Content-Type: application/json" -d '{"action":"logs","limit":50}'
curl -s -X POST $A -H "x-admin-key: $K" -H "Content-Type: application/json" -d '{"action":"disable"}'
curl -s -X POST $A -H "x-admin-key: $K" -H "Content-Type: application/json" -d '{"action":"enable"}'
```

## Giới hạn cần biết
1. Ai cũng tạo được phiên ẩn danh; giới hạn theo người dùng chỉ chặn người dùng bình thường. Chống lạm dụng thật là: giới hạn IP, trần ngày toàn hệ thống, công tắc tắt và (với soạn đề) mật khẩu admin ở n8n.
2. `Origin` chỉ đáng tin với trình duyệt (curl giả được).
3. `admin.html` vẫn dùng mật khẩu tĩnh nằm trong mã nguồn (ai đọc JS cũng thấy), nên mật khẩu này chỉ ngăn truy cập tình cờ. Muốn chặt hơn, đặt `generateKey` ở n8n khác `ADMIN_PASSWORD` và chỉ nhập tay (cần sửa admin.html để hỏi lại), hoặc chuyển admin sang đăng nhập thật.
4. Dữ liệu log/bộ đếm nằm trong bộ nhớ workflow, chỉ ghi ở chế độ production, mất khi import đè workflow.
5. Giữ **Save successful production executions = Do not save** (đã đặt sẵn).

## Mã lỗi
`400 bad_request` (reason: `unknown_mode`, `bad_params`, `bad_scores`…) · `401 invalid_id_token / invalid_token / token_expired` · `403 forbidden` (`origin_not_allowed`, `bad_admin_secret`…) · `429 user_rate_limit / user_daily_limit / too_many_requests` · `502 llm_unavailable` · `503 gateway_disabled / daily_cap_reached`. Phía web thêm: `anon_auth_disabled`, `auth_failed`, `network_error`.
