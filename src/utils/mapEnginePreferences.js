const DASH = '—';

function pickStr(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  return s || null;
}

/**
 * GET /me/preferences — flexible keys; drives Settings form.
 * Example contract: { theme: "dark", density: "comfortable" }
 */
export function mapPreferencesFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const theme = pickStr(api.theme ?? api.color_mode ?? api.mode ?? api.appearance);
  const density = pickStr(api.density ?? api.ui_density ?? api.spacing);
  let whatsappEnabled;
  if (typeof api.whatsapp_enabled === 'boolean') whatsappEnabled = api.whatsapp_enabled;
  else if (typeof api.alert_preferences?.whatsapp_enabled === 'boolean') {
    whatsappEnabled = api.alert_preferences.whatsapp_enabled;
  }
  const severity = pickStr(api.severity_filter ?? api.alert_preferences?.severity_filter);
  const out = {};
  if (theme) out.theme = theme;
  if (density) out.density = density;
  if (whatsappEnabled !== undefined) out.whatsappEnabled = whatsappEnabled;
  if (severity) out.severity = severity;
  return Object.keys(out).length ? out : null;
}

/**
 * GET /preferences/scope — e.g. { scopes: ["global", "plant", "personal"] }
 */
export function mapPreferenceScopeFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const scopes = api.scopes ?? api.data ?? api.scope ?? api.available_scopes;
  const list = Array.isArray(scopes)
    ? scopes.map((s) => String(s).trim()).filter(Boolean)
    : [];
  if (!list.length) return null;
  return { scopes: list, displayLine: list.join(' · ') };
}

/** Human-readable scope line or em dash. */
export function formatPreferenceScopeLine(mappedScope) {
  if (mappedScope?.displayLine) return mappedScope.displayLine;
  return DASH;
}
