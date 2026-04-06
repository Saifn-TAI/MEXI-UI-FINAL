function normalizeBreakdownSev(s) {
  const x = String(s ?? 'a').toLowerCase();
  if (x.startsWith('r') || x.includes('critical')) return 'r';
  if (x.startsWith('g') || x.includes('normal')) return 'g';
  return 'a';
}

function normalizeCardColor(c) {
  const x = String(c.color || c.severity || c.status || 'r').toLowerCase();
  if (x.startsWith('r') || x.includes('critical')) return 'r';
  if (x.startsWith('a') || x.includes('warn')) return 'a';
  if (x.startsWith('p')) return 'p';
  if (x.startsWith('g') || x.includes('normal')) return 'g';
  return 'r';
}

/**
 * Maps GET /biz-impact/cards response into the shape used by BizImpactGrid / BizImpactDrawer / IPHeader.
 * Backend may return { cards: [...] } or a raw array — both are handled.
 */
/** API may send breakdown as an object map: { "P3.01": { pct, label, ... } } */
function coerceBreakdownRows(breakdownSrc) {
  if (Array.isArray(breakdownSrc)) return breakdownSrc;
  if (breakdownSrc && typeof breakdownSrc === 'object' && !Array.isArray(breakdownSrc)) {
    return Object.entries(breakdownSrc).map(([key, v]) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return { ...v, _mapKey: key };
      }
      return { signal_id: key, contribution: v };
    });
  }
  return [];
}

/** "10 signals causing …" → 10 */
function parseSignalCountFromNarrative(text) {
  if (!text || typeof text !== 'string') return null;
  const m = text.match(/(\d+)\s+signals?\b/i);
  return m ? Math.min(999, Math.max(0, parseInt(m[1], 10))) : null;
}

function extractDescFromSignalBreakdown(text) {
  if (!text || typeof text !== 'string') return '';
  const top = text.match(/Top:\s*([^)]+)\)/i);
  if (top) return top[1].trim().slice(0, 120);
  const cause = text.match(/causing\s+the\s+Impact\s*\(([^)]+)\)/i);
  if (cause) return cause[1].trim().slice(0, 120);
  return '';
}

function coerceToCardArray(json) {
  let raw =
    json?.cards ??
    json?.data ??
    json?.items ??
    json?.results ??
    json?.impact_cards ??
    (Array.isArray(json) ? json : null);
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    if (Array.isArray(raw.cards)) return raw.cards;
    if (Array.isArray(raw.items)) return raw.items;
    const vals = Object.values(raw).filter((x) => x && typeof x === 'object' && !Array.isArray(x));
    if (
      vals.length > 0 &&
      vals.some(
        (x) =>
          x.card_id != null ||
          x.id != null ||
          x.label != null ||
          x.title != null ||
          x.value != null ||
          x.display_value != null ||
          x.breakdown != null ||
          x.signals != null
      )
    ) {
      return vals;
    }
  }
  return null;
}

