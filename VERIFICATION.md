# Verificación de la primera implementación

Comprobado sobre la compilación de producción en `http://127.0.0.1:3100`.

- `npm.cmd run build`: correcto. Ruta principal prerenderizada; comprobación TypeScript incluida.
- `npm.cmd run typecheck`: correcto.
- `npm.cmd run test:experience`: correcto. Revelación de los tres empaques, vasos, características, navegación por capítulos, scroll inverso, CTA de repetición, alternancia de vista estática y reconstrucción de una sola timeline al cambiar de escritorio a móvil.
- Navegador Chrome real mediante Playwright: escritorio 1440 × 900 y móvil 390 × 844; comprobación adicional de desbordamiento a 320 × 568. Sin excepciones de navegador.
- `prefers-reduced-motion`: sin pinning, sin escenas inertes, todos los productos accesibles en flujo normal.
- Sin JavaScript: contenido de los productos legible.
- Revisión visual de capturas de introducción, productos, preparación, cierre y móvil. Se corrigió la superposición del sobre con el texto móvil y se amplió la tipografía de detalles.
- `designmd lint DESIGN.md`: cero errores y cero advertencias.
- Instalación tras actualizar Sharp: auditoría npm con cero vulnerabilidades reportadas.

Las capturas y el informe automatizado se generan en `test-results/`.

## Alcance y límites

- La animación de preparación es una ilustración 2D con fotografías originales, recorte vectorial, partículas y vaso CSS. No es una simulación física ni un video de preparación real. Los colores del líquido son dirección artística, no una representación validada de la bebida.
- No se midieron FPS en dispositivos físicos; las pruebas de móvil utilizan viewport de navegador, no hardware móvil.
- No se afirma conformidad WCAG completa ni se ha hecho una matriz exhaustiva de lectores de pantalla.
- El auditor estático opcional de la skill (`audit_project.py`) se intentó ejecutar, pero Python no está disponible en PATH. La compilación, el linter de diseño y las pruebas reales de navegador sí se ejecutaron.
- El material de WhatsApp limita la nitidez al ampliar los sobres. Las fotografías no fueron regeneradas ni retocadas; el SVG incorpora los JPEG originales y delimita su silueta.
- El nombre THERMO T3 proviene del empaque entregado. No se incorporan beneficios médicos, dosis ni resultados comerciales sin evidencia.
- El CTA final se configura en `data/products.ts`; por defecto repite la experiencia. No hay ecommerce ni envío de datos.
