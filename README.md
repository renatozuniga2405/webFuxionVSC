# Fuxion — Nutrición en movimiento

Experiencia editorial en español con Next.js App Router, React, TypeScript, Tailwind CSS 4 y una timeline GSAP/ScrollTrigger cargada bajo demanda.

```sh
npm install
npm run dev -- --port 3100
```

Abrir http://localhost:3100. En PowerShell con scripts bloqueados, usar `npm.cmd`.

## Edición

- `data/products.ts`: nombres, descripciones, características, iluminación y CTA final. Sin contacto comercial suministrado, el CTA repite la experiencia; puede cambiarse por una URL real.
- `lib/animations/timeline.ts`: apertura, vertido, mezcla, transiciones y posiciones de capítulos.
- `app/globals.css`: composición, tokens, iluminación y adaptación móvil.
- `public/products/{thermo-t,nocarb-t,beauty-in}/`: originales y ventanas SVG de recorte. `node scripts/prepare-assets.mjs` regenera los SVG sin modificar los bytes de las fotografías.

El asset entregado dice **THERMO T3**, por eso ese nombre se utiliza en pantalla, conservando la ruta `thermo-t` pedida. Los textos describen solo datos del empaque; no se afirman beneficios médicos. La preparación es una ilustración estilizada y no determina dosis, temperatura ni volumen.

## Comportamiento

El documento es legible sin JavaScript. Tras cargar GSAP se fija una sola escena y el scroll nativo controla toda la película, en ambas direcciones. Los capítulos permiten saltar con teclado o toque. `prefers-reduced-motion` y el botón “Ver sin animación” muestran todos los productos en flujo normal. Los listeners y ScrollTriggers se limpian al cambiar de vista o desmontar.

No hay comercio, analítica, sonido ni contacto inventado. Para la siguiente fase de realismo se necesitan fotografías de mayor resolución, video de preparación o una secuencia aprobada; la resolución de las fotografías de WhatsApp limita el detalle en pantallas grandes.

## Verificación

```sh
npm run typecheck
npm run build
npm run test:experience
```

El último comando requiere servidor en puerto 3100 y Google Chrome instalado. Se puede cambiar el destino con `TEST_URL`. Las capturas y el reporte se guardan en `test-results/`.

Referencia de implementación: [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) y [limpieza con gsap.context](https://gsap.com/docs/v3/GSAP/gsap.context()).
