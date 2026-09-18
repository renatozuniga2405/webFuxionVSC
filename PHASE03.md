# Fase Cinemática 03 — Thermo T3

## Base inspeccionada

Se partió de la escena compartida `ProductScene`, el vaso CSS existente y la timeline GSAP. En esta carpeta no se encontró un Canvas anterior ni documentación identificada como Fase 02; se consultaron `DESIGN.md`, `README.md` y `VERIFICATION.md`. No se reconstruyó la landing ni se instalaron dependencias.

## Archivos modificados

Código existente:

1. `scenes/ProductScene.tsx`: elementos de boca y emisor, y Canvas exclusivamente para Thermo T3. El markup de los demás productos conserva su comportamiento anterior.
2. `lib/animations/timeline.ts`: conexión del refinamiento a la timeline original; progreso conservado al refrescar dimensiones; capítulo actualizado solo cuando cambia; desaparición del indicador de scroll al final.
3. `components/cinematic/Experience.tsx`: elimina la recreación por breakpoint y conserva el progreso al salir/entrar del modo animado.
4. `app/globals.css`: añade únicamente la importación del CSS específico de Thermo.
5. `scripts/verify.mjs`: ajusta el instante de comprobación de las características de Thermo a su nuevo reveal. Mantiene las pruebas de las otras escenas.

Archivos nuevos:

6. `lib/animations/thermo.ts`: secuencia determinista, geometría de boca, partículas e interacción con el líquido.
7. `app/thermo.css`: composición, apertura e iluminación limitadas a `.thermo-scene`.
8. `scripts/inspect-thermo.mjs`: evidencia de geometría y overflow anterior.
9. `scripts/verify-thermo.mjs`: capturas y verificaciones específicas de esta fase.
10. `scripts/phase03-baseline.json`: hashes de datos, assets y componentes que no deben cambiar.
11. `PHASE03.md`: este informe.

Next.js generó automáticamente `AGENTS.md` y `CLAUDE.md` al arrancar el servidor, y actualizó sus referencias de tipos en `next-env.d.ts`. No forman parte del diseño de la escena.

Evidencia generada en `test-results/phase03/`: capturas, galería HTML, diagnóstico inicial de overflow e informe JSON.

## Cambios realizados

### Composición

El producto ocupa un escenario acotado, con una zona inferior de líquido. En escritorio el copy queda a la izquierda; en móvil la acción precede al copy. El ancho del sobre respeta el espacio disponible, la envolvente de su rotación y el presupuesto de píxeles del JPEG original.

### Apertura

El sobre pasa de completo a inclinado, muestra tensión en la tira lateral, separa la tira y revela una boca con interior oscuro y borde cálido. Se conserva la fotografía y su proporción; el efecto se superpone mediante recorte y transformaciones. La boca continúa abierta después del vertido.

### Vertido

La boca y el emisor usan la misma transformación: posición, rotación y escala. Las partículas nacen en la posición de la boca en su instante de emisión. El flujo crece, se estabiliza y disminuye. Cada grano usa una trayectoria analítica con gravedad; al retroceder se obtiene el mismo estado sin acumular simulación.

### Vaso

Se reutiliza `Glass`. El agua ya está presente al llegar el polvo; cambia de tono y turbulencia sin fingir que el polvo aporta todo el volumen. El tiempo de vuelo determina el impacto: ondas superficiales y microgotas breves preceden a la bebida estabilizada.

### Iluminación

Se añaden reflejos cálidos al borde, pared y base del vaso; sombra de contacto, transparencia y brillo interior. El sobre y el líquido comparten la iluminación existente. No se rediseñó la atmósfera global.

### Responsive

Hay poses propias para móvil. Se mide el escenario mediante `ResizeObserver`. Canvas limita su resolución a DPR 2; el sobre calcula su máximo usando el DPR real y los 566 píxeles de anchura útil de la fuente. La vista estática conserva producto cerrado, vaso preparado, copy y navegación.

### Navegación

Se mantiene la timeline, duración total y navegación originales. Un resize actualiza medidas y restaura la fracción de progreso; cruzar un breakpoint ya no desmonta toda la experiencia. Las poses existentes de las otras escenas consultan el viewport al refrescar. Al finalizar desaparece «SCROLL PARA EXPLORAR»; no se añadió un CTA.

