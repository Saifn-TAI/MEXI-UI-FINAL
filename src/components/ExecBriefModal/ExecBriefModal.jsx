import { useApp } from '../../context/AppContext'

export default function ExecBriefModal() {
    const { showExecBrief, setShowExecBrief } = useApp()
    if (!showExecBrief) return null

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="modal-overlay" onClick={() => setShowExecBrief(false)}>
            <div className="modal exec-brief-modal eb-compact" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="eb-hdr">
                    <div className="eb-hdr-left">
                        <div className="eb-hdr-title">EXECUTIVE BRIEF</div>
                        <div className="eb-hdr-date">Veejei Automation · {today} · Operational Summary</div>
                    </div>
                    <button className="modal-close" onClick={() => setShowExecBrief(false)}>✕</button>
                </div>

                {/* Status bar */}
                <div className="eb-status-bar">
                    <div className="eb-status-badge eb-badge-r">
                        <span className="eb-badge-dot"></span>
                        OVERALL OPERATIONS: SYSTEM UNDER STRESS
                    </div>
                    <div className="eb-session-delta">Risk Increase: ₹82L vs prev session</div>
                </div>

                {/* Intelligence Strip */}
                <div className="eb-intel-strip">
                    <div className="eb-intel-cell eb-intel-r">
                        <div className="eb-intel-num">7</div>
                        <div className="eb-intel-lbl">CRITICAL SIGNALS</div>
                    </div>
                    <div className="eb-intel-cell eb-intel-a">
                        <div className="eb-intel-num">170</div>
                        <div className="eb-intel-lbl">OVERDUE ORDERS</div>
                    </div>
                    <div className="eb-intel-cell eb-intel-r">
                        <div className="eb-intel-num">535d</div>
                        <div className="eb-intel-lbl">MAX OVERDUE DAYS</div>
                    </div>
                    <div className="eb-intel-cell eb-intel-a">
                        <div className="eb-intel-num">3</div>
                        <div className="eb-intel-lbl">EXPIRED ASSET COVER</div>
                    </div>
                </div>

                {/* Top Risks */}
                <div className="eb-risks">
                    <div className="eb-block-label">PRIORITY OPERATIONAL RISKS</div>
                    <div className="eb-risk-row">
                        <span className="eb-risk-dot r"></span>
                        <span className="eb-risk-text">
                            <strong>Service Level Failure:</strong> 170 orders overdue. Critical delays on Toshiba (323d), Rotzler (504d), and Bull Machine (535d). OTD Rate currently at 58.3% against IATF 95% target.
                        </span>
                    </div>
                    <div className="eb-risk-row">
                        <span className="eb-risk-dot r"></span>
                        <span className="eb-risk-text">
                            <strong>Production Bottleneck:</strong> Order completion rate at 7.5% volume. 344 work orders stalled; machine fleet utilization currently at 43.4% against designed throughput.
                        </span>
                    </div>
                    <div className="eb-risk-row">
                        <span className="eb-risk-dot a"></span>
                        <span className="eb-risk-text">
                            <strong>Customer Concentration:</strong> ₹843L total exposure within Bonfiglioli order book. Current status stable, however fleet-wide OTD slippage creates high risk for contractual penalties.
                        </span>
                    </div>
                </div>

                {/* Directives */}
                <div className="eb-actions">
                    <div className="eb-block-label">MANAGEMENT DIRECTIVES</div>
                    <div className="eb-action-pills">
                        <div className="eb-pill">Direct escalation: Toshiba, Rotzler, Bull Machine</div>
                        <div className="eb-pill">Ring-fence Bonfiglioli work orders</div>
                        <div className="eb-pill">Restrict new BTPL WO releases</div>
                        <div className="eb-pill">OEM review for expired machine cover</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="eb-footer">
                    <button className="btn-cancel" onClick={() => setShowExecBrief(false)}>CLOSE</button>
                    <button className="btn-save">DOWNLOAD PDF</button>
                </div>
            </div>
        </div>
    )
}
