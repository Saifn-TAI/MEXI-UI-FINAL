import React from 'react';

export default function AskMexiHeader({ rcpOpen, setRcpOpen, startNewChat }) {
  return (
    <div className="ask-mexi-header">
      <div className="ask-mexi-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <span className="ask-mexi-title">Ask MExI</span>

      <div className="ask-mexi-history-btn" onClick={() => setRcpOpen(!rcpOpen)} title="Recent chats">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Recent
      </div>
      <div className="ask-mexi-new-btn" onClick={startNewChat} title="New chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        New
      </div>
    </div>
  );
}
