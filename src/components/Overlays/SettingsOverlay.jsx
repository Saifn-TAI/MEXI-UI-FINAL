import React, { useState, useEffect } from 'react';
import {
  getEngineMyPreferences,
  patchEngineMyPreferences,
  getPreferenceScope,
} from '../../services/signalsEngineApi';
import {
  mapPreferencesFromApi,
  mapPreferenceScopeFromApi,
  formatPreferenceScopeLine,
} from '../../utils/mapEnginePreferences';

const selectStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--bd, #e0e0e0)',
  background: 'var(--surface, #fff)',
  color: 'var(--ink, #111)',
  fontSize: '13px',
  fontFamily: 'var(--f-body, inherit)',
};

const THEME_OPTS = ['dark', 'light', 'system'];
const DENSITY_OPTS = ['comfortable', 'compact'];

/**
 * Opens: GET /me/preferences + GET /preferences/scope (non-blocking).
 * Save: PATCH /me/preferences with theme, density, alert fields (same card layout).
 */
export function SettingsOverlay({ isOpen, onClose, showToast }) {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [severity, setSeverity] = useState('');
  const [theme, setTheme] = useState('');
  const [density, setDensity] = useState('');
  const [scopeLine, setScopeLine] = useState('—');
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    setPrefsLoading(true);
    setTheme('');
    setDensity('');
    setSeverity('');
    setWhatsappEnabled(false);
    (async () => {
      try {
        const [rawPrefs, rawScope] = await Promise.all([
          getEngineMyPreferences().catch(() => null),
          getPreferenceScope().catch(() => null),
        ]);
        if (cancelled) return;
        const mapped = rawPrefs ? mapPreferencesFromApi(rawPrefs) : null;
        if (mapped?.theme) setTheme(mapped.theme);
        if (mapped?.density) setDensity(mapped.density);
        if (mapped?.whatsappEnabled !== undefined) setWhatsappEnabled(!!mapped.whatsappEnabled);
        if (mapped?.severity) setSeverity(mapped.severity);
        const sc = rawScope ? mapPreferenceScopeFromApi(rawScope) : null;
        setScopeLine(formatPreferenceScopeLine(sc));
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Settings] load prefs/scope', e?.message || e);
        setScopeLine('—');
      } finally {
        if (!cancelled) setPrefsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { whatsapp_enabled: whatsappEnabled };
      if (theme) payload.theme = theme;
      if (density) payload.density = density;
      if (severity) payload.severity_filter = severity;
      const res = await patchEngineMyPreferences(payload);
      const msg =
        res && typeof res === 'object' && typeof res.status === 'string'
          ? res.status === 'saved'
            ? 'Preferences saved'
            : String(res.status)
          : res?.message || 'Preferences saved';
      showToast(msg);
      onClose();
    } catch (e) {
      showToast(e?.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay open" onClick={onClose}>
      <div className="settings-card pref-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-hdr pref-hdr">
          <div className="settings-title">Settings</div>
          <div className="settings-close" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="settings-body pref-body">
          <div className="pref-section" style={{ borderBottom: '1px solid var(--bd-2, #eee)', paddingBottom: '16px', marginBottom: '12px' }}>
            <div className="pref-sec-title">Appearance</div>
            <div className="pref-sec-helper">
              {prefsLoading ? 'Loading preferences…' : `Preference scope: ${scopeLine}`}
            </div>
            <div className="pref-field-label">Theme</div>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={selectStyle} aria-label="Theme">
              <option value="">—</option>
              {theme && !THEME_OPTS.includes(theme) ? <option value={theme}>{theme}</option> : null}
              {THEME_OPTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="pref-field-label" style={{ marginTop: '14px' }}>
              Density
            </div>
            <select value={density} onChange={(e) => setDensity(e.target.value)} style={selectStyle} aria-label="Density">
              <option value="">—</option>
              {density && !DENSITY_OPTS.includes(density) ? <option value={density}>{density}</option> : null}
              {DENSITY_OPTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

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

            <div className="pref-field-label" style={{ marginTop: '14px' }}>
              Severity
            </div>
            <div className="pref-radios">
              <label className="pref-radio-row">
                <input type="radio" name="severity" value="critical" checked={severity === 'critical'} onChange={() => setSeverity('critical')} />
                <span>Critical Only</span>
              </label>
              <label className="pref-radio-row">
                <input type="radio" name="severity" value="high" checked={severity === 'high'} onChange={() => setSeverity('high')} />
                <span>Critical + High</span>
              </label>
              <label className="pref-radio-row">
                <input type="radio" name="severity" value="" checked={severity === ''} onChange={() => setSeverity('')} />
                <span>— (not set)</span>
              </label>
            </div>

            <div className="pref-field-label" style={{ marginTop: '14px' }}>
              Delivery
            </div>
            <div className="pref-seg">
              <div className="pref-seg-opt active">Instant</div>
              <div className="pref-seg-opt">Daily Summary</div>
            </div>

            <div className="pref-field-label" style={{ marginTop: '14px' }}>
              Channel
            </div>
            <div className="pref-checks">
              <label className="pref-check-row">
                <input type="checkbox" defaultChecked />
                <span>Email</span>
              </label>
              <label className="pref-check-row">
                <input type="checkbox" checked={whatsappEnabled} onChange={(e) => setWhatsappEnabled(e.target.checked)} />
                <span>WhatsApp</span>
              </label>
            </div>
            {whatsappEnabled && <div className="pref-info-text">Messages will be sent to your registered mobile number</div>}
          </div>
        </div>
        <div className="pref-footer">
          <div className="pref-cancel" onClick={onClose}>
            Cancel
          </div>
          <div className="pref-save" onClick={() => !saving && handleSave()} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Settings'}
          </div>
        </div>
      </div>
    </div>
  );
}
