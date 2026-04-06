import React from 'react';

export default function IPWhyTab({ sig }) {
  const w = sig?.why && typeof sig.why === 'object' ? sig.why : { cause: '—', impact: '—', timeline: '—', confidence: 'low', rec: '—' };
  const confCls = w.confidence === 'high' ? 'high' : w.confidence === 'med' ? 'med' : 'low';
  const confLabel = w.confidence === 'high' ? 'High — data confirmed' : w.confidence === 'med' ? 'Medium — partial data' : 'Low — data gaps present';

  return (
    <>
      <div className="ip-section-lbl">Structured Explanation</div>
      <div className="explainer-card">
        <div className="expl-row"><div className="expl-label">Cause</div><div className="expl-val">{w.cause}</div></div>
        <div className="expl-row"><div className="expl-label">Impact</div><div className="expl-val"><strong>{w.impact}</strong></div></div>
        <div className="expl-row"><div className="expl-label">Timeline</div><div className="expl-val">{w.timeline}</div></div>
        <div className="expl-row"><div className="expl-label">Confidence</div><div className="expl-val"><span className={`conf-pill ${confCls}`}>{confLabel}</span></div></div>
        <div className="expl-row"><div className="expl-label">Recommend</div><div className="expl-val"><strong>{w.rec}</strong></div></div>
      </div>
      
      <div className="ip-section-lbl">Root Cause Hypotheses</div>
      {Array.isArray(sig.hyps) && sig.hyps.length ? (
        sig.hyps.map((h, i) => (
          <div key={i} className={`hyp-item ${h.c}`}>
            <div className="hyp-rank">{h.r}</div>
            <div><div className="hyp-title">{h.t}</div><div className="hyp-ev">{h.e}</div></div>
          </div>
        ))
      ) : (
        <div className="hyp-item h1" style={{ opacity: 0.9 }}>
          <div className="hyp-rank">—</div>
          <div><div className="hyp-title">—</div><div className="hyp-ev">—</div></div>
        </div>
      )}
    </>
  );
}
