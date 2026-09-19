import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { Product } from '@/data/products';
import Pack from '@/components/products/Pack';
import Glass from '@/components/cinematic/Glass';
import { assetPath } from '@/lib/site-path';
export default function ProductScene({ product, index, staticFrame }: { product: Product; index: number; staticFrame: boolean }) {
  const thermo = product.slug === 'thermo-t';
  const nocarb = product.slug === 'nocarb-t';
  const beauty = product.slug === 'beauty-in';
  const cinematicVideo = thermo || nocarb || beauty;
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!cinematicVideo || !video.current) return;
    const element = video.current;
    if (!staticFrame) return;
    const setFrame = () => { if (Number.isFinite(element.duration)) element.currentTime = element.duration * .94; };
    setFrame(); element.addEventListener('loadedmetadata', setFrame);
    return () => element.removeEventListener('loadedmetadata', setFrame);
  }, [cinematicVideo, staticFrame]);
  return <section id={product.slug} className={`product-scene scene${thermo ? ' thermo-scene' : ''}${nocarb ? ' nocarb-scene' : ''}${beauty ? ' beauty-scene' : ''}`} aria-labelledby={`${product.slug}-title`} style={{ '--scene-accent': product.accent, '--liquid': product.sceneConfig.liquid } as CSSProperties}>
    {thermo && <div className="thermo-video-layer" aria-hidden="true"><video ref={video} className="thermo-video" muted playsInline preload="auto" poster={assetPath('/videos/thermo-t/thermo-t-poster.png')}><source media="(max-width: 699px)" src={assetPath('/videos/thermo-t/thermo-t.mp4')} type="video/mp4" /><source src={assetPath('/videos/thermo-t/thermo-t-preparation-v2.mp4')} type="video/mp4" /></video></div>}
    {nocarb && <div className="nocarb-video-layer" aria-hidden="true"><video ref={video} className="nocarb-video" muted playsInline preload="metadata" poster={assetPath('/videos/nocarb-t/nocarb-t-poster.png')}><source media="(max-width: 699px)" src={assetPath('/videos/nocarb-t/nocarb-t.mp4')} type="video/mp4" /><source src={assetPath('/videos/nocarb-t/nocarb-t-preparation-v2.mp4')} type="video/mp4" /></video></div>}
    {beauty && <div className="beauty-video-layer" aria-hidden="true"><video ref={video} className="beauty-video" muted playsInline preload="metadata" poster={assetPath('/videos/beauty-in/beauty-in-poster.png')}><source media="(max-width: 699px)" src={assetPath('/videos/beauty-in/beauty-in.mp4')} type="video/mp4" /><source src={assetPath('/videos/beauty-in/beauty-in-preparation-v2.mp4')} type="video/mp4" /></video></div>}
    <div className="editorial-scrim" aria-hidden="true" />
    <div className="scene-watermark" aria-hidden="true">{product.name}</div>
    <div className="product-content-panel">
      <div className="product-editorial"><p className="eyebrow">0{index + 1} <span /> EL HÁBITO</p><h2 id={`${product.slug}-title`}>{product.name}</h2><p className="editorial-subtitle">{product.subtitle}</p>{product.description && <p className="product-description">{product.description}</p>}</div>
      <div className="product-panel-divider" aria-hidden="true" />
      <div className="product-notes">{product.benefits.map((benefit, i) => <div className="product-note" key={benefit.title}><span className="note-index">0{i + 1}</span><div><h3>{benefit.title}</h3><p>{benefit.detail}</p></div></div>)}</div>
      <p className="preparation-note">Preparación ilustrativa · Consulta las indicaciones del empaque.</p>
    </div>
    <div className={`product-stage${thermo ? ' thermo-procedural' : ''}${nocarb ? ' nocarb-procedural' : ''}${beauty ? ' beauty-procedural' : ''}`} aria-hidden="true">
      {thermo && <div className="thermo-studio-light" />}
      <div className="sachet"><div className="sachet-body"><Pack product={product} priority={index === 0} /></div><div className="sachet-tear"><Pack product={product} priority={index === 0} /></div>{thermo && <><div className="thermo-mouth" /><i className="thermo-emitter" /></>}</div>
      {thermo ? <canvas className="thermo-powder" /> : <div className="powder">{Array.from({ length: 28 }, (_, i) => <i className="powder-grain" key={i} style={{ left: `${(i * 17) % 100}%`, top: `${(i * 31) % 100}%`, width: `${i % 3 + 1}px`, height: `${i % 4 + 2}px` }} />)}</div>}
      {/* Reusing one studio prop gives the three chapters a cohesive film language. */}
      <Glass photoreal />
    </div>
  </section>;
}
