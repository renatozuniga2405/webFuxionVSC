import type { CSSProperties } from 'react';
export default function Atmosphere() {
  return <div className="atmosphere" aria-hidden="true">
    <div className="overhead-light" /><div className="backlight" /><div className="horizon" /><div className="floor-light" />
    <div className="ambient-particles">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 23 + 17) % 90}%`, '--size': `${i % 3 + 1}px`, opacity: 0.12 + (i % 5) * 0.08 } as CSSProperties} />)}</div>
    <div className="transition-light" /><div className="grain" />
  </div>;
}
