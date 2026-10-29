// acdi-gateway.js
// Client gọi AI qua ACDI AI Gateway (n8n) — KHÔNG có API key trong trình duyệt.
//
// Luồng:
//  1. Lấy Firebase ID token. Học sinh không đăng nhập nên dùng Firebase Anonymous Auth (ẩn danh, không thu thập thông tin cá nhân).
//  2. POST {id_token, page_url} -> /acdi-gw-token -> nhận token của n8n, sống ~5 phút.
//  3. POST {token, mode, params, page_url} -> /acdi-gw-chat -> n8n kiểm tra, dựng prompt (phía server), gọi LLM, trả {reply}.
//  Token được làm mới "lười" khi còn dưới 60 giây, và tự thử lại 1 lần khi gặp 401.
//
// mode: "feedback" (nhận xét cá nhân hoá) | "generate_test" (soạn đề — chỉ admin, cần mật khẩu admin).
import { acdiAuth } from "./acdi-firebase-config.js";
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ACDI_GATEWAY_BASE_URL } from "./acdi-api-config.js";

const RENEW_BEFORE_MS = 60 * 1000;
let cached = null;   // { token, expMs }
let inflight = null; // chống xin token trùng
let authReady = null;

class GatewayError extends Error {
  constructor(code, status) { super(code); this.code = code; this.status = status || 0; }
}

async function postJson(path, body, signal) {
  let res;
  try {
    res = await fetch(String(ACDI_GATEWAY_BASE_URL).replace(/\/$/, "") + path, {
      method: "POST",
      // text/plain = "simple request": không bị preflight (OPTIONS) -> tránh lỗi CORS khi proxy của hosting trả lời preflight sai.
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e && e.name === "AbortError") throw e;
    throw new GatewayError("network_error");
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* không phải JSON */ }
  return { status: res.status, data };
}

// Đợi Firebase khôi phục phiên đã lưu (nếu có) trước khi quyết định đăng nhập ẩn danh mới
function waitAuthReady() {
  if (!authReady) {
    authReady = new Promise((resolve) => {
      const off = onAuthStateChanged(acdiAuth, () => { off(); resolve(); });
    });
  }
  return authReady;
}

async function getFirebaseIdToken() {
  await waitAuthReady();
  let user = acdiAuth.currentUser;
  if (!user) {
    try { user = (await signInAnonymously(acdiAuth)).user; }
    catch (e) {
      throw new GatewayError(e && e.code === "auth/operation-not-allowed" ? "anon_auth_disabled" : "auth_failed");
    }
  }
  return user.getIdToken();
}

async function fetchToken(signal) {
  const idToken = await getFirebaseIdToken();
  const { status, data } = await postJson("/acdi-gw-token", { id_token: idToken, page_url: location.href }, signal);
  if (status !== 200 || !data || !data.token) throw new GatewayError((data && data.error) || "token_http_" + status, status);
  const ttlMs = (Number(data.expires_in) || 300) * 1000;
  cached = { token: data.token, expMs: Date.now() + ttlMs };
  return cached.token;
}

function ensureToken(force, signal) {
  if (!force && cached && cached.expMs - Date.now() > RENEW_BEFORE_MS) return Promise.resolve(cached.token);
  if (!inflight) inflight = fetchToken(signal).finally(() => { inflight = null; });
  return inflight;
}

/**
 * Gửi yêu cầu AI tới n8n.
 * @param {{mode:string, params:object, adminSecret?:string, timeoutMs?:number}} p
 * @returns {Promise<string>} nội dung trả lời (văn bản; chế độ nào cần JSON thì nơi gọi tự parse)
 */
export async function askAcdiGateway({ mode, params, adminSecret, timeoutMs = 60000 }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await ensureToken(attempt > 0, ctrl.signal);
      const body = { token, mode, params, page_url: location.href };
      if (adminSecret) body.admin_secret = adminSecret;
      const { status, data } = await postJson("/acdi-gw-chat", body, ctrl.signal);
      if (status === 200 && data && typeof data.reply === "string" && data.reply.trim()) return data.reply;
      const code = (data && data.error) || "http_" + status;
      if (status === 401 && attempt === 0) { cached = null; continue; } // token hết hạn -> xin lại đúng 1 lần
      throw new GatewayError(code, status);
    }
    throw new GatewayError("token_refresh_failed");
  } finally { clearTimeout(timer); }
}
