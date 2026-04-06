import React, { useState } from 'react';

const FUNC_DATA = {
  func_production: {
    label: 'Production', value: '43.4%', delta: '↓ 6.2%', color: 'r', stat: '6 alerts · ₹424L',
    summaryNote: 'Fleet efficiency at 43.4% — 344 of 372 WOs incomplete. Setup time consuming 53.6% of all non-productive time.',
    topAction: 'Freeze new BTPL WO releases. Priority sequence: cross-ref WOs vs overdue SO lines by value × delay days.',
    breakdown: [
      { sigId: 'P3.04', contribution: '₹424L', pct: 55, label: 'Production WO backlog risk', sev: 'r' },
      { sigId: 'P3.01', contribution: '₹77L', pct: 17, label: 'Fleet avg 43.4% — 22 of 24 machines below 60%', sev: 'r' },
      { sigId: 'S1.01', contribution: '₹180L', pct: 12, label: 'Supplier delays starving production input', sev: 'r' },
      { sigId: 'M7.19', contribution: 'Unprotected', pct: 8, label: '3 machines no warranty — breakdown risk on production path', sev: 'r' },
      { sigId: 'P3.03', contribution: '₹18K/day', pct: 5, label: '194K min No-Operator downtime', sev: 'a' },
      { sigId: 'P3.13', contribution: '2,168 hrs', pct: 3, label: '53.6% of all non-productive time', sev: 'a' },
    ],
  },
  func_supply: {
    label: 'Supply', value: '71%', delta: '↓ 4%', color: 'r', stat: '9 alerts · ₹180L',
    summaryNote: '3 repeat-offender vendors missing delivery dates for 3+ consecutive periods. No escalation triggered.',
    topAction: 'MD-level review of 3 repeat-offender vendors. Issue 30-day Performance Improvement Notice.',
    breakdown: [
      { sigId: 'S1.01', contribution: '₹180L', pct: 62, label: '3 repeat offenders · 9 critical alerts', sev: 'r' },
      { sigId: 'S1.04', contribution: '₹42L', pct: 24, label: 'No escalation triggered for 3–4 periods', sev: 'r' },
      { sigId: 'S1.16', contribution: '8–15% premium', pct: 14, label: '8 of 12 vendors below 75% reliability', sev: 'a' },
    ],
  },
  func_vendor: {
    label: 'Vendor', value: '8 ops', delta: '↑ 2 ops', color: 'a', stat: '3 alerts · ₹42L',
    summaryNote: '8 subcontracting operations have only one qualified vendor. MP Tech is single-source for 2 critical ops simultaneously.',
    topAction: 'Qualify alternate vendor for Turning-2 and Stress Relieving within 60 days.',
    breakdown: [
      { sigId: 'V2.07', contribution: '16,380 pcs', pct: 68, label: 'MP Tech sole vendor for 2 critical ops', sev: 'a' },
      { sigId: 'S1.04', contribution: '₹42L', pct: 32, label: 'No alternate sourcing in place', sev: 'r' },
    ],
  },
  func_demand: {
    label: 'Demand', value: '58.3%', delta: '↓ 4.1%', color: 'r', stat: '58% OTD',
    summaryNote: 'OTD at 58.3% against IATF target of 95%. 170 orders past committed delivery date. Penalty clauses active.',
    topAction: 'MD-level calls for Toshiba, Rotzler, Bull Machine this week. Freeze new order commitments.',
    breakdown: [
      { sigId: 'D5.01', contribution: '₹247L', pct: 60, label: 'OTD Collapse — overdue order value', sev: 'r' },
      { sigId: 'D5.08', contribution: '₹843L', pct: 28, label: '70.6% of total order book in one customer', sev: 'r' },
      { sigId: 'P3.04', contribution: '↓ 2.4%', pct: 12, label: 'WO completion failure reducing throughput', sev: 'a' },
    ],
  },
  func_inventory: {
    label: 'Inventory', value: '₹28L', delta: '↑ ₹6L', color: 'a', stat: '2 alerts · ₹28L',
    summaryNote: 'Excess raw material and stalled WIP locking capital. ₹38L in WIP recovering at <10% per period.',
    topAction: 'SMED audit on VTL-06/HMC-02 to release ₹38L trapped WIP this weekend.',
    breakdown: [
      { sigId: 'P3.01', contribution: '₹38L', pct: 55, label: 'Stalled WIP on floor — recovering <10%/period', sev: 'r' },
      { sigId: 'P3.03', contribution: '₹6L', pct: 45, label: 'Excess stock above safety level', sev: 'a' },
    ],
  },
  func_quality: {
    label: 'Quality', value: 'No data', delta: '—', color: 'g', stat: 'No data yet',
    summaryNote: 'Quality module active but no signal data recorded yet for this period.',
    topAction: 'Configure quality signal thresholds and connect to production data sources.',
    breakdown: [],
  },
  func_maintenance: {
    label: 'Maintenance', value: '20 PM due', delta: '↑ 5', color: 'r', stat: '20 PM due',
    summaryNote: '3 machines operating without warranty since December 2025. 85% PM compliance — 15% of scheduled maintenance not actioned.',
    topAction: 'Contact OEM for VTL-14, VTL-15, HMC-02 AMC renewal this week. HMC-02 first priority.',
    breakdown: [
      { sigId: 'M7.19', contribution: 'Full repair cost', pct: 55, label: 'VTL-14, VTL-15, HMC-02 unprotected 99–103 days', sev: 'r' },
      { sigId: 'M7.09', contribution: '₹8L', pct: 30, label: '14,793 min downtime · PM overdue', sev: 'a' },
      { sigId: 'P3.01', contribution: '4,042 hrs', pct: 15, label: 'Non-productive time from maintenance gaps', sev: 'a' },
    ],
  },
};

