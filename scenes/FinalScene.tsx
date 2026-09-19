import { experienceCopy, products } from '@/data/products';
import Pack from '@/components/products/Pack';
export default function FinalScene({ replay }: { replay: () => void }) {
  const copy = experienceCopy.final;
  return <section id="habito" className="final-scene scene" aria-labelledby="final-title">
    <div className="final-copy"><p className="eyebrow">{copy.eyebrow}</p><h2 id="final-title">{copy.title}<br /><span>{copy.titleEnd}</span></h2><p className="editorial-subtitle">{copy.description}</p></div>
    <div className="collection">{products.map(product => <div className={`collection-product ${product.slug}`} key={product.slug}><Pack product={product} /><span>{product.name}</span></div>)}</div>
    <div className="final-action">{copy.cta.href === '#inicio' ? <button className="text-link" onClick={replay}>{copy.cta.label} <span aria-hidden="true">↗</span></button> : <a className="text-link" href={copy.cta.href}>{copy.cta.label} <span aria-hidden="true">↗</span></a>}<p>Un espacio para descubrir tu próximo hábito.</p></div>
  </section>;
}
