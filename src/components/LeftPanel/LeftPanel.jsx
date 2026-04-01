import React from 'react';
import BizImpactGrid from './BizImpactGrid';
import PrioritySignalStack from './PrioritySignalStack';
import CrossFunctionHealth from './CrossFunctionHealth';
import RisksChanged from './RisksChanged';
import Watchlist from './Watchlist';

export default function LeftPanel({ leftPanelOpen, roleData, SIGNALS, openPanel, showToast, openBrief, openAllSignalsPanel, openBizCard, watchlist, unfollowEntity }) {
  return (
    <aside className="left-panel" style={{ transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)', pointerEvents: leftPanelOpen ? 'auto' : 'none' }}>
      <BizImpactGrid 
        openBrief={openBrief} 
        openPanel={openPanel}
        SIGNALS={SIGNALS}
        openBizCard={openBizCard}
      />

      <PrioritySignalStack 
        roleData={roleData} 
        SIGNALS={SIGNALS} 
        openPanel={openPanel} 
        openAllSignalsPanel={openAllSignalsPanel} 
      />

      <CrossFunctionHealth 
        openPanel={openPanel} 
        showToast={showToast} 
      />

      <RisksChanged />

      <Watchlist 
        watchlist={watchlist} 
        openPanel={openPanel} 
        showToast={showToast} 
        unfollowEntity={unfollowEntity} 
      />
    </aside>
  );
}
