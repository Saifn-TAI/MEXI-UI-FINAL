import React from 'react';

export default function PrioritySignalStack({ roleData, SIGNALS, openPanel, openAllSignalsPanel }) {
  const sigOrder = roleData?.sigOrder || [];
  const allSigs = sigOrder.filter(id => SIGNALS[id] && !id.startsWith('func_'));

  // Count by severity across full signal set
  const critSigs = allSigs.filter(id => SIGNALS[id]?.sev === 'r');
  const warnSigs = allSigs.filter(id => SIGNALS[id]?.sev === 'a');
  const normSigs = allSigs.filter(id => SIGNALS[id]?.sev === 'g');

  // Show top 5 critical only in the sidebar
  const topCritical = critSigs.slice(0, 5);

  return (
    <>
      <div className="stack-hdr">
        <span className="stack-title">Priority Signals</span>
        <div className="stack-hdr-right">
          <span className="stack-count">
            <span style={{ color: 'var(--critical)', fontWeight: 700 }}>
              {topCritical.length}/{critSigs.length} critical
            </span>
            <span style={{ color: 'var(--ink-4)', margin: '0 4px' }}>·</span>
            <span style={{ color: 'var(--warn)', fontWeight: 600 }}>
              {warnSigs.length} warning
            </span>
          </span>
          <div className="stack-view-all" onClick={openAllSignalsPanel}><span>Active Signals →</span></div>
        </div>
      </div>
      <div className="signal-stack">
        {topCritical.map((id, index) => {
          const s = SIGNALS[id];
          if (!s) return null;
          const rank = index + 1;

          return (
            <div key={id} className={`psc rank-${rank}`} data-sig={id}>
              <div className="psc-top-bar"></div>
              <div className="psc-body">
                <div className="psc-row1">
                  <div className="psc-rank-badge">
                    <span className="psc-rank-num">#{rank}</span>
                    <span className="psc-sev r"><span className="psc-sev-dot"></span>Critical</span>
                  </div>
                  <span className="psc-impact">{s.impact}</span>
                </div>
                <div className="psc-name">{s.name}</div>
                <div className="psc-proc">{s.proc}</div>
                <div className="psc-actions">
                  <div className="psc-btn why" onClick={() => openPanel(id, 'what')}>What</div>
                  <div className="psc-btn act" onClick={() => openPanel(id, 'ask')}>Ask</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
