import React from 'react';
import logo from '../../assets/logo.png';

export default function TopbarLeftRail({ leftPanelOpen, toggleLeftPanel }) {
  return (
    <div className={`tb-left-rail ${!leftPanelOpen ? 'collapsed' : ''}`} id="tb-left-rail">
      <div className="tb-wordmark" onClick={() => !leftPanelOpen && toggleLeftPanel()} title="Open panel" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <img src={logo} alt="MEXI" style={{ height: '50px', width: 'auto' }} />
      </div>
      <div className="tb-rail-toggle" id="tb-rail-toggle" onClick={toggleLeftPanel} title="Toggle sidebar">
        <svg id="tb-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </svg>
      </div>
    </div>
  );
}
