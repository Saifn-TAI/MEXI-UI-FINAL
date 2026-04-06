import { useApp } from '../../context/AppContext';
import { DASH } from '../../utils/mapEngineIntelligence';

export default function ExecBriefModal() {
  const { showExecBrief, setShowExecBrief, execBriefContent, engineTenant } = useApp();
  if (!showExecBrief) return null;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const tenantLine = engineTenant?.displayName?.trim() || DASH;

  return (
    <div className="modal-overlay" onClick={() => setShowExecBrief(false)}>
      <div className="modal exec-brief-modal eb-compact" onClick={(e) => e.stopPropagation()}>
        <div className="eb-hdr">
          <div className="eb-hdr-left">
            <div className="eb-hdr-title">EXECUTIVE BRIEF</div>
            <div className="eb-hdr-date">
              {tenantLine} · {today} · Operational Summary
            </div>
          </div>
          <button type="button" className="modal-close" onClick={() => setShowExecBrief(false)}>
            ✕
          </button>
        </div>

        <div className="eb-status-bar">
          <div className="eb-status-badge eb-badge-r">
            <span className="eb-badge-dot"></span>
            OVERALL: {DASH}
          </div>
          <div className="eb-session-delta">Session delta: {DASH}</div>
        </div>

        <div className="eb-intel-strip">
          <div className="eb-intel-cell eb-intel-r">
            <div className="eb-intel-num">{DASH}</div>
            <div className="eb-intel-lbl">CRITICAL SIGNALS</div>
          </div>
          <div className="eb-intel-cell eb-intel-a">
            <div className="eb-intel-num">{DASH}</div>
            <div className="eb-intel-lbl">OVERDUE ORDERS</div>
          </div>
          <div className="eb-intel-cell eb-intel-r">
            <div className="eb-intel-num">{DASH}</div>
            <div className="eb-intel-lbl">MAX OVERDUE DAYS</div>
          </div>
          <div className="eb-intel-cell eb-intel-a">
            <div className="eb-intel-num">{DASH}</div>
            <div className="eb-intel-lbl">OTHER</div>
          </div>
        </div>

        <div className="eb-risks">
          <div className="eb-block-label">PRIORITY OPERATIONAL RISKS</div>
          {execBriefContent ? (
            <div className="eb-risk-row">
              <span className="eb-risk-dot a"></span>
              <span className="eb-risk-text" style={{ whiteSpace: 'pre-wrap' }}>
                {execBriefContent}
              </span>
            </div>
          ) : (
            <div className="eb-risk-row">
              <span className="eb-risk-dot r"></span>
              <span className="eb-risk-text">{DASH}</span>
            </div>
          )}
        </div>

        <div className="eb-actions">
          <div className="eb-block-label">MANAGEMENT DIRECTIVES</div>
          <div className="eb-action-pills">
            <div className="eb-pill">{DASH}</div>
          </div>
        </div>

        <div className="eb-footer">
          <button type="button" className="btn-cancel" onClick={() => setShowExecBrief(false)}>
            CLOSE
          </button>
          <button type="button" className="btn-save">
            DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
  );
}
