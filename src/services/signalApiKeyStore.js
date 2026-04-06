const STORAGE_KEY = 'mexi_signal_x_api_key';

/**
 * .env mistakes (quotes, BOM, zero-width chars) send a different key → 401s; some backends then lock/revoke the key.
 * Also used for JWT pasted as `VITE_SIGNALS_API_KEY` (TAI: login token = X-API-Key).
 */
export function normalizeApiKeyInput(v) {
  if (v == null) return '';
  let s = String(v)
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Key returned from GET/POST /api/auth/signal-key (hex); Signal Engine validates this — not the login JWT. */
export function getStoredSignalApiKeyOnly() {
  return normalizeApiKeyInput(localStorage.getItem(STORAGE_KEY));
}

/** Optional: set VITE_SIGNALS_API_KEY in .env; or fetch via GET /api/auth/signal-key (Bearer). */
export function getSignalApiKey() {
  const envKey = normalizeApiKeyInput(import.meta.env.VITE_SIGNALS_API_KEY);
  if (envKey) return envKey;
  return getStoredSignalApiKeyOnly();
}

export function setSignalApiKey(value) {
  const k = normalizeApiKeyInput(value);
  if (k) localStorage.setItem(STORAGE_KEY, k);
  else localStorage.removeItem(STORAGE_KEY);
}

export function clearSignalApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

/** JWTs are three base64url segments; never use them as X-API-Key (login often uses `token` for JWT). */
function looksLikeJwt(value) {
  if (typeof value !== 'string') return false;
  const parts = value.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Normalize API key from Auth: GET/POST /signal-key, or signup/login when backend includes a dedicated key field.
 * Login payloads like `{ token: "<jwt>", user: {...} }` do NOT contain the Signal key — use /signal-key or env.
 */
export function extractSignalApiKeyFromAuthResponse(body) {
  if (!body || typeof body !== 'object') return null;
  const user = body.user ?? body.data?.user ?? body.profile;
  const tokenMaybeKey =
    body.access_token == null && body.accessToken == null && typeof body.token === 'string' && !looksLikeJwt(body.token)
      ? body.token
      : null;
  return (
    body.key ??
    body.apiKey ??
    body.api_key ??
    body.data?.key ??
    body.signal_key ??
    body.signalKey ??
    user?.signal_api_key ??
    user?.api_key ??
    user?.signalKey ??
    body.secret ??
    tokenMaybeKey
  );
}
