import React from 'react';
import IPWhatTab from './IPWhatTab';
import IPWhyTab from './IPWhyTab';
import IPImpactTab from './IPImpactTab';
import IPActionsTab from './IPActionsTab';
import IPAskTab from './IPAskTab';

export default function IPContent({ activeTab, sig, currentPanelSig, showToast, followFromChat, setActiveTab }) {
  return (
    <div className="ip-body">
      {activeTab === 'what' && <IPWhatTab sig={sig} />}
      {activeTab === 'why' && <IPWhyTab sig={sig} />}
      {activeTab === 'impact' && <IPImpactTab sig={sig} />}
      {activeTab === 'actions' && (
        <IPActionsTab 
          sig={sig} 
          currentPanelSig={currentPanelSig} 
          showToast={showToast} 
          followFromChat={followFromChat} 
          setActiveTab={setActiveTab} 
        />
      )}
      {activeTab === 'ask' && (
        <IPAskTab 
          sig={sig} 
          currentPanelSig={currentPanelSig} 
          showToast={showToast} 
        />
      )}
    </div>
  );
}
