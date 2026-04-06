import React from 'react';
import { BIZ_IMPACT_CARDS } from '../../data/mockData';

export default function BizImpactGrid({ openBrief, SIGNALS, openPanel, openBizCard }) {
  return (
    <div className="lp-biz-grid">
      <div className="lp-biz-header">
        <span className="lp-biz-title"><span className="biz-dot r"></span>Business Impact</span>
        <div className="lp-brief-btn" onClick={openBrief}>Brief</div>
      </div>
      <div className="lp-biz-cards">
        {BIZ_IMPACT_CARDS.map(card => (
          <div
            key={card.id}
            className="lp-biz-card lp-bc-white"
            onClick={() => openBizCard(card.id)}
          >
            <div className="lp-bc-label">{card.label}</div>
            <div className={`lp-bc-val ${card.color}`}>{card.value}</div>
            <div className="lp-bc-delta lp-bd-r">{card.delta}</div>
            <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-4)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>
              {card.desc}
            </div>
            <div className="lp-bc-sig-count">
              {card.breakdown.length} signals
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
