import React, { useState } from 'react';

const FUNC_DATA = {
  func_production: {
    label: 'Production', color: 'r', value: '43.4%', delta: '↓ 6.2%', stat: '6 alerts · ₹424L',
    summaryNote: 'Fleet efficiency at 43.4% — 344 of 372 WOs incomplete.',
    topAction: 'Freeze new BTPL WO releases. Priority sequence: cross-ref WOs vs overdue SO lines.',
    breakdown: [
      { id: 'P3.04', name: 'Production Order Completion', contribution: '₹424L', pct: 72, label: '344 of 372 WOs incomplete', sev: 'r' },
      { id: 'P3.01', name: 'Machine Efficiency Collapse', contribution: '₹77L', pct: 13, label: 'Fleet avg 43.4% — 22 of 24 machines below 60%', sev: 'r' },
      { id: 'P3.03', name: 'Machine Idle Rate', contribution: '₹18K/day', pct: 9, label: '194K min No-Operator downtime', sev: 'a' },
      { id: 'P3.13', name: 'Excessive Setup Time', contribution: '2,168 hrs', pct: 6, label: '53.6% of all non-productive time', sev: 'a' },
    ],
  },
  func_supply: {
    label: 'Supply', color: 'r', value: '71%', delta: '↓ 4%', stat: '9 alerts · ₹180L',
    summaryNote: '3 repeat-offender vendors missing delivery dates for 3+ consecutive periods.',
    topAction: 'MD-level review of 3 repeat-offender vendors. Issue 30-day Performance Improvement Notice.',
    breakdown: [
      { id: 'S1.01', name: 'Supplier OTD Failure', contribution: '₹180L', pct: 62, label: '3 repeat offenders · 9 critical alerts', sev: 'r' },
      { id: 'S1.04', name: 'Repeat Supplier Default', contribution: '₹42L', pct: 24, label: 'No escalation triggered for 3–4 periods', sev: 'r' },
      { id: 'S1.16', name: 'Supplier Reliability Below Threshold', contribution: '8–15% premium', pct: 14, label: '8 of 12 vendors below 75% reliability', sev: 'a' },
    ],
  },
  func_vendor: {
    label: 'Vendor', color: 'a', value: '8 ops', delta: '↑ 2 ops', stat: '3 alerts · ₹42L',
    summaryNote: '8 subcontracting operations have only one qualified vendor.',
    topAction: 'Qualify alternate vendor for Turning-2 and Stress Relieving within 60 days.',
    breakdown: [
      { id: 'V2.07', name: 'Single-Source Vendor Dependency', contribution: '16,380 pcs', pct: 68, label: 'MP Tech sole vendor for 2 critical ops', sev: 'a' },
      { id: 'S1.04', name: 'Repeat Supplier Default', contribution: '₹42L', pct: 32, label: 'No alternate sourcing in place', sev: 'r' },
    ],
  },
  func_demand: {
    label: 'Demand', color: 'r', value: '58.3%', delta: '↓ 4.1%', stat: '58% OTD',
    summaryNote: 'OTD at 58.3% against IATF target of 95%. 170 orders past committed delivery date.',
    topAction: 'MD-level calls for Toshiba, Rotzler, Bull Machine this week.',
    breakdown: [
      { id: 'D5.01', name: 'On-Time Delivery Collapse', contribution: '₹247L', pct: 60, label: '170 overdue lines · IATF penalty active', sev: 'r' },
      { id: 'D5.08', name: 'Bonfiglioli Concentration Risk', contribution: '₹843L', pct: 28, label: '70.6% of total order book in one customer', sev: 'r' },
      { id: 'D5.09', name: 'Customer Delivery Backlog', contribution: '₹95L', pct: 12, label: 'Oldest overdue: 535 days', sev: 'a' },
    ],
  },
  func_inventory: {
    label: 'Inventory', color: 'a', value: '₹28L', delta: '↑ ₹6L', stat: '2 alerts · ₹28L',
    summaryNote: 'Excess raw material and stalled WIP locking capital.',
    topAction: 'SMED audit on VTL-06/HMC-02 to release ₹38L trapped WIP this weekend.',
    breakdown: [
      { id: 'I4.19', name: 'Excess Raw Material Inventory', contribution: '₹6L', pct: 55, label: 'Excess stock above safety level', sev: 'a' },
      { id: 'P3.01', name: 'WIP Capital Locked', contribution: '₹38L', pct: 45, label: 'Stalled WIP on floor — recovering <10%/period', sev: 'r' },
    ],
  },
  func_quality: {
    label: 'Quality', color: 'g', value: 'No data', delta: '—', stat: 'No data yet',
    summaryNote: 'Quality module active but no signal data recorded yet.',
    topAction: 'Configure quality signal thresholds and connect to production data sources.',
    breakdown: [],
  },
  func_maintenance: {
    label: 'Maintenance', color: 'r', value: '20 PM due', delta: '↑ 5', stat: '20 PM due',
    summaryNote: '3 machines operating without warranty since December 2025.',
    topAction: 'Contact OEM for VTL-14, VTL-15, HMC-02 AMC renewal this week.',
    breakdown: [
      { id: 'M7.19', name: 'Warranty Lapsed — 3 Machines', contribution: 'Full repair cost', pct: 55, label: 'VTL-14, VTL-15, HMC-02 unprotected 99–103 days', sev: 'r' },
      { id: 'M7.09', name: 'VTL06 Highest Downtime', contribution: '₹8L', pct: 30, label: '14,793 min downtime · PM overdue', sev: 'a' },
      { id: 'P3.01', name: 'Fleet Efficiency Impact', contribution: '4,042 hrs', pct: 15, label: 'Non-productive time from maintenance gaps', sev: 'a' },
    ],
  },
};

