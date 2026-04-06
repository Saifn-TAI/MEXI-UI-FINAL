import { DASH } from './mapEngineIntelligence';

function pickFirst(...vals) {
  for (const v of vals) {
    if (v != null && v !== '') return v;
  }
  return undefined;
}

function normalizeSev(s) {
  if (s == null || s === '') return 'nd';
  if (typeof s === 'number' && Number.isFinite(s)) {
    const n = s;
    if (n >= 3) return 'r';
    if (n >= 2) return 'a';
    return 'g';
  }
  const x = String(s).toLowerCase().trim();
  const crit = [
    'r',
    'critical',
    'crit',
    'high',
    '3',
    'red',
    'severe',
    'urgent',
    'p0',
    'p1',
    'very_high',
    'very high',
    'v_high',
    'major',
    'blocker',
    'blocking',
    'escalated',
    'danger',
  ];
  const warn = [
    'a',
    'warning',
    'warn',
    'medium',
    '2',
    'amber',
    'orange',
    'moderate',
    'p2',
    'attention',
    'caution',
    'elevated',
  ];
  const norm = [
    'g',
    'normal',
    'ok',
    'low',
    '1',
    'green',
    'minor',
    'good',
    'stable',
    'info',
    'healthy',
    'clear',
    'p3',
    'p4',
  ];
  if (crit.includes(x)) return 'r';
  if (warn.includes(x)) return 'a';
  if (norm.includes(x)) return 'g';
  if (['nd', 'no_data', 'none', 'no data', 'unknown', 'na', 'n/a'].includes(x)) return 'nd';
  if (/critical|severe|urgent|blocker|escalat|p\s*0|p\s*1/.test(x)) return 'r';
  if (/warn|amber|caution|medium|moderate|p\s*2/.test(x)) return 'a';
  if (/normal|ok|green|healthy|low\s*risk|stable/.test(x)) return 'g';
  return 'nd';
}

/** Parse JSON strings from ORM/OpenAPI (definition/result often arrive as stringified JSON). */
function asObject(v) {
  if (v == null) return {};
  if (typeof v === 'object' && !Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v);
      if (p && typeof p === 'object' && !Array.isArray(p)) return p;
    } catch {
      /* ignore */
    }
    return {};
  }
  return {};
}

/**
 * One merged row: root fields + definition + result (later wins).
 * Fixes empty catalog when `definition`/`result` are JSON strings or when ids live only inside them.
 */
export function flattenSignalListItem(item) {
  if (item == null || typeof item !== 'object' || Array.isArray(item)) return null;
  const flat = { ...item };
  delete flat.definition;
  delete flat.result;
  const def = asObject(item.definition);
  const res = asObject(item.result);
  return { ...flat, ...def, ...res };
}

function signalIdFromMerged(merged) {
  const fromCode = pickFirst(
    merged.signal_id,
    merged.signalId,
    merged.SignalId,
    merged.slug,
    merged.code,
    merged.identifier
  );
  if (fromCode != null && String(fromCode).trim() !== '') return String(fromCode).trim();
  const id = merged.id;
  if (id != null && id !== '') {
    const s = String(id).trim();
    if (s && /[A-Za-z]/.test(s)) return s;
  }
  return undefined;
}

/** Map threshold tier (T0/T1/T2) to a coarse severity string when API `signal_severity` is generic. */
function severityHintFromTier(tier) {
  if (tier == null || tier === '') return null;
  const u = String(tier).toUpperCase().replace(/\s/g, '');
  if (u === 'T2' || u.endsWith('T2')) return 'critical';
  if (u === 'T1' || u.endsWith('T1')) return 'warning';
  if (u === 'T0' || u.endsWith('T0')) return 'normal';
  return null;
}

function pickSeverityApiFields(merged) {
  return pickFirst(
    merged.signal_severity,
    merged.latest_stage,
    merged.LatestStage,
    merged.severity,
    merged.risk_level,
    merged.level,
    merged.health,
    merged.signal_status,
    merged.alert_level,
    merged.classification,
    merged.default_severity,
    merged.alert_severity,
    merged.status
  );
}

