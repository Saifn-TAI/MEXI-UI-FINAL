/** Map Signal Engine tab JSON → shapes expected by IP*Tab components. Use "—" when missing. */

export const DASH = '—';

function str(v, fb = DASH) {
  if (v == null || v === '') return fb;
  return String(v);
}

/**
 * Merge common API envelopes and named tab sections so flat and nested Swagger shapes both map.
 * @param {object} api raw JSON
 * @param {string[]} sectionKeys e.g. ['what'] — shallow merge from api[sectionKeys[i]]
 */
export function coalesceEngineObject(api, sectionKeys = []) {
  if (!api || typeof api !== 'object' || Array.isArray(api)) return {};
  let out = { ...api };
  const liftKeys = ['data', 'payload', 'result', 'response', 'body', 'content'];
  for (const k of liftKeys) {
    const v = api[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out = { ...out, ...v };
    }
  }
  for (const k of sectionKeys) {
    const v = api[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out = { ...out, ...v };
    }
  }
  return out;
}

function pickDescription(doc) {
  const d =
    doc.description ??
    doc.what_description ??
    doc.signal_description ??
    doc.narrative ??
    doc.detail ??
    doc.body ??
    doc.text;
  if (typeof d === 'string' && d.trim()) return d.trim();
  const w = doc.what;
  if (w && typeof w === 'object' && typeof w.description === 'string' && w.description.trim()) {
    return w.description.trim();
  }
  return null;
}

function pickSummaryLine(doc) {
  const s = doc.summary ?? doc.overview ?? doc.headline ?? doc.title;
  if (typeof s === 'string' && s.trim()) return s.trim();
  return null;
}

function sevClass(x) {
  const s = String(x ?? 'g').toLowerCase();
  if (['r', 'red', 'critical', 'high', '3'].some((k) => s.includes(k))) return 'r';
  if (['a', 'amber', 'warn', 'medium', '2', 'orange'].some((k) => s.includes(k))) return 'a';
  return 'g';
}

/** Build { h, r, c } from TAI `structured_table`: array of row objects (e.g. Machine, Utilization, …). */
function tableFromStructuredTable(rows) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const keyOrder = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        keyOrder.push(k);
      }
    }
  }
  if (!keyOrder.length) return null;
  const h = keyOrder.map((k) => str(k, DASH));
  return {
    h,
    r: rows.map((row) =>
      keyOrder.map((k) => str(row && typeof row === 'object' ? row[k] : undefined, DASH))
    ),
    c: h.map(() => ''),
  };
}

/** GET /signals/{id}/what — API-only; missing fields become em dashes. */
export function mapWhatFromApi(api) {
  const doc = coalesceEngineObject(api && typeof api === 'object' ? api : {}, [
    'what',
    'signal_what',
    'measurement',
    'tab',
  ]);
  let meas = [];
  const msrc =
    doc.measurement_cards ??
    doc.measurements ??
    doc.meas ??
    doc.metrics ??
    doc.kpis ??
    doc.tiles ??
    doc.summary_metrics ??
    doc.measurement_rows ??
    doc.kpi_rows ??
    doc.indicator_rows;
  if (Array.isArray(msrc) && msrc.length) {
    meas = msrc.map((x) => ({
      l: str(x.label ?? x.l ?? x.name ?? x.title ?? x.metric ?? x.key, DASH),
      v: str(x.value ?? x.v ?? x.val ?? x.reading ?? x.current),
      c: sevClass(x.color ?? x.severity ?? x.c ?? x.status),
    }));
  } else {
    const desc = pickDescription(doc);
    if (desc) {
      meas = [{ l: 'Description', v: str(desc), c: 'g' }];
    } else {
      const sum = pickSummaryLine(doc);
      if (sum) {
        meas = [{ l: 'Summary', v: str(sum), c: 'g' }];
      }
    }
  }
  if (!meas.length) {
    meas = [{ l: DASH, v: DASH, c: 'g' }];
  }

  let table = tableFromStructuredTable(doc.structured_table);
  const hdrs =
    doc.headers ??
    doc.columns ??
    doc.table_headers ??
    doc.table?.headers ??
    doc.evidence_headers;
  const rows =
    doc.rows ??
    doc.table_rows ??
    doc.evidence ??
    doc.table?.rows ??
    doc.data_rows ??
    doc.measurement_table;
  if (!table && Array.isArray(hdrs) && Array.isArray(rows) && rows.length) {
    const h = hdrs.map((h) => str(typeof h === 'string' ? h : h.label ?? h.key ?? h.name ?? DASH));
    table = {
      h,
      r: rows.map((row) => {
        if (Array.isArray(row)) return row.map((c) => str(c));
        return h.map((_, ci) => {
          const key = hdrs[ci];
          const k = typeof key === 'object' ? key.key ?? key.field : key;
          return str(row?.[k] ?? row?.[ci] ?? DASH);
        });
      }),
      c: h.map(() => ''),
    };
  }

  return { meas, table };
}

