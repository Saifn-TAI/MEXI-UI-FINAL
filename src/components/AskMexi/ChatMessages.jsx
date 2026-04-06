import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, isLatest }) => {
  const [displayedText, setDisplayedText] = useState(isLatest ? '' : text);
  
  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(text);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i += 2;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text, isLatest]);

  return (
    <div style={{ lineHeight: '1.6', fontSize: '13px', color: 'var(--ink)' }}>
      {displayedText.split('\n').map((line, ix) => {
        if (!line.trim()) return null;
        const isBoldSegment = line.startsWith('Impact:') || line.startsWith('Recommended Action:') || line.startsWith('Timeline:') || line.startsWith('Confidence:');
        return (
          <div key={ix} style={{ marginBottom: '10px' }}>
            {isBoldSegment ? (
              <><strong>{line.split(':')[0]}:</strong>{line.split(':').slice(1).join(':')}</>
            ) : (
               line
            )}
          </div>
        );
      })}
    </div>
  );
};

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
              
              const fullText = `${r.cause}\n\nImpact: ${r.impact}\n\nTimeline: ${r.timeline}\n\nConfidence: ${confLabel}\n\nRecommended Action: ${r.rec}`;
              
              return (
                <div key={i} className="msg-group bot" style={{animation:'fadeUp .2s ease'}}>
                  <div className="bot-response" style={{ padding: '16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--bd)', boxShadow: 'var(--float-xs)' }}>
                    <TypewriterText text={fullText} isLatest={i === messages.length - 1} />
                    {m.sigId && SIGNALS[m.sigId] && (
                      <div style={{display:'flex', gap:'6px', paddingTop:'12px', marginTop:'4px', borderTop:'1px solid var(--bd-2)', flexWrap:'wrap'}}>
                        <div onClick={() => openPanel(m.sigId)} style={{display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 11px', borderRadius:'var(--r-pill)', background:'linear-gradient(135deg,var(--primary),var(--primary-dark))', color:'#fff', fontFamily:'var(--f-body)', fontSize:'9.5px', fontWeight:600, cursor:'pointer', border:'none'}}>
                          View signal ↗
                        </div>
                        <div onClick={() => openPanel(m.sigId,'actions')} style={{display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 11px', borderRadius:'var(--r-pill)', background:'var(--accent-5)', color:'var(--primary-dark)', fontFamily:'var(--f-body)', fontSize:'9.5px', fontWeight:600, cursor:'pointer', border:'1.5px solid var(--primary-bd)'}}>
                          Actions
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
