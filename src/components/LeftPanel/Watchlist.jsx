import React, { useState, useRef } from 'react';

export default function Watchlist({ watchlist, openPanel, showToast, unfollowEntity }) {
  const [wlOpen, setWlOpen] = useState(false);
  const wlRef = useRef(null);

  const toggleWatchlist = () => {
    const opening = !wlOpen;
    setWlOpen(opening);
    if (opening) {
      setTimeout(() => wlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  return (
    <div className="wl-section" ref={wlRef}>
      <div className="rc-toggle-hdr" onClick={toggleWatchlist}>
        <div className="rc-toggle-left">
          <span className="rc-title">Watchlist</span>
          <span className="rc-badge">{watchlist.length} items</span>
        </div>
        <span className={`rc-arrow ${wlOpen ? 'open' : ''}`}>▼</span>
      </div>

      <div className={`rc-collapsible ${wlOpen ? 'open' : ''}`}>
        <div style={{ paddingTop: '8px' }}>
          <div className="wl-items">
            {watchlist.map((w, i) => (
              <div key={i} className="wl-item" onClick={() => openPanel(w.sig)}>
                <div className="wl-dot" style={{ background: w.status === 'r' ? 'var(--critical)' : w.status === 'a' ? 'var(--warn)' : 'var(--normal)' }}></div>
                <span className="wl-name">{w.id}</span>
                <span className="wl-type">{w.type}</span>
                <span className={`wl-status ${w.status}`}>{w.statusLabel}</span>
                <span className="wl-unfollow" onClick={(e) => { e.stopPropagation(); unfollowEntity(i); }} title="Unfollow">✕</span>
              </div>
            ))}
          </div>
          <div className="wl-add-btn" onClick={() => showToast('Search entities to follow — coming in next build')}>+ Follow entity</div>
        </div>
      </div>
    </div>
  );
}