/** Prefer explicit API severity unless it is generic "normal" while tier says T1/T2. */
function resolveSeverityRaw(merged) {
  const tierHint = severityHintFromTier(merged.tier);
  const apiSev = pickSeverityApiFields(merged);
  const apiNorm = apiSev != null && apiSev !== '' ? normalizeSev(apiSev) : 'nd';
  const tierNorm = tierHint ? normalizeSev(tierHint) : null;
  if (tierNorm === 'r' && (apiNorm === 'g' || apiNorm === 'nd')) return tierHint;
  if (tierNorm === 'a' && apiNorm === 'g') return tierHint;
  if (apiSev != null && apiSev !== '') return apiSev;
  if (tierHint) return tierHint;
  return apiSev;
}

function formatImpact(res) {
  if (res == null) return DASH;
  if (res.revenue_at_risk_lakhs != null && String(res.revenue_at_risk_lakhs).trim() !== '') {
    return `₹${res.revenue_at_risk_lakhs}L`;
  }
  const rupees = res.revenue_at_risk_rupees ?? res.revenue_at_risk_Rupees;
  if (rupees != null && rupees !== '') {
    const n = Number(rupees);
    if (Number.isFinite(n)) {
      const abs = Math.abs(n);
      if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
      if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
      if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
      return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    }
  }
  if (res.revenue_at_risk != null) return String(res.revenue_at_risk);
  let dj = res.data_json || {};
  if (typeof dj === 'string') dj = asObject(dj);
  if (dj.revenue_risk_rupees != null && Number.isFinite(Number(dj.revenue_risk_rupees))) {
    return formatImpact({ ...res, revenue_at_risk_rupees: dj.revenue_risk_rupees });
  }
  if (dj.impact != null && String(dj.impact).trim()) return String(dj.impact);
  return DASH;
}

const FUNC_IDS = [
  'func_production',
  'func_supply',
  'func_vendor',
  'func_demand',
  'func_inventory',
  'func_quality',
  'func_maintenance',
  'func_planning',
  'func_marketing_sales',
];

const FUNC_LABELS = {
  func_production: 'Production',
  func_supply: 'Supply',
  func_vendor: 'Vendor',
  func_demand: 'Demand',
  func_inventory: 'Inventory',
  func_quality: 'Quality',
  func_maintenance: 'Maintenance',
  func_planning: 'Planning',
  func_marketing_sales: 'Mkt&Sales',
};

/** Placeholder rows for heatmap `func_*` panels (no narrative mock data). */
export function createEmptySignalEntry(id) {
  const sid = id != null && String(id).trim() ? String(id).trim() : DASH;
  return {
    name: sid,
    proc: DASH,
    sev: 'nd',
    val: DASH,
    impact: DASH,
    what: { meas: [{ l: DASH, v: DASH, c: 'g' }], table: null },
    why: { cause: DASH, impact: DASH, timeline: DASH, confidence: 'low', rec: DASH },
    hyps: [],
    fvla: { rev: DASH, revS: '', cap: DASH, capS: '', mar: DASH, marS: '' },
    acts: [{ t: DASH, s: DASH }],
  };
}

export function buildMinimalFunctionCatalog() {
  const out = {};
  for (const fid of FUNC_IDS) {
    out[fid] = { ...createEmptySignalEntry(fid), name: FUNC_LABELS[fid] || fid };
  }
  return out;
}

/**
 * One catalog row from a GET /signals (or evaluate/run) list item: `{ definition, result, … }`.
 */
