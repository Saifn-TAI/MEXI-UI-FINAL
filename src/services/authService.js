import { getAuthApiBase, AUTH_PREFIX } from '../config/authConfig';
import { clearSignalApiKey, extractSignalApiKeyFromAuthResponse, setSignalApiKey } from './signalApiKeyStore';

/** If login/signup JSON includes a Signal Engine key, store it for X-API-Key (backend often creates key on user creation). */
function persistSignalKeyIfPresent(authJson) {
  const k = extractSignalApiKeyFromAuthResponse(authJson);
  if (k) setSignalApiKey(String(k));
}

const STORAGE_ACCESS = 'mexi_access_token';
const STORAGE_REFRESH = 'mexi_refresh_token';
const STORAGE_EMAIL = 'mexi_user_email';

function url(path) {
  const base = getAuthApiBase();
  return `${base}${AUTH_PREFIX}${path}`;
}

function normalizeAuthPayload(data) {
  if (!data || typeof data !== 'object') return { access: null, refresh: null, email: '' };
  const root = data.data !== undefined ? data.data : data;
  const user = root.user || root.profile || {};
  const access =
    data.accessToken ??
    data.access_token ??
    root.accessToken ??
    root.access_token ??
    user.accessToken ??
    data.token ??
    root.token;
  const refresh =
    data.refreshToken ??
    data.refresh_token ??
    root.refreshToken ??
    root.refresh_token ??
    user.refreshToken;
  const email =
    user.email ??
    root.email ??
    data.email ??
    '';
  return { access: access || null, refresh: refresh || null, email: email || '' };
}

export function persistTokens({ access, refresh, email }) {
  if (access) localStorage.setItem(STORAGE_ACCESS, access);
  else localStorage.removeItem(STORAGE_ACCESS);
  if (refresh) localStorage.setItem(STORAGE_REFRESH, refresh);
  else localStorage.removeItem(STORAGE_REFRESH);
  if (email) localStorage.setItem(STORAGE_EMAIL, email);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
  localStorage.removeItem(STORAGE_EMAIL);
  clearSignalApiKey();
}

export function getStoredAccessToken() {
  return localStorage.getItem(STORAGE_ACCESS);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(STORAGE_REFRESH);
}

export function getStoredEmail() {
  return localStorage.getItem(STORAGE_EMAIL);
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function getErrorMessage(body, res) {
  if (!body || typeof body !== 'object') {
    if (res.status === 401) return 'Invalid email or password, or account not allowed to sign in.';
    return res.statusText || 'Request failed';
  }
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    const parts = body.detail.map((d) => (typeof d === 'string' ? d : d?.msg || d?.message)).filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  const keys = Object.keys(body).filter((k) => k !== 'raw');
  const fallback =
    keys.length === 0 && res.status >= 500
      ? `Auth server error (${res.status}). Empty response — check TAI Auth service logs or try another host via VITE_AUTH_PROXY_TARGET in .env.`
      : `Error ${res.status}`;
  return (
    body.message ||
    body.msg ||
    (typeof body.error === 'string' ? body.error : body.error?.message) ||
    body.error_description ||
    (Array.isArray(body.errors) ? body.errors.join(', ') : null) ||
    body.raw ||
    (res.status === 401 ? 'Invalid email or password, or account not allowed to sign in.' : fallback)
  );
}

/**
 * Login — returns normalized tokens + email.
 * Sends both `email` and `username` (same value) so backends that expect either field still work.
 */
export async function login({ email, password }) {
  const id = email.trim();
  const loginUrl = url('/login');
  const res = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: id, username: id, password }),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    if (import.meta.env.DEV) {
      console.error('[Auth]', loginUrl, res.status, res.statusText, body);
    }
    throw new Error(getErrorMessage(body, res));
  }
  const norm = normalizeAuthPayload(body);
  if (!norm.access) throw new Error('Login succeeded but no access token was returned. Check API response shape.');
  persistTokens({ access: norm.access, refresh: norm.refresh, email: norm.email || email.trim() });
  persistSignalKeyIfPresent(body);
  return { ...norm, email: norm.email || email.trim() };
}

/**
 * Signup — body shape may need to match your controller; adjust field names if Swagger differs.
 */
export async function signup(payload) {
  const body = {
    email: payload.email?.trim(),
    password: payload.password,
    username: payload.username,
    fullName: payload.fullName,
    name: payload.fullName,
    phone: payload.phone,
    company: payload.company,
  };
  const res = await fetch(url('/signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(data, res));
  const norm = normalizeAuthPayload(data);
  if (norm.access) {
    persistTokens({ access: norm.access, refresh: norm.refresh, email: norm.email || payload.email?.trim() });
  }
  persistSignalKeyIfPresent(data);
  return { ...norm, email: norm.email || payload.email?.trim(), autoLoggedIn: !!norm.access };
}

/**
 * Logout — requires Bearer access token per auth routes (verifyToken on logout).
 */
export async function logout() {
  const token = getStoredAccessToken();
  try {
    if (token) {
      await fetch(url('/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } finally {
    clearTokens();
  }
}

/**
 * Refresh — send refresh token (common patterns: body or Bearer refresh).
 */
export async function refresh() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(url('/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken, refresh_token: refreshToken }),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(body, res));
  const norm = normalizeAuthPayload(body);
  if (!norm.access) throw new Error('Refresh did not return an access token');
  persistTokens({
    access: norm.access,
    refresh: norm.refresh || refreshToken,
    email: getStoredEmail() || norm.email,
  });
  return norm;
}

/**
 * Verify session — GET with Bearer access token.
 */
export async function verify(isAfterRefresh = false) {
  const token = getStoredAccessToken();
  if (!token) throw new Error('Not signed in');
  const res = await fetch(url('/verify'), {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const body = await parseJsonSafe(res);
  if (res.status === 401 && getStoredRefreshToken() && !isAfterRefresh) {
    await refresh();
    return verify(true);
  }
  if (!res.ok) throw new Error(getErrorMessage(body, res));
  return body;
}

/**
 * Current Signal API key — GET /api/auth/signal-key with Bearer (new TAI auth).
 * Falls back to POST for older deployments that only expose POST.
 */
export async function signalKey(isAfterRefresh = false) {
  const token = getStoredAccessToken();
  if (!token) throw new Error('Not signed in');
  const keyUrl = url('/signal-key');
  const authHeaders = { Accept: 'application/json', Authorization: `Bearer ${token}` };

  let res = await fetch(keyUrl, { method: 'GET', headers: authHeaders });
  if (res.status === 405 || res.status === 404) {
    res = await fetch(keyUrl, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
    });
  }
  const body = await parseJsonSafe(res);
  if (res.status === 401 && getStoredRefreshToken() && !isAfterRefresh) {
    await refresh();
    return signalKey(true);
  }
  if (!res.ok) throw new Error(getErrorMessage(body, res));
  return body;
}
