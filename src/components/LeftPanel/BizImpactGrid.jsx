import React from 'react';

export default function BizImpactGrid({ openBrief, SIGNALS, openPanel, openBizCard, bizImpactCards }) {
  const cards = bizImpactCards || [];
  return (
    <div className="lp-biz-grid">
      <div className="lp-biz-header">
        <span className="lp-biz-title"><span className="biz-dot r"></span>Business Impact</span>
        <div className="lp-brief-btn" onClick={openBrief}>Brief</div>
      </div>
      <div className="lp-biz-cards">
        {cards.length === 0 ? (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              fontFamily: 'var(--f-body)',
              fontSize: '13px',
              color: 'var(--ink-4)',
              gridColumn: '1 / -1',
            }}
          >
            —
          </div>
        ) : null}
        {cards.map((card) => {
          const hasDelta =
            card.delta != null &&
            String(card.delta).trim() !== '' &&
            String(card.delta).trim() !== '—';
          const dir = card.deltaDir === 'down' ? 'down' : card.deltaDir === 'flat' ? 'flat' : 'up';
          const arrow = !hasDelta ? '' : dir === 'down' ? '↓' : dir === 'up' ? '↑' : '';
          const deltaText = hasDelta ? `${arrow} ${String(card.delta).trim()}`.trim() : '—';
          const deltaCls =
            !hasDelta || dir === 'flat' ? 'lp-bd-n' : 'lp-bd-r';
          const n =
            card.signalCount != null && Number.isFinite(Number(card.signalCount))
              ? Math.max(0, Math.floor(Number(card.signalCount)))
              : Array.isArray(card.breakdown)
                ? card.breakdown.length
                : 0;
          const desc = card.desc && String(card.desc).trim() ? String(card.desc).trim() : '—';
          return (
            <div
              key={card.id}
              className="lp-biz-card lp-bc-white"
              onClick={() => openBizCard(card.id)}
            >
              <div className="lp-bc-label">{card.label}</div>
              <div className={`lp-bc-val ${card.color}`}>{card.value}</div>
              <div className={`lp-bc-delta ${deltaCls}`}>{deltaText}</div>
              <div
                className="lp-bc-desc"
                style={{
                  fontSize: '9.5px',
                  color: 'var(--ink-4)',
                  marginTop: '6px',
                  lineHeight: 1.2,
                  fontWeight: 500,
                }}
              >
                {desc}
              </div>
              <div className="lp-bc-sig-count">
                {n} {n === 1 ? 'signal' : 'signals'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
