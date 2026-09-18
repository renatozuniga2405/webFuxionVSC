export type Product = {
  slug: string; name: string; subtitle: string; description: string;
  benefits: { title: string; detail: string }[];
  image: string; accent: string;
  sceneConfig: { entryX: number; tilt: number; pourTilt: number; liquid: string };
};

// Only characteristics readable on the supplied packaging. Benefits require approved evidence.
export const products: Product[] = [
  { slug: 'thermo-t', name: 'THERMO T3', subtitle: 'Un momento para activar tu ritual.',
    description: 'Una mezcla de té para darle otro ritmo a tu día.',
    benefits: [{ title: 'Mix de tés', detail: 'La base de tu nuevo ritual.' }, { title: 'Una mezcla singular', detail: 'Con los ingredientes declarados en su empaque.' }],
    image: '/products/thermo-t/pack.svg', accent: '#ed8b47',
    sceneConfig: { entryX: 100, tilt: -12, pourTilt: 28, liquid: '#bb7130' } },
  { slug: 'nocarb-t', name: 'NOCARB-T', subtitle: 'Haz una pausa. Disfruta el momento.',
    description: 'El sabor de la manzana y la canela, en un pequeño ritual cotidiano.',
    benefits: [{ title: 'Manzana y canela', detail: 'Sabor indicado en el empaque.' }, { title: '6 g por sobre', detail: 'Presentación individual.' }],
    image: '/products/nocarb-t/pack.svg', accent: '#e29a62',
    sceneConfig: { entryX: -120, tilt: 9, pourTilt: 23, liquid: '#a85b29' } },
  { slug: 'beauty-in', name: 'BEAUTY-IN', subtitle: 'El arte de dedicarte un momento.',
    description: 'Una pausa que empieza contigo. Descubre lo que hay en cada sobre.',
    benefits: [{ title: 'Péptidos de colágeno bioactivo', detail: 'Ingrediente declarado en el empaque.' }, { title: 'Q10 & biotina natural', detail: 'Una combinación en tu presentación individual.' }],
    image: '/products/beauty-in/pack.svg', accent: '#d8b575',
    sceneConfig: { entryX: 40, tilt: -7, pourTilt: 20, liquid: '#c77b7c' } },
];

export const experienceCopy = {
  intro: { eyebrow: 'TRES PRODUCTOS. UN NUEVO RITUAL.', title: 'NUTRICIÓN EN', titleEnd: 'MOVIMIENTO', invitation: 'Hay momentos que lo cambian todo.', scroll: 'Desliza para descubrir' },
  final: { eyebrow: 'EL SIGUIENTE MOMENTO ES TUYO', title: 'TRANSFORMA', titleEnd: 'TU RUTINA', description: 'Tres experiencias. Un nuevo ritual.', cta: { label: 'Volver a vivir la experiencia', href: '#inicio' } },
};
