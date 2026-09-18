# Fase Cinemática 04 — Thermo T3 photoreal upgrade

## Alcance ejecutado

La intervención se limita a la escena `#thermo-t`. Se conservaron la estructura `ProductScene`, la línea de tiempo GSAP, la navegación, los estados estáticos y el modo de movimiento reducido. No se tocó contenido ni visuales de NOCARB-T, BEAUTY-IN, final ni atmósfera global.

## Recursos y tratamiento

- El sachet conserva el asset original existente: `public/products/thermo-t/original.jpeg`. Sólo recibió sombra y un reflejo CSS muy tenue; no se escaló por encima del presupuesto físico de la fuente.
- Se añadió `public/products/thermo-t/glass-photoreal-v1-trim.png`, un recorte con alfa de **781 × 1015 px**. Es una imagen generada para esta interfaz, no una fotografía suministrada por Fuxion. El original generado se conserva como `glass-photoreal-v1.png`; `scripts/prepare-glass.mjs` recorta sus márgenes transparentes para el uso web.
- Prompt de producción del recurso: vaso premium bajo, recto y transparente, vacío, frontal a tres cuartos, paredes gruesas, borde superior nítido, reflejo ámbar lateral, base pesada y sombra de contacto, fondo alfa; sin bebida, hielo, etiqueta, texto, logotipo, manos ni objetos.
- Las imágenes de `public/references/` se consultaron exclusivamente como dirección de fotografía, luz, polvo y evolución de mezcla. No se usan como fondos, no se recortaron dentro de la escena y no aportan texto ni afirmaciones de producto.

## Vaso, líquido y polvo

El vaso deja de ser la silueta CSS de baja fidelidad durante Thermo T3 y usa el recorte fotográfico. El agua está presente antes del vertido y evoluciona mediante una capa de líquido y un canvas interno: inicia clara y cálida, recibe un penacho marrón claro, remolinos y anillos de impacto, y termina como té claro traslúcido. Se evitó deliberadamente un color naranja opaco.

El canvas de partículas usa una reserva determinista de 286 partículas con tamaños y dispersión distintos: grano, micrograno y neblina. El flujo sale del emisor geométrico del sachet, llega a la superficie, activa una corona de impacto, microgotas y turbulencia, y desaparece al concluir. El cálculo depende del progreso de GSAP, por lo que al retroceder se recompone sin un bucle temporal independiente.

## Luz y composición

La luz de estudio de Thermo T3 tiene halo ámbar suave y bokeh discreto. El sachet mantiene su zona segura respecto al texto y la navegación; el vaso queda separado de la lectura editorial. El resultado busca un marrón de té ligero dentro del vidrio, con reflejos blancos del vaso preservados encima de las capas de líquido.

## Rendimiento y accesibilidad

- Canvas principal y canvas de líquido limitan DPR a 2.
- No hay RAF adicional ni simulación aleatoria por reloj: el render se actualiza desde el progreso de ScrollTrigger/GSAP.
- En modo estático y `prefers-reduced-motion`, el mecanismo de pinning se desactiva y permanece una composición estable con sachet y vaso visibles.
- La imagen del vaso se entrega recortada, sin fondo opaco, y el asset original del producto sigue siendo el asset de producto de la escena.

## Validación y evidencia

El validador ejecutable es `scripts/verify-phase04.mjs`. Produce diez capturas de escritorio, revisión de 1280×720, 390×844 y 573×844, reversibilidad, vista estática, reduced motion, protección SHA-256 de archivos fuera de alcance y la comparación cualitativa `test-results/phase04/comparison.html`.

La comparación empareja los estados 02, 07, 08, 09 y 10 con la referencia. Es una revisión de intención visual, no una afirmación de coincidencia píxel a píxel: el paquete usado en la implementación conserva el asset original y, por tanto, no reproduce el empaque mostrado en las referencias.

## Límite pendiente

**ASSET REQUIRED (para una fidelidad comercial superior):** no se proporcionó una fotografía de estudio del vaso real ni una foto de producto de alta resolución del Thermo T3. El recorte generado mejora materialmente el vaso frente al wireframe, pero una fotografía/licencia de estudio del vaso y un master de empaque de mayor resolución permitirían igualar reflejos, borde y microdetalle con mayor precisión.

También permanece la discrepancia previa de datos de NOCARB-T (5 g / 6 g); no se modificó porque queda fuera del alcance de Thermo T3.
