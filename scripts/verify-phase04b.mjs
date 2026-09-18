import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.TEST_URL || 'http://127.0.0.1:3110';
const out = 'test-results/phase04b';
const states = [['04-abierto', .43], ['05-inicio-polvo', .467], ['06-flujo-medio', .56], ['07-impacto', .60], ['08-nube-difusion', .68], ['09-fin-vertido', .80], ['10-bebida-final', .92]];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url); await page.waitForSelector('.is-cinematic'); await page.waitForTimeout(600);
  const seek = async p => { await page.evaluate(progress => { const length = innerHeight * (innerWidth < 700 ? 13 : 16); scrollTo(0, length * (1.55 + progress * 3.5) / 14); }, p); await page.waitForTimeout(1100); };
  for (const viewport of [{ name: 'desktop', width: 1280, height: 720 }, { name: 'mobile', width: 390, height: 844 }, { name: 'narrow', width: 573, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const [name, p] of states) {
      await seek(p);
      const check = await page.locator('#thermo-t').evaluate(scene => {
        const photo = scene.querySelector('.thermo-glass-photo'); const liquid = scene.querySelector('.glass-liquid');
        const powder = scene.querySelector('.thermo-powder'); const stage = scene.querySelector('.product-stage').getBoundingClientRect();
        const pack = scene.querySelector('.sachet').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, photo: photo.naturalWidth, liquidHeight: liquid.getBoundingClientRect().height, particles: +powder.dataset.particles, mix: +powder.dataset.mix, bounded: pack.left >= 0 && pack.right <= innerWidth && stage.left >= 0 };
      });
      assert.equal(check.overflow, false, `${viewport.name}/${name}: horizontal overflow`); assert.ok(check.photo > 700 && check.liquidHeight > 40, `${viewport.name}/${name}: water/glass missing`); assert.equal(check.bounded, true, `${viewport.name}/${name}: unsafe composition`);
      if (p >= .467 && p < .8) assert.ok(check.particles > 0, `${viewport.name}/${name}: dry powder missing`);
      if (p >= .92) assert.ok(check.mix > .99 && check.particles === 0, `${viewport.name}/${name}: final state invalid`);
      if (viewport.name === 'desktop') await page.screenshot({ path: `${out}/${name}.png` });
    }
    results.push(`${viewport.width}x${viewport.height}: estados 04–10, vaso con agua, polvo, mezcla y límites de pantalla comprobados.`);
  }
  assert.deepEqual(errors, []);
  const panels = states.map(([name]) => `<figure><img src="${name}.png"><figcaption>${name}</figcaption></figure>`).join('');
  await writeFile(`${out}/comparison.html`, `<!doctype html><meta charset="utf-8"><title>Thermo T3 Fase 04B</title><style>body{margin:28px;background:#111;color:#eee;font:14px system-ui}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}img{width:100%;display:block;background:#050505}figure{margin:0}figcaption{padding:8px 0 18px;color:#cfbca7}</style><h1>Thermo T3 — Fase 04B</h1><p>Referencia de material a la izquierda; implementación validada a la derecha. Comparación cualitativa de agua, grano, nube y té final.</p><main><figure><img src="../../public/references/thermo-phase04b-material-reference.png"><figcaption>Referencia de material</figcaption></figure><figure><img src="04-abierto.png"><figcaption>04 — agua inicial</figcaption></figure>${panels}</main>`);
  await writeFile(`${out}/report.json`, JSON.stringify({ pass: true, results }, null, 2)); console.log(JSON.stringify({ pass: true, results }, null, 2));
} finally { await browser.close(); }
