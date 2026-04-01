import React, { useState } from 'react';
import { BIZ_IMPACT_CARDS } from '../../data/mockData';

export default function BizImpactDrawer({ cardId, SIGNALS, onClose, openPanel }) {
  const [activeSignal, setActiveSignal] = useState(null);
  const card = BIZ_IMPACT_CARDS.find(c => c.id === cardId);
  if (!card) return null;

  const colorMap = {
    r: { accent: 'var(--critical)', bg: 'var(--critical-bg)', bd: 'var(--critical-bd)', label: 'Critical' },
    a: { accent: 'var(--warn)', bg: 'var(--warn-bg)', bd: 'var(--warn-bd)', label: 'Warning' },
    g: { accent: 'var(--normal)', bg: 'var(--normal-bg)', bd: 'var(--normal-bd)', label: 'Normal' },
  };

  const headerColor = colorMap[card.color] || colorMap['r'];

  return (
    <div className="bid-overlay" onClick={onClose}>
      <div className="bid-drawer" onClick={e => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className="bid-header" style={{ borderTop: `3px solid ${headerColor.accent}` }}>
          <div className="bid-header-top">
            <div>
              <div className="bid-eyebrow">Business Impact · Contributing Signals</div>
              <div className="bid-title">{card.label}</div>
              <div className="bid-total-note">{card.totalNote}</div>
            </div>
            <button className="bid-close" onClick={onClose}>✕</button>
          </div>

          {/* KPI strip */}
          <div className="bid-kpi-strip">
            <div className="bid-kpi-main">
              <span className="bid-kpi-val" style={{ color: headerColor.accent }}>{card.value}</span>
              <span className="bid-kpi-delta" style={{ color: headerColor.accent, background: headerColor.bg, border: `1px solid ${headerColor.bd}` }}>
                {card.delta}
              </span>
            </div>
            <div className="bid-key-metrics">
              {card.keyMetrics.map((m, i) => (
                <div key={i} className="bid-metric-chip">
                  <span className="bid-metric-l">{m.l}</span>
                  <span className={`bid-metric-v ${m.c}`}>{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="bid-body">

          {/* Contributing signals breakdown */}
          <div className="bid-section-label">Signal Breakdown</div>
          <div className="bid-signal-list">
            {card.breakdown.map((b, idx) => {
              const sig = SIGNALS[b.sigId];
              const sc = colorMap[b.sev] || colorMap['a'];
              const isActive = activeSignal === b.sigId;
              return (
                <div
                  key={b.sigId}
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
              );
            })}
          </div>

          {/* Expanded signal quick-view */}
          {activeSignal && SIGNALS[activeSignal] && (() => {
            const s = SIGNALS[activeSignal];
            const sc = colorMap[s.sev] || colorMap['a'];
            return (
              <div className="bid-sig-expand" style={{ borderColor: sc.bd, background: sc.bg }}>
                <div className="bid-se-header">
                  <div>
                    <div className="bid-se-id" style={{ color: sc.accent }}>SIGNAL INTELLIGENCE</div>
                    <div className="bid-se-name">{s.name}</div>
                  </div>
                  <button
                    className="bid-se-full-btn"
                    style={{ background: sc.accent }}
                    onClick={() => { onClose(); openPanel(activeSignal, 'what'); }}
                  >
                    Full Signal →
                  </button>
                </div>
                <div className="bid-se-why">{s.why?.cause}</div>
                <div className="bid-se-meas">
                  {(s.what?.meas || []).map((m, i) => (
                    <div key={i} className="bid-se-meas-chip">
                      <span className="bid-sem-l">{m.l}</span>
                      <span className={`bid-sem-v ${m.c}`}>{m.v}</span>
                    </div>
                  ))}
                </div>
                {s.acts?.[0] && (
                  <div className="bid-se-action">
                    <span className="bid-se-action-label">Top Action:</span> {s.acts[0].t}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Summary note */}
          {card.summaryNote && (
            <div className="bid-summary-note">
              <span className="bid-note-icon">ℹ</span>
              {card.summaryNote}
            </div>
          )}

          {/* Top recommended action */}
          <div className="bid-top-action">
            <div className="bid-ta-label">Recommended First Action</div>
            <div className="bid-ta-text">{card.topAction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
