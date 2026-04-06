import { getSignalsApiOrigin, isSignalAccessTokenMode } from '../config/signalsConfig';
import { getSignalApiKey, getStoredSignalApiKeyOnly, normalizeApiKeyInput } from './signalApiKeyStore';
import { getStoredAccessToken } from './authService';

function looksLikeJwt(s) {
  if (typeof s !== 'string') return false;
  const parts = s.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Signal Engine `X-API-Key` is usually the **separate key** from GET /api/auth/signal-key (or .env), not the login JWT.
 * Order: env → key from Auth signal-key → (optional) JWT if VITE_SIGNAL_USE_ACCESS_TOKEN=true.
 */
export function resolveSignalEngineXApiKey() {
  const envKey = normalizeApiKeyInput(import.meta.env.VITE_SIGNALS_API_KEY);
  if (envKey) return envKey;
  const fromSignalKeyEndpoint = getStoredSignalApiKeyOnly();
  if (fromSignalKeyEndpoint) return fromSignalKeyEndpoint;
  if (isSignalAccessTokenMode()) {
    const t = getStoredAccessToken();
    if (t) return normalizeApiKeyInput(t);
  }
  return getSignalApiKey();
}

function buildUrl(path) {
  const origin = getSignalsApiOrigin();
  const rel = `/api/v1${path.startsWith('/') ? path : `/${path}`}`;
  return origin ? `${origin}${rel}` : rel;
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** FastAPI / Starlette often use `detail` as string or validation array */
function formatEngineErrorBody(body, status) {
  if (status === 502 || status === 503 || status === 504) {
    return `Upstream unavailable (${status}). Nginx reached nothing healthy behind it (Signal Engine process down, wrong socket/port, or timeout). Ops: check uvicorn/gunicorn, nginx upstream_*, and host logs — not a React bug.`;
  }
  if (!body || typeof body !== 'object') return `HTTP ${status} (empty body)`;
  const raw = typeof body.raw === 'string' ? body.raw : '';
  if (raw && (raw.includes('<html') || raw.includes('<!DOCTYPE'))) {
    if (/502|Bad Gateway/i.test(raw)) {
      return '502 Bad Gateway — nginx HTML page; upstream API worker not responding. Same as curl/Swagger if that host is broken.';
    }
    return 'Proxy returned HTML instead of JSON — usually a gateway/load-balancer error page.';
  }
  const keys = Object.keys(body).filter((k) => k !== 'raw');
  const d = body.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d
      .map((x) => (typeof x === 'string' ? x : x?.msg || x?.message || JSON.stringify(x)))
      .join('; ');
  }
  if (body.message) return String(body.message);
  if (body.error) return typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
  if (raw) return raw.slice(0, 280).replace(/\s+/g, ' ').trim() + (raw.length > 280 ? '…' : '');
  if (keys.length === 0 && status >= 500) {
    return 'Server returned an empty JSON body — check Signal Engine logs (traceback), DB connection, and X-API-Key validation.';
  }
  return `HTTP ${status}`;
}

async function engineFetch(path, options = {}) {
  const key = resolveSignalEngineXApiKey();
  if (!key) {
    throw new Error(
      'Missing X-API-Key for Signal Engine. Sign in and set VITE_SIGNAL_USE_ACCESS_TOKEN=true, paste key in VITE_SIGNALS_API_KEY, or call GET /api/auth/signal-key (Bearer).'
    );
  }
  const url = buildUrl(path);
  const headers = {
    Accept: 'application/json',
    'X-API-Key': key,
    ...(options.headers || {}),
  };
  /** Some stacks validate JWT only from Authorization; TAI may need both. */
  if (looksLikeJwt(key)) {
    headers.Authorization = `Bearer ${key}`;
  }
  if (import.meta.env.DEV) {
    const hint = looksLikeJwt(key) ? 'JWT' : 'opaque-key';
    console.info('[Signal Engine] →', url, `| X-API-Key (${hint}, len=${key.length})`);
  }
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const body = await parseJson(res);
  if (!res.ok) {
    const msg = `${res.status} ${res.statusText}: ${formatEngineErrorBody(body, res.status)}`;
    if (import.meta.env.DEV) {
      console.error('[Signal Engine]', url, msg, body);
    }
    throw new Error(msg);
  }
  return body;
}

function firstNestedObjectArray(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  for (const v of Object.values(obj)) {
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      v.every((x) => x != null && typeof x === 'object' && !Array.isArray(x))
    ) {
      return v;
    }
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = firstNestedObjectArray(v, depth + 1);
      if (inner) return inner;
    }
  }
  return null;
}

