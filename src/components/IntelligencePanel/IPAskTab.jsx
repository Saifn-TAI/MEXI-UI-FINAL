import React, { useState } from 'react';
import { postSignalAsk } from '../../services/signalsEngineApi';
import { mapChatBotReplyFromApi, formatStructuredReplyForDisplay, DASH } from '../../utils/mapEngineIntelligence';

const DEFAULT_QS = [
  'What is the root cause of this signal?',
  'What is the financial impact?',
  'What should we do next?',
];

export default function IPAskTab({ sig, currentPanelSig, showToast, askChips }) {
  const [askBusy, setAskBusy] = useState(false);
  const [lastReply, setLastReply] = useState(null);
  const isFunctionPanel = currentPanelSig && String(currentPanelSig).startsWith('func_');

  const nm = sig?.name && String(sig.name).trim() ? String(sig.name) : null;
  const tailored = nm
    ? [
        `What is driving "${nm}"?`,
        `What is the financial impact of "${nm}"?`,
        `What actions are recommended for "${nm}"?`,
      ]
    : null;
  const qs =
    Array.isArray(askChips) && askChips.length
      ? askChips.filter(Boolean)
      : tailored || DEFAULT_QS;

  const askSignalEngine = async (q) => {
    if (!currentPanelSig || askBusy) return;
    if (isFunctionPanel) {
      showToast('Ask applies to a specific signal (e.g. P3.01). Open a signal from the list or heatmap drill-down.');
      return;
    }
    setAskBusy(true);
    setLastReply(null);
    try {
      const raw = await postSignalAsk(currentPanelSig, q);
      if (raw && typeof raw === 'object' && raw.error) {
        setLastReply(String(raw.error));
        showToast(String(raw.error));
        return;
      }
      const mapped = mapChatBotReplyFromApi(raw);
      if (mapped) {
        setLastReply(formatStructuredReplyForDisplay(mapped));
      } else {
        setLastReply(DASH);
      }
    } catch (e) {
      setLastReply(DASH);
      showToast(e?.message || 'Ask failed');
    } finally {
      setAskBusy(false);
    }
  };

  return (
    <div className="ip-ask-wrap">
      {isFunctionPanel ? (
        <div className="ip-section-lbl" style={{ opacity: 0.85, marginBottom: 8 }}>
          Signal Ask is disabled for function overview panels. Open a contributing signal (e.g. from All Signals) to ask about it.
        </div>
      ) : null}
      <div className="ip-section-lbl">Suggested questions</div>
      <div className="ip-ask-chips">
        {qs.map((q, i) => (
          <div
            key={i}
            className="ip-ask-chip"
            style={{
              opacity: askBusy || isFunctionPanel ? 0.5 : 1,
              cursor: askBusy || isFunctionPanel ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !askBusy && !isFunctionPanel && askSignalEngine(q)}
          >
            {q}
          </div>
        ))}
      </div>
      <div className="ip-section-lbl" style={{ marginTop: '16px' }}>
        Signal answer
      </div>
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--r-sm)',
          fontSize: '12px',
          lineHeight: 1.55,
          color: 'var(--ink)',
          whiteSpace: 'pre-wrap',
          minHeight: '48px',
        }}
      >
        {askBusy ? '…' : lastReply ?? '—'}
      </div>
    </div>
  );
}
