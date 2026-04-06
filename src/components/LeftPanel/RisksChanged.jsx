import React, { useState } from 'react';
import { RC_ITEMS } from '../../data/mockData';

export default function RisksChanged() {
  const [rcOpen, setRcOpen] = useState(false);

  return (
    <div className="risks-changed">
      <div className="rc-toggle-hdr" onClick={() => setRcOpen(!rcOpen)}>
        <div className="rc-toggle-left">
          <span className="rc-title">Risks Changed</span>
          <span className="rc-badge">{RC_ITEMS.length} updates</span>
        </div>
        <span className={`rc-arrow ${rcOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div className={`rc-collapsible ${rcOpen ? 'open' : ''}`}>
        <div>
          {RC_ITEMS.map((item, i) => (
            <div key={i} className="rc-item">
              <div className="rc-icon">{item.icon}</div>
              <div className="rc-body">
                <div className="rc-text">{item.text}</div>
                <div className={`rc-delta ${item.type}`}>{item.delta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