const colorMap = {
  r: { accent: 'var(--critical)', bg: 'var(--critical-bg)', bd: 'var(--critical-bd)' },
  a: { accent: 'var(--warn)', bg: 'var(--warn-bg)', bd: 'var(--warn-bd)' },
  g: { accent: 'var(--normal)', bg: 'var(--normal-bg)', bd: 'var(--normal-bd)' },
};

const TILES = [
  { id: 'func_production', cls: 'red' },
  { id: 'func_supply', cls: 'red' },
  { id: 'func_vendor', cls: 'amber' },
  { id: 'func_demand', cls: 'red' },
  { id: 'func_inventory', cls: 'amber' },
  { id: 'func_quality', cls: 'green' },
  { id: 'func_maintenance', cls: 'red' },
];

export default function CrossFunctionHealth({ openFuncCard, showToast }) {
  const [hmapOpen, setHmapOpen] = useState(false);

  return (
    <div className="hmap-section">
      <div className="rc-toggle-hdr" onClick={() => { setHmapOpen(!hmapOpen); setActiveFunc(null); }}>
        <div className="rc-toggle-left">
          <span className="rc-title">Cross-Function Health</span>
        </div>
        <span className={`rc-arrow ${hmapOpen ? 'open' : ''}`}>▼</span>
      </div>

      <div className={`rc-collapsible ${hmapOpen ? 'open' : ''}`}>
        <div className="hmap-compact">
          {TILES.map(t => {
            const d = FUNC_DATA[t.id];
            return (
              <div key={t.id} className={`hmc ${t.cls}`} onClick={() => openFuncCard(t.id)}>
                <span className="hmc-name">{d.label}</span>
                <span className="hmc-stat">{d.stat}</span>
              </div>
            );
          })}
          <div className="hmc locked" onClick={() => showToast('Planning — Phase 2')}>
            <span className="hmc-name">Planning</span><span className="hmc-stat">Phase 2</span><span className="hmc-lock">🔒</span>
          </div>
          <div className="hmc locked" onClick={() => showToast('Mktg & Sales — Phase 2')}>
            <span className="hmc-name">Mktg & Sales</span><span className="hmc-stat">Phase 2</span><span className="hmc-lock">🔒</span>
          </div>
        </div>
      </div>
    </div>
  );
}
