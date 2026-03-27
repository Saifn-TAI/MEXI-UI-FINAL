import React from 'react';

export default function IPWhatTab({ sig }) {
  const measHtml = sig.what.meas.map((m, i) => (
    <div key={i} className="ip-meas-tile"><div className="ip-meas-lbl">{m.l}</div><div className={`ip-meas-val ${m.c}`}>{m.v}</div></div>
  ));

  const t = sig.what.table;
  const tblHtml = t ? (
    <>
      <div className="ip-section-lbl">Evidence Data</div>
      <table className="ip-ev-table">
        <thead><tr>{t.h.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {t.r.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={ci === 0 ? 'ip-mono' : ''}>
                  <span className={t.c[ci] ? `ip-val-${t.c[ci]}` : ''}>{cell}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ) : null;

  return (
    <>
      <div className="ip-section-lbl">Signal Measurement</div>
      <div className="ip-meas-row">{measHtml}</div>
      {tblHtml}
    </>
  );
}
