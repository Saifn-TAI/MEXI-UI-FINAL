import React, { useState } from 'react';
import { DASH } from '../../utils/mapEngineIntelligence';

export default function RisksChanged({ items }) {
  const [rcOpen, setRcOpen] = useState(false);
  const list = Array.isArray(items) && items.length ? items : [];

  return (
    <div className="risks-changed">
      <div className="rc-toggle-hdr" onClick={() => setRcOpen(!rcOpen)}>
        <div className="rc-toggle-left">
          <span className="rc-title">Risks Changed</span>
          <span className="rc-badge">{list.length} updates</span>
        </div>
        <span className={`rc-arrow ${rcOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`rc-collapsible ${rcOpen ? 'open' : ''}`}>
        <div>
          {list.length === 0 ? (
            <div className="rc-item">
              <div className="rc-icon">—</div>
              <div className="rc-body">
                <div className="rc-text">{DASH}</div>
                <div className={`rc-delta new`}>{DASH}</div>
              </div>
            </div>
          ) : (
            list.map((item, i) => (
              <div key={i} className="rc-item">
                <div className="rc-icon">{item.icon}</div>
                <div className="rc-body">
                  <div className="rc-text">{item.text}</div>
                  <div className={`rc-delta ${item.type}`}>{item.delta}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
