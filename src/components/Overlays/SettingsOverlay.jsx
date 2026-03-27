import React, { useState } from 'react';

export function SettingsOverlay({ isOpen, onClose, showToast }) {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [priorityData, setPriorityData] = useState({ revenue: false, cost: true, operations: true, quality: false });
  const [sensitivity, setSensitivity] = useState('1');

  if (!isOpen) return null;

  const togglePriority = (key) => {
    setPriorityData(prev => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (!prev[key] && activeCount >= 3) {
        showToast('Max 3 priorities allowed');
        return prev;
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleSave = () => {
    showToast('Preferences saved');
    onClose();
  };

  const sensLabels = ['Low — Major issues only', 'Medium — Important issues', 'High — Early signals'];

  return (
    <div className="settings-overlay open" onClick={onClose}>
      <div className="settings-card pref-card" onClick={e => e.stopPropagation()}>
        <div className="settings-hdr pref-hdr">
          <div>
            <div className="settings-title">Preferences</div>
            <div className="pref-summary">
              MExI will monitor Cost and Operations risks across All Plants and notify you instantly for Critical issues via Email.
            </div>
          </div>
          <div className="settings-close" onClick={onClose}>✕</div>
        </div>
        <div className="settings-body pref-body">
          <div className="pref-section">
            <div className="pref-sec-title">Business Focus</div>
            <div className="pref-sec-helper">What should MExI prioritise?</div>
            <div className="pref-field-label">Priority <span className="pref-field-hint">Pick up to 3</span></div>
            <div className="pref-chips">
              <div className={`pref-chip ${priorityData.revenue ? 'active' : ''}`} onClick={() => togglePriority('revenue')}>Revenue</div>
              <div className={`pref-chip ${priorityData.cost ? 'active' : ''}`} onClick={() => togglePriority('cost')}>Cost</div>
              <div className={`pref-chip ${priorityData.operations ? 'active' : ''}`} onClick={() => togglePriority('operations')}>Operations</div>
              <div className={`pref-chip ${priorityData.quality ? 'active' : ''}`} onClick={() => togglePriority('quality')}>Quality</div>
            </div>
            <div className="pref-field-label" style={{ marginTop: '14px' }}>Scope</div>
            <select className="pref-select">
              <option value="all">All Plants</option>
              <option value="a">Plant A</option>
              <option value="b">Plant B</option>
              <option value="x">Region X</option>
            </select>
          </div>

          <div className="pref-section">
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

          <div className="pref-section" style={{ borderBottom: 'none' }}>
            <div className="pref-sec-title">Sensitivity</div>
            <div className="pref-sec-helper">How early should MExI flag issues?</div>
            <div className="pref-slider-wrap">
              <input type="range" min="0" max="2" step="1" value={sensitivity} className="pref-slider" onChange={(e) => setSensitivity(e.target.value)} />
              <div className="pref-slider-labels">
                <span>Low<br /><small>Major issues only</small></span>
                <span style={{ textAlign: 'center' }}>Medium<br /><small>Important issues</small></span>
                <span style={{ textAlign: 'right' }}>High<br /><small>Early signals</small></span>
              </div>
              <div className="pref-slider-value">{sensLabels[parseInt(sensitivity)]}</div>
            </div>
          </div>
        </div>
        <div className="pref-footer">
          <div className="pref-cancel" onClick={onClose}>Cancel</div>
          <div className="pref-save" onClick={handleSave}>Save Preferences</div>
        </div>
      </div>
    </div>
  );
}