/** GET /signals/{id}/why → { why, hyps } for merging onto signal object */
export function mapWhyFromApi(api, curSig) {
  const b = curSig?.why && typeof curSig.why === 'object' ? curSig.why : {};
  if (!api || typeof api !== 'object') {
    return {
      why: {
        cause: str(b.cause, DASH),
        impact: str(b.impact, DASH),
        timeline: str(b.timeline, DASH),
        confidence: b.confidence === 'high' || b.confidence === 'med' ? b.confidence : 'low',
        rec: str(b.rec, DASH),
      },
      hyps: [],
    };
  }
  const a0 = coalesceEngineObject(api, ['why', 'analysis', 'explanation', 'root_cause_analysis', 'tab']);
  const se = a0.structured_explanation;
  const a =
    se && typeof se === 'object' && !Array.isArray(se) ? { ...a0, ...se } : a0;
  const confRaw = String(a.confidence ?? a.conf ?? a.confidence_level ?? b.confidence ?? 'low').toLowerCase();
  const confidence = confRaw.startsWith('h') ? 'high' : confRaw.startsWith('m') ? 'med' : 'low';
  const hySrc =
    a.hypotheses ??
    a.hyps ??
    a.root_cause_hypotheses ??
    a.candidate_causes ??
    a.possible_causes;
  let hyps = [];
  if (Array.isArray(hySrc) && hySrc.length) {
    hyps = hySrc.map((h) => ({
      r: str(h.rank ?? h.r, DASH),
      c: str(h.css_class ?? h.c ?? 'h1', 'h1'),
      t: str(h.title ?? h.t ?? h.hypothesis ?? h.cause ?? DASH),
      e: str(h.evidence ?? h.e ?? h.detail ?? h.description ?? DASH),
    }));
  }
  return {
    why: {
      cause: str(
        a.cause ??
          a.root_cause ??
          a.primary_cause ??
          (typeof a.explanation === 'string' ? a.explanation : null) ??
          pickDescription(a) ??
          b.cause,
        DASH
      ),
      impact: str(
        a.impact ?? a.business_impact ?? a.effect ?? a.financial_impact ?? b.impact,
        DASH
      ),
      timeline: str(
        a.timeline ?? a.time_horizon ?? a.when ?? a.horizon ?? a.eta ?? b.timeline,
        DASH
      ),
      confidence,
      rec: str(
        a.recommended_actions ??
          a.recommendation ??
          a.rec ??
          a.recommended_action ??
          a.next_step ??
          (Array.isArray(a.recommendations) ? a.recommendations[0] : null) ??
          b.rec,
        DASH
      ),
    },
    hyps,
  };
}

/** GET /signals/{id}/impact → fvla block (API fields only). */
export function mapFvlaFromApi(api) {
  const doc = coalesceEngineObject(api && typeof api === 'object' ? api : {}, [
    'impact',
    'fvla',
    'financial',
    'tab',
  ]);
  let revPrimary;
  if (typeof doc.fvla === 'string' && doc.fvla.trim()) {
    revPrimary = doc.fvla.trim();
  } else if (doc.revenue_at_risk != null && doc.revenue_at_risk !== '') {
    revPrimary = doc.revenue_at_risk;
  } else if (doc.revenue_at_risk_lakhs != null && doc.revenue_at_risk_lakhs !== '') {
    revPrimary = `₹${doc.revenue_at_risk_lakhs}L`;
  }
  const trace =
    doc.source_traceability ??
    doc.traceability ??
    doc.source ??
    doc.sap_source ??
    doc.revenue_subtitle ??
    doc.rev_sub ??
    doc.revS;
  return {
    rev: str(revPrimary ?? doc.rev ?? doc.revenue ?? doc.revenue_risk ?? doc.financial_impact, DASH),
    revS: str(trace, ''),
    cap: str(
      doc.capital_locked ?? doc.cap ?? doc.capital ?? doc.working_capital_impact,
      DASH
    ),
    capS: str(doc.capital_subtitle ?? doc.capS, ''),
    mar: str(doc.margin_impact ?? doc.mar ?? doc.margin ?? doc.margin_effect, DASH),
    marS: str(doc.margin_subtitle ?? doc.marS, ''),
  };
}

