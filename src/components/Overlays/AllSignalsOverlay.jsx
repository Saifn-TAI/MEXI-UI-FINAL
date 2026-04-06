import React, { useState } from 'react';

export function AllSignalsOverlay({
  isOpen,
  onClose,
  roleData,
  sigOrder: sigOrderProp,
  SIGNALS,
  openPanel,
  onRunSignal,
  onEvaluateAll,
}) {
  const [filter, setFilter] = useState('all');
  const [runningId, setRunningId] = useState(null);
  const [evaluatingAll, setEvaluatingAll] = useState(false);

  if (!isOpen) return null;

  const runOne = async (e, id) => {
    e.stopPropagation();
    if (!onRunSignal || runningId) return;
    setRunningId(id);
    try {
      await onRunSignal(id);
    } finally {
      setRunningId(null);
    }
  };

  const runAll = async () => {
    if (!onEvaluateAll || evaluatingAll) return;
    setEvaluatingAll(true);
    try {
      await onEvaluateAll();
    } finally {
      setEvaluatingAll(false);
    }
  };

  const primary =
    sigOrderProp && sigOrderProp.length ? sigOrderProp : roleData?.sigOrder || [];
  const order =
    primary && primary.length
      ? primary
      : Object.keys(SIGNALS || {}).filter((id) => !id.startsWith('func_'));
  const allSigs = order.filter((id) => SIGNALS[id] && !id.startsWith('func_'));
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="asp-title">All Signals</div>
              {onEvaluateAll ? (
                <button
                  type="button"
                  className="asp-eval-all"
                  disabled={evaluatingAll}
                  onClick={(e) => {
                    e.stopPropagation();
                    runAll();
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--primary-bd, #c4d4e8)',
                    background: 'var(--accent-5, #f0f4fa)',
                    color: 'var(--primary-dark, #1a365d)',
                    cursor: evaluatingAll ? 'wait' : 'pointer',
                    opacity: evaluatingAll ? 0.7 : 1,
                    fontFamily: 'var(--f-body, inherit)',
                  }}
                >
                  {evaluatingAll ? 'Evaluating…' : 'Evaluate all'}
                </button>
              ) : null}
            </div>
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
                {onRunSignal ? (
                  <button
                    type="button"
                    className="asp-run-signal"
                    disabled={runningId === id}
                    onClick={(e) => runOne(e, id)}
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--bd, #ddd)',
                      background: runningId === id ? 'var(--ink-5, #eee)' : 'var(--surface, #fff)',
                      color: 'var(--primary, #2563eb)',
                      cursor: runningId === id ? 'wait' : 'pointer',
                      flexShrink: 0,
                      fontFamily: 'var(--f-body, inherit)',
                    }}
                  >
                    {runningId === id ? '…' : 'Run'}
                  </button>
                ) : null}
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
