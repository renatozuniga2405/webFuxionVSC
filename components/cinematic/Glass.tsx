import Image from 'next/image';
import { assetPath } from '@/lib/site-path';

export default function Glass({ photoreal = false }: { photoreal?: boolean }) {
  return <div className="glass-assembly" aria-hidden="true">
    <div className="glass-shadow" />
    <div className="glass-liquid"><div className="liquid-surface" /><div className="liquid-swirl" /><div className="liquid-glow" /></div>
    {photoreal && <><canvas className="thermo-liquid-canvas" /><Image className="thermo-glass-photo" src={assetPath('/products/thermo-t/glass-photoreal-v1-trim.png')} alt="" width={805} height={1056} sizes="(max-width: 700px) 28vw, 12vw" unoptimized /></>}
    <div className="glass"><div className="glass-rim" /><div className="glass-shine" /><div className="glass-bottom" /></div>
  </div>;
}
