import React from 'react';
import { DASH } from '../../utils/mapEngineIntelligence';

export default function TopbarDataTrust({ showToast, engineBootstrap, engineDataSync }) {
  const time = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const datePart = `Synced ${time.getDate()} ${months[time.getMonth()]}`;
  const syncParts = [engineDataSync?.statusText, engineDataSync?.lastRunText].filter(
    (x) => x != null && String(x).trim() !== ''
  );
  const bootParts = [engineBootstrap?.statusLabel, engineBootstrap?.envLabel].filter(
    (x) => x != null && String(x).trim() !== ''
  );
  const tail = syncParts.length
    ? syncParts.map((x) => String(x).trim()).join(' · ')
    : bootParts.length
      ? bootParts.map((x) => String(x).trim()).join(' · ')
      : DASH;
  const syncTxt = `${datePart} · ${tail}`;

  const syncHint = syncParts.length
    ? `Data sync: ${syncParts.join(' · ')}`
    : bootParts.length
      ? `Engine: ${bootParts.join(' · ')}`
      : DASH;

  return (
    <div className="data-trust" onClick={() => showToast(syncHint)} style={{ marginLeft: '6px' }}>
      <div className="dt-dot"></div>
      <span id="sync-txt">{syncTxt}</span>
    </div>
  );
}
