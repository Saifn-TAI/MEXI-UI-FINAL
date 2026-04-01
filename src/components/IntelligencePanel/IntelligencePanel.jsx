import React, { useState, useEffect, useRef } from 'react';
import IPHeader from './IPHeader';
import IPContent from './IPContent';
import IPSkeleton from './IPSkeleton';

export default function IntelligencePanel({
  currentPanelSig, panelMode, activeTab, setActiveTab,
  SIGNALS, closePanel, togglePanelMode, showToast, followFromChat, setChatInputTrigger
}) {
  const [contentKey, setContentKey] = useState(0);
  const [headerFlash, setHeaderFlash] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSig, setActiveSig] = useState(null);

  const prevSigRef = useRef(null);
  const prevModeRef = useRef('hidden');

  useEffect(() => {
    // If panel is closed
    if (panelMode === 'hidden') {
      prevModeRef.current = 'hidden';
      // Do not clear activeSig immediately to prevent visual jump while closing
      return;
    }

    // Panel is opened 
    if (!currentPanelSig) return;

    const justOpened = prevModeRef.current === 'hidden' && panelMode === 'expanded';
    const sigChanged = prevSigRef.current !== currentPanelSig;

    // Trigger loading sequence IF it just opened OR the signal changed
    if (justOpened || sigChanged) {
      setIsLoading(true);
      setHeaderFlash(false);
      
      // Delay to simulate "fetching" and allow panel slide animation to start before content pops in
      const loadDelay = justOpened ? 250 : 150; 
      
      const timer1 = setTimeout(() => {
        setActiveSig(currentPanelSig);
        setContentKey(k => k + 1); // trigger remount animations
        setIsLoading(false);
        if (sigChanged && !justOpened) setHeaderFlash(true); // highlight header only when switching signals
      }, loadDelay);

      const timer2 = setTimeout(() => {
        setHeaderFlash(false);
      }, 800 + loadDelay);

      prevSigRef.current = currentPanelSig;
      prevModeRef.current = panelMode;

      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [currentPanelSig, panelMode]);

  // Use activeSig for rendering content. If loading or no active sig, use currentPanelSig for header to show title immediately
  const renderSigId = activeSig || currentPanelSig; 
  const sig = SIGNALS[renderSigId];

  if (!sig || panelMode === 'hidden') return <div className="intel-panel hidden" />;

  const badgeCls = sig.sev === 'r' ? 'r' : sig.sev === 'a' ? 'a' : sig.sev === 'g' ? 'g' : 'nd';
  const badgeLabel = sig.sev === 'r' ? 'T2 — Critical' : sig.sev === 'a' ? 'T1 — Warning' : sig.sev === 'g' ? 'Normal' : 'No Data';
  const formatId = (id) => id.startsWith('func_') ? id.replace('func_', '').toUpperCase() + ' · ' + sig.proc : id + ' · ' + sig.proc;

  return (
    <div className={`intel-panel ${isLoading && prevSigRef.current ? 'ip-refreshing' : ''}`} id="intel-panel">

      {/* Loading indicator stripe for when switching signals while panel is open */}
      <div className={`ip-refresh-bar ${isLoading && prevSigRef.current ? 'animating' : ''}`} />

      <IPHeader
        sig={sig}
        currentPanelSig={renderSigId}
        badgeCls={badgeCls}
        badgeLabel={badgeLabel}
        formatId={formatId}
        togglePanelMode={togglePanelMode}
        closePanel={closePanel}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        headerFlash={headerFlash}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {isLoading ? (
          <IPSkeleton />
        ) : (
          <IPContent
            key={`${activeSig}-${contentKey}`}
            activeTab={activeTab}
            sig={sig}
            currentPanelSig={activeSig}
            showToast={showToast}
            followFromChat={followFromChat}
            setActiveTab={setActiveTab}
            setChatInputTrigger={setChatInputTrigger}
          />
        )}
      </div>
    </div>
  );
}
