import { qrMatrix } from '../../lib/qr.js';

// Renders a scannable QR code as crisp SVG (prints sharply at any card size).
export default function QrCode({ value, size = 160, label = 'QR code for the feedback page' }) {
  const m = value ? qrMatrix(value) : null;
  if (!m) {
    return (
      <div role="img" aria-label="QR code unavailable" style={{ width: size, height: size, display: 'grid', placeItems: 'center', background: '#f5f5f5', fontSize: 12, color: '#555', textAlign: 'center', padding: 8 }}>
        Link too long for a QR code
      </div>
    );
  }
  const quiet = 4;
  const n = m.length + quiet * 2;
  let d = '';
  m.forEach((row, r) => row.forEach((on, c) => { if (on) d += `M${c + quiet} ${r + quiet}h1v1h-1z`; }));
  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" style={{ display: 'block', background: '#fff' }}>
      <path d={d} fill="#000" />
    </svg>
  );
}
