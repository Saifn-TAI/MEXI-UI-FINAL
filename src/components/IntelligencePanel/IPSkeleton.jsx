import React from 'react';

export default function IPSkeleton() {
  return (
    <div className="ip-skeleton" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="skel-row" style={{ display: 'flex', gap: '10px' }}>
        <div className="skel-box" style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--surface-3)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skel-line" style={{ width: '60%', height: '14px', borderRadius: '4px', background: 'var(--surface-3)', animation: 'pulse 1.5s infinite' }} />
          <div className="skel-line" style={{ width: '40%', height: '14px', borderRadius: '4px', background: 'var(--surface-3)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div className="skel-block" style={{ height: '80px', borderRadius: '8px', background: 'var(--surface-3)', animation: 'pulse 1.5s infinite' }} />
      <div className="skel-block" style={{ height: '120px', borderRadius: '8px', background: 'var(--surface-3)', animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}
