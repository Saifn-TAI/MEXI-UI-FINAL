import React, { useState, useEffect, useCallback } from 'react';
import Topbar from './components/Topbar/Topbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import AskMexi from './components/AskMexi/AskMexi';
import IntelligencePanel from './components/IntelligencePanel/IntelligencePanel';
import { AllSignalsOverlay, SettingsOverlay, ProfileOverlay } from './components/Overlays';
import ExecBriefModal from './components/ExecBriefModal/ExecBriefModal';
import IPContent from './components/IntelligencePanel/IPContent';
import LoginPage from './components/Login/LoginPage';
import SignupPage from './components/Login/SignupPage';
import LoadingScreen from './components/Login/LoadingScreen';
import BizImpactDrawer from './components/LeftPanel/BizImpactDrawer';
import CrossFunctionDrawer from './components/LeftPanel/CrossFunctionDrawer';
import DashboardLoader from './components/DashboardLoader';
import { useApp } from './context/AppContext';
import { ROLES, SIGNALS } from './data/mockData';

const LOADER_DURATION = 3000;

export default function App() {
  const { setShowExecBrief } = useApp();
  const [authStatus, setAuthStatus] = useState('login');
  const [userEmail, setUserEmail] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [currentRole, setCurrentRole] = useState('CEO');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [currentPanelSig, setCurrentPanelSig] = useState(null);
  const [panelMode, setPanelMode] = useState('hidden');
  const [panelTab, setPanelTab] = useState('what');
  const [toastMsg, setToastMsg] = useState(null);

  const [allSignalsOpen, setAllSignalsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fsOverlayOpen, setFsOverlayOpen] = useState(false);
  const [chatInputTrigger, setChatInputTrigger] = useState(null);

  const [activeBizCard, setActiveBizCard] = useState(null);
  const [activeFuncCard, setActiveFuncCard] = useState(null);
  const [originBizCard, setOriginBizCard] = useState(null);
  const [originFuncCard, setOriginFuncCard] = useState(null);
  const [originAllSignals, setOriginAllSignals] = useState(false);

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem('mexi_watchlist');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: 'Bonfiglioli', type: 'Customer', status: 'a', statusLabel: 'At risk', sig: 'D5.08' },
      { id: 'Vendor A (Castings)', type: 'Supplier', status: 'r', statusLabel: 'Critical', sig: 'S1.01' },
      { id: 'HMC-02', type: 'Machine', status: 'r', statusLabel: 'No warranty', sig: 'M7.19' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mexi_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Generic loader wrapper — DISABLED
  const withLoader = useCallback((fn) => {
    fn();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const openPanel = (sigId, tab = 'what', originId = null, originFunc = null, fromAllSignals = false) => {
    withLoader(() => {
      setActiveBizCard(null);
      setActiveFuncCard(null);
      setOriginBizCard(originId);
      setOriginFuncCard(originFunc);
      setOriginAllSignals(fromAllSignals);
      setCurrentPanelSig(sigId);
      setPanelTab(tab);
      setPanelMode('expanded');
    });
  };

  const handleOpenBizCard = (cardId) => {
    withLoader(() => {
      setPanelMode('hidden');
      setOriginBizCard(null);
      setActiveFuncCard(null);
      setActiveBizCard(cardId);
    });
  };

  const handleOpenFuncCard = (funcId) => {
    withLoader(() => {
      setPanelMode('hidden');
      setActiveBizCard(null);
      setOriginFuncCard(null);
      setActiveFuncCard(funcId);
    });
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
      sig: sigId,
    };
    if (watchlist.find(w => w.sig === sigId)) {
      showToast(`${entity.id} is already in your Watchlist`);
      return;
    }
    setWatchlist(prev => [...prev, entity]);
    showToast(`+ Following: ${entity.id}`);
  };

  const unfollowEntity = (index) => {
    withLoader(() => {
      setWatchlist(prev => prev.filter((_, i) => i !== index));
      showToast('Removed from watchlist');
    });
  };

  const roleData = ROLES[currentRole];
  const leftW = leftPanelOpen ? '340px' : '0px';
  const rightW = (panelMode === 'expanded' || activeBizCard || activeFuncCard) ? '480px' : '0px';

  if (authStatus === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(email) => { setUserEmail(email); setAuthStatus('loading'); }}
        onGoToSignup={() => setAuthStatus('signup')}
      />
    );
  }

  if (authStatus === 'signup') {
    return (
      <SignupPage
        onSignupSuccess={(email) => { setUserEmail(email); setAuthStatus('loading'); }}
        onGoToLogin={() => setAuthStatus('login')}
      />
    );
  }

  if (authStatus === 'loading') {
    return <LoadingScreen onLoadingComplete={() => setAuthStatus('dashboard')} />;
  }

  const dashboardStyle = {
    animation: 'fadeUp 0.6s ease',
    opacity: 1,
    gridTemplateColumns: `${leftW} 1fr ${rightW}`,
  };

  return (
    <>
      {dashboardLoading && <DashboardLoader />}

      <div
        className={`shell ${!leftPanelOpen ? 'no-panel' : ''} ${(panelMode === 'expanded' || activeBizCard) ? 'panel-expanded' : ''}`}
        id="shell"
        style={dashboardStyle}
      >
        <Topbar
          leftPanelOpen={leftPanelOpen}
          toggleLeftPanel={() => setLeftPanelOpen(p => !p)}
          currentRole={currentRole}
          roleData={roleData}
          showToast={showToast}
          openSettings={() => withLoader(() => setSettingsOpen(true))}
          openProfile={() => withLoader(() => setProfileOpen(true))}
          onSignOut={() => { setUserEmail(''); setAuthStatus('login'); }}
        />

        <LeftPanel
          leftPanelOpen={leftPanelOpen}
          roleData={roleData}
          SIGNALS={SIGNALS}
          openPanel={openPanel}
          showToast={showToast}
          openBrief={() => withLoader(() => { setShowExecBrief(true); showToast('Opening Executive Brief...'); })}
          openAllSignalsPanel={() => withLoader(() => setAllSignalsOpen(true))}
          openBizCard={handleOpenBizCard}
          openFuncCard={handleOpenFuncCard}
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
            chatInputTrigger={chatInputTrigger}
            setChatInputTrigger={setChatInputTrigger}
          />
        </main>

        {activeBizCard ? (
          <BizImpactDrawer
            cardId={activeBizCard}
            SIGNALS={SIGNALS}
            onClose={() => setActiveBizCard(null)}
            openPanel={(sigId, tab, originId) => { setActiveBizCard(null); openPanel(sigId, tab, originId); }}
          />
        ) : activeFuncCard ? (
          <CrossFunctionDrawer
            funcId={activeFuncCard}
            SIGNALS={SIGNALS}
            onClose={() => setActiveFuncCard(null)}
            openPanel={(sigId, tab) => { setActiveFuncCard(null); openPanel(sigId, tab, null, activeFuncCard); }}
          />
        ) : (
          <IntelligencePanel
            key={`${currentPanelSig}-${originBizCard}-${originFuncCard}`}
            currentPanelSig={currentPanelSig}
            panelMode={panelMode}
            activeTab={panelTab}
            setActiveTab={setPanelTab}
            SIGNALS={SIGNALS}
            closePanel={closePanel}
            togglePanelMode={togglePanelMode}
            showToast={showToast}
            followFromChat={followFromChat}
            setChatInputTrigger={setChatInputTrigger}
            originBizCard={originBizCard}
            onBackToBiz={handleOpenBizCard}
            originFuncCard={originFuncCard}
            onBackToFunc={handleOpenFuncCard}
            originAllSignals={originAllSignals}
            onBackToAllSignals={() => { closePanel(); setAllSignalsOpen(true); }}
          />
        )}

        <ExecBriefModal />
      </div>



      <AllSignalsOverlay
        isOpen={allSignalsOpen}
        onClose={() => setAllSignalsOpen(false)}
        roleData={roleData}
        SIGNALS={SIGNALS}
        openPanel={openPanel}
      />

      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        showToast={showToast}
      />

      <ProfileOverlay
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        roleData={roleData}
        userEmail={userEmail}
      />

      {fsOverlayOpen && currentPanelSig && (
        <div className="ip-fullscreen-overlay open" onClick={() => setFsOverlayOpen(false)}>
          <div className="ip-fullscreen-card" onClick={e => e.stopPropagation()}>
            <div className="ip-hdr" style={{ flexShrink: 0, padding: '16px 20px' }}>
              <div className="ip-hdr-top">
                <div className="ip-hdr-left">
                  <div className="ip-sig-id" style={{ fontSize: '12px', color: 'var(--primary)' }}>{currentPanelSig} · {SIGNALS[currentPanelSig].proc}</div>
                  <div className="ip-sig-name" style={{ fontSize: '20px', fontWeight: 700 }}>{SIGNALS[currentPanelSig].name}</div>
                </div>
                <div className="ip-hdr-actions">
                  <div className="ip-close-btn" onClick={() => setFsOverlayOpen(false)} style={{ width: '32px', height: '32px', fontSize: '16px' }}>✕</div>
                </div>
              </div>
              <div className="ip-tabs" style={{ marginTop: '12px' }}>
                {['what', 'why', 'impact', 'actions', 'ask'].map(tab => (
                  <div key={tab} className={`ip-tab ${panelTab === tab ? 'active' : ''}`} onClick={() => setPanelTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>
              <IPContent
                activeTab={panelTab}
                sig={SIGNALS[currentPanelSig]}
                currentPanelSig={currentPanelSig}
                showToast={showToast}
                followFromChat={followFromChat}
                setActiveTab={setPanelTab}
                setChatInputTrigger={setChatInputTrigger}
              />
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast" style={{ opacity: toastMsg ? 1 : 0 }}>
        {toastMsg}
      </div>
    </>
  );
}