/** GET /signals/{id}/actions */
export function mapActsFromApi(api) {
  const doc = coalesceEngineObject(api && typeof api === 'object' ? api : {}, ['actions', 'tab']);
  const src =
    doc.actions ??
    doc.items ??
    doc.executive_actions ??
    doc.recommended_actions ??
    doc.next_steps ??
    doc.action_items ??
    doc.tasks;
  if (!Array.isArray(src) || !src.length) {
    return [{ t: DASH, s: DASH }];
  }
  return src.map((a) => ({
    t: str(
      a.title ?? a.t ?? a.action ?? a.name ?? a.label ?? a.description ?? a.summary,
      DASH
    ),
    s: str(
      a.assigned_to ??
        a.assignee ??
        a.source ??
        a.s ??
        a.grounding ??
        a.sap_source ??
        a.owner ??
        a.system ??
        (a.status != null && String(a.status).trim() ? String(a.status).trim() : null),
      DASH
    ),
  }));
}

function mapRiskChangedRow(item, i) {
  return {
    icon: str(item.icon ?? item.change_type ?? '•', '•'),
    type: ['worse', 'better', 'new'].includes(String(item.type ?? item.delta_type).toLowerCase())
      ? String(item.type ?? item.delta_type).toLowerCase()
      : 'new',
    text: str(item.text ?? item.message ?? item.summary ?? item.title ?? item.description ?? DASH, DASH),
    delta: str(item.delta ?? item.change ?? item.subtitle ?? DASH, DASH),
  };
}

/** GET /risks/changed */
export function mapRisksChangedFromApi(api) {
  if (Array.isArray(api) && api.length) return api.map(mapRiskChangedRow);
  const root = coalesceEngineObject(api && typeof api === 'object' ? api : {}, [
    'risks',
    'changes',
    'updates',
    'delta',
  ]);
  const dataNested =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? root.data.items || root.data.changes || root.data.risks || root.data.updates
      : null;
  const src =
    root.items ??
    root.changes ??
    root.risks ??
    root.updates ??
    (Array.isArray(root.data) ? root.data : null) ??
    dataNested ??
    root.events ??
    root.feed;
  if (!Array.isArray(src) || !src.length) return null;
  return src.map(mapRiskChangedRow);
}

/** GET /dashboard/brief-highlights — TAI: `highlights[]` with `revenue_at_risk`, `severity` */
export function mapBriefHighlightsToBriefRows(api) {
  const hl = api?.highlights ?? api?.items ?? api?.data;
  if (!Array.isArray(hl) || !hl.length) return null;
  return hl.map((h) => {
    const sevChar = sevClass(h.severity ?? h.sev ?? 'a');
    const c = sevChar === 'r' ? 'r' : sevChar === 'g' ? 'g' : 'a';
    const name = str(h.signal_name ?? h.name ?? h.title, DASH);
    const sid = str(h.signal_id ?? h.id ?? '', '');
    const rev = str(h.revenue_at_risk ?? h.revenueAtRisk ?? '', '').trim();
    let summary = str(h.summary ?? h.text ?? h.what_summary ?? '', '').trim();
    if (!summary && rev) summary = rev;
    else if (summary && rev && !summary.includes(rev)) summary = `${summary} · ${rev}`;
    if (!summary) summary = DASH;
    const html = sid ? `<strong>${name}</strong> (${sid}): ${summary}` : `<strong>${name}</strong>: ${summary}`;
    return { c, text: html, sig: sid || undefined };
  });
}

