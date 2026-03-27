import React from 'react';

export default function IPImpactTab({ sig }) {
  const f = sig.fvla;
  return (
    <>
      <div className="ip-section-lbl">FVLA — Financial Impact</div>
      <div className="fvla-card-ip">
        <div className="fvla-row-ip">
          <div className="fvla-item-ip">
            <div><div className="fvla-lbl-ip">Revenue at Risk</div><div className="fvla-val-ip">{f.rev}</div>{f.revS && <div className="fvla-sub-ip">{f.revS}</div>}</div>
          </div>
          <div className="fvla-item-ip">
            <div><div className="fvla-lbl-ip">Capital Locked</div><div className="fvla-val-ip" style={{fontSize:'16px'}}>{f.cap}</div>{f.capS && <div className="fvla-sub-ip">{f.capS}</div>}</div>
          </div>
          <div className="fvla-item-ip">
            <div><div className="fvla-lbl-ip">Margin Impact</div><div className="fvla-val-ip" style={{fontSize:'16px'}}>{f.mar}</div>{f.marS && <div className="fvla-sub-ip">{f.marS}</div>}</div>
          </div>
        </div>
      </div>
      <div className="ip-section-lbl" style={{marginTop:'12px'}}>Source Traceability</div>
      <div style={{padding:'9px 12px', background:'var(--canvas)', border:'1px solid var(--bd)', borderRadius:'var(--r-sm)', fontFamily:'var(--f-mono)', fontSize:'9px', color:'var(--ink-4)', lineHeight:1.7}}>
        All figures computed deterministically by FVLA engine from Veejei source data.<br/>
        Independently verifiable in SAP B1 — no AI estimation.
      </div>
    </>
  );
}
