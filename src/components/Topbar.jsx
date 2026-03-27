import React, { useEffect, useState } from 'react';

export default function Topbar({ leftPanelOpen, toggleLeftPanel, currentRole, roleData, showToast, openSettings }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateStr = `${days[time.getDay()]} ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()} · IST`;
  const syncTxt = `Synced ${time.getDate()} ${months[time.getMonth()]} · 08:14`;

  return (
    <header className={`topbar ${!leftPanelOpen ? 'panel-collapsed' : ''}`} id="topbar">
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
      <div className="tb-right-section">
        <span className="tb-client">Veejei Automation</span>
        <div className="tb-sep"></div>

        <div className="data-trust" onClick={() => showToast('3 sources active · SAP B1 · Machine Shop · Order Book · High confidence')} style={{marginLeft:'6px'}}>
          <div className="dt-dot"></div><span id="sync-txt">{syncTxt}</span>
        </div>
        <div className="tb-right">
          <div className="tb-clk"><span className="tb-clk-main" id="clk">{timeStr}</span><span className="tb-clk-sub" id="clk-date">{dateStr}</span></div>
          <div className="tb-vd"></div>
          <div className="tb-icon-btn" onClick={openSettings} title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div className="tb-usr" onClick={() => showToast('Profile — coming soon')}>
            <div><span className="tb-uname" id="tb-uname">Alagan S.</span><span className="tb-urole" id="tb-urole">{roleData?.urole || 'Chief Executive Officer'}</span></div>
            <div className="tb-av" id="tb-av">{roleData?.uav || 'CE'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
