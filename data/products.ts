export type Product = {
  slug: string; name: string; subtitle: string; description?: string;
  benefits: { title: string; detail: string }[];
  image: string; accent: string;
  sceneConfig: { entryX: number; tilt: number; pourTilt: number; liquid: string };
};

// Official nutritional and habit characteristics per product
export const products: Product[] = [
  {
    slug: 'thermo-t',
    name: 'THERMO-T',
    subtitle: 'Energía para tu día · Activa tu rutina · Mezcla botánica',
    benefits: [
      { title: '⚡ Energía para tu día', detail: 'Acompaña un estilo de vida activo.' },
      { title: '🔥 Activa tu rutina', detail: 'Ideal para complementar tus momentos de movimiento y ejercicio.' },
      { title: '🍃 Mezcla botánica', detail: 'Con té verde y otros ingredientes de origen vegetal.' }
    ],
    image: '/products/thermo-t/pack.png',
    accent: '#ed8b47',
    sceneConfig: { entryX: 100, tilt: -12, pourTilt: 28, liquid: '#bb7130' }
  },
  {
    slug: 'nocarb-t',
    name: 'NOCARB-T',
    subtitle: 'Acompaña tus comidas · Balance nutricional · Aliado de tu rutina',
    benefits: [
      { title: '🍽️ Acompaña tus comidas', detail: 'Diseñado para complementar tu rutina de alimentación.' },
      { title: '⚖️ Balance nutricional', detail: 'Una opción pensada para acompañar un estilo de vida equilibrado.' },
      { title: '🌿 Aliado de tu rutina', detail: 'Fácil de incorporar como parte de tus hábitos diarios de alimentación.' }
    ],
    image: '/products/nocarb-t/pack.png',
    accent: '#e29a62',
    sceneConfig: { entryX: -120, tilt: 9, pourTilt: 23, liquid: '#a85b29' }
  },
  {
    slug: 'beauty-in',
    name: 'BEAUTY-IN',
    subtitle: 'Belleza desde el interior · Cuidado de la piel · Hábito de belleza',
    benefits: [
      { title: '✨ Belleza desde el interior', detail: 'Nutrición pensada para complementar tu rutina diaria de belleza.' },
      { title: '💧 Cuidado de la piel', detail: 'Acompaña tu rutina de cuidado personal desde la nutrición.' },
      { title: '🌸 Hábito de belleza', detail: 'Una forma práctica de integrar bienestar y belleza en tu día a día.' }
    ],
    image: '/products/beauty-in/pack.png',
    accent: '#d8b575',
    sceneConfig: { entryX: 40, tilt: -7, pourTilt: 20, liquid: '#c77b7c' }
  }
];

export const experienceCopy = {
  intro: { eyebrow: 'TRES PRODUCTOS. UN NUEVO HÁBITO.', title: 'NUTRICIÓN EN', titleEnd: 'MOVIMIENTO', invitation: 'Hay momentos que lo cambian todo.', scroll: 'Desliza para descubrir' },
  final: { eyebrow: 'EL SIGUIENTE MOMENTO ES TUYO', title: 'TRANSFORMA', titleEnd: 'TU RUTINA', description: 'Tres experiencias. Un nuevo hábito.' },
};
