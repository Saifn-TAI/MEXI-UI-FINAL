import React from 'react';
import IPHeader from './IPHeader';
import IPWhatTab from './IPWhatTab';
import IPWhyTab from './IPWhyTab';
import IPImpactTab from './IPImpactTab';
import IPActionsTab from './IPActionsTab';
import IPAskTab from './IPAskTab';
import IPContent from './IPContent';

export default function IntelligencePanel({ currentPanelSig, panelMode, activeTab, setActiveTab, SIGNALS, closePanel, togglePanelMode, showToast, followFromChat }) {

  const sig = SIGNALS[currentPanelSig];
  if (!sig || panelMode === 'hidden') return <div className="intel-panel hidden" />;

  const badgeCls = sig.sev === 'r' ? 'r' : sig.sev === 'a' ? 'a' : sig.sev === 'g' ? 'g' : 'nd';
  const badgeLabel = sig.sev === 'r' ? 'T2 — Critical' : sig.sev === 'a' ? 'T1 — Warning' : sig.sev === 'g' ? 'Normal' : 'No Data';

  const formatId = (id) => id.startsWith('func_') ? id.replace('func_', '').toUpperCase() + ' · ' + sig.proc : id + ' · ' + sig.proc;

  return (
    <div className={`intel-panel`} id="intel-panel">
      <IPHeader 
        sig={sig}
        currentPanelSig={currentPanelSig}
        badgeCls={badgeCls}
        badgeLabel={badgeLabel}
        formatId={formatId}
        togglePanelMode={togglePanelMode}
        closePanel={closePanel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <IPContent 
        activeTab={activeTab}
        sig={sig}
        currentPanelSig={currentPanelSig}
        showToast={showToast}
        followFromChat={followFromChat}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