/** TAI `function_key` from GET /signals/heatmap/all → left-panel `func_*` id */
export const HEATMAP_FUNCTION_KEY_TO_PANEL = {
  production: 'func_production',
  supply_chain: 'func_supply',
  vendor: 'func_vendor',
  demand_otd: 'func_demand',
  inventory: 'func_inventory',
  quality: 'func_quality',
  maintenance: 'func_maintenance',
  planning: 'func_planning',
  marketing_sales: 'func_marketing_sales',
};

/** Panel id → URL segment for GET /signals/heatmap/{segment} */
export const HEATMAP_PATH_BY_PANEL = {
  func_production: 'production',
  func_supply: 'supply-chain',
  func_vendor: 'vendor',
  func_demand: 'demand-otd',
  func_inventory: 'inventory',
  func_quality: 'quality',
  func_maintenance: 'maintenance',
  func_planning: 'planning',
  func_marketing_sales: 'marketing-sales',
};

/** GET /signals/heatmap/all (and similar) → compact tile lines */
const HEAT_KEYS = [
  { panel: 'func_production', pathKeys: ['production', 'prod', 'machine'] },
  { panel: 'func_supply', pathKeys: ['supply', 'supplier', 'sc', 'supply_chain'] },
  { panel: 'func_vendor', pathKeys: ['vendor', 'subcon'] },
  { panel: 'func_demand', pathKeys: ['demand', 'otd', 'order', 'demand_otd'] },
  { panel: 'func_inventory', pathKeys: ['inventory', 'inv', 'wip'] },
  { panel: 'func_quality', pathKeys: ['quality', 'qm'] },
  { panel: 'func_maintenance', pathKeys: ['maintenance', 'maint', 'pm'] },
  { panel: 'func_planning', pathKeys: ['planning'] },
  { panel: 'func_marketing_sales', pathKeys: ['marketing', 'sales', 'mkt', 'marketing_sales'] },
];

function heatmapTilesHaveData(tiles) {
  if (!Array.isArray(tiles) || !tiles.length) return false;
  return tiles.some((t) => t.statLine && t.statLine !== DASH);
}

function confidenceFromHeatmapString(s) {
  const t = String(s ?? '').toLowerCase();
  if (t.startsWith('h')) return 'high';
  if (t.startsWith('m')) return 'med';
  return 'low';
}

/**
 * TAI heatmap `what[]` can list multiple signals (e.g. demand_otd P3.05 + P3.07). Merge cards and tables.
 */
function mergeHeatmapWhatArray(whatArr) {
  if (!Array.isArray(whatArr) || !whatArr.length) {
    return mapWhatFromApi({});
  }
  const meas = [];
  const tableRows = [];
  for (const w of whatArr) {
    if (!w || typeof w !== 'object') continue;
    const sid = str(w.signal_id, '').trim();
    const sname = str(w.signal_name, '').trim();
    const cards = Array.isArray(w.measurement_cards) ? w.measurement_cards : [];
    if (cards.length) {
      for (const c of cards) {
        const lbl = str(c.label ?? c.l, DASH);
        meas.push({
          l: sid ? `${lbl} (${sid})` : lbl,
          v: str(c.value ?? c.v ?? c.val),
          c: sevClass(c.color ?? c.severity ?? c.c ?? c.status),
        });
      }
    } else {
      const desc =
        typeof w.description === 'string' && w.description.trim() ? w.description.trim() : '';
      if (desc) {
        const rowLabel = sname || sid || 'Signal';
        meas.push({ l: rowLabel + (sid ? ` (${sid})` : ''), v: str(desc), c: 'g' });
      }
    }
    if (Array.isArray(w.structured_table) && w.structured_table.length) {
      tableRows.push(...w.structured_table);
    }
  }
  const table = tableFromStructuredTable(tableRows);
  if (!meas.length) {
    return mapWhatFromApi({});
  }
  return { meas, table };
}