### Performance

Pool fijo de 220 partículas, reducido a la mitad en móvil. Sin simulación acumulativa, sin bucle RAF permanente y sin renders React por frame. Las referencias DOM se almacenan una vez. El observador y el listener de resize se eliminan al desmontar. El Canvas se dibuja solo cuando cambia el progreso o su tamaño.

## Validación visual

Script: `node scripts/verify-thermo.mjs`; acepta `TEST_URL` para dirigirlo al servidor de producción.

- Desktop: 1280 × 720, capturas de los diez estados solicitados.
- Mobile: 390 × 844, verificación de diez estados y capturas específicas 04, 06, 07 y 10.
- Narrow: 573 × 844, capturas de los diez estados.
- Barrido adicional de 57 posiciones intermedias para comprobar zonas seguras.
- Retroceso: comparación exacta del Canvas y la transformación del sobre en el mismo progreso; ausencia de polvo al cerrar.
- Resize y orientación, incluida 844 × 390: conservación aproximada del progreso y un solo pin.
- Navegación por capítulos, teclado, final del recorrido, modo estático manual y `prefers-reduced-motion`.
- Móvil DPR 3: presupuesto del asset y límite de resolución del Canvas.
- Hashes SHA-256: datos comerciales, fotografías, SVG de Thermo, `FinalScene` y `Atmosphere` intactos.

Los resultados ejecutados y sus medidas se registran en `test-results/phase03/report.json`; las capturas se revisan en `test-results/phase03/gallery.html`. Este informe no reemplaza el resultado del script.

## Problemas encontrados y límites

- No hay una imagen Thermo de mayor resolución en los assets del proyecto. La fuente es un JPEG de 704 × 255; el producto utiliza una ventana de 566 × 153. El ajuste evita ampliaciones indebidas, pero no recupera detalle que la foto no contiene.
- No se reprodujo overflow horizontal del documento en la inspección inicial de escritorio. Había capas ocultas escaladas fuera del encuadre, contenidas por el escenario. No se añadió `overflow-x: hidden` global; se acotaron las dimensiones reales de la acción de Thermo.
- La consola registra un 404 de `/favicon.ico`, también presente en la vista anterior. Se documenta por separado y se conserva fuera del alcance; no corresponde al Canvas ni a los assets del producto.
- Apertura y preparación son una ilusión 2D, no un video real ni simulación física de fluidos. No se validan dosis, proporciones de preparación o color real de la bebida.
- Se prueba Chrome de escritorio con distintos viewports y DPR, no dispositivos móviles físicos. No se promete una medición de 60 FPS en hardware real.

## Pendiente de producto

**NOCARB-T — discrepancia 5 g / 6 g pendiente de validación.** No se modificó el dato ni se decidió cuál es correcto.

## Resultado ejecutado

La compilación de producción está disponible en `http://localhost:3102`.

- `npm.cmd run build`: aprobado.
- `npm.cmd run typecheck`: aprobado.
- `TEST_URL=http://127.0.0.1:3102 node scripts/verify-thermo.mjs`: aprobado.
- `TEST_URL=http://127.0.0.1:3102 npm.cmd run test:experience`: aprobado.

Se comprobaron 30 estados principales y 57 posiciones intermedias. Se generaron 24 capturas de estados, más las vistas estática, reduced motion y DPR 3. El error máximo medido entre la boca DOM y el emisor Canvas fue **0,014 píxeles CSS**. La reproducción inversa produjo el mismo Canvas y la misma transformación del sobre.

Los criterios de aceptación de Thermo T3 se consideran cumplidos dentro de las resoluciones y estados comprobados: zonas seguras, proporción y límite de resolución, apertura visible, boca y emisor vinculados, flujo continuo, impacto/mezcla, iluminación, reveal, reversibilidad, ausencia de overflow del documento, responsive, progreso tras resize y composición estática. Los hashes confirman que no se alteraron los datos comerciales ni los assets originales.

Se ejecutaron todas las validaciones funcionales y visuales solicitadas. Permanece el 404 preexistente del favicon descrito arriba; no se declara la consola global libre de incidencias. La valoración de realismo sigue limitada por la fotografía de origen y la técnica 2D; no equivale a una filmación real ni a pruebas de rendimiento en dispositivos físicos.
