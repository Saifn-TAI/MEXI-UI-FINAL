/**
 * Login JWT as Signal `X-API-Key` (TAI). Vite env values are strings — accept true / 1 / yes.
 */
export function isSignalAccessTokenMode() {
  const v = String(import.meta.env.VITE_SIGNAL_USE_ACCESS_TOKEN ?? '')
    .toLowerCase()
    .trim();
  return v === 'true' || v === '1' || v === 'yes';
}

/**
 * Signal Engine base URL (origin only, no trailing path).
 * - Unset: browser uses relative `/api/v1/...` → Vite dev server proxies to `VITE_SIGNAL_PROXY_TARGET` (Node; can 502 if upstream/nginx differs from browser).
 * - Set: browser calls `VITE_SIGNALS_API_URL` directly (same idea as Swagger “Execute”; needs CORS for your SPA origin).
 */
export function getSignalsApiOrigin() {
  const v = import.meta.env.VITE_SIGNALS_API_URL;
  if (v !== undefined && v !== null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '');
  }
  return '';
}
