'use client';
import { useEffect, useRef, useState } from 'react';
import Atmosphere from './Atmosphere';
import IntroScene from './IntroScene';
import ProductScene from '@/scenes/ProductScene';
import FinalScene from '@/scenes/FinalScene';
import WhatsAppButton from './WhatsAppButton';
import { products } from '@/data/products';

const chapters = ['Fuxion', ...products.map(p => p.name), 'Tu hábito'];
const ids = ['inicio', ...products.map(p => p.slug), 'habito'];
export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const controller = useRef<{ goTo: (chapter: number) => void; getProgress: () => number; destroy: () => void } | null>(null);
  const savedProgress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [staticView, setStaticView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const simple = staticView || reducedMotion;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); setReady(true); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!ready || simple || !root.current) return;
    let cancelled = false;
    const element = root.current;
    import('@/lib/animations/timeline').then(({ createExperience }) => {
      if (cancelled) return;
      element.classList.add('is-cinematic');
      controller.current = createExperience(element, setChapter, savedProgress.current);
    }).catch(() => { if (!cancelled) setStaticView(true); });
    return () => {
      cancelled = true;
      savedProgress.current = controller.current?.getProgress() ?? savedProgress.current;
      controller.current?.destroy(); controller.current = null; element.classList.remove('is-cinematic');
    };
  }, [ready, simple]);
  function goTo(index: number) {
    if (controller.current) {
      controller.current.goTo(index);
    } else {
      if (index === 4) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else {
        document.getElementById(ids[index])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setChapter(index);
  }
  return <main ref={root} className={`experience ${simple ? 'is-static' : ''}`}>
    <a className="skip-link" href="#habito" onClick={event => { event.preventDefault(); goTo(4); }}>Ir al cierre de la experiencia</a>
    <div className="cinema-stage">
      <header className="site-header"><button className="wordmark" aria-label="Fuxion, volver al inicio" onClick={() => goTo(0)}>FU<span>X</span>ION<span className="brand-dot">®</span></button><span className="header-caption">NUTRICIÓN EN MOVIMIENTO</span><button className="view-toggle" onClick={() => setStaticView(v => !v)} aria-pressed={simple} disabled={reducedMotion}>{simple ? 'Vista sin animación' : 'Ver sin animación'} <span aria-hidden="true">{simple ? '◉' : '◎'}</span></button></header>
      <Atmosphere />
      <IntroScene staticFrame={simple} />
      {products.map((product, index) => <ProductScene key={product.slug} product={product} index={index} staticFrame={simple} />)}
      <FinalScene replay={() => goTo(0)} />
      <footer className="experience-controls"><div className="timeline-track"><div className="timeline-fill" /></div><span className="chapter-count">0{chapter + 1}<span> / 05</span></span><nav aria-label="Capítulos de la experiencia">{chapters.map((label, index) => <button key={label} onClick={() => goTo(index)} aria-current={chapter === index ? 'step' : undefined}><span className="chapter-dot" />{label}</button>)}</nav><span className="scroll-caption">SCROLL PARA EXPLORAR <span aria-hidden="true">↓</span></span></footer>
    </div>
    <WhatsAppButton />
  </main>;
}
