import React, { useState, useRef } from 'react';
import { RC_ITEMS } from '../data/mockData';

export default function LeftPanel({ leftPanelOpen, roleData, SIGNALS, openPanel, showToast, openBrief, openAllSignalsPanel, watchlist, unfollowEntity }) {
  const [rcOpen, setRcOpen] = useState(false);
  const [wlOpen, setWlOpen] = useState(false);
  const [hmapOpen, setHmapOpen] = useState(false);
  const wlRef = useRef(null);

  const toggleWatchlist = () => {
    const opening = !wlOpen;
    setWlOpen(opening);
    if (opening) {
      setTimeout(() => wlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  // Derive sigOrder specifically for the left panel priority stack
  const sigOrder = roleData?.sigOrder || [];
  const allSigs = sigOrder.filter(id => SIGNALS[id] && !id.startsWith('func_'));
  const topSigs = allSigs.slice(0, 5);
  const critCount = allSigs.filter(id => SIGNALS[id]?.sev === 'r').length;

  return (
    <aside className="left-panel" style={{ transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)', pointerEvents: leftPanelOpen ? 'auto' : 'none' }}>

      {/* Biz Impact Grid */}
      <div className="lp-biz-grid">
        <div className="lp-biz-header">
          <span className="lp-biz-title"><span className="biz-dot r"></span>Business Impact</span>
          <div className="lp-brief-btn" onClick={openBrief}>Brief</div>
        </div>
        <div className="lp-biz-cards">
          <div className="lp-biz-card lp-bc-r" onClick={() => openPanel('D5.01')}>
            <div className="lp-bc-label">Revenue at Risk</div>
            <div className="lp-bc-val r">₹924L</div>
            <div className="lp-bc-delta lp-bd-r">↑ ₹82L</div>
            <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-3)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>170 orders delayed</div>
          </div>
          <div className="lp-biz-card lp-bc-r" onClick={() => openPanel('P3.01')}>
            <div className="lp-bc-label">Capital Locked</div>
            <div className="lp-bc-val r">₹77L</div>
            <div className="lp-bc-delta lp-bd-r">↑ ₹12L</div>
            <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-3)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>Excess raw material</div>
          </div>
          <div className="lp-biz-card lp-bc-r" onClick={() => openPanel('P3.03')}>
            <div className="lp-bc-label">Margin Impact</div>
            <div className="lp-bc-val r">1.4%</div>
            <div className="lp-bc-delta lp-bd-r">↑ 0.3%</div>
            <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-3)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>Idle machine overhead</div>
          </div>
          <div className="lp-biz-card lp-bc-r" onClick={() => openPanel('D5.01')}>
            <div className="lp-bc-label">On-Time Delivery</div>
            <div className="lp-bc-val r">58.3%</div>
            <div className="lp-bc-delta lp-bd-r">↓ 4.1%</div>
            <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-3)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>Fleet-wide average</div>
          </div>
        </div>
      </div>

      {/* Priority Signal Stack */}
      <div className="stack-hdr">
        <span className="stack-title">Priority Signals</span>
        <div className="stack-hdr-right">
          <span className="stack-count"><span style={{ color: 'var(--critical)', fontWeight: 700 }}>critical: {critCount}/{allSigs.length} total</span></span>
          <div className="stack-view-all" onClick={openAllSignalsPanel}><span>View All →</span></div>
        </div>
      </div>
      <div className="signal-stack">
        {topSigs.map((id, index) => {
          const s = SIGNALS[id];
          if (!s) return null;
          const rank = index + 1;
          const sevCls = s.sev === 'r' ? 'r' : 'a';
          const sevLabel = s.sev === 'r' ? 'Critical' : 'Warning';

          return (
            <div key={id} className={`psc rank-${rank}`} data-sig={id}>
              <div className="psc-top-bar"></div>
              <div className="psc-body">
                <div className="psc-row1">
                  <div className="psc-rank-badge">
                    <span className="psc-rank-num">#{rank}</span>
                    <span className={`psc-sev ${sevCls}`}><span className="psc-sev-dot"></span>{sevLabel}</span>
                  </div>
                  <span className="psc-impact">{s.impact}</span>
                </div>
                <div className="psc-name">{s.name}</div>
                <div className="psc-proc">{s.proc}</div>
                <div className="psc-actions">
                  <div className="psc-btn why" onClick={() => openPanel(id, 'why')}>Why?</div>
                  <div className="psc-btn act" onClick={() => openPanel(id, 'actions')}>Actions</div>
                  <div className="psc-btn assign" onClick={() => openPanel(id, 'ask')}>Ask</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Cross-Function Health */}
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

      {/* Risks Changed */}
      <div className="risks-changed">
        <div className="rc-toggle-hdr" onClick={() => setRcOpen(!rcOpen)}>
          <div className="rc-toggle-left">
            <span className="rc-title">Risks Changed</span>
            <span className="rc-badge">{RC_ITEMS.length} updates</span>
          </div>
          <span className={`rc-arrow ${rcOpen ? 'open' : ''}`}>▼</span>
        </div>
        <div className={`rc-collapsible ${rcOpen ? 'open' : ''}`}>
          <div>
            {RC_ITEMS.map((item, i) => (
              <div key={i} className="rc-item">
                <div className="rc-icon">{item.icon}</div>
                <div className="rc-body">
                  <div className="rc-text">{item.text}</div>
                  <div className={`rc-delta ${item.type}`}>{item.delta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Watchlist */}
      <div className="wl-section" ref={wlRef} style={{ marginTop: '12px', paddingBottom: '24px' }}>
        <div className="rc-toggle-hdr" onClick={toggleWatchlist}>
          <div className="rc-toggle-left">
            <span className="rc-title">Watchlist</span>
            <span className="rc-badge">{watchlist.length} items</span>
          </div>
          <span className={`rc-arrow ${wlOpen ? 'open' : ''}`}>▼</span>
        </div>

        <div className={`rc-collapsible ${wlOpen ? 'open' : ''}`}>
          <div style={{ paddingTop: '8px' }}>
            <div className="wl-items">
              {watchlist.map((w, i) => (
                <div key={i} className="wl-item" onClick={() => openPanel(w.sig)}>
                  <div className="wl-dot" style={{ background: w.status === 'r' ? 'var(--critical)' : w.status === 'a' ? 'var(--warn)' : 'var(--normal)' }}></div>
                  <span className="wl-name">{w.id}</span>
                  <span className="wl-type">{w.type}</span>
                  <span className={`wl-status ${w.status}`}>{w.statusLabel}</span>
                  <span className="wl-unfollow" onClick={(e) => { e.stopPropagation(); unfollowEntity(i); }} title="Unfollow">✕</span>
                </div>
              ))}
            </div>
            <div className="wl-add-btn" onClick={() => showToast('Search entities to follow — coming in next build')}>+ Follow entity</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
