/** Map GET /data-sync/status → top bar data-trust line (used with calendar date prefix). */

export function mapDataSyncFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const status = api.status ?? api.state ?? api.sync_status ?? api.sync_state;
  const last =
    api.last_run ??
    api.lastRun ??
    api.last_sync ??
    api.last_synced_at ??
    api.synced_at ??
    api.updated_at ??
    api.message;
  const statusText = status != null && String(status).trim() ? String(status).trim() : '';
  const lastRunText = last != null && String(last).trim() ? String(last).trim() : '';
  if (!statusText && !lastRunText) return null;
  return { statusText, lastRunText };
}

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Map GET /me → top bar + profile. */

export function mapEngineMeFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const name = api.name ?? api.display_name ?? api.full_name ?? api.user_name;
  const role = api.role ?? api.title ?? api.job_title;
  const id = api.id ?? api.user_id ?? api.sub;
  const email = api.email ?? api.mail;
  const displayName = typeof name === 'string' && name.trim() ? name.trim() : null;
  const roleLabel = typeof role === 'string' && role.trim() ? role.trim() : null;
  const idStr = id != null && String(id).trim() ? String(id).trim() : null;
  const emailStr = typeof email === 'string' && email.trim() ? email.trim() : null;
  if (!displayName && !roleLabel && !idStr && !emailStr) return null;
  return {
    id: idStr,
    displayName,
    roleLabel,
    email: emailStr,
    initials: initialsFromName(displayName) || (idStr ? idStr.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() : null),
    greetingName: displayName ? displayName.split(/\s+/)[0] : null,
  };
}

function watchlistSevToUi(sevRaw) {
  const s = String(sevRaw ?? 'a').toLowerCase();
  if (s === 'r' || s === 'critical' || s === 'red') return { status: 'r', statusLabel: 'Critical' };
  if (s === 'g' || s === 'normal' || s === 'green' || s === 'ok') return { status: 'g', statusLabel: 'Normal' };
  return { status: 'a', statusLabel: 'Warning' };
}

/** GET /me/watchlist — `items[]` to Watchlist.jsx rows */
export function mapWatchlistItemsFromApi(api, signalsCatalog = {}) {
  if (!api || typeof api !== 'object') return [];
  const items = api.items ?? api.data?.items ?? api.watchlist ?? api.data;
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const sig = String(item.signal_id ?? item.signalId ?? item.sig ?? '').trim();
      if (!sig || sig.startsWith('func_')) return null;
      const cat = signalsCatalog[sig];
      const nameRaw = item.signal_name ?? item.name ?? item.title ?? cat?.name ?? sig;
      const id = String(nameRaw).trim().slice(0, 40) || sig;
      const { status, statusLabel } = watchlistSevToUi(item.severity ?? item.status ?? item.signal_severity ?? cat?.sev);
      return { id, type: 'Signal', status, statusLabel, sig };
    })
    .filter(Boolean);
}

/** PUT /me/watchlist body */
export function watchlistUiRowsToApiPayload(rows) {
  const items = (Array.isArray(rows) ? rows : []).map((w) => ({
    signal_id: w.sig,
    signal_name: w.id,
  }));
  return { items };
}