/** Map up to three heatmap `impact[]` rows into IP impact tab slots (rev / cap / mar). */
function mapFvlaFromHeatmapImpactArray(impArr) {
  if (!Array.isArray(impArr) || !impArr.length) return mapFvlaFromApi({});
  const at = (i) => impArr[i];
  const f0 = at(0);
  const f1 = at(1);
  const f2 = at(2);
  return {
    rev: str(f0?.fvla, DASH),
    revS: str(f0?.traceability ?? f0?.source_traceability, ''),
    cap: str(f1?.fvla, DASH),
    capS: str(f1?.traceability ?? f1?.source_traceability, ''),
    mar: str(f2?.fvla, DASH),
    marS: str(f2?.traceability ?? f2?.source_traceability, ''),
  };
}

/**
 * GET /signals/heatmap/{function} — merge `what` / `why` / `impact` / `actions` arrays into one catalog row.
 */
export function mapHeatmapDetailToCatalogEntry(api, panelId) {
  if (!api || typeof api !== 'object') return null;
  const root = coalesceEngineObject(api, []);
  const name = str(root.function ?? root.name, panelId ? String(panelId).replace(/^func_/, '') : DASH);
  const score = root.health_score;
  const valStr =
    score != null && score !== '' && Number.isFinite(Number(score)) ? `${Number(score)}% health` : DASH;
  const n = Number(score);
  let sev = 'nd';
  if (Number.isFinite(n)) {
    if (n < 40) sev = 'r';
    else if (n < 75) sev = 'a';
    else sev = 'g';
  }

  const whatArr = Array.isArray(root.what) ? root.what : [];
  let what = mergeHeatmapWhatArray(whatArr);
  const contrib = Array.isArray(root.contributing_signals) ? root.contributing_signals.filter(Boolean) : [];
  if (!whatArr.length && contrib.length) {
    what = {
      meas: [{ l: 'Contributing signals', v: contrib.map((x) => String(x).trim()).join(' · '), c: 'g' }],
      table: null,
    };
  }

  const whyArr = Array.isArray(root.why) ? root.why : [];
  const firstWhy = whyArr[0];
  const why = firstWhy
    ? {
        cause: str(firstWhy.cause, DASH),
        impact: str(firstWhy.impact, DASH),
        timeline: str(firstWhy.timeline, DASH),
        confidence: confidenceFromHeatmapString(firstWhy.confidence),
        rec: str(
          firstWhy.recommended_actions ?? firstWhy.recommendation ?? firstWhy.rec ?? firstWhy.next_step,
          DASH
        ),
      }
    : {
        cause: DASH,
        impact: DASH,
        timeline: DASH,
        confidence: 'low',
        rec: DASH,
      };

  const hyps = whyArr.slice(1).map((w, i) => ({
    r: String(i + 2),
    c: 'h1',
    t: str(w.signal_name ?? w.signal_id, DASH),
    e: str(w.cause ?? w.impact, DASH),
  }));

  const impArr = Array.isArray(root.impact) ? root.impact : [];
  const fvla = mapFvlaFromHeatmapImpactArray(impArr);

  const actArr = Array.isArray(root.actions) ? root.actions : [];
  const acts =
    actArr.length > 0
      ? actArr.map((a) => ({
          t: str(a.action ?? a.title ?? a.text, DASH),
          s: str(
            [a.signal_name, a.signal_id].filter((x) => x != null && String(x).trim()).join(' · ') || DASH,
            DASH
          ),
        }))
      : mapActsFromApi({});

  const impactLines = impArr
    .map((i) => (i?.fvla != null && String(i.fvla).trim() ? String(i.fvla).trim() : ''))
    .filter(Boolean);
  const impactLine = impactLines.length ? impactLines.slice(0, 3).join(' · ') : DASH;

  return {
    name,
    proc: name,
    sev,
    val: valStr,
    impact: impactLine,
    what,
    why,
    hyps,
    fvla,
    acts,
    contributingSignals: contrib.length ? contrib : undefined,
  };
}

