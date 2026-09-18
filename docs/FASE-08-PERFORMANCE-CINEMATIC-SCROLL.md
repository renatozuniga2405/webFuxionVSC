# Fase 08 — auditoría de performance del scroll cinematográfico

Fecha de auditoría: 2026-09-18. Alcance: FUXION INTRO, THERMO-T, NOCARB-T y BEAUTY-IN. No se modificaron composición, texto, claims, colores, escenarios ni archivos MP4.

## 1. Arquitectura encontrada

`components/cinematic/Experience.tsx` monta las cuatro escenas de video y carga bajo demanda `lib/animations/timeline.ts`. Ese módulo crea una sola timeline GSAP con un único `ScrollTrigger` que fija `.cinema-stage`; la timeline actualiza objetos `state.progress` de cada capítulo. Los controladores de video escriben en propiedades DOM del elemento `<video>`, no en estado React.

La mejora aplicada conserva esta arquitectura: `lib/animations/scroll-video.ts` centraliza la sincronización de los cuatro videos, y los adaptadores por capítulo conservan sus curvas de progreso existentes.

## 2. ScrollTriggers encontrados

| Trigger | Scene | Pin | Scrub | Purpose | Status |
| --- | --- | --- | --- | --- | --- |
| Timeline global, sin ID | `.experience` / `.cinema-stage` | Sí | `0.75` | Progreso cinematográfico, visibilidad y capítulos | Unico; validado en carga, resize y dos remounts |

No existen `ScrollTrigger.create`, timelines por `ProductScene` ni `scrollTrigger` adicionales en los componentes inspeccionados. Las pruebas observaron exactamente un `.pin-spacer` en modo cinematográfico, cero en modo estático, y uno otra vez después de cada remount.

## 3. Videos

| Video | Duration | Resolution | FPS | Codec | Size | Bitrate aprox. | Keyframe/GOP | Status |
| --- | ---: | --- | --- | --- | ---: | ---: | --- | --- |
| `fuxion-intro-v1.mp4` | 4.01 s | 1280x720 | No medido | `avc1` marker | 2,242,797 B | 4.47 Mb/s | No medido | Apto en pruebas de scrub |
| `thermo-t-preparation.mp4` | 8.00 s | 1280x720 | No medido | `avc1` marker | 2,271,372 B | 2.27 Mb/s | No medido | Apto en pruebas de scrub |
| `nocarb-t-preparation-v1.mp4` | 8.00 s | 1280x720 | No medido | `avc1` marker | 2,780,100 B | 2.78 Mb/s | No medido | Apto en pruebas de scrub |
| `beauty-in-preparation-v1.mp4` | 8.00 s | 1280x720 | No medido | `avc1` marker | 2,356,657 B | 2.36 Mb/s | No medido | Apto en pruebas de scrub |

La resolución y duración se comprobaron desde `HTMLVideoElement`; el marcador `avc1` se detectó en el contenedor MP4. `ffprobe`/`ffmpeg` no están instalados en este entorno, por eso no se inventan FPS, pixel format, keyframe spacing ni GOP. No se hizo reencoding porque la interacción comprobada no mostró black frames, bloqueo ni desincronización; esa conclusión debe revisarse con `ffprobe` y un perfil en hardware móvil real antes de producir variantes `-scroll.mp4`.

## 4. Problemas encontrados

| Síntoma/riesgo | Causa confirmada | Severidad | Solución |
| --- | --- | --- | --- |
| Las cuatro fuentes podían competir al cargar | Los cuatro elementos usaban `preload="auto"` | Media | NOCARB y BEAUTY comienzan en `metadata`; se elevan a `auto` solo antes de su capítulo |
| Una ráfaga de scroll podía encadenar seeks | El umbral de 30 ms evitaba escrituras cercanas, pero no coalescía una petición mientras el seek anterior estaba pendiente | Media | Cada controlador guarda solo el último target durante `seeking` y lo aplica en `seeked` |
| El test histórico no representaba la duración/times actuales y apuntaba a un puerto no usado | `scripts/verify.mjs` seguía configurado para la etapa anterior | Media para regresión | `test:experience` usa ahora el verificador Fase 08 actual |
| Long Task de carga de 68–72 ms | Observado por `PerformanceObserver` al inicio en Chrome headless | Baja, pendiente | No atribuido sin perfil; no ocurre evidencia de que sea un long task de scrub |

## 5. Cambios realizados

- `lib/animations/scroll-video.ts`: controlador común con threshold de 0.03 s, cola de último destino y cleanup de listeners.
- `lib/animations/{intro,thermo-video,nocarb-video,beauty-video}.ts`: adaptadores a ese controlador; las curvas narrativas se mantienen.
- `scenes/ProductScene.tsx`: NOCARB y BEAUTY pasan de `auto` a `metadata`; el frame final solo se solicita en static/reduced motion.
- `components/cinematic/IntroScene.tsx`: evita escribir `currentTime = 0` en la ruta cinematográfica.
- `lib/animations/timeline.ts`: prepara NOCARB y BEAUTY al aproximarse a la transición, sin reproducirlos ni scrubbearlos fuera de su capítulo.
- `scripts/verify-phase08.mjs` y `package.json`: prueba de regresión vigente para esta experiencia.

## 6. Video seeking

La fuente de verdad sigue siendo `scroll -> timeline global -> chapter progress -> target currentTime`. El threshold es 0.03 s. Si el video no está haciendo seek, el target se escribe solo cuando se aleja más que ese umbral de `currentTime`. Si está haciendo seek, los targets intermedios se reemplazan por el último; `seeked` procesa únicamente ese último destino. No hay `play()`, `pause()` como simulación de scrub, `requestAnimationFrame` de video ni cola creciente de seeks.

