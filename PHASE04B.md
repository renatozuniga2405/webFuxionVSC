# Fase Cinemática 04B — Thermo T3

## Alcance

Refinamiento visual limitado a `app/thermo.css` y `lib/animations/thermo.ts` dentro de la escena Thermo T3. Se mantienen `ProductScene`, GSAP, navegación, textos, layout editorial, asset oficial del sachet, `products.ts`, las otras escenas y la atmósfera global.

## Ajustes realizados

- **Agua inicial:** el volumen visible se elevó a una lectura aproximada de 60–70% del vaso. Usa un degradado frío/transparente, superficie horizontal clara y luces ambientales, sin el gris opaco de la versión previa.
- **Polvo:** se reemplazó el núcleo lineal por una reserva determinista de 640 partículas y una capa granular compacta. Hay grano de núcleo, micrograno, dispersión lateral y haze suave; todos nacen desde la geometría de la boca del sachet.
- **Impacto:** se retiraron los anillos y el trazo central. El contacto usa sólo micrograno desplazado y una perturbación pequeña, adecuada a polvo seco.
- **Nube y difusión:** el canvas interno compone 19 lóbulos suaves, desplazados y difuminados más 52 flecks suspendidos. La nube aparece bajo el punto de impacto, baja, se abre y pierde flecks al homogenizarse. No depende del reloj.
- **Bebida final:** la capa base sube gradualmente desde agua clara a té marrón claro/dorado de baja opacidad; el fondo sigue siendo perceptible.
- **Vaso:** se conserva `glass-photoreal-v1-trim.png`. Se reforzaron sombra de contacto, reflejo ámbar lateral y highlight de borde/base. Las capas de líquido quedan limitadas al interior del vaso.

## Reversibilidad y rendimiento

No se añadió `requestAnimationFrame`, temporizador ni azar por frame. Los offsets provienen de la función semilla existente y el render responde únicamente al progreso GSAP. Los dos canvas continúan limitados a DPR 2 y no generan renders React por frame.

## Validación

`scripts/verify-phase04b.mjs` produjo las capturas de 1280×720 de los estados 04–10 y verificó esos mismos estados en 390×844 y 573×844: sin desborde horizontal, con vaso/agua visibles, flujo activo en el vertido y mezcla final estabilizada.

La comparación cualitativa está en `test-results/phase04b/comparison.html`. La referencia se usa sólo para evaluar material, luz, agua, polvo y mezcla; no se copian su paquete, logos, tipografías ni composición.

## Limitación real

La nube se genera proceduralmente porque no se entregaron overlays o fotografía de mezcla real con transparencia. El resultado evita las primitivas gráficas de la versión anterior y preserva la reversibilidad, pero una serie de assets fotográficos de nube/agua con licencia permitiría más microdetalle de producto que un canvas a escala de este layout.
