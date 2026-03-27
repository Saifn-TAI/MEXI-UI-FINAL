import React from 'react';

export default function TopbarLeftRail({ leftPanelOpen, toggleLeftPanel }) {
  return (
    <div className={`tb-left-rail ${!leftPanelOpen ? 'collapsed' : ''}`} id="tb-left-rail">
      <div className="tb-wordmark" onClick={() => !leftPanelOpen && toggleLeftPanel()} title="Open panel">
        <span>ME</span><span className="mx">x</span><span>I</span><span className="tb-pip"></span>
      </div>
      <div className="tb-rail-toggle" id="tb-rail-toggle" onClick={toggleLeftPanel} title="Toggle sidebar">
        <svg id="tb-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 3v18"/>
        </svg>
      </div>
    </div>
  );
}