export function catalogEntryFromListItem(item) {
  const merged = flattenSignalListItem(item);
  if (!merged) return null;
  const id = signalIdFromMerged(merged);
  if (!id || String(id).startsWith('func_')) return null;

  const mLabel = pickFirst(merged.measured_label, merged.MeasuredLabel);
  const measured =
    mLabel != null && String(mLabel).trim() !== '' ? String(mLabel).trim() : DASH;

  const sevRaw = resolveSeverityRaw(merged);
  const hasSev = sevRaw != null && sevRaw !== '';
  const sev = hasSev ? normalizeSev(sevRaw) : 'nd';

  const impact = formatImpact(merged);

  const name = String(
    pickFirst(merged.signal_name, merged.SignalName, merged.name, merged.title, merged.label, id)
  );

  const proc = String(
    pickFirst(
      merged.process,
      merged.Process,
      merged.process_area,
      merged.proc,
      merged.category,
      merged.domain,
      merged.ProcessArea,
      DASH
    )
  );

  const valRaw = pickFirst(merged.signal_value, merged.SignalValue, merged.value, merged.default_value);
  const val =
    valRaw != null && valRaw !== ''
      ? String(valRaw)
      : measured;

  return {
    id,
    entry: {
      ...createEmptySignalEntry(id),
      name,
      proc,
      sev,
      val,
      impact: impact !== DASH ? impact : DASH,
    },
  };
}

/** Patch existing catalog with rows from POST /signals/evaluate `data.results` (or same-shaped array). */
export function mergeSignalListItemsIntoCatalog(catalog, items) {
  if (!catalog || !Array.isArray(items) || !items.length) return catalog;
  const next = { ...catalog };
  for (const item of items) {
    const row = catalogEntryFromListItem(item);
    if (row) next[row.id] = row.entry;
  }
  return next;
}

/** Apply POST /signals/evaluate envelope: `{ data: { evaluated, results: [...] } }`. */
export function applyEvaluateAllResponseToCatalog(catalog, evaluateRes) {
  const results =
    evaluateRes?.data?.results ??
    evaluateRes?.results ??
    (Array.isArray(evaluateRes?.data) ? evaluateRes.data : null);
  if (!Array.isArray(results) || !results.length) return catalog;
  return mergeSignalListItemsIntoCatalog(catalog, results);
}

/**
 * Build catalog from GET /signals only (plus func_* placeholders). No demo signal narratives.
 */
export function mergeSignalsFromEngineResponse(apiJson) {
  const items = Array.isArray(apiJson?.data) ? apiJson.data : [];
  const out = buildMinimalFunctionCatalog();

  for (const item of items) {
    const row = catalogEntryFromListItem(item);
    if (row) out[row.id] = row.entry;
  }

  if (import.meta.env.DEV && items.length > 0) {
    const real = Object.keys(out).filter((k) => !k.startsWith('func_'));
    if (real.length === 0) {
      const sample = flattenSignalListItem(items[0]);
      console.warn(
        '[mergeSignals] API returned',
        items.length,
        'rows but 0 catalog ids. First row keys:',
        items[0] && typeof items[0] === 'object' ? Object.keys(items[0]) : items[0],
        'flattened keys:',
        sample ? Object.keys(sample).slice(0, 40) : null
      );
    }
  }

  return out;
}

/**
 * When GET /signals is empty but biz-impact breakdown lists signal ids, add minimal catalog
 * entries so Priority stack, drawers, and tab fetches can resolve real ids.
 */
export function hydrateCatalogFromBizCards(catalog, bizCards) {
  if (!catalog) return buildMinimalFunctionCatalog();
  if (!Array.isArray(bizCards) || !bizCards.length) return catalog;
  const next = { ...catalog };
  for (const card of bizCards) {
    for (const b of card.breakdown || []) {
      const sid = b.sigId != null && String(b.sigId).trim() !== '' ? String(b.sigId).trim() : null;
      if (!sid || sid.startsWith('func_')) continue;
      if (next[sid]) continue;
      const sev = b.sev === 'r' || b.sev === 'a' || b.sev === 'g' ? b.sev : 'nd';
      const contrib = b.contribution;
      const impact =
        contrib != null &&
        String(contrib).trim() !== '' &&
        String(contrib).trim() !== DASH
          ? String(contrib).trim()
          : DASH;
      next[sid] = {
        ...createEmptySignalEntry(sid),
        name:
          b.label && String(b.label).trim() && String(b.label).trim() !== DASH
            ? String(b.label).trim()
            : sid,
        proc: DASH,
        sev,
        val: DASH,
        impact,
      };
    }
  }
  return next;
}

