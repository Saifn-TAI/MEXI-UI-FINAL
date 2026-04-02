import React from 'react';
import { BIZ_IMPACT_CARDS } from '../../data/mockData';

export default function IPHeader({ sig, currentPanelSig, badgeCls, badgeLabel, formatId, togglePanelMode, closePanel, activeTab, setActiveTab, headerFlash, originBizCard, onBackToBiz }) {
  const originCard = BIZ_IMPACT_CARDS.find(c => c.id === originBizCard);
  return (
    <div className={`ip-hdr ${headerFlash ? 'ip-hdr-flash' : ''}`}>
      <div className="ip-hdr-top">
        <div className="ip-hdr-left">
          {originCard && (
            <div className="ip-breadcrumb-icon" onClick={() => onBackToBiz(originCard.id)} title={`Back to ${originCard.label}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
          )}
        </div>
        <div className="ip-hdr-actions">
          <div className="ip-expand-btn" onClick={togglePanelMode} title="Expand">⤢</div>
          <div className="ip-close-btn" onClick={closePanel} title="Close">✕</div>
        </div>
      </div>

      <div className="ip-hdr-content">
        <div className="ip-sig-name">{sig.name}</div>
        <div className="ip-badge-row">
          <span className={`ip-badge ${badgeCls}`}>{badgeLabel}</span>
          <span className="ip-badge p">{sig.proc.split('·')[1]?.trim() || sig.proc.split('·')[0].trim()}</span>
          <span className="ip-badge" style={{color:'var(--ink-2)', background:'var(--canvas)', borderColor:'var(--bd-2)'}}>{sig.val}</span>
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