/** Map common OpenAPI shapes to `{ data: SignalListItem[] }` for the UI merge step */
function normalizeSignalsListResponse(body) {
  if (!body || typeof body !== 'object') return { data: [] };
  if (Array.isArray(body)) return { data: body };
  /** TAI: `{ success, message, data: SignalListItem[] }` */
  if (Array.isArray(body.data)) return { ...body, data: body.data };

  for (const wrap of ['payload', 'response', 'result', 'body']) {
    const o = body[wrap];
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      if (Array.isArray(o.data)) return { ...body, data: o.data };
      if (Array.isArray(o.signals)) return { ...body, data: o.signals };
      if (Array.isArray(o.items)) return { ...body, data: o.items };
      if (Array.isArray(o.results)) return { ...body, data: o.results };
    }
  }

  let data = body.data;
  if (Array.isArray(data)) return { ...body, data };
  if (body.Data !== undefined && Array.isArray(body.Data)) return { ...body, data: body.Data };

  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner =
      data.signals ||
      data.items ||
      data.list ||
      data.results ||
      data.records ||
      data.rows ||
      data.values;
    if (Array.isArray(inner)) return { ...body, data: inner };
  }

  for (const k of ['items', 'signals', 'signalList', 'signal_list', 'results', 'records', 'list', 'rows']) {
    const arr = body[k];
    if (Array.isArray(arr)) return { ...body, data: arr };
  }

  const guess = firstNestedObjectArray(body);
  if (guess) return { ...body, data: guess };

  return { ...body, data: [] };
}

/** Always returns an array of list rows (possibly empty) after normalization. */
export function getSignalsListItems(body) {
  const norm = normalizeSignalsListResponse(body || {});
  const d = norm.data;
  return Array.isArray(d) ? d : [];
}

/** Normalize biz-impact JSON so `mapBizImpactCardsResponse` finds the array */
function normalizeBizImpactCardsBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (Array.isArray(body.cards)) return body;
  if (body.data && typeof body.data === 'object' && Array.isArray(body.data.cards)) {
    return { ...body, cards: body.data.cards };
  }
  if (body.data && typeof body.data === 'object' && Array.isArray(body.data.items)) {
    return { ...body, cards: body.data.items };
  }
  if (Array.isArray(body.data)) return { ...body, cards: body.data };
  if (body.cards && typeof body.cards === 'object' && !Array.isArray(body.cards)) {
    const vals = Object.values(body.cards).filter((x) => x && typeof x === 'object');
    if (vals.length) return { ...body, cards: vals };
  }
  if (Array.isArray(body.items)) return { ...body, cards: body.items };
  if (Array.isArray(body.results)) return { ...body, cards: body.results };
  if (Array.isArray(body.records)) return { ...body, cards: body.records };
  if (Array.isArray(body.impact_cards)) return { ...body, cards: body.impact_cards };
  if (Array.isArray(body)) return { cards: body };
  return body;
}

/** GET /api/v1/signals — OpenAPI: { data: SignalListItem[] } (several nested shapes normalized) */
export async function getSignals() {
  const body = await engineFetch('/signals');
  const norm = normalizeSignalsListResponse(body);
  if (import.meta.env.DEV) {
    const n = Array.isArray(norm.data) ? norm.data.length : 'n/a';
    console.info('[Signal Engine] GET /signals → data length:', n, 'top-level keys:', Object.keys(body || {}));
  }
  return norm;
}

/** Unwrap `{ success, data: { order } }` → top-level `order` for mappers */
function normalizeDisplayOrderBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (Array.isArray(body.order)) return body;
  const d = body.data;
  if (d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.order)) {
    return { ...body, order: d.order };
  }
  return body;
}

/** GET /api/v1/signals/display-order — e.g. { order: ["P3.01", ...] } */
export async function getSignalsDisplayOrder() {
  const body = normalizeDisplayOrderBody(await engineFetch('/signals/display-order'));
  if (import.meta.env.DEV) {
    const o = body?.order ?? body?.display_order ?? body?.signal_ids;
    console.info('[Signal Engine] GET /signals/display-order →', Array.isArray(o) ? `len ${o.length}` : 'keys:', Object.keys(body || {}));
  }
  return body;
}

/** POST /api/v1/signals/{signal_id}/run — recomputes one signal */
export function postSignalRun(signalId) {
  return engineFetch(`/signals/${encId(signalId)}/run`, { method: 'POST' });
}

