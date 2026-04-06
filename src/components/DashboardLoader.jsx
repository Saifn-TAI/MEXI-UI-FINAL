import React from 'react';

// Builds a clean gear path: outerR = tip radius, innerR = root radius, teeth count, tooth arc width in degrees
function gearPath(cx, cy, outerR, innerR, teeth, toothArc) {
  const step = (Math.PI * 2) / teeth;
  const half = (toothArc * Math.PI) / 180 / 2;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const base = i * step - Math.PI / 2;
    // root -> tip -> tip -> root
    const a0 = base - step / 2 + half * 0.3;
    const a1 = base - half;
    const a2 = base + half;
    const a3 = base + step / 2 - half * 0.3;
    const p = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const [x0, y0] = p(a0, innerR);
    const [x1, y1] = p(a1, outerR);
    const [x2, y2] = p(a2, outerR);
    const [x3, y3] = p(a3, innerR);
    if (i === 0) d += `M ${x0} ${y0}`;
    else d += ` L ${x0} ${y0}`;
    d += ` L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;
  }
  return d + ' Z';
}

export default function DashboardLoader() {
  const cx = 60, cy = 60;
  const gear = gearPath(cx, cy, 52, 38, 10, 22);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(245,247,247,0.85)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{ position: 'relative', width: 120, height: 120 }}>

        {/* Spinning gear */}
        <svg
          width="120" height="120"
          viewBox="0 0 120 120"
          style={{ position: 'absolute', inset: 0, animation: 'mexiSpinGear 2.4s linear infinite' }}
        >
          {/* Solid dark gear body */}
          <path d={gear} fill="#0C1F1E" />
          {/* White filled inner circle */}
          <circle cx={cx} cy={cy} r="26" fill="white" />
          {/* Subtle inner ring */}
          <circle cx={cx} cy={cy} r="26" fill="none" stroke="#555" strokeWidth="2.5" />
        </svg>

        {/* Stable lowercase m — does NOT spin */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'Bruno Ace SC', system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 400,
            color: '#14B8A6',
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}>M</span>
        </div>
      </div>
    </div>
  );
}
