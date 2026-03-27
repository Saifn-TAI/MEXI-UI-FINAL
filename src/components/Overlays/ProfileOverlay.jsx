import React from 'react';
import './ProfileOverlay.css';

export const ProfileOverlay = ({ isOpen, onClose, userEmail, roleData }) => {
  return (
    <div className={`profile-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className="profile-card" 
        onClick={e => e.stopPropagation()} 
      >
        <div className="profile-hdr">
          <div className="profile-title">User Profile</div>
          <button className="profile-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">
            {roleData?.uav || 'CE'}
          </div>

          <div className="profile-name">
            Alagan S.
          </div>
          <div className="profile-role">
            {roleData?.urole || 'Chief Executive Officer'}
          </div>
          <div className="profile-email">
            {userEmail || 'alagan.s@veejei.com'}
          </div>

          <div className="profile-sep"></div>

          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">Account Status</span>
              <span className="profile-detail-value status-indicator">
                <div className="status-dot"></div>
                Active & Secured
              </span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Clearance Level</span>
              <span className="profile-detail-value">Tier 1 (Executive)</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Last Login</span>
              <span className="profile-detail-value" style={{ fontFamily: 'var(--f-mono)' }}>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
