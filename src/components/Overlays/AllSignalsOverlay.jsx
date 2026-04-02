import React, { useState } from 'react';

export function AllSignalsOverlay({ isOpen, onClose, roleData, SIGNALS, openPanel }) {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const allSigs = (roleData?.sigOrder || []).filter(id => SIGNALS[id] && !id.startsWith('func_'));
  const critCount = allSigs.filter(id => SIGNALS[id]?.sev === 'r').length;
  const warnCount = allSigs.filter(id => SIGNALS[id]?.sev === 'a').length;
  const normCount = allSigs.filter(id => SIGNALS[id]?.sev === 'g').length;

  const filteredSigs = filter === 'all' ? allSigs
    : allSigs.filter(id => SIGNALS[id] && SIGNALS[id].sev === filter);

  const sevLabel = { r: 'Critical', a: 'Warning', g: 'Normal', nd: 'No Data' };
  const sevColor = { r: 'var(--critical)', a: 'var(--warn)', g: 'var(--normal)', nd: 'var(--nodata)' };

  return (
    <div className="all-signals-overlay open" onClick={onClose}>
      <div className="asp-card" onClick={e => e.stopPropagation()}>
        <div className="asp-hdr">
          <div className="asp-hdr-left">
            <div className="asp-title">All Signals</div>
            <div className="asp-subtitle" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
              <span style={{ color: '#FF3B30', fontWeight: 800 }}>{critCount} critical</span>
              <span style={{ color: 'var(--ink-4)', margin: '0 8px' }}>·</span>
              <span style={{ color: '#FF9F0A', fontWeight: 700 }}>{warnCount} warning</span>
              <span style={{ color: 'var(--ink-4)', margin: '0 8px' }}>·</span>
              <span style={{ color: '#30D158', fontWeight: 700 }}>{normCount} normal</span>
            </div>
          </div>
          <div className="asp-close" onClick={onClose}>✕</div>
        </div>
        <div className="asp-filters">
          <div className={`asp-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All <span className="asp-filter-count">{allSigs.length}</span>
          </div>
          <div className={`asp-filter asp-f-crit ${filter === 'r' ? 'active' : ''}`} onClick={() => setFilter('r')}>
            Critical <span className="asp-filter-count">{critCount}</span>
          </div>
          <div className={`asp-filter asp-f-warn ${filter === 'a' ? 'active' : ''}`} onClick={() => setFilter('a')}>
            Warning <span className="asp-filter-count">{warnCount}</span>
          </div>
          <div className={`asp-filter asp-f-norm ${filter === 'g' ? 'active' : ''}`} onClick={() => setFilter('g')}>
            Normal <span className="asp-filter-count">{normCount}</span>
          </div>
        </div>
        <div className="asp-body" id="asp-list">
          {filteredSigs.length > 0 ? filteredSigs.map((id, idx) => {
            const s = SIGNALS[id];
            const color = sevColor[s.sev] || 'var(--nodata)';
            const label = sevLabel[s.sev] || 'Unknown';
            const globalRank = allSigs.indexOf(id) + 1;

            return (
              <div key={id} className="asp-row" onClick={() => { onClose(); openPanel(id); }}>
                <div className="asp-rank">#{globalRank}</div>
                <div className="asp-dot" style={{ background: color }}></div>
                <div className="asp-info">
                  <div className="asp-name">{s.name}</div>
                  <div className="asp-proc">{s.proc}</div>
                </div>
                <div className="asp-sev" style={{ color }}>{label}</div>
                <div className="asp-impact">{s.impact}</div>
                <div className="asp-arrow">↗</div>
              </div>
            );
          }) : (
            <div style={{ padding: '28px', textAlign: 'center', fontFamily: 'var(--f-body)', color: 'var(--ink-4)', fontSize: '13px' }}>
              No signals in this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
