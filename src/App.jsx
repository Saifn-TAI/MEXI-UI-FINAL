import React, { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import LeftPanel from './components/LeftPanel';
import AskMexi from './components/AskMexi';
import IntelligencePanel from './components/IntelligencePanel';
import { AllSignalsOverlay, SettingsOverlay } from './components/Overlays';
import ExecBriefModal from './components/ExecBriefModal';
import { useApp } from './context/AppContext';
import { ROLES, SIGNALS } from './data/mockData';

export default function App() {
  const { setShowExecBrief } = useApp();
  const [currentRole, setCurrentRole] = useState('CEO');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [currentPanelSig, setCurrentPanelSig] = useState(null);
  const [panelMode, setPanelMode] = useState('hidden');
  const [panelTab, setPanelTab] = useState('what');
  const [toastMsg, setToastMsg] = useState(null);

  // Overlay states
  const [allSignalsOpen, setAllSignalsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fsOverlayOpen, setFsOverlayOpen] = useState(false);

  // Watchlist state
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem('mexi_watchlist');
      if (stored) return JSON.parse(stored);
    } catch (e) { }

    return [
      { id: 'Bonfiglioli', type: 'Customer', status: 'a', statusLabel: 'At risk', sig: 'D5.08' },
      { id: 'Vendor A (Castings)', type: 'Supplier', status: 'r', statusLabel: 'Critical', sig: 'S1.01' },
      { id: 'HMC-02', type: 'Machine', status: 'r', statusLabel: 'No warranty', sig: 'M7.19' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mexi_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const openPanel = (sigId, tab = 'what') => {
    setCurrentPanelSig(sigId);
    setPanelTab(tab);
    setPanelMode('expanded');
  };

  const closePanel = () => {
    setCurrentPanelSig(null);
    setPanelMode('hidden');
  };

  const togglePanelMode = () => {
    if (currentPanelSig) setFsOverlayOpen(true);
  };

  const followFromChat = (sigId) => {
    const sig = SIGNALS[sigId];
    if (!sig) return;
    const entityMap = {
      'D5.01': { id: 'Customer Delivery', type: 'Signal' },
      'P3.04': { id: 'Production Completion', type: 'Signal' },
      'S1.01': { id: 'Supplier OTD', type: 'Signal' },
      'P3.03': { id: 'Machine Idle Rate', type: 'Signal' },
      'D5.08': { id: 'Bonfiglioli', type: 'Customer' },
    };
    const mapped = entityMap[sigId] || { id: sig.name.substring(0, 22), type: 'Signal' };

    const entity = {
      id: mapped.id,
      type: mapped.type,
      status: sig.sev === 'r' ? 'r' : 'a',
      statusLabel: sig.sev === 'r' ? 'Critical' : 'Warning',
      sig: sigId
    };

    if (watchlist.find(w => w.sig === sigId)) {
      showToast(`${entity.id} is already in your Watchlist`);
      return;
    }

    setWatchlist(prev => [...prev, entity]);
    showToast(`+ Following: ${entity.id}`);
  };

  const unfollowEntity = (index) => {
    setWatchlist(prev => prev.filter((_, i) => i !== index));
    showToast('Removed from watchlist');
  };

  const roleData = ROLES[currentRole];

  // Calculate left/right panel widths for shell layout
  const leftW = leftPanelOpen ? '340px' : '0px';
  const rightW = panelMode === 'expanded' ? '480px' : '0px';

  return (
    <>
      <div className={`shell ${!leftPanelOpen ? 'no-panel' : ''} ${panelMode === 'expanded' ? 'panel-expanded' : ''}`} id="shell" style={{ gridTemplateColumns: `${leftW} 1fr ${rightW}` }}>

        <Topbar
          leftPanelOpen={leftPanelOpen}
          toggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
          currentRole={currentRole}
          roleData={roleData}
          showToast={showToast}
          openSettings={() => setSettingsOpen(true)}
        />

        <LeftPanel
          leftPanelOpen={leftPanelOpen}
          roleData={roleData}
          SIGNALS={SIGNALS}
          openPanel={openPanel}
          showToast={showToast}
          openBrief={() => setShowExecBrief(true)}
          openAllSignalsPanel={() => setAllSignalsOpen(true)}
          watchlist={watchlist}
          unfollowEntity={unfollowEntity}
        />

        <main className="center-col">
          <AskMexi
            roleData={roleData}
            showToast={showToast}
            openPanel={openPanel}
            followFromChat={followFromChat}
            SIGNALS={SIGNALS}
          />
        </main>

        <IntelligencePanel
          currentPanelSig={currentPanelSig}
          panelMode={panelMode}
          activeTab={panelTab}
          setActiveTab={setPanelTab}
          SIGNALS={SIGNALS}
          closePanel={closePanel}
          togglePanelMode={togglePanelMode}
          showToast={showToast}
          followFromChat={followFromChat}
        />

      </div>

      {!leftPanelOpen && (
        <div className="panel-expand-btn" style={{ display: 'flex' }} onClick={() => setLeftPanelOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      )}

      {/* OVERLAYS */}
      <AllSignalsOverlay
        isOpen={allSignalsOpen}
        onClose={() => setAllSignalsOpen(false)}
        roleData={roleData}
        SIGNALS={SIGNALS}
        openPanel={openPanel}
      />

      <ExecBriefModal />

      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        showToast={showToast}
      />

      {/* Full-Screen Overlay for Intelligence Panel */}
      {fsOverlayOpen && currentPanelSig && (
        <div className="ip-fullscreen-overlay open" onClick={() => setFsOverlayOpen(false)}>
          <div className="ip-fullscreen-card" onClick={e => e.stopPropagation()}>
            {/* Copying IntelligencePanel's header look here to simply display */}
            <div className="ip-hdr" style={{ flexShrink: 0 }}>
              <div className="ip-hdr-top">
                <div className="ip-hdr-left">
                  <div className="ip-sig-name">{SIGNALS[currentPanelSig].name}</div>
                  <div className="ip-sig-id">{currentPanelSig} · {SIGNALS[currentPanelSig].proc}</div>
                </div>
                <div className="ip-hdr-actions">
                  <div className="ip-close-btn" onClick={() => setFsOverlayOpen(false)}>✕</div>
                </div>
              </div>
            </div>
            <div className="ip-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
              <div style={{ fontFamily: 'var(--f-body)', fontSize: '14px', color: 'var(--ink-2)' }}>
                Full view mode for {SIGNALS[currentPanelSig].name} is active.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast" style={{ opacity: toastMsg ? 1 : 0 }}>
        {toastMsg}
      </div>
    </>
  );
}