## 7. Video lifecycle

| Momento | Intro | Thermo | NOCARB | BEAUTY |
| --- | --- | --- | --- | --- |
| Carga inicial | Active/preload auto | Next/preload auto | Metadata | Metadata |
| Thermo | Inactivo, pausado | Active scrub | Se prepara antes de su transición | Metadata |
| NOCARB | Inactivo, pausado | Inactivo, pausado | Active scrub | Se prepara antes de su transición |
| BEAUTY | Inactivo, pausado | Inactivo, pausado | Inactivo, pausado | Active scrub |

Todos permanecen pausados. Una fuente puede conservar buffer tras haber sido preparada, pero solo el capítulo gobernado por la timeline recibe cambios de `currentTime`.

## 8. React

`Experience.tsx` usa React state únicamente para capítulo, modo estático/reduced motion y preparación del controlador. No hay `setState` dentro de `ScrollTrigger.onUpdate`, handlers de scroll, RAF ni controlador de video. El scrub se mantiene en refs, objetos GSAP y propiedades DOM.

## 9. RAF / timers

No se encontraron `setInterval`, timers recurrentes ni RAF de video. Hay un único `requestAnimationFrame` en `timeline.ts`, usado una vez tras `ScrollTrigger.refresh` para restaurar el progreso de resize; se cancela en `destroy`.

## 10. Canvas / capas procedurales

Hay canvas procedurales históricos en la escena Thermo (`thermo-powder`, `thermo-liquid-canvas`), pero la ruta cinematográfica oculta `.thermo-procedural` con `display:none` y la timeline actual no invoca `lib/animations/thermo.ts`. NOCARB y BEAUTY tampoco tienen controlador procedural activo en esta ruta. No se borró código histórico.

## 11. Preload

Inicialmente solo INTRO y THERMO usan `preload="auto"`. NOCARB y BEAUTY usan `metadata`, y la timeline eleva cada próximo video a `auto` antes de la transición. La elevación prepara red/buffer, no reproduce ni hace seeks sobre el video siguiente.

## 12. Encoding

No hubo reencoding. H.264/`avc1` fue detectado en los cuatro archivos. Falta inspección de GOP y keyframes porque no hay `ffprobe`; por eso no puede emitirse aprobación del encoding de scroll en particular. Si perfiles en dispositivos reales revelan reverse seeks lentos, el siguiente paso acotado es medir GOP y probar copias H.264 `yuv420p` con `faststart` y GOP corto, sin reemplazar originales.

## 13. Desktop tests

En 1280x720: cuatro videos con metadata, un pin, cero overflow, todos pausados. Intro y Thermo iniciaron con `auto`; NOCARB y BEAUTY con `metadata`. El recorrido y capturas de intro, Thermo, NOCARB y BEAUTY pasaron.

## 14. Mobile tests

En 390x844 y 573x844: un pin, cero overflow, cuatro videos pausados, metadata disponible y recorrido completo pasado. El máximo observado fue un Long Task de carga de 72 ms; no se midió GPU, energía ni memoria nativa del decoder.

## 15. Reverse tests

Se realizaron cambios DOWN/UP/DOWN/UP alrededor de INTRO↔THERMO, THERMO↔NOCARB y NOCARB↔BEAUTY, más saltos entre inicio, mitad y BEAUTY. No hubo error de página, pin adicional, video reproduciéndose ni metadata perdida. Esta prueba no sustituye un perfil de frame-by-frame en un teléfono físico.

## 16. Fast scroll test

La secuencia incluyó un salto hasta BEAUTY, regreso a INTRO y saltos sucesivos a NOCARB y BEAUTY. Al asentarse, los cuatro videos seguían pausados y disponibles; el pin siguió siendo uno, sin overflow ni excepciones. La estrategia de último target evita acumular los destinos intermedios.

## 17. Memory

Se validaron dos ciclos cinematic→static→cinematic: el pin fue 1→0→1, no quedaron escenas `inert` y no se detectaron nodos de video duplicados. No se dispone de profiling de heap, detached DOM nodes o memoria de decoder en Chrome headless, por lo que no se declara una medición de memoria completa.

## 18. Build/tests

- `npm.cmd run typecheck`: aprobado.
- `npm.cmd run test:experience`: aprobado; incluye desktop, 390x844, 573x844, dirección rápida, static mode, reduced motion y no-JS.
- No existe un script `lint` en `package.json`; por ello no se puede informar un lint ejecutado sin agregar tooling ajeno al alcance.
- `npm.cmd run build`: aprobado; compilación de producción y generación estática completadas.

## 19. Limitaciones

- El entorno no ofrece `ffprobe`/`ffmpeg`; FPS, GOP, keyframes y pixel format no se verificaron.
- El profiling se realizó en Chrome headless, no en CPU/GPU/decoder de teléfonos reales.
- Se observó un Long Task inicial de 68–72 ms. No se atribuye una causa concreta sin un trace de DevTools.
- No se midió heap ni memoria nativa del decoder durante recorridos repetidos.

## 20. Veredicto

REQUIRES FURTHER OPTIMIZATION

La estabilidad funcional y los riesgos de preload/seek storm fueron corregidos y pasaron pruebas reales de interacción. Sin embargo, el Long Task de carga y la falta de evidencia de GOP/keyframes, memoria y perfil en hardware móvil impiden afirmar que el scroll esté completamente optimizado.
