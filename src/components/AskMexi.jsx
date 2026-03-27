import React, { useState, useRef, useEffect } from 'react';

const DEMO_RECENT_CHATS = [
  {id:'chat1', title:'Why is production failing?', time:'Today · 08:32', active:true},
  {id:'chat2', title:'Bonfiglioli risk analysis', time:'Yesterday · 17:10', active:false},
  {id:'chat3', title:'Supplier OTD breakdown', time:'24 Mar · 14:55', active:false},
  {id:'chat4', title:'Machine efficiency deep dive', time:'23 Mar · 11:20', active:false},
];

const CHAT_RESPONSES = {
  'revenue': {cause:'170 overdue orders at ₹247L direct exposure, plus Bonfiglioli ₹843L concentration risk (0 overdue but fragile).',impact:'₹924L total. ₹82L increase since last session. IATF penalties active for automotive customers.',timeline:'OTD has been deteriorating since October 2025. Oldest overdue: 535 days (Bull Machine).',conf:'high',rec:'MD calls for Toshiba, Rotzler, Bull Machine this week. Ring-fence Bonfiglioli production.'},
  'production': {cause:'Fleet machine efficiency at 43.4% vs 75% target. Setting time consuming 130,075 minutes — 53.6% of all non-productive time.',impact:'344 of 372 WOs open. BTPL alone: 196 WOs at 8.8% completion. ₹424L production overdue.',timeline:'Structural — building since October 2025. Not a spike.',conf:'high',rec:'Freeze new BTPL WO releases. SMED programme targeting top 5 machine-operation combinations.'},
  'supplier': {cause:'3 vendors missing delivery dates for 3+ consecutive periods. No escalation triggered.',impact:'₹180L inbound supply risk. 9 critical alerts. Planning disruptions cascading into production.',timeline:'Repeat pattern visible for 3–4 consecutive periods.',conf:'high',rec:'MD-level review of 3 repeat offenders. Issue 30-day performance improvement notice.'},
  'margin': {cause:'No-Operator idle (194K min), Setting time (130K min), and Inspection holds (60K min) absorbing machine overhead with zero output.',impact:'1.4% margin erosion. ₹22L idle machine absorption. Worsening — up 0.3% vs last week.',timeline:'Consistent across Oct 2025–Jan 2026 period.',conf:'high',rec:'Pre-shift operator check-in protocol eliminates No-Operator category. Recovers 0.6% margin immediately.'},
  'bonfiglioli': {cause:'70.6% of total pending order book (₹843L) in one customer. Fleet OTD at 58.3% — no active protection for Bonfiglioli WOs.',impact:'₹843L at risk if relationship deteriorates. IATF penalties activate on first missed delivery.',timeline:'Concentration has been building. Currently 0 overdue — window to act is open.',conf:'med',rec:'Ring-fence all Bonfiglioli WOs in production schedule. No Bonfiglioli line to slip without MD approval.'},
  'default': {cause:'Signal detected from Veejei operational data. Cross-referencing machine shop, order book, and subcon GRN records.',impact:'Financial impact quantified by FVLA deterministic engine from source data.',timeline:'Data covers October 2025 to present.',conf:'high',rec:'Use the signal panel on the right to explore root causes, evidence data, and specific actions.'},
};

export default function AskMexi({ roleData, showToast, openPanel, followFromChat, SIGNALS }) {
  const [rcpOpen, setRcpOpen] = useState(false);
  const [recentChats, setRecentChats] = useState(DEMO_RECENT_CHATS);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadRecentChat = (id, title) => {
    setRecentChats(prev => prev.map(c => ({...c, active: c.id === id})));
    setRcpOpen(false);
    showToast(`Chat loaded: "${title}"`);
  };

  const startNewChat = () => {
    setRecentChats(prev => prev.map(c => ({...c, active: false})));
    setMessages([]);
    showToast('New chat started');
  };

  const getResponse = (q) => {
    const ql = q.toLowerCase();
    if (ql.includes('revenue') || ql.includes('risk')) return CHAT_RESPONSES.revenue;
    if (ql.includes('production') || ql.includes('completion') || ql.includes('wo') || ql.includes('efficiency')) return CHAT_RESPONSES.production;
    if (ql.includes('supplier') || ql.includes('supply')) return CHAT_RESPONSES.supplier;
    if (ql.includes('margin') || ql.includes('idle') || ql.includes('setting')) return CHAT_RESPONSES.margin;
    if (ql.includes('bonfiglioli') || ql.includes('concentration')) return CHAT_RESPONSES.bonfiglioli;
    return CHAT_RESPONSES.default;
  };

  const sendChat = (text) => {
    const txt = text.trim();
    if (!txt) return;

    setMessages(prev => [...prev, { type: 'user', text: txt }]);
    setInputVal('');
    setIsTyping(true);

    const resp = getResponse(txt);
    const ql = txt.toLowerCase();
    let matchedSig = 'P3.04';
    if (ql.includes('revenue')||ql.includes('risk')) matchedSig='D5.01';
    else if (ql.includes('production')||ql.includes('wo')||ql.includes('efficiency')) matchedSig='P3.04';
    else if (ql.includes('supplier')||ql.includes('supply')) matchedSig='S1.01';
    else if (ql.includes('margin')||ql.includes('idle')) matchedSig='P3.03';
    else if (ql.includes('bonfiglioli')) matchedSig='D5.08';

    // Hook Stage 5
    const ms = SIGNALS[matchedSig];
    if (ms) {
      localStorage.setItem('mexi_last_ask', JSON.stringify({
        question: txt, sigId: matchedSig, sigName: ms.name, ts: Date.now()
      }));
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'bot',
        response: resp,
        sigId: matchedSig,
        time: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false})
      }]);
    }, 700 + Math.random() * 400);
  };

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="ask-mexi-card" style={{margin:0, border:'none', borderRadius:0, boxShadow:'none', background:'var(--canvas)', position:'relative', flex: 1, display: 'flex', flexDirection: 'column'}}>
      <div className="ask-mexi-header">
        <div className="ask-mexi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <span className="ask-mexi-title">Ask MExI</span>
        <span className="ask-mexi-sub">CEO · Decision Intelligence</span>
        <div className="ask-mexi-history-btn" onClick={() => setRcpOpen(!rcpOpen)} title="Recent chats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Recent
        </div>
        <div className="ask-mexi-new-btn" onClick={startNewChat} title="New chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          New
        </div>
      </div>

      <div className={`recent-chats-panel ${rcpOpen ? 'open' : ''}`}>
        <div className="rcp-header">
          <span className="rcp-title">Recent Chats</span>
          <div className="rcp-close" onClick={() => setRcpOpen(false)}>✕</div>
        </div>
        <div className="rcp-list">
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

      {messages.length === 0 && (
        <div className="explore-bar">
          {roleData?.chips?.map(q => (
            <div key={q} className="explore-chip" onClick={() => sendChat(q)}>{q}</div>
          ))}
        </div>
      )}

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
    </div>
  );
}
