import React from 'react';
import TopbarLeftRail from './TopbarLeftRail';
import TopbarDataTrust from './TopbarDataTrust';
import TopbarClock from './TopbarClock';
import TopbarUser from './TopbarUser';

export default function Topbar({ leftPanelOpen, toggleLeftPanel, currentRole, roleData, showToast, openSettings, openProfile, onSignOut }) {
  return (
    <header className={`topbar ${!leftPanelOpen ? 'panel-collapsed' : ''}`} id="topbar">
      
      <TopbarLeftRail 
        leftPanelOpen={leftPanelOpen} 
        toggleLeftPanel={toggleLeftPanel} 
      />

      <div className="tb-right-section">
        <span className="tb-client">Veejei Automation</span>
        <div className="tb-sep"></div>

        <TopbarDataTrust 
          showToast={showToast} 
        />

        <div className="tb-right">
          <TopbarClock />
          <TopbarUser 
            roleData={roleData} 
            showToast={showToast} 
            openSettings={openSettings} 
            openProfile={openProfile}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  );
}
