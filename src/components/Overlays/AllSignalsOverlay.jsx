import React, { useState } from 'react';

export function AllSignalsOverlay({ isOpen, onClose, roleData, SIGNALS, openPanel }) {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const allSigs = (roleData?.sigOrder || []).filter(id => SIGNALS[id] && !id.startsWith('func_'));
  const critCount = allSigs.filter(id => SIGNALS[id]?.sev === 'r').length;

  const filteredSigs = filter === 'all' ? allSigs : allSigs.filter(id => SIGNALS[id] && SIGNALS[id].sev === filter);

  return (
    <div className="all-signals-overlay open" onClick={onClose}>
      <div className="asp-card" onClick={e => e.stopPropagation()}>
        <div className="asp-hdr">
          <div className="asp-hdr-left">
            <div className="asp-title">All Priority Signals</div>
            <div className="asp-subtitle">{allSigs.length} signals · {critCount} critical</div>
          </div>
          <div className="asp-close" onClick={onClose}>✕</div>
        </div>
        <div className="asp-filters">
          <div className={`asp-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</div>
          <div className={`asp-filter ${filter === 'r' ? 'active' : ''}`} onClick={() => setFilter('r')}>Critical</div>
          <div className={`asp-filter ${filter === 'a' ? 'active' : ''}`} onClick={() => setFilter('a')}>Warning</div>
        </div>
        <div className="asp-body" id="asp-list">
          {filteredSigs.length > 0 ? filteredSigs.map((id, idx) => {
            const s = SIGNALS[id];
            const sevColor = s.sev === 'r' ? 'var(--critical)' : 'var(--warn)';
            const sevLabel = s.sev === 'r' ? 'Critical' : 'Warning';
            // Global rank is index in allSigs+1
            const globalRank = allSigs.indexOf(id) + 1;

            return (
              <div key={id} className="asp-row" onClick={() => { onClose(); openPanel(id); }}>
                <div className="asp-rank">#{globalRank}</div>
                <div className="asp-dot" style={{ background: sevColor }}></div>
                <div className="asp-info">
                  <div className="asp-name">{s.name}</div>
                  <div className="asp-proc">{s.proc}</div>
                </div>
                <div className="asp-sev" style={{ color: sevColor }}>{sevLabel}</div>
                <div className="asp-impact">{s.impact}</div>
                <div className="asp-arrow">↗</div>
              </div>
            );
          }) : (
            <div style={{ padding: '28px', textAlign: 'center', fontFamily: 'var(--f-body)', color: 'var(--ink-4)', fontSize: '13px' }}>No signals in this category</div>
          )}
        </div>
      </div>
    </div>
  );
}
