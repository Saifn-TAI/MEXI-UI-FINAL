import React from 'react';

export default function TopbarDataTrust({ showToast }) {
  const time = new Date();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const syncTxt = `Synced ${time.getDate()} ${months[time.getMonth()]} · 08:14`;

  return (
    <div className="data-trust" onClick={() => showToast('3 sources active · SAP B1 · Machine Shop · Order Book · High confidence')} style={{marginLeft:'6px'}}>
      <div className="dt-dot"></div><span id="sync-txt">{syncTxt}</span>
    </div>
  );
}
