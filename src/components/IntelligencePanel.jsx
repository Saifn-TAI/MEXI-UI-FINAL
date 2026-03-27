import React, { useState, useEffect } from 'react';

export default function IntelligencePanel({ currentPanelSig, panelMode, activeTab, setActiveTab, SIGNALS, closePanel, togglePanelMode, showToast, followFromChat }) {

  const sig = SIGNALS[currentPanelSig];
  if (!sig || panelMode === 'hidden') return <div className="intel-panel hidden" />;

  const badgeCls = sig.sev === 'r' ? 'r' : sig.sev === 'a' ? 'a' : sig.sev === 'g' ? 'g' : 'nd';
  const badgeLabel = sig.sev === 'r' ? 'T2 — Critical' : sig.sev === 'a' ? 'T1 — Warning' : sig.sev === 'g' ? 'Normal' : 'No Data';

  const formatId = (id) => id.startsWith('func_') ? id.replace('func_', '').toUpperCase() + ' · ' + sig.proc : id + ' · ' + sig.proc;

  const renderWhat = () => {
    const measHtml = sig.what.meas.map((m, i) => (
      <div key={i} className="ip-meas-tile"><div className="ip-meas-lbl">{m.l}</div><div className={`ip-meas-val ${m.c}`}>{m.v}</div></div>
    ));

    const t = sig.what.table;
    const tblHtml = t ? (
      <>
        <div className="ip-section-lbl">Evidence Data</div>
        <table className="ip-ev-table">
          <thead><tr>{t.h.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>
            {t.r.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className={ci === 0 ? 'ip-mono' : ''}>
                    <span className={t.c[ci] ? `ip-val-${t.c[ci]}` : ''}>{cell}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : null;

    return (
      <>
        <div className="ip-section-lbl">Signal Measurement</div>
        <div className="ip-meas-row">{measHtml}</div>
        {tblHtml}
      </>
    );
  };

  const renderWhy = () => {
    const w = sig.why;
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
        
        {sig.hyps && (
          <>
            <div className="ip-section-lbl">Root Cause Hypotheses</div>
            {sig.hyps.map((h, i) => (
              <div key={i} className={`hyp-item ${h.c}`}>
                <div className="hyp-rank">{h.r}</div>
                <div><div className="hyp-title">{h.t}</div><div className="hyp-ev">{h.e}</div></div>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  const renderImpact = () => {
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
  };

  const renderActions = () => {
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
                <div className="aib tracker" onClick={() => showToast(`+ Tracker: [${currentPanelSig}] ${a.t.substring(0,40)}`)}>+ Tracker</div>
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
  };

  const renderAsk = () => {
    const qs = [
      `Why is ${sig.name.toLowerCase()} happening?`,
      `What is the financial impact of ${currentPanelSig}?`,
      `What should I do about ${currentPanelSig} today?`,
    ];
    return (
      <div className="ip-ask-wrap">
        <div className="ip-ask-ctx">Context loaded: <strong>{currentPanelSig} — {sig.name}</strong></div>
        <div className="ip-section-lbl">Suggested questions</div>
        <div className="ip-ask-chips">
          {qs.map((q, i) => <div key={i} className="ip-ask-chip" onClick={() => {
             // In a real app this would call AskMexi's sendChat
             showToast(`Simulated Ask: ${q}`);
          }}>{q}</div>)}
        </div>
      </div>
    );
  };

  return (
    <div className={`intel-panel`} id="intel-panel">
      <div className="ip-hdr">
        <div className="ip-hdr-top">
          <div className="ip-hdr-left">
            <div className="ip-sig-id">{formatId(currentPanelSig)}</div>
            <div className="ip-sig-name">{sig.name}</div>
            <div className="ip-badge-row">
              <span className={`ip-badge ${badgeCls}`}>{badgeLabel}</span>
              <span className="ip-badge p">{sig.proc.split('·')[0].trim()}</span>
              <span className="ip-badge" style={{color:'var(--ink-2)', background:'var(--canvas)', borderColor:'var(--bd-2)'}}>{sig.val}</span>
            </div>
          </div>
          <div className="ip-hdr-actions">
            <div className="ip-expand-btn" onClick={togglePanelMode} title="Expand">⤢</div>
            <div className="ip-close-btn" onClick={closePanel} title="Close">✕</div>
          </div>
        </div>
        <div className="ip-tabs">
          {['what', 'why', 'impact', 'actions', 'ask'].map(tab => (
            <div key={tab} className={`ip-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </div>
          ))}
        </div>
      </div>
      <div className="ip-body">
        {activeTab === 'what' && renderWhat()}
        {activeTab === 'why' && renderWhy()}
        {activeTab === 'impact' && renderImpact()}
        {activeTab === 'actions' && renderActions()}
        {activeTab === 'ask' && renderAsk()}
      </div>
    </div>
  );
}
