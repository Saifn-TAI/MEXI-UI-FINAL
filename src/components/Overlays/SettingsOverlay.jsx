import React, { useState } from 'react';

export function SettingsOverlay({ isOpen, onClose, showToast }) {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    showToast('Preferences saved');
    onClose();
  };

  return (
    <div className="settings-overlay open" onClick={onClose}>
      <div className="settings-card pref-card" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="settings-hdr pref-hdr">
          <div className="settings-title">Settings</div>
          <div className="settings-close" onClick={onClose}>✕</div>
        </div>
        <div className="settings-body pref-body">


          <div className="pref-section" style={{ borderBottom: 'none' }}>
            <div className="pref-sec-title">Alerts</div>
            <div className="pref-sec-helper">When and how should MExI notify you?</div>
            <div className="pref-field-label">Alert Types</div>
            <div className="pref-toggles">
              <div className="pref-toggle-row">
                <span className="pref-toggle-label">Financial Risks</span>
                <div className="toggle on"></div>
              </div>
              <div className="pref-toggle-row">
                <span className="pref-toggle-label">Operational Issues</span>
                <div className="toggle on"></div>
              </div>
              <div className="pref-toggle-row">
                <span className="pref-toggle-label">Quality Issues</span>
                <div className="toggle"></div>
              </div>
            </div>

            <div className="pref-field-label" style={{ marginTop: '14px' }}>Severity</div>
            <div className="pref-radios">
              <label className="pref-radio-row"><input type="radio" name="severity" value="critical" defaultChecked /><span>Critical Only</span></label>
              <label className="pref-radio-row"><input type="radio" name="severity" value="high" /><span>Critical + High</span></label>
            </div>

            <div className="pref-field-label" style={{ marginTop: '14px' }}>Delivery</div>
            <div className="pref-seg">
              <div className="pref-seg-opt active">Instant</div>
              <div className="pref-seg-opt">Daily Summary</div>
            </div>

            <div className="pref-field-label" style={{ marginTop: '14px' }}>Channel</div>
            <div className="pref-checks">
              <label className="pref-check-row"><input type="checkbox" defaultChecked /><span>Email</span></label>
              <label className="pref-check-row"><input type="checkbox" checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} /><span>WhatsApp</span></label>
            </div>
            {whatsappEnabled && (
              <div className="pref-info-text">Messages will be sent to your registered mobile number</div>
            )}
          </div>
        </div>
        <div className="pref-footer">
          <div className="pref-cancel" onClick={onClose}>Cancel</div>
          <div className="pref-save" onClick={handleSave}>Save Settings</div>
        </div>
      </div>
    </div>
  );
}
