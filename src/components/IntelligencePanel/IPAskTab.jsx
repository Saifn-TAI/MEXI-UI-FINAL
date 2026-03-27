import React from 'react';

export default function IPAskTab({ sig, currentPanelSig, showToast }) {
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
}