export function mapHeatmapToTiles(api) {
  if (!api || typeof api !== 'object') return null;

  const health = api.health ?? api.data?.health;
  if (Array.isArray(health) && health.length) {
    const tiles = health
      .map((row) => {
        const fk = String(row.function_key ?? '').toLowerCase().replace(/-/g, '_');
        const panel = HEATMAP_FUNCTION_KEY_TO_PANEL[fk];
        if (!panel) return null;
        const name = str(row.name, titleCase(panel));
        const score = row.score;
        const status = str(row.status, '');
        const parts = [];
        if (score != null && score !== '' && Number.isFinite(Number(score))) parts.push(`${Number(score)}%`);
        if (status) parts.push(status);
        let statLine = parts.length ? parts.join(' · ') : DASH;
        if (statLine === DASH && row.description) {
          const d = str(row.description, '');
          statLine = d.length > 56 ? `${d.slice(0, 54)}…` : d;
        }
        return {
          panel,
          name,
          statLine,
          sev: sevClass(row.status ?? row.severity),
        };
      })
      .filter(Boolean);
    return heatmapTilesHaveData(tiles) ? tiles : null;
  }

  const funcs = api.functions ?? api.areas ?? api.domains ?? api.zones ?? api.categories;
  if (!Array.isArray(funcs)) {
    if (Array.isArray(api.scores)) {
      const tiles = HEAT_KEYS.map((hk, i) => {
        const row = api.scores[i] ?? api.scores.find((s) => hk.pathKeys.some((k) => JSON.stringify(s).toLowerCase().includes(k)));
        return {
          panel: hk.panel,
          name: hk.panel.replace('func_', '').replace(/_/g, ' '),
          statLine: row ? str(row.label ?? row.summary ?? row.status, DASH) : DASH,
          sev: row ? sevClass(row.severity ?? row.health ?? row.status) : 'g',
        };
      });
      return heatmapTilesHaveData(tiles) ? tiles : null;
    }
    return null;
  }
  if (funcs.length === 0) return null;
  const tiles = HEAT_KEYS.map((hk) => {
    const row =
      funcs.find((f) => {
        const id = String(f.id ?? f.key ?? f.slug ?? f.function_key ?? f.name ?? '').toLowerCase();
        return hk.pathKeys.some((k) => id.includes(k));
      }) ?? funcs[HEAT_KEYS.indexOf(hk)];
    if (!row) {
      return { panel: hk.panel, name: titleCase(hk.panel), statLine: DASH, sev: 'g' };
    }
    return {
      panel: hk.panel,
      name: str(row.name ?? row.label ?? titleCase(hk.panel), titleCase(hk.panel)),
      statLine: str(
        row.summary ?? row.stat ?? row.subtitle ?? row.alerts ?? row.value ?? row.description,
        DASH
      ),
      sev: sevClass(row.severity ?? row.health ?? row.status ?? row.color),
    };
  });
  return heatmapTilesHaveData(tiles) ? tiles : null;
}

function titleCase(s) {
  return s
    .replace(/^func_/, '')
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** GET /ask-mexi/suggested-prompts — TAI may return a raw JSON array of strings. */
export function mapSuggestedPromptsFromApi(api) {
  if (Array.isArray(api)) {
    const out = api
      .map((p) => str(typeof p === 'string' ? p : p?.text ?? p?.label ?? p?.prompt ?? p?.question, ''))
      .filter(Boolean);
    return out.length ? out : null;
  }
  const src = api?.prompts ?? api?.suggestions ?? api?.items ?? api?.chips ?? api?.questions ?? api?.data;
  if (!Array.isArray(src)) return null;
  const out = src.map((p) => str(typeof p === 'string' ? p : p.text ?? p.label ?? p.prompt ?? p.question, '')).filter(Boolean);
  return out.length ? out : null;
}

/** GET /ask-mexi/conversations — e.g. `{ data: [...] }` */
export function mapAskMexiConversationsFromApi(api) {
  if (!api || typeof api !== 'object') return [];
  const merged = coalesceEngineObject(api, []);
  const arr =
    (Array.isArray(merged.data) ? merged.data : null) ??
    (Array.isArray(merged.conversations) ? merged.conversations : null) ??
    (Array.isArray(merged.items) ? merged.items : null) ??
    (Array.isArray(api) ? api : null) ??
    [];
  if (!Array.isArray(arr)) return [];
  return arr.map((c, i) => {
    const id = c?.id ?? c?.conversation_id ?? `conv-${i}`;
    const titleRaw = c?.title ?? c?.first_message ?? c?.preview ?? c?.last_message ?? 'Chat';
    const title = str(titleRaw, 'Chat').slice(0, 72);
    let time = '—';
    const at = c?.created_at ?? c?.updated_at ?? c?.last_message_at;
    if (typeof at === 'string' && at.trim()) {
      const d = new Date(at);
      if (!Number.isNaN(d.getTime())) {
        time = d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      }
    }
    return { id: String(id), title, time, active: false };
  });
}

/** Plain-text block for in-panel Ask display (matches ChatMessages bot layout). */
export function formatStructuredReplyForDisplay(m) {
  if (!m || typeof m !== 'object') return '—';
  const confCls = m.conf === 'high' ? 'high' : m.conf === 'med' ? 'med' : 'low';
  const confLabel =
    confCls === 'high' ? '● High confidence' : confCls === 'med' ? '◐ Medium confidence' : '○ Low confidence';
  const cause = str(m.cause, DASH);
  const impact = str(m.impact, DASH);
  const timeline = str(m.timeline, DASH);
  const rec = str(m.rec, DASH);
  return `${cause}\n\nImpact: ${impact}\n\nTimeline: ${timeline}\n\nConfidence: ${confLabel}\n\nRecommended Action: ${rec}`;
}

function tryParseJsonObject(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!t.startsWith('{')) return null;
  try {
    const j = JSON.parse(t);
    return j && typeof j === 'object' && !Array.isArray(j) ? j : null;
  } catch {
    return null;
  }
}

