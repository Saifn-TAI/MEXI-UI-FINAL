import { getSignalsApiOrigin } from '../config/signalsConfig';

/**
 * Absolute URL for tenant logo when API returns a path (e.g. /logos/veejai.png).
 */
export function resolveTenantLogoUrl(logoUrl) {
  if (!logoUrl || typeof logoUrl !== 'string') return null;
  const t = logoUrl.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const origin = getSignalsApiOrigin();
  if (!origin) return t.startsWith('/') ? t : `/${t}`;
  return `${origin.replace(/\/$/, '')}${t.startsWith('/') ? t : `/${t}`}`;
}

/**
 * GET /api/v1/tenant — map to topbar / brief branding.
 */
export function mapTenantFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const name =
    api.name ??
    api.tenant_name ??
    api.company_name ??
    api.display_name ??
    api.title ??
    api.organization_name;
  const displayName = typeof name === 'string' && name.trim() ? name.trim() : null;
  const logoRaw = api.logo_url ?? api.logoUrl ?? api.logo ?? api.brand_logo_url ?? api.logo_path;
  const logoUrl = resolveTenantLogoUrl(typeof logoRaw === 'string' ? logoRaw : '');
  if (!displayName && !logoUrl) return null;
  return { displayName, logoUrl };
}

/**
 * GET /api/v1/bootstrap — map to data-trust / status hints (no new UI regions).
 */
export function mapBootstrapFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const status = api.status ?? api.state ?? (api.ready === true ? 'ready' : api.ready);
  const cfg = api.config && typeof api.config === 'object' ? api.config : {};
  const env = cfg.env ?? cfg.environment ?? api.environment ?? api.env;
  const statusLabel =
    typeof status === 'string' && status.trim()
      ? status.trim()
      : status != null && status !== ''
        ? String(status)
        : null;
  const envLabel = env != null && String(env).trim() ? String(env).trim() : '';
  if (!statusLabel && !envLabel) return null;
  return {
    statusLabel: statusLabel ? String(statusLabel) : '',
    envLabel,
  };
}
