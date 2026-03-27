import React from 'react';

export default function ChatInputArea({ inputVal, setInputVal, sendChat, showToast }) {
  return (
    <div className="input-area" style={{padding:'0 20px 20px', background:'transparent', flexShrink:0}}>
      <div className="input-card">
        <textarea className="chat-inp" value={inputVal} onChange={e => setInputVal(e.target.value)} rows="1" placeholder="Ask about a signal, machine, customer or risk…"
          onKeyDown={(e) => {
            if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(inputVal); }
          }}
          style={{height: '52px'}}
          onInput={(e) => { e.target.style.height=''; e.target.style.height=Math.min(e.target.scrollHeight,140)+'px'; }}
        />
        <div className="input-card-bottom">
          <div className="input-attach-btn" onClick={() => showToast('Attach file — coming soon')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            Attach
          </div>
          <button className="send-btn" onClick={() => sendChat(inputVal)}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M13 1L1 5.5l5 2 2 5L13 1z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
