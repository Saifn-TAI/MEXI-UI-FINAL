import React, { useState } from 'react';
import { postSignalAssignAction, postSignalRunAgentAction } from '../../services/signalsEngineApi';
import { DASH } from '../../utils/mapEngineIntelligence';

export default function IPActionsTab({ sig, currentPanelSig, showToast, followFromChat, setActiveTab }) {
  const [busyAssign, setBusyAssign] = useState(null);
  const [busyAgent, setBusyAgent] = useState(null);
  const acts = Array.isArray(sig?.acts) && sig.acts.length ? sig.acts : [{ t: DASH, s: DASH }];

  const onAssign = async (e, idx) => {
    e?.stopPropagation?.();
    if (!currentPanelSig || busyAssign !== null || busyAgent !== null) return;
    setBusyAssign(idx);
    try {
      const res = await postSignalAssignAction(currentPanelSig, idx);
      const msg = res?.message ?? res?.status ?? 'ok';
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } catch (err) {
      showToast(err?.message || 'Assign failed');
    } finally {
      setBusyAssign(null);
    }
  };

  const onRunAgent = async (e, idx) => {
    e?.stopPropagation?.();
    if (!currentPanelSig || busyAssign !== null || busyAgent !== null) return;
    setBusyAgent(idx);
    try {
      const res = await postSignalRunAgentAction(currentPanelSig, idx);
      const msg = res?.message ?? res?.status ?? 'triggered';
      showToast(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } catch (err) {
      showToast(err?.message || 'Run agent failed');
    } finally {
      setBusyAgent(null);
    }
  };

  return (
    <>
      <div className="ip-section-lbl">Executive Actions</div>
      {acts.map((a, i) => (
        <div key={i} className="action-item-ip">
          <div className="action-num-ip">{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div className="action-text-ip">{a.t}</div>
            <div className="action-src-ip">{a.s}</div>
            <div className="action-btns-ip">
              <div
                className="aib assign"
                style={{ opacity: busyAssign === i || busyAgent === i ? 0.5 : 1 }}
                onClick={(e) => onAssign(e, i)}
              >
                {busyAssign === i ? '…' : 'Assign ↗'}
              </div>
              <div
                className="aib agent"
                style={{ opacity: busyAgent === i || busyAssign === i ? 0.5 : 1 }}
                onClick={(e) => onRunAgent(e, i)}
              >
                {busyAgent === i ? '…' : 'Run Agent'}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: '8.5px', color: 'var(--ink-4)', textAlign: 'center', marginTop: '8px', lineHeight: 1.5 }}>
        Actions from Signal Engine · Assign / Run Agent call live APIs
      </div>
      <div style={{ marginTop: '10px', display: 'flex', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--bd)' }}>
        <div
          onClick={() => followFromChat(currentPanelSig)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 10px',
            borderRadius: 'var(--r-pill)',
            background: 'var(--canvas)',
            border: '1.5px solid var(--bd-2)',
            fontFamily: 'var(--f-body)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--ink-3)',
            cursor: 'pointer',
            transition: 'all .12s',
          }}
        >
          + Follow this signal
        </div>
        <div
          onClick={() => setActiveTab('ask')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 10px',
            borderRadius: 'var(--r-pill)',
            background: 'var(--accent-5)',
            border: '1.5px solid var(--primary-bd)',
            fontFamily: 'var(--f-body)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--primary-dark)',
            cursor: 'pointer',
            transition: 'all .12s',
          }}
        >
          Ask MExI →
        </div>
      </div>
    </>
  );
}
