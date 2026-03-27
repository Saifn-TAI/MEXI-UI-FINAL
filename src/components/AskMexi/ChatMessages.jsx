import React from 'react';

export default function ChatMessages({ messages, isTyping, msgsRef, openPanel, followFromChat, SIGNALS }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="msgs-wrap" ref={msgsRef} style={{flex:1, overflowY:'auto', padding:0, background:'var(--canvas)'}}>
      <div className="msgs-inner" style={{minHeight:'100%', padding:'0 0 10px'}}>
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="cw-greeting">{greeting}, Alagan</div>
            <div className="cw-sub">What's on your mind today?</div>
          </div>
        )}
        
        <div className="msgs-chat" style={{padding:'16px 24px 0'}}>
          {messages.map((m, i) => {
            if (m.type === 'user') {
              return (
                <div key={i} className="msg-group user" style={{animation:'fadeUp .2s ease'}}>
                  <div className="user-msg">{m.text}</div>
                </div>
              )
            } else {
              const r = m.response;
              const confCls = r.conf === 'high' ? 'conf-high' : r.conf === 'med' ? 'conf-med' : 'conf-low';
              const confLabel = r.conf === 'high' ? '● High confidence' : r.conf === 'med' ? '◐ Medium confidence' : '○ Low confidence';
              
              return (
                <div key={i} className="msg-group bot" style={{animation:'fadeUp .2s ease'}}>
                  <div className="bot-response">
                    <div className="bot-resp-row"><div className="bot-resp-label">Cause</div><div className="bot-resp-val">{r.cause}</div></div>
                    <div className="bot-resp-row"><div className="bot-resp-label">Impact</div><div className="bot-resp-val"><strong>{r.impact}</strong></div></div>
                    <div className="bot-resp-row"><div className="bot-resp-label">Timeline</div><div className="bot-resp-val">{r.timeline}</div></div>
                    <div className="bot-resp-row"><div className="bot-resp-label">Confidence</div><div className="bot-resp-val"><span className={confCls}>{confLabel}</span></div></div>
                    <div className="bot-resp-row"><div className="bot-resp-label">Action</div><div className="bot-resp-val"><strong>{r.rec}</strong></div></div>
                    {m.sigId && SIGNALS[m.sigId] && (
                      <div style={{display:'flex', gap:'6px', padding:'8px 12px', borderTop:'1px solid var(--bd)', background:'var(--canvas)', flexWrap:'wrap'}}>
                        <div onClick={() => openPanel(m.sigId)} style={{display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 11px', borderRadius:'var(--r-pill)', background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', color:'#fff', fontFamily:'var(--f-body)', fontSize:'9.5px', fontWeight:600, cursor:'pointer', border:'none'}}>
                          View signal ↗
                        </div>
                        <div onClick={() => openPanel(m.sigId,'actions')} style={{display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 11px', borderRadius:'var(--r-pill)', background:'var(--accent-5)', color:'var(--primary-dark)', fontFamily:'var(--f-body)', fontSize:'9.5px', fontWeight:600, cursor:'pointer', border:'1.5px solid var(--primary-bd)'}}>
                          Actions
                        </div>
                        <div onClick={() => followFromChat(m.sigId)} style={{display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 11px', borderRadius:'var(--r-pill)', background:'var(--canvas)', color:'var(--ink-3)', fontFamily:'var(--f-body)', fontSize:'9.5px', fontWeight:600, cursor:'pointer', border:'1.5px solid var(--bd-2)'}}>
                          + Follow
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="msg-time">{m.time}</div>
                </div>
              )
            }
          })}
          
          {isTyping && (
            <div className="msg-group bot">
              <div className="typing-row"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
