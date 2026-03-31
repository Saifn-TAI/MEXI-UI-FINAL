import React from 'react';

export default function IPActionsTab({ sig, currentPanelSig, showToast, followFromChat, setActiveTab }) {
  return (
    <>
      <div className="ip-section-lbl">Executive Actions</div>
      {sig.acts.map((a, i) => (
        <div key={i} className="action-item-ip">
          <div className="action-num-ip">{i+1}</div>
          <div style={{flex:1}}>
            <div className="action-text-ip">{a.t}</div>
            <div className="action-src-ip">{a.s}</div>
            <div className="action-btns-ip">
              <div className="aib assign" onClick={() => showToast('Assign — coming in Phase 2')}>Assign ↗</div>
              <div className="aib agent" onClick={() => showToast('Agent triggered — re-run scheduled')}>Run Agent</div>
            </div>
          </div>
        </div>
      ))}
      <div style={{fontFamily:'var(--f-mono)', fontSize:'8.5px', color:'var(--ink-4)', textAlign:'center', marginTop:'8px', lineHeight:1.5}}>
        Every action is grounded in Veejei source data · No generic recommendations
      </div>
      <div style={{marginTop:'10px', display:'flex', gap:'6px', paddingTop:'10px', borderTop:'1px solid var(--bd)'}}>
        <div onClick={() => followFromChat(currentPanelSig)} style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'7px 10px', borderRadius:'var(--r-pill)', background:'var(--canvas)', border:'1.5px solid var(--bd-2)', fontFamily:'var(--f-body)', fontSize:'10px', fontWeight:600, color:'var(--ink-3)', cursor:'pointer', transition:'all .12s'}}>
          + Follow this signal
        </div>
        <div onClick={() => setActiveTab('ask')} style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'7px 10px', borderRadius:'var(--r-pill)', background:'var(--accent-5)', border:'1.5px solid var(--primary-bd)', fontFamily:'var(--f-body)', fontSize:'10px', fontWeight:600, color:'var(--primary-dark)', cursor:'pointer', transition:'all .12s'}}>
          Ask MExI →
        </div>
      </div>
    </>
  );
}
