# Fase 10 — auditoría E2E del scroll cinematográfico

## 1. Problema reportado

Se reportó que el prólogo FUXION podía parecer detenido, saltar frames o perder sincronía con el scroll. Esta auditoría separó el MP4, su seeking y la timeline global antes de modificar parámetros.

## 2. Arquitectura encontrada

`Experience.tsx` carga `createExperience`. `timeline.ts` crea un solo `ScrollTrigger`: `trigger: root`, `start: top top`, `end: 16 * viewport` en desktop (13 en mobile), `pin: .cinema-stage`, `scrub: 0.75`. INTRO no tiene trigger ni pin propio.

Los cuatro videos usan `createScrollVideoScene`: progreso GSAP -> target determinista -> `currentTime`, con threshold de 0.03 s y retención solo del último target si hay un seek pendiente. No hay autoplay, RAF de video, `setInterval` ni React state por frame.

## 3. Mapa completo del scroll

| Chapter | Timeline start/end | Video duration | Video mapping | Pin/scrub | Transition |
| --- | ---: | ---: | --- | --- | --- |
| FUXION INTRO | 0.00–2.45 | 4.01 s | Piecewise, 0–98% | Global / 0.75 | Fades before Thermo |
| THERMO-T | 3.00–6.60 video; scene to 7.30 | 8.00 s | Linear | Global / 0.75 | Editorial exit to NOCARB |
| NOCARB-T | 7.20–11.20 video; scene to 11.92 | 8.00 s | Piecewise, 0–98% | Global / 0.75 | Overlap to BEAUTY |
| BEAUTY-IN | 11.70–15.80 video; scene to 16.70 | 8.00 s | Piecewise, 0–98% | Global / 0.75 | Existing final handoff |

Desktop scroll distance is 16 viewports. INTRO therefore occupies approximately 1.95 viewports of the global scroll. It is not governed by a second competing trigger.

## 4. Auditoría FUXION INTRO

Archivo real: `public/videos/intro/fuxion-intro-v1.mp4`; 4.01 s, 1280x720, 2,242,797 bytes. El navegador informó `readyState=4` antes de la prueba y no produjo errores de página.

El mapping es determinista y piecewise. Muestras E2E reales a 1280x720:

| Scroll global | scrollY | Intro progress | currentTime | readyState |
| ---: | ---: | ---: | ---: | ---: |
| 0% | 0 | 0.00000 | 0.000 s | 4 |
| 2% | 230 | 0.15768 | 0.243 s | 4 |
| 5% | 576 | 0.39490 | 1.158 s | 4 |
| 10% | 1152 | 0.78980 | 3.092 s | 4 |
| 18% | 2074 | 1.00000 | 3.930 s | 4 |

El frame inicial fue estable: `scrollY=0`, `currentTime=0`, opacidad 1 y un solo pin. El hero se mantiene en 3.9298 s sin escrituras redundantes gracias al threshold.

## 5. Causa raíz del problema del prólogo

**No se reprodujo una causa técnica de fallo en el entorno de prueba.** La evidencia descarta, para este entorno, un MP4 que no pueda hacer seek, una falta de metadata, un trigger duplicado y un reset de `currentTime`.

La percepción de aceleración tiene una causa de diseño medible: el prólogo completa su tramo de video durante los primeros ~12% del scroll global (1.95 viewports), y su mapping es intencionalmente no lineal para preservar el hero. Esto no es evidencia suficiente para cambiar duración, `scrub`, threshold ni encoding sin validarlo en el dispositivo donde se reportó el síntoma.

## 6. Corrección aplicada

No se aplicó corrección al sistema de scroll. Cambiarlo habría sido un ajuste a ciegas y habría contravenido la auditoría. Se añadió únicamente el diagnóstico reproducible `scripts/audit-phase10-intro.mjs` y su salida `test-results/phase10/intro-audit.json`.

## 7. INTRO -> THERMO

El único pin persistió durante la transición. INTRO llega al hero final y THERMO se mantiene preloaded; no se observaron errores de página ni autoplay. La revisión visual en hardware real sigue pendiente.

## 8–12. Productos y transiciones

La arquitectura mantiene un solo video activo por tween y prepara el siguiente con `preload`. Los controladores no actualizan `currentTime` de escenas lejanas. Las transiciones editorial y de video existentes no se modificaron en esta fase.

## 13–18. E2E, reverse, fast scroll, refresh, navegación y mobile

La regresión existente `npm.cmd run test:experience` valida desktop, 390x844, 573x844, cambios rápidos de dirección, remount cinematic/static, reduced motion, no-JS, un pin y ausencia de overflow. Esta auditoría añadió el muestreo específico del INTRO forward. No se afirma una prueba manual de wheel/trackpad/touch ni refresh en cada checkpoint porque el entorno automatizado no reproduce esos dispositivos físicos.

## 19. Performance

Un ScrollTrigger, un RAF no recurrente de restauración tras refresh, cero RAF de video, cero timers recurrentes, cero React renders por scrub. El threshold es 0.03 s; es menor que un frame a 24 fps (0.0417 s) y el coalescing preserva solo el último target.

## 20. Video encoding analysis

No se encontró `ffprobe`/`ffmpeg` en el entorno, por lo que FPS, GOP, keyframes, pixel format y faststart no se certifican. El test aislado sí midió seeks exactos: 0.6–31.1 ms forward y 1.4–24.3 ms reverse, con `readyState=4`. No se creó `fuxion-intro-scroll.mp4` porque no hay evidencia de mejora necesaria.

## 21. Files modified

- `scripts/audit-phase10-intro.mjs`
- `docs/FASE-10-E2E-SCROLL-AUDIT.md`

## 22. Remaining limitations

- Falta `ffprobe` para confirmar GOP/keyframes.
- Falta reproduccion en el dispositivo y gesto exactos donde se reportó el síntoma.
- No se midieron heap/decoder nativo ni touch/trackpad físico.

## 23. Verdict

REQUIRES FURTHER OPTIMIZATION

El intro se comportó correctamente en el entorno automatizado y no justifica un parche. El veredicto se mantiene conservador hasta medir GOP y reproducir el gesto/dispositivo reportado.
