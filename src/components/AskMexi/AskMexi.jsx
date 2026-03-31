import React, { useState, useRef, useEffect } from 'react';
import AskMexiHeader from './AskMexiHeader';
import RecentChatsPanel from './RecentChatsPanel';
import ChatMessages from './ChatMessages';
import ExploreBar from './ExploreBar';
import ChatInputArea from './ChatInputArea';

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

export default function AskMexi({ roleData, showToast, openPanel, followFromChat, SIGNALS, chatInputTrigger, setChatInputTrigger }) {
  const [rcpOpen, setRcpOpen] = useState(false);
  const [recentChats, setRecentChats] = useState(DEMO_RECENT_CHATS);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => {
    if (chatInputTrigger) {
      setInputVal(chatInputTrigger);
      sendChat(chatInputTrigger);
      setChatInputTrigger(null);
    }
  }, [chatInputTrigger]);

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

  return (
    <div className="ask-mexi-card" style={{margin:0, border:'none', borderRadius:0, boxShadow:'none', background:'var(--canvas)', position:'relative', flex: 1, display: 'flex', flexDirection: 'column'}}>
      <AskMexiHeader 
        rcpOpen={rcpOpen} 
        setRcpOpen={setRcpOpen} 
        startNewChat={startNewChat} 
      />

      <RecentChatsPanel 
        rcpOpen={rcpOpen} 
        setRcpOpen={setRcpOpen} 
        recentChats={recentChats} 
        loadRecentChat={loadRecentChat} 
      />

      <ChatMessages 
        messages={messages} 
        isTyping={isTyping} 
        msgsRef={msgsRef} 
        openPanel={openPanel} 
        followFromChat={followFromChat} 
        SIGNALS={SIGNALS} 
      />

      {messages.length === 0 && (
        <ExploreBar 
          roleData={roleData} 
          sendChat={sendChat} 
        />
      )}

      <ChatInputArea 
        inputVal={inputVal} 
        setInputVal={setInputVal} 
        sendChat={sendChat} 
        showToast={showToast} 
      />
    </div>
  );
}
