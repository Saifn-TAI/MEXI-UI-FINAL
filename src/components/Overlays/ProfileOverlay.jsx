import React, { useState, useEffect, useMemo } from 'react';
import './ProfileOverlay.css';
import { useApp } from '../../context/AppContext';
import { patchEngineMe, getEngineMe } from '../../services/signalsEngineApi';
import { mapEngineMeFromApi } from '../../utils/mapEngineUserSync';
import { DASH } from '../../utils/mapEngineIntelligence';

const fieldStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--bd, #e0e0e0)',
  background: 'var(--surface, #fff)',
  color: 'var(--ink, #111)',
  fontSize: '13px',
  fontFamily: 'var(--f-body, inherit)',
  marginTop: 6,
};

function initialsFromString(name) {
  if (!name || typeof name !== 'string') return DASH;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return DASH;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1];
  return (parts[0][0] + last[0]).toUpperCase();
}

export const ProfileOverlay = ({ isOpen, onClose, showToast, userEmail, engineProfile }) => {
  const { setEngineMe } = useApp();
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setEditName(engineProfile?.displayName?.trim() || '');
    setEditRole(engineProfile?.roleLabel?.trim() || '');
  }, [isOpen, engineProfile?.displayName, engineProfile?.roleLabel]);

  const av = useMemo(
    () => engineProfile?.initials || initialsFromString(editName),
    [engineProfile?.initials, editName]
  );

  const email = userEmail?.trim() || engineProfile?.email?.trim() || DASH;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const body = await patchEngineMe({
        name: editName.trim(),
        role: editRole.trim(),
      });
      const raw = await getEngineMe();
      const mapped = mapEngineMeFromApi(raw);
      if (mapped) setEngineMe(mapped);
      const msg =
        typeof body?.status === 'string'
          ? body.status === 'updated'
            ? 'Profile updated'
            : body.status
          : body?.message || 'Profile updated';
      showToast?.(msg);
      onClose();
    } catch (e) {
      showToast?.(e?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`profile-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-hdr">
          <div className="profile-title">User Profile</div>
          <button className="profile-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar">{av}</div>

          <div className="profile-details" style={{ textAlign: 'left', width: '100%' }}>
            <label className="profile-detail-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <span className="profile-detail-label">Name</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={fieldStyle}
                autoComplete="name"
                aria-label="Display name"
              />
            </label>
            <label className="profile-detail-row" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: 12 }}>
              <span className="profile-detail-label">Role</span>
              <input
                type="text"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                style={fieldStyle}
                autoComplete="organization-title"
                aria-label="Role"
              />
            </label>
            <div className="profile-detail-row" style={{ marginTop: 12, flexDirection: 'column', alignItems: 'stretch' }}>
              <span className="profile-detail-label">Email (auth)</span>
              <span className="profile-detail-value" style={{ marginTop: 4 }}>
                {email}
              </span>
            </div>
            {engineProfile?.id ? (
              <div className="profile-detail-row" style={{ marginTop: 12 }}>
                <span className="profile-detail-label">User ID</span>
                <span className="profile-detail-value" style={{ fontFamily: 'var(--f-mono)', fontSize: '12px' }}>
                  {engineProfile.id}
                </span>
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="profile-close" style={{ position: 'static' }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveProfile}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--primary-dark, #1a365d)',
                color: '#fff',
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
                fontSize: '13px',
              }}
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
