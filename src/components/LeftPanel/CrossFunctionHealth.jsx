import React, { useState } from 'react';

export default function CrossFunctionHealth({ openPanel, showToast }) {
  const [hmapOpen, setHmapOpen] = useState(false);

  return (
    <div className="hmap-section" style={{ marginTop: '16px' }}>
      <div className="rc-toggle-hdr" onClick={() => setHmapOpen(!hmapOpen)}>
        <div className="rc-toggle-left">
          <span className="rc-title">Cross-Function Health</span>
        </div>
        <span className={`rc-arrow ${hmapOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`rc-collapsible ${hmapOpen ? 'open' : ''}`}>
        <div className="hmap-compact">
          <div className="hmc red" onClick={() => openPanel('func_production')}><span className="hmc-name">Production</span><span className="hmc-stat">6 alerts · ₹424L</span></div>
          <div className="hmc red" onClick={() => openPanel('func_supply')}><span className="hmc-name">Supply</span><span className="hmc-stat">9 alerts · ₹180L</span></div>
          <div className="hmc amber" onClick={() => openPanel('func_vendor')}><span className="hmc-name">Vendor</span><span className="hmc-stat">3 alerts · ₹42L</span></div>
          <div className="hmc red" onClick={() => openPanel('func_demand')}><span className="hmc-name">Demand</span><span className="hmc-stat">58% OTD</span></div>
          <div className="hmc amber" onClick={() => openPanel('func_inventory')}><span className="hmc-name">Inventory</span><span className="hmc-stat">2 alerts · ₹28L</span></div>
          <div className="hmc green" onClick={() => openPanel('func_quality')}><span className="hmc-name">Quality</span><span className="hmc-stat">No data yet</span></div>
          <div className="hmc amber" onClick={() => openPanel('func_maintenance')}><span className="hmc-name">Maintenance</span><span className="hmc-stat">20 PM due</span></div>
          <div className="hmc locked" onClick={() => showToast('Planning — Phase 2')}><span className="hmc-name">Planning</span><span className="hmc-stat">Phase 2</span><span className="hmc-lock">🔒</span></div>
          <div className="hmc locked" onClick={() => showToast('Mktg & Sales — Phase 2')}><span className="hmc-name">Mktg & Sales</span><span className="hmc-stat">Phase 2</span><span className="hmc-lock">🔒</span></div>
        </div>
      </div>
    </div>
  );
}
