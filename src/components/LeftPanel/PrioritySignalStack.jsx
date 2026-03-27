import React from 'react';

export default function PrioritySignalStack({ roleData, SIGNALS, openPanel, openAllSignalsPanel }) {
  // Derive sigOrder specifically for the left panel priority stack
  const sigOrder = roleData?.sigOrder || [];
  const allSigs = sigOrder.filter(id => SIGNALS[id] && !id.startsWith('func_'));
  const topSigs = allSigs.slice(0, 5);
  const critCount = allSigs.filter(id => SIGNALS[id]?.sev === 'r').length;

  return (
    <>
      <div className="stack-hdr">
        <span className="stack-title">Priority Signals</span>
        <div className="stack-hdr-right">
          <span className="stack-count"><span style={{ color: 'var(--critical)', fontWeight: 700 }}>critical: {critCount}/{allSigs.length} total</span></span>
          <div className="stack-view-all" onClick={openAllSignalsPanel}><span>Active Signals →</span></div>
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