function openAiText(root) {
  const c = root?.choices?.[0]?.message?.content;
  return typeof c === 'string' ? c.trim() : '';
}

/** POST /ask-mexi/conversations/{id}/messages or /signals/{id}/ask */
export function mapChatBotReplyFromApi(api) {
  if (!api || typeof api !== 'object') return null;
  const merged = coalesceEngineObject(api, ['response', 'answer', 'assistant', 'result', 'data', 'message']);
  if (merged.message && typeof merged.message === 'object' && !Array.isArray(merged.message)) {
    Object.assign(merged, merged.message);
  }
  const oai = openAiText(api) || openAiText(merged);
  const fromOai = tryParseJsonObject(oai);
  if (fromOai) Object.assign(merged, fromOai);

  for (const key of ['text', 'answer', 'content', 'output', 'reply']) {
    const extra = tryParseJsonObject(merged[key]);
    if (extra) Object.assign(merged, extra);
  }

  const rawCause = merged.cause ?? merged.root_cause ?? merged.answer_cause ?? merged.title ?? merged.headline;
  const rawImpact =
    merged.impact ?? merged.answer_impact ?? merged.business_impact ?? merged.effect ?? merged.financial_impact;
  const rawTimeline = merged.timeline ?? merged.time_horizon ?? merged.when ?? merged.horizon;
  const confRaw = String(merged.confidence ?? merged.conf ?? merged.certainty ?? 'med').toLowerCase();
  const conf = confRaw.startsWith('h') ? 'high' : confRaw.startsWith('l') ? 'low' : 'med';
  const rawRec =
    merged.recommendation ??
    merged.rec ??
    merged.recommended_action ??
    merged.next_step ??
    (Array.isArray(merged.recommendations) ? merged.recommendations[0] : null);

  const freeCandidates = [
    oai,
    merged.assistant_message,
    merged.bot_message,
    merged.reply,
    merged.answer,
    merged.content,
    merged.output,
    merged.explanation,
    merged.summary,
    merged.narrative,
    typeof merged.message === 'string' ? merged.message : null,
    typeof merged.text === 'string' ? merged.text : null,
  ];
  const freeText = freeCandidates.find((x) => typeof x === 'string' && x.trim().length > 0);
  const free = freeText ? freeText.trim() : '';

  const cause = str(rawCause, DASH);
  const impact = str(rawImpact, DASH);
  const timeline = str(rawTimeline, DASH);
  const rec = str(rawRec, DASH);

  const missingBlock =
    (cause === DASH || !String(cause).trim()) &&
    (impact === DASH || !String(impact).trim()) &&
    (rec === DASH || !String(rec).trim());

  if (missingBlock && free) {
    return { cause: free, impact: DASH, timeline: DASH, conf, rec: DASH };
  }
  if ((cause === DASH || !String(cause).trim()) && free) {
    return { cause: free, impact, timeline, conf, rec };
  }
  return { cause, impact, timeline, conf, rec };
}
