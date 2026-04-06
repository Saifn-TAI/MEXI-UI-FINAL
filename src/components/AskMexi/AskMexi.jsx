import React, { useState, useRef, useEffect } from 'react';
import AskMexiHeader from './AskMexiHeader';
import RecentChatsPanel from './RecentChatsPanel';
import ChatMessages from './ChatMessages';
import ExploreBar from './ExploreBar';
import ChatInputArea from './ChatInputArea';
import {
  postAskMexiCreateConversation,
  postAskMexiMessage,
  getAskMexiConversations,
  postAskMexiLastContext,
} from '../../services/signalsEngineApi';
import { mapChatBotReplyFromApi, mapAskMexiConversationsFromApi } from '../../utils/mapEngineIntelligence';

const EMPTY_BOT = { cause: '—', impact: '—', timeline: '—', conf: 'low', rec: '—' };

export default function AskMexi({ roleData, showToast, openPanel, followFromChat, SIGNALS, chatInputTrigger, setChatInputTrigger, chatGreetingName }) {
  const [rcpOpen, setRcpOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const msgsRef = useRef(null);
  const askMexiConversationIdRef = useRef(null);

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

  useEffect(() => {
    if (!rcpOpen) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const raw = await getAskMexiConversations().catch(() => null);
        if (cancelled || raw == null) return;
        setRecentChats(mapAskMexiConversationsFromApi(raw));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rcpOpen]);

  const loadRecentChat = (id, title) => {
    setRecentChats((prev) => prev.map((c) => ({ ...c, active: c.id === id })));
    setRcpOpen(false);
    showToast(`Chat loaded: "${title}"`);
  };

  const startNewChat = () => {
    setRecentChats((prev) => prev.map((c) => ({ ...c, active: false })));
    setMessages([]);
    askMexiConversationIdRef.current = null;
    showToast('New chat started');
  };

  const firstRealSigId = () =>
    Object.keys(SIGNALS || {}).find((k) => !String(k).startsWith('func_')) || null;

  const sendChat = (text) => {
    const txt = text.trim();
    if (!txt) return;

    setMessages((prev) => [...prev, { type: 'user', text: txt }]);
    setInputVal('');
    setIsTyping(true);

    const pushBot = (resp, sigId) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          response: resp,
          sigId,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        },
      ]);
    };

    (async () => {
      try {
        if (!askMexiConversationIdRef.current) {
          const created = await postAskMexiCreateConversation();
          const cid =
            created?.id ??
            created?.conversation_id ??
            created?.data?.id ??
            created?.conversation?.id;
          if (cid) askMexiConversationIdRef.current = String(cid);
        }
        if (!askMexiConversationIdRef.current) {
          throw new Error('No conversation id');
        }
        const raw = await postAskMexiMessage(askMexiConversationIdRef.current, txt);
        if (raw?.error && typeof raw.error === 'string') {
          throw new Error(raw.error);
        }
        const mapped = mapChatBotReplyFromApi(raw);
        const reply = mapped
          ? {
              cause: mapped.cause,
              impact: mapped.impact,
              timeline: mapped.timeline,
              conf: mapped.conf,
              rec: mapped.rec,
            }
          : EMPTY_BOT;
        const apiSig =
          raw?.signal_id ?? raw?.recommended_signal_id ?? raw?.sig_id ?? raw?.context?.signal_id;
        const sigId =
          apiSig && SIGNALS[String(apiSig)] ? String(apiSig) : firstRealSigId();
        const ms = sigId ? SIGNALS[sigId] : null;
        if (ms) {
          localStorage.setItem(
            'mexi_last_ask',
            JSON.stringify({ question: txt, sigId, sigName: ms.name, ts: Date.now() })
          );
        }
        postAskMexiLastContext({
          question: txt,
          signal_id: sigId || undefined,
          conversation_id: askMexiConversationIdRef.current || undefined,
        }).catch(() => {});
        pushBot(reply, sigId || undefined);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Ask MExI]', e?.message || e);
        askMexiConversationIdRef.current = null;
        pushBot(EMPTY_BOT, firstRealSigId() || undefined);
        showToast(e?.message || 'MExI chat unavailable');
      }
    })();
  };

  return (
    <div
      className="ask-mexi-card"
      style={{
        margin: 0,
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        background: 'var(--canvas)',
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AskMexiHeader rcpOpen={rcpOpen} setRcpOpen={setRcpOpen} startNewChat={startNewChat} />

      <RecentChatsPanel rcpOpen={rcpOpen} setRcpOpen={setRcpOpen} recentChats={recentChats} loadRecentChat={loadRecentChat} />

      <ChatMessages
        messages={messages}
        isTyping={isTyping}
        msgsRef={msgsRef}
        openPanel={openPanel}
        followFromChat={followFromChat}
        SIGNALS={SIGNALS}
        greetingFirstName={chatGreetingName}
      />

      {messages.length === 0 && <ExploreBar roleData={roleData} sendChat={sendChat} />}

      <ChatInputArea inputVal={inputVal} setInputVal={setInputVal} sendChat={sendChat} showToast={showToast} />
    </div>
  );
}