/** GET /api/v1/signals/{signal_id} — `{ success, message, data: { definition, result } }` */
export function getSignalById(signalId) {
  return engineFetch(`/signals/${encId(signalId)}`);
}

/** PATCH /api/v1/signals/{signal_id} — update definition; response same shape as GET */
export function patchSignalById(signalId, body) {
  return engineFetch(`/signals/${encId(signalId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body && typeof body === 'object' ? body : {}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** POST /api/v1/signals/evaluate — run all signals */
export function postSignalsEvaluateAll() {
  return engineFetch('/signals/evaluate', { method: 'POST' });
}

/** GET /api/v1/biz-impact/cards */
export async function getBizImpactCards() {
  const body = await engineFetch('/biz-impact/cards');
  const norm = normalizeBizImpactCardsBody(body);
  if (import.meta.env.DEV) {
    const arr = norm?.cards ?? norm?.data ?? (Array.isArray(norm) ? norm : null);
    console.info(
      '[Signal Engine] GET /biz-impact/cards → array len:',
      Array.isArray(arr) ? arr.length : 'n/a',
      'top-level keys:',
      Object.keys(norm || {})
    );
  }
  return norm;
}

function encId(id) {
  return encodeURIComponent(String(id ?? ''));
}

/** GET /signals/{signal_id}/what */
export function getSignalWhat(signalId) {
  return engineFetch(`/signals/${encId(signalId)}/what`);
}

/** GET /signals/{signal_id}/why */
export function getSignalWhy(signalId) {
  return engineFetch(`/signals/${encId(signalId)}/why`);
}

/** GET /signals/{signal_id}/impact */
export function getSignalImpactTab(signalId) {
  return engineFetch(`/signals/${encId(signalId)}/impact`);
}

/** GET /signals/{signal_id}/actions */
export function getSignalActions(signalId) {
  return engineFetch(`/signals/${encId(signalId)}/actions`);
}

/** POST /signals/{signal_id}/ask — body must include non-empty `question` (TAI rejects missing field). */
export function postSignalAsk(signalId, payload) {
  let question = '';
  if (typeof payload === 'string') question = payload.trim();
  else if (payload && typeof payload === 'object') {
    question = String(
      payload.question ?? payload.q ?? payload.message ?? payload.text ?? payload.prompt ?? ''
    ).trim();
  }
  if (!question) {
    return Promise.reject(new Error('Ask requires a non-empty question'));
  }
  return engineFetch(`/signals/${encId(signalId)}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** POST /signals/{signal_id}/actions/{idx}/assign */
export function postSignalAssignAction(signalId, idx) {
  const n = Number.parseInt(String(idx), 10);
  const pathIdx = Number.isFinite(n) && n >= 0 ? n : 0;
  return engineFetch(`/signals/${encId(signalId)}/actions/${pathIdx}/assign`, {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** POST /signals/{signal_id}/actions/{idx}/run-agent */
export function postSignalRunAgentAction(signalId, idx) {
  const n = Number.parseInt(String(idx), 10);
  const pathIdx = Number.isFinite(n) && n >= 0 ? n : 0;
  return engineFetch(`/signals/${encId(signalId)}/actions/${pathIdx}/run-agent`, {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** GET /risks/changed */
export function getRisksChanged() {
  return engineFetch('/risks/changed');
}

/** GET /reports/executive-brief */
export function getExecutiveBrief() {
  return engineFetch('/reports/executive-brief');
}

/** GET /reports/executive-brief/overlay — same `content` shape; used as fallback if main brief empty */
export function getExecutiveBriefOverlay() {
  return engineFetch('/reports/executive-brief/overlay');
}

/** GET /dashboard/risk-exposure */
export function getDashboardRiskExposure() {
  return engineFetch('/dashboard/risk-exposure');
}

/** GET /dashboard/brief-highlights */
export function getDashboardBriefHighlights() {
  return engineFetch('/dashboard/brief-highlights');
}

/** GET /signals/heatmap/all */
export function getHeatmapAll() {
  return engineFetch('/signals/heatmap/all');
}

/** GET /signals/heatmap/{segment} e.g. production, supply-chain, vendor */
export function getHeatmapFunction(pathSegment) {
  const seg = String(pathSegment ?? '').replace(/^\/+|\/+$/g, '');
  if (!seg) return Promise.reject(new Error('Heatmap path segment required'));
  return engineFetch(`/signals/heatmap/${encodeURIComponent(seg)}`);
}

/** GET /ask-mexi/suggested-prompts */
export function getAskMexiSuggestedPrompts() {
  return engineFetch('/ask-mexi/suggested-prompts');
}

/** GET /ask-mexi/conversations — e.g. `{ data: [] }` */
export function getAskMexiConversations() {
  return engineFetch('/ask-mexi/conversations');
}

/** POST /ask-mexi/conversations — e.g. `{ id, created_at }` */
export function postAskMexiCreateConversation() {
  return engineFetch('/ask-mexi/conversations', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** POST /ask-mexi/conversations/{id}/messages */
export function postAskMexiMessage(conversationId, message) {
  return engineFetch(`/ask-mexi/conversations/${encId(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, content: message, text: message }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** POST /ask-mexi/last-context — e.g. `{ status: "ok" }` */
export function postAskMexiLastContext(body) {
  return engineFetch('/ask-mexi/last-context', {
    method: 'POST',
    body: JSON.stringify(body && typeof body === 'object' ? body : {}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** GET /me/watchlist — e.g. `{ items: [] }` */
export function getEngineMeWatchlist() {
  return engineFetch('/me/watchlist');
}

/** POST /me/watchlist — persist `{ items: [...] }`; TAI: `{ status: "ok" }` */
export function postEngineMeWatchlist(body) {
  return engineFetch('/me/watchlist', {
    method: 'POST',
    body: JSON.stringify(body && typeof body === 'object' ? body : { items: [] }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** PUT /me/watchlist — alternate stacks */
export function putEngineMeWatchlist(body) {
  return engineFetch('/me/watchlist', {
    method: 'PUT',
    body: JSON.stringify(body && typeof body === 'object' ? body : { items: [] }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** POST /me/watchlist/items — add one signal; TAI: `{ status: "ok" }` */
export function postEngineMeWatchlistItem(body) {
  return engineFetch('/me/watchlist/items', {
    method: 'POST',
    body: JSON.stringify(body && typeof body === 'object' ? body : {}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** GET /bootstrap */
export function getBootstrap() {
  return engineFetch('/bootstrap');
}

/** GET /tenant */
export function getTenant() {
  return engineFetch('/tenant');
}

/** GET /data-sync/status */
export function getDataSyncStatus() {
  return engineFetch('/data-sync/status');
}

/** GET /me — Signal Engine profile (name, role, id; may differ from auth email). */
export function getEngineMe() {
  return engineFetch('/me');
}

/** PATCH /me — persist profile / preference payload accepted by engine. */
export function patchEngineMe(body) {
  return engineFetch('/me', {
    method: 'PATCH',
    body: JSON.stringify(body && typeof body === 'object' ? body : {}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** GET /me/preferences */
export function getEngineMyPreferences() {
  return engineFetch('/me/preferences');
}

/** PATCH /me/preferences */
export function patchEngineMyPreferences(body) {
  return engineFetch('/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(body && typeof body === 'object' ? body : {}),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Unwrap `{ success, data: { scopes } }` → `{ scopes }` for Settings */
function normalizePreferenceScopeBody(body) {
  if (!body || typeof body !== 'object') return body;
  if (Array.isArray(body.scopes)) return body;
  const d = body.data;
  if (d && typeof d === 'object' && !Array.isArray(d) && Array.isArray(d.scopes)) {
    return { ...body, scopes: d.scopes };
  }
  return body;
}

/** GET /preferences/scope */
export async function getPreferenceScope() {
  return normalizePreferenceScopeBody(await engineFetch('/preferences/scope'));
}

/** GET /health — e.g. `{ status: "healthy" }` */
export function getEngineHealth() {
  return engineFetch('/health');
}

/**
 * GET / (engine root, no /api/v1) — service banner, version, docs links.
 * Returns null when `VITE_SIGNALS_API_URL` is unset (relative /api/v1-only dev).
 */
export async function getSignalEngineRoot() {
  const origin = getSignalsApiOrigin();
  if (!origin) return null;
  const key = resolveSignalEngineXApiKey();
  const headers = { Accept: 'application/json' };
  if (key) {
    headers['X-API-Key'] = key;
    if (looksLikeJwt(key)) headers.Authorization = `Bearer ${key}`;
  }
  const res = await fetch(`${origin}/`, { headers });
  const body = await parseJson(res);
  if (!res.ok) {
    const msg = `${res.status} ${res.statusText}: ${formatEngineErrorBody(body, res.status)}`;
    throw new Error(msg);
  }
  return body;
}