const colorMap = {
  r: { accent: 'var(--critical)', bg: 'var(--critical-bg)', bd: 'var(--critical-bd)', label: 'Critical' },
  a: { accent: 'var(--warn)', bg: 'var(--warn-bg)', bd: 'var(--warn-bd)', label: 'Warning' },
  g: { accent: 'var(--normal)', bg: 'var(--normal-bg)', bd: 'var(--normal-bd)', label: 'Normal' },
};

export default function CrossFunctionDrawer({ funcId, SIGNALS, onClose, openPanel }) {
  const [activeSignal, setActiveSignal] = useState(null);
  const data = FUNC_DATA[funcId];
  if (!data) return null;

  const hc = colorMap[data.color] || colorMap['r'];

  return (
    <div className="intel-panel" id="intel-panel" style={{ borderLeft: '1px solid var(--bd-2)' }}>
      {/* HEADER */}
      <div className="bid-header" style={{ borderTop: `3px solid ${hc.accent}`, flexShrink: 0 }}>
        <div className="bid-header-top">
          <div>
            <div className="bid-eyebrow">CROSS-FUNCTION HEALTH</div>
            <div className="bid-title">{data.label}</div>
          </div>
          <button className="bid-close" onClick={onClose}>✕</button>
        </div>
        <div className="bid-kpi-strip">
          <div className="bid-kpi-main">
            <span className="bid-kpi-val" style={{ color: hc.accent }}>{data.value}</span>
            <span className="bid-kpi-delta" style={{ color: hc.accent, background: hc.bg, border: `1px solid ${hc.bd}` }}>
              {data.delta}
            </span>
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '12px', color: 'var(--ink-4)', marginLeft: '8px' }}>
              {data.stat}
            </span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="bid-body" style={{ flex: 1, overflowY: 'auto' }}>
        {data.breakdown.length > 0 ? (
          <>
            <div className="bid-body-top-row">
              <div className="bid-section-label">Signal Breakdown</div>
              <div className="bid-status-count">{data.breakdown.length} Signals</div>
            </div>

            <div className="bid-signal-list">
              {data.breakdown.map((b, idx) => {
                const sig = SIGNALS?.[b.sigId];
                const sc = colorMap[b.sev] || colorMap['a'];
                const isActive = activeSignal === b.sigId;

                return (
                  <React.Fragment key={b.sigId}>
                    <div
                      className={`bid-sig-row ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveSignal(isActive ? null : b.sigId)}
                    >
                      <div className="bid-sig-left">
                        <div className="bid-sig-rank" style={{ background: sc.bg, color: sc.accent, borderColor: sc.bd }}>
                          #{idx + 1}
                        </div>
                        <div className="bid-sig-info">
                          <div className="bid-sig-name">{sig?.name || b.sigId}</div>
                          <div className="bid-sig-desc">{b.label}</div>
                        </div>
                      </div>
                      <div className="bid-sig-right">
                        <div className="bid-sig-contrib" style={{ color: sc.accent }}>{b.contribution}</div>
                        <div className="bid-sig-bar-wrap">
                          <div className="bid-sig-bar" style={{ width: `${b.pct}%`, background: sc.accent }} />
                        </div>
                        <div className="bid-sig-pct">{b.pct}%</div>
                        <div className="bid-sig-chevron">{isActive ? '▲' : '▼'}</div>
                      </div>
                    </div>

                    {isActive && sig && (
                      <div className="bid-sig-expand" style={{ borderColor: sc.bd, background: sc.bg, marginBottom: '6px', marginTop: '-4px' }}>
                        <div className="bid-se-header">
                          <div>
                            <div className="bid-se-id" style={{ color: sc.accent }}>SIGNAL INTELLIGENCE</div>
                            <div className="bid-se-name">{sig.name}</div>
                          </div>
                          <button
                            className="bid-se-full-btn"
                            style={{ background: sc.accent }}
                            onClick={() => { onClose(); openPanel(b.sigId, 'what'); }}
                          >
                            Full Signal →
                          </button>
                        </div>
                        <div className="bid-se-why">{sig.why?.cause}</div>
                        <div className="bid-se-meas">
                          {(sig.what?.meas || []).map((m, i) => (
                            <div key={i} className="bid-se-meas-chip">
                              <span className="bid-sem-l">{m.l}</span>
                              <span className={`bid-sem-v ${m.c}`}>{m.v}</span>
                            </div>
                          ))}
                        </div>
                        {sig.acts?.[0] && (
                          <div className="bid-se-action">
                            <span className="bid-se-action-label">Top Action:</span> {sig.acts[0].t}
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: '28px', textAlign: 'center', fontFamily: 'var(--f-body)', color: 'var(--ink-4)', fontSize: '13px' }}>
            No signal data available yet.
          </div>
        )}

        {data.summaryNote && (
          <div className="bid-summary-note">
            <span className="bid-note-icon">ℹ</span>
            {data.summaryNote}
          </div>
        )}

        <div className="bid-top-action">
          <div className="bid-ta-label">Recommended First Action</div>
          <div className="bid-ta-text">{data.topAction}</div>
        </div>
      </div>
    </div>
  );
}
