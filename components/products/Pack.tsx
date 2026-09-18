import Image from 'next/image';
import type { Product } from '@/data/products';
import { assetPath } from '@/lib/site-path';
export default function Pack({ product, priority = false }: { product: Product; priority?: boolean }) {
  return <Image src={assetPath(product.image)} alt={`Sobre original de ${product.name}`} width={760} height={210} sizes="(max-width: 700px) 85vw, 54vw" priority={priority} unoptimized draggable={false} />;
}