export function mapBizImpactCardsResponse(json) {
  const raw = coerceToCardArray(json);
  if (!Array.isArray(raw) || raw.length === 0) return null;

  return raw.map((c, i) => {
    const breakdownSrc = coerceBreakdownRows(
      c.breakdown ||
        c.signals ||
        c.items ||
        c.contributing_signals ||
        c.contributingSignals ||
        c.signal_breakdown ||
        c.signalBreakdown ||
        c.related_signals ||
        c.top_signals ||
        c.drivers ||
        c.contributors ||
        []
    );
    let breakdown = breakdownSrc.map((b) => {
      const nestedSig = b.signal && typeof b.signal === 'object' ? b.signal : null;
      const fromMapKey = b._mapKey && String(b._mapKey).trim() ? String(b._mapKey).trim() : null;
      return {
        sigId:
          b.sig_id ||
          b.sigId ||
          b.signal_id ||
          b.signalId ||
          (typeof b.signal === 'string' ? b.signal : null) ||
          nestedSig?.signal_id ||
          nestedSig?.id ||
          b.id ||
          b.code ||
          b.slug ||
          fromMapKey,
        contribution: b.contribution ?? b.value ?? b.amount ?? b.weight ?? '—',
        pct: typeof b.pct === 'number' ? b.pct : parseInt(b.pct, 10) || 0,
        label:
          b.label ||
          b.title ||
          b.name ||
          b.signal_name ||
          b.signalName ||
          nestedSig?.signal_name ||
          nestedSig?.name ||
          '',
        sev: normalizeBreakdownSev(b.sev || b.severity),
      };
    });

    const sbText =
      typeof c.signal_breakdown === 'string'
        ? c.signal_breakdown.trim()
        : typeof c.signalBreakdown === 'string'
          ? c.signalBreakdown.trim()
          : '';
    if (!breakdown.length && sbText) {
      breakdown = [
        {
          sigId: null,
          contribution: '—',
          pct: 0,
          label: sbText,
          sev: normalizeBreakdownSev(c.status),
        },
      ];
    }

    const countHint =
      c.signal_count ??
      c.signals_count ??
      c.contributing_count ??
      c.n_signals ??
      c.linked_signal_count;
    const idList = c.signal_ids || c.top_signal_ids || c.contributing_signal_ids;
    if (!breakdown.length && countHint != null && Number(countHint) > 0) {
      const n = Math.min(Math.max(0, Math.floor(Number(countHint))), 80);
      breakdown = Array.from({ length: n }, (_, idx) => ({
        sigId: Array.isArray(idList) ? idList[idx] : null,
        contribution: '—',
        pct: 0,
        label: '—',
        sev: 'a',
      }));
    }

    const narrativeCount = sbText ? parseSignalCountFromNarrative(sbText) : null;
    const realRowCount = breakdown.filter((b) => b.sigId != null && String(b.sigId).trim()).length;
    let signalCount =
      countHint != null && Number.isFinite(Number(countHint)) && Number(countHint) >= 0
        ? Math.floor(Number(countHint))
        : null;
    if (signalCount == null) {
      if (realRowCount > 0) signalCount = realRowCount;
      else if (narrativeCount != null) signalCount = narrativeCount;
      else signalCount = Array.isArray(breakdown) ? breakdown.length : 0;
    }

    const deltaRaw =
      c.delta_display ??
      c.deltaDisplay ??
      c.change_display ??
      c.changeDisplay ??
      c.delta ??
      c.change ??
      c.delta_value ??
      c.change_value;
    const hasDelta = deltaRaw != null && String(deltaRaw).trim() !== '' && String(deltaRaw).trim() !== '—';
    const deltaDirRaw = String(
      c.delta_direction ?? c.deltaDirection ?? c.trend ?? c.delta_dir ?? c.deltaDir ?? 'up'
    ).toLowerCase();
    const deltaDir = !hasDelta
      ? 'flat'
      : deltaDirRaw === 'down' || deltaDirRaw === 'd' || deltaDirRaw === 'negative' || deltaDirRaw === 'worse'
        ? 'down'
        : deltaDirRaw === 'flat' || deltaDirRaw === 'neutral' || deltaDirRaw === 'n' || deltaDirRaw === 'same'
          ? 'flat'
          : 'up';

    const desc =
      c.desc ||
      c.description ||
      c.context_line ||
      c.contextLine ||
      c.subtitle ||
      c.metric_context ||
      c.metricContext ||
      c.kpi_subtitle ||
      extractDescFromSignalBreakdown(sbText) ||
      '';

    return {
      id: c.card_id || c.id || `card-${i}`,
      label: c.label || c.title || c.name || 'Business impact',
      value: c.value ?? c.display_value ?? '—',
      delta: hasDelta ? String(deltaRaw).trim() : '—',
      deltaDir,
      desc,
      color: normalizeCardColor(c),
      signalCount,
      totalNote: c.total_note || c.totalNote || '',
      breakdown,
      summaryNote: c.summary_note || c.summaryNote || '',
      keyMetrics: mapKeyMetrics(c.key_metrics || c.keyMetrics),
      topAction:
        c.top_action ||
        c.topAction ||
        c.recommended_first_action ||
        c.recommendedFirstAction ||
        '',
    };
  });
}

function mapKeyMetrics(km) {
  if (!Array.isArray(km)) return [];
  return km.map((m) => ({
    l: m.l || m.label || '',
    v: m.v ?? m.value ?? '',
    c: m.c || m.color || 'a',
  }));
}
