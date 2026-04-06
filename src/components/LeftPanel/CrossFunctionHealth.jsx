import React, { useState } from 'react';

const DEFAULT_TILES = [
  { panel: 'func_production', name: 'Production', statLine: '6 alerts · ₹424L', sev: 'red' },
  { panel: 'func_supply', name: 'Supply', statLine: '9 alerts · ₹180L', sev: 'red' },
  { panel: 'func_vendor', name: 'Vendor', statLine: '3 alerts · ₹42L', sev: 'amber' },
  { panel: 'func_demand', name: 'Demand', statLine: '58% OTD', sev: 'red' },
  { panel: 'func_inventory', name: 'Inventory', statLine: '2 alerts · ₹28L', sev: 'amber' },
  { panel: 'func_quality', name: 'Quality', statLine: 'No data yet', sev: 'green' },
  { panel: 'func_maintenance', name: 'Maintenance', statLine: '20 PM due', sev: 'amber' },
];

function sevClass(sev) {
  const s = String(sev || '').toLowerCase();
  if (s === 'r' || s === 'red') return 'red';
  if (s === 'a' || s === 'amber' || s === 'warn') return 'amber';
  if (s === 'g' || s === 'green' || s === 'nd') return 'green';
  return 'amber';
}

export default function CrossFunctionHealth({ openPanel, showToast, healthTiles }) {
  const [hmapOpen, setHmapOpen] = useState(false);
  const fromApi = Array.isArray(healthTiles) && healthTiles.length > 0;
  const tiles = fromApi ? healthTiles : DEFAULT_TILES;

  return (
    <div className="hmap-section">
      <div className="rc-toggle-hdr" onClick={() => setHmapOpen(!hmapOpen)}>
        <div className="rc-toggle-left">
          <span className="rc-title">Cross-Function Health</span>
        </div>
        <span className={`rc-arrow ${hmapOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`rc-collapsible ${hmapOpen ? 'open' : ''}`}>
        <div className="hmap-compact">
          {tiles.map((t) => (
            <div
              key={t.panel}
              className={`hmc ${sevClass(t.sev)}`}
              onClick={() => openPanel(t.panel)}
            >
              <span className="hmc-name">{t.name}</span>
              <span className="hmc-stat">{t.statLine || '—'}</span>
            </div>
          ))}
          {!fromApi ? (
            <>
              <div className="hmc locked" onClick={() => showToast('Planning — Phase 2')}>
                <span className="hmc-name">Planning</span>
                <span className="hmc-stat">Phase 2</span>
                <span className="hmc-lock">🔒</span>
              </div>
              <div className="hmc locked" onClick={() => showToast('Mktg & Sales — Phase 2')}>
                <span className="hmc-name">Mktg & Sales</span>
                <span className="hmc-stat">Phase 2</span>
                <span className="hmc-lock">🔒</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
