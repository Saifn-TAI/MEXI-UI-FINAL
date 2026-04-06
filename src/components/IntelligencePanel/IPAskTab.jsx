import React from 'react';

export default function IPAskTab({ sig, currentPanelSig, showToast, setChatInputTrigger }) {
  const qs = [
    `Why is ${sig.name.toLowerCase()} happening?`,
    `What is the financial impact of ${sig.name.toLowerCase()}?`,
    `What should I do about ${sig.name.toLowerCase()} today?`,
  ];
  return (
    <div className="ip-ask-wrap">
      <div className="ip-section-lbl">Suggested questions</div>
      <div className="ip-ask-chips">
        {qs.map((q, i) => <div key={i} className="ip-ask-chip" onClick={() => {
           setChatInputTrigger(q);
           showToast(`Question sent to MExI`);
        }}>{q}</div>)}
      </div>
    </div>
  );
}
