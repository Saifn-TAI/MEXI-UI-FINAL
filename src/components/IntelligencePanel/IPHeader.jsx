import React from 'react';

export default function IPHeader({ sig, currentPanelSig, badgeCls, badgeLabel, formatId, togglePanelMode, closePanel, activeTab, setActiveTab, headerFlash }) {
  return (
    <div className={`ip-hdr ${headerFlash ? 'ip-hdr-flash' : ''}`}>
      <div className="ip-hdr-top">
        <div className="ip-hdr-left">
          <div className="ip-sig-name">{sig.name}</div>
          <div className="ip-badge-row">
            <span className={`ip-badge ${badgeCls}`}>{badgeLabel}</span>
            <span className="ip-badge p">{sig.proc.split('·')[1]?.trim() || sig.proc.split('·')[0].trim()}</span>
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
  );
}
