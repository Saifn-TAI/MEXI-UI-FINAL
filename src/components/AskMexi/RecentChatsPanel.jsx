import React from 'react';

export default function RecentChatsPanel({ rcpOpen, setRcpOpen, recentChats, loadRecentChat }) {
  return (
    <div className={`recent-chats-panel ${rcpOpen ? 'open' : ''}`}>
      <div className="rcp-header">
        <span className="rcp-title">Recent Chats</span>
        <div className="rcp-close" onClick={() => setRcpOpen(false)}>✕</div>
      </div>
      <div className="rcp-list">
        {recentChats.length === 0 ? (
          <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--ink-4)', textAlign: 'center' }}>—</div>
        ) : null}
        {recentChats.map(c => (
          <div key={c.id} className={`rc-chat-item ${c.active ? 'active-chat' : ''}`} onClick={() => loadRecentChat(c.id, c.title)}>
            <div className="rc-chat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
            <div className="rc-chat-body">
              <div className="rc-chat-title">{c.title}</div>
              <div className="rc-chat-time">{c.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