/** Add placeholder rows for ids from GET /signals/display-order when list/breakdown did not supply them. */
export function hydrateCatalogFromDisplayOrder(catalog, displayOrderIds) {
  if (!catalog) return buildMinimalFunctionCatalog();
  if (!Array.isArray(displayOrderIds) || !displayOrderIds.length) return catalog;
  const next = { ...catalog };
  for (const sid of displayOrderIds) {
    const id = sid && String(sid).trim();
    if (!id || id.startsWith('func_')) continue;
    if (next[id]) continue;
    next[id] = {
      ...createEmptySignalEntry(id),
      name: id,
    };
  }
  return next;
}

/**
 * GET /signals/display-order — normalize to id list.
 */
function orderArrayFromRaw(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const t = raw.trim();
    if (/[,;|]/.test(t)) return t.split(/[,;|]+/).map((s) => s.trim()).filter(Boolean);
    return [t];
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const vals = Object.values(raw).filter(
      (x) => (typeof x === 'string' || typeof x === 'number') && String(x).trim()
    );
    if (vals.length) return vals;
  }
  return null;
}

export function mapDisplayOrderFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const candidates = [
    api.order,
    api.display_order,
    api.signal_ids,
    Array.isArray(api.data) ? api.data : null,
    api.data?.order,
    api.data?.display_order,
    api.data?.signal_ids,
    api.data?.signals,
    api.payload?.order,
    api.payload?.display_order,
    api.payload?.signal_ids,
    api.response?.order,
    api.result?.order,
    api.result?.signal_ids,
  ];
  let list = null;
  for (const raw of candidates) {
    list = orderArrayFromRaw(raw);
    if (list && list.length) break;
  }
  if (!list) return null;
  const ids = list
    .map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x) : x?.signal_id ?? x?.id ?? x?.signalId))
    .filter((sid) => sid && String(sid).trim() && !String(sid).startsWith('func_'));
  return ids.length ? ids : null;
}

export function buildSigOrderFromEngine(mergedSignals, apiItems, displayOrderFromApi = null) {
  const mergedKeys = Object.keys(mergedSignals).filter((k) => !k.startsWith('func_'));
  const set = new Set(mergedKeys);
  const ordered = [];
  const push = (sid) => {
    const id = sid && String(sid).trim();
    if (!id || id.startsWith('func_') || !set.has(id) || ordered.includes(id)) return;
    ordered.push(id);
  };

  if (Array.isArray(displayOrderFromApi)) {
    for (const sid of displayOrderFromApi) push(sid);
  }

  for (const item of apiItems || []) {
    const merged = flattenSignalListItem(item);
    const id = merged ? signalIdFromMerged(merged) : null;
    push(id);
  }

  for (const k of mergedKeys) push(k);

  return ordered.length ? ordered : mergedKeys;
}

/**
 * POST /signals/{id}/run — TAI: `{ success, message, data: { definition, result } }`.
 */
export function applyRunResponseToCatalog(catalog, runResponse) {
  let data = runResponse?.data;
  if (data && typeof data === 'object' && !Array.isArray(data) && data.data && (data.data.definition || data.data.result)) {
    data = data.data;
  }
  if (!data || typeof data !== 'object') return catalog;
  const slice = mergeSignalsFromEngineResponse({
    data: [data],
  });
  const merged = flattenSignalListItem(data);
  const id = merged ? signalIdFromMerged(merged) : null;
  if (!id || !slice[id]) return catalog;
  return { ...catalog, [id]: slice[id] };
}
