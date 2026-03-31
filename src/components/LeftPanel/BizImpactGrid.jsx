import React from 'react';

export default function BizImpactGrid({ openBrief, openPanel }) {
  return (
    <div className="lp-biz-grid">
      <div className="lp-biz-header">
        <span className="lp-biz-title"><span className="biz-dot r"></span>Business Impact</span>
        <div className="lp-brief-btn" onClick={openBrief}>Brief</div>
      </div>
      <div className="lp-biz-cards">
        <div className="lp-biz-card lp-bc-white" onClick={() => openPanel('D5.01')}>
          <div className="lp-bc-label">Revenue at Risk</div>
          <div className="lp-bc-val r">₹924L</div>
          <div className="lp-bc-delta lp-bd-r">↑ ₹82L</div>
          <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-4)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>170 orders delayed</div>
        </div>
        <div className="lp-biz-card lp-bc-white" onClick={() => openPanel('P3.01')}>
          <div className="lp-bc-label">Capital Locked</div>
          <div className="lp-bc-val a">₹77L</div>
          <div className="lp-bc-delta lp-bd-r">↑ ₹12L</div>
          <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-4)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>Excess raw material</div>
        </div>
        <div className="lp-biz-card lp-bc-white" onClick={() => openPanel('P3.03')}>
          <div className="lp-bc-label">Margin Impact</div>
          <div className="lp-bc-val p">1.4%</div>
          <div className="lp-bc-delta lp-bd-r">↑ 0.3%</div>
          <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-4)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>Idle machine overhead</div>
        </div>
        <div className="lp-biz-card lp-bc-white" onClick={() => openPanel('D5.01')}>
          <div className="lp-bc-label">On-Time Delivery</div>
          <div className="lp-bc-val r">58.3%</div>
          <div className="lp-bc-delta lp-bd-r">↓ 4.1%</div>
          <div className="lp-bc-desc" style={{ fontSize: '9.5px', color: 'var(--ink-4)', marginTop: '6px', lineHeight: 1.2, fontWeight: 500 }}>Fleet-wide average</div>
        </div>
      </div>
    </div>
  );
}
