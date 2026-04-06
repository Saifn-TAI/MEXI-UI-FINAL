import React from 'react';

export default function ExploreBar({ roleData, sendChat }) {
  const chips = Array.isArray(roleData?.chips) ? roleData.chips.filter(Boolean) : [];
  return (
    <div className="explore-bar">
      {chips.length ? (
        chips.map((q) => (
          <div key={q} className="explore-chip" onClick={() => sendChat(q)}>
            {q}
          </div>
        ))
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--ink-4)', padding: '8px 12px' }}>—</div>
      )}
    </div>
  );
}
