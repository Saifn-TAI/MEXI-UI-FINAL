import React from 'react';
import TopbarLeftRail from './TopbarLeftRail';
import TopbarDataTrust from './TopbarDataTrust';
import TopbarClock from './TopbarClock';
import TopbarUser from './TopbarUser';
import { DASH } from '../../utils/mapEngineIntelligence';

export default function Topbar({
  leftPanelOpen,
  toggleLeftPanel,
  showToast,
  openSettings,
  openProfile,
  onSignOut,
  tenantClientName,
  tenantLogoUrl,
  engineBootstrap,
  engineDataSync,
  engineProfile,
}) {
  const clientLabel = tenantClientName?.trim() || DASH;

  return (
    <header className={`topbar ${!leftPanelOpen ? 'panel-collapsed' : ''}`} id="topbar">
      
      <TopbarLeftRail 
        leftPanelOpen={leftPanelOpen} 
        toggleLeftPanel={toggleLeftPanel} 
      />

      <div className="tb-right-section">
        <span className="tb-client" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {tenantLogoUrl ? (
            <img
              src={tenantLogoUrl}
              alt={clientLabel === DASH ? 'Tenant logo' : clientLabel}
              style={{ height: 20, width: 'auto', maxWidth: 120, objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          {clientLabel}
        </span>
        <div className="tb-sep"></div>

        <TopbarDataTrust 
          showToast={showToast}
          engineBootstrap={engineBootstrap}
          engineDataSync={engineDataSync}
        />

        <div className="tb-right">
          <TopbarClock />
          <TopbarUser
            showToast={showToast}
            openSettings={openSettings}
            openProfile={openProfile}
            onSignOut={onSignOut}
            engineProfile={engineProfile}
          />
        </div>
      </div>
    </header>
  );
}
