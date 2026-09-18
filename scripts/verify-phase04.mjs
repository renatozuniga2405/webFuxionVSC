import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const url = process.env.TEST_URL || 'http://127.0.0.1:3105';
const output = 'test-results/phase04';
const states = [
  ['01-entrada', .06], ['02-hero', .22], ['03-inicio-apertura', .325], ['04-abierto', .43], ['05-inicio-vertido', .467],
  ['06-vertido-medio', .56], ['07-impacto', .60], ['08-mezcla', .68], ['09-fin-vertido', .80], ['10-reveal', .92],
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const findings = [], captures = [], errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) errors.push(message.text()); });
  await page.goto(url); await page.waitForSelector('.is-cinematic'); await page.waitForTimeout(700);
  const seek = async p => { await page.evaluate(progress => { const distance = innerHeight * (innerWidth < 700 ? 13 : 16); scrollTo(0, distance * (1.55 + progress * 3.5) / 14); }, p); await page.waitForTimeout(1150); };
  const inspect = () => page.evaluate(() => {
    const scene = document.querySelector('#thermo-t');
    const sachet = scene.querySelector('.sachet').getBoundingClientRect();
    const glass = scene.querySelector('.glass-assembly').getBoundingClientRect();
    const powder = scene.querySelector('.thermo-powder');
    const liquid = scene.querySelector('.thermo-liquid-canvas');
    const photo = scene.querySelector('.thermo-glass-photo');
    const emitter = scene.querySelector('.thermo-emitter').getBoundingClientRect();
    const stage = scene.querySelector('.product-stage').getBoundingClientRect();
    const origin = powder.dataset.origin.split(',').map(Number);
    const liquidPixels = (() => { const ctx = liquid.getContext('2d'); const { data } = ctx.getImageData(0, 0, liquid.width, liquid.height); let hit = 0; for (let i = 3; i < data.length; i += 32) hit += data[i] > 5; return hit; })();
    return {
      progress: +scene.dataset.thermoProgress, particles: +powder.dataset.particles, mix: +powder.dataset.mix, liquidPixels,
      naturalWidth: photo.naturalWidth, glassPhotoVisible: getComputedStyle(photo).display !== 'none' && +getComputedStyle(photo).opacity > .9,
      fallbackGlass: getComputedStyle(scene.querySelector('.glass')).display, waterBackground: scene.querySelector('.glass-liquid').style.background,
      overflow: document.documentElement.scrollWidth > innerWidth, bounded: [sachet, glass].every(r => r.left >= 0 && r.right <= innerWidth),
      emitterError: Math.hypot(emitter.x - stage.x - origin[0], emitter.y - stage.y - origin[1]), canvas: powder.toDataURL(),
    };
  });
  let midCanvas;
  for (const viewport of [{ name: 'desktop', width: 1280, height: 720 }, { name: 'mobile', width: 390, height: 844 }, { name: 'narrow', width: 573, height: 844 }]) {
    await page.setViewportSize(viewport); await page.waitForTimeout(650);
    for (const [name, progress] of states) {
      await seek(progress); const check = await inspect();
      assert.equal(check.overflow, false, `${viewport.name}/${name}: horizontal overflow`);
      assert.equal(check.bounded, true, `${viewport.name}/${name}: product out of safe zone`);
      assert.ok(check.emitterError < 1, `${viewport.name}/${name}: emitter drift`);
      assert.ok(check.naturalWidth > 700 && check.glassPhotoVisible, `${viewport.name}/${name}: photographic glass missing`);
      assert.equal(check.fallbackGlass, 'none', `${viewport.name}/${name}: legacy CSS glass shown`);
      if (progress < .44) assert.equal(check.particles, 0, `${viewport.name}/${name}: powder before opening`);
      if (progress > .45 && progress < .7) assert.ok(check.particles > 0, `${viewport.name}/${name}: stream missing`);
      if (progress > .85) { assert.equal(check.particles, 0); assert.ok(check.mix > .99); assert.ok(check.liquidPixels > 10, 'final liquid cloud missing'); }
      if (viewport.name === 'desktop') { const file = `${name}.png`; await page.screenshot({ path: `${output}/${file}` }); captures.push({ state: name, file }); }
      if (viewport.name === 'desktop' && name === '06-vertido-medio') midCanvas = check.canvas;
    }
    findings.push(`${viewport.width}x${viewport.height}: diez estados, zona segura, emisor, recorte de vidrio y ausencia de desborde validados.`);
  }
  await page.setViewportSize({ width: 1280, height: 720 }); await seek(.56); const reverseBaseline = (await inspect()).canvas;
  await seek(.22); assert.equal((await inspect()).particles, 0, 'reverse playback leaves powder');
  await seek(.56); assert.equal((await inspect()).canvas, reverseBaseline, 'reverse playback must reconstruct powder');
  findings.push('Desplazamiento inverso: la nube de polvo se reconstruye de forma determinista.');
  await page.getByRole('button', { name: /^Ver sin animaci/ }).click(); await page.waitForTimeout(400); await page.getByRole('button', { name: 'THERMO T3', exact: true }).click();
  assert.equal(await page.locator('.pin-spacer').count(), 0); assert.ok(await page.locator('#thermo-t .thermo-glass-photo').isVisible());
  findings.push('Vista estÃ¡tica manual: el vaso y el sachet permanecen visibles sin ScrollTrigger.');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload(); await page.waitForTimeout(600); await page.getByRole('button', { name: 'THERMO T3', exact: true }).click();
  assert.equal(await page.locator('.pin-spacer').count(), 0); assert.ok(await page.locator('#thermo-t .thermo-glass-photo').isVisible());
  await page.screenshot({ path: `${output}/reduced-motion.png` }); findings.push('Reduced motion: vista estable con vidrio fotogrÃ¡fico y producto visible.');
  const hashes = JSON.parse(await readFile(new URL('./phase03-baseline.json', import.meta.url), 'utf8'));
  for (const [file, hash] of Object.entries(hashes)) assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), hash, `out-of-scope modification: ${file}`);
  assert.deepEqual(errors, []); findings.push('Los archivos protegidos de las escenas ajenas conservan sus SHA-256 de Fase 03; no hubo errores de navegador.');
  const selected = new Set(['02-hero', '07-impacto', '08-mezcla', '09-fin-vertido', '10-reveal']);
  await writeFile(`${output}/comparison.html`, `<!doctype html><meta charset="utf-8"><title>Fase 04 — comparación visual</title><style>body{margin:32px;background:#11100e;color:#eee;font:15px system-ui}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}img{display:block;width:100%;background:#050505}figure{margin:0}figcaption{padding:10px 0 24px;color:#c8b9a4}h1{font-weight:500}.note{max-width:70ch;line-height:1.5}</style><h1>Thermo T3 — Fase 04</h1><p class="note">Comparación cualitativa: las referencias se usan sólo para dirección de luz, polvo y resultado de mezcla. No se evalúa identidad de producto ni coincidencia píxel a píxel.</p><main>${[...selected].map(state => `<figure><img src="../../public/references/a_wide_cinematic_high_end_product_advertisement.png"><figcaption>Referencia visual — ${state}</figcaption></figure><figure><img src="${state}.png"><figcaption>Implementación — ${state}</figcaption></figure>`).join('')}</main>`);
  await writeFile(`${output}/report.json`, JSON.stringify({ pass: true, findings, captures }, null, 2));
  console.log(JSON.stringify({ pass: true, findings }, null, 2));
} finally { await browser.close(); }
