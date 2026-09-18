import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.TEST_URL || 'http://127.0.0.1:3110';
const output = 'test-results/phase05';
const totalDuration = 14.7;
const thermoStart = 1.55;
const thermoDuration = 4.4;
const states = [
  ['01-entry', .08], ['02-product', .16], ['03-opening', .33], ['04-pour', .51],
  ['05-water-impact', .62], ['06-mixing', .75], ['07-color-change', .86], ['08-final-hero', .95],
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  if (process.env.CAPTURE !== 'true') page.screenshot = async () => Buffer.alloc(0);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url); await page.waitForSelector('.is-cinematic');
  await page.locator('.thermo-video').evaluate(video => new Promise(resolve => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) resolve();
    else video.addEventListener('loadeddata', resolve, { once: true });
  }));
  const metadata = await page.locator('.thermo-video').evaluate(video => ({ duration: video.duration, width: video.videoWidth, height: video.videoHeight }));
  assert.equal(metadata.duration, 8, 'unexpected source duration');
  const seek = async (progress, mobile = false) => {
    const time = thermoStart + thermoDuration * progress;
    await page.evaluate(({ time, mobile, totalDuration }) => scrollTo(0, innerHeight * (mobile ? 13 : 16) * time / totalDuration), { time, mobile, totalDuration });
    await page.waitForTimeout(900);
  };
  for (const [name, progress] of states) {
    await seek(progress);
    const snapshot = await page.locator('#thermo-t').evaluate((scene, progress) => {
      const video = scene.querySelector('video'); const procedural = scene.querySelector('.thermo-procedural');
      const bounds = video.getBoundingClientRect();
      return { currentTime: video.currentTime, duration: video.duration, sourceProgress: +(scene.dataset.thermoVideoProgress || 0), paused: video.paused, opacity: +getComputedStyle(video).opacity, procedural: getComputedStyle(procedural).display, bounds: [bounds.width, bounds.height], overflow: document.documentElement.scrollWidth > innerWidth };
    }, progress);
    assert.ok(Math.abs(snapshot.currentTime - metadata.duration * snapshot.sourceProgress) < .12, `${name}: time desynchronized`);
    assert.equal(snapshot.paused, true, `${name}: video is playing independently`);
    assert.equal(snapshot.procedural, 'none', `${name}: procedural scene is visible`);
    assert.ok(snapshot.opacity > (progress === .08 ? .01 : .99) && snapshot.bounds[0] > 1200 && snapshot.bounds[1] > 700, `${name}: video layer missing`);
    assert.equal(snapshot.overflow, false, `${name}: horizontal overflow`);
    await page.screenshot({ path: `${output}/${name}.png` });
  }
  await seek(.95); const finalState = await page.locator('.thermo-video').evaluate(video => ({ time: video.currentTime, progress: +(video.closest('section').dataset.thermoVideoProgress || 0) }));
  await seek(.16); const reverseState = await page.locator('.thermo-video').evaluate(video => ({ time: video.currentTime, progress: +(video.closest('section').dataset.thermoVideoProgress || 0) }));
  assert.ok(reverseState.progress < finalState.progress && reverseState.time < finalState.time, 'reverse scroll does not reverse video');
  results.push('1280x720: 8 estados, tiempo de video, pausa, capa procedural y composición comprobados.');
  results.push('Reverse scroll: el tiempo vuelve de hero final a producto sin reproducción autónoma.');
  for (const viewport of [{ name: '390x844', width: 390, height: 844 }, { name: '573x844', width: 573, height: 844 }]) {
    await page.setViewportSize(viewport); await seek(.54, true);
    const mobile = await page.locator('#thermo-t').evaluate(scene => {
      const video = scene.querySelector('video').getBoundingClientRect(); const sceneBounds = scene.getBoundingClientRect();
      return { video: [video.width, video.height], scene: [sceneBounds.width, sceneBounds.height], overflow: document.documentElement.scrollWidth > innerWidth, objectPosition: getComputedStyle(scene.querySelector('video')).objectPosition };
    });
    assert.deepEqual(mobile.video, mobile.scene, `${viewport.name}: video does not cover scene`);
    assert.equal(mobile.overflow, false, `${viewport.name}: horizontal overflow`);
    await page.screenshot({ path: `${output}/mobile-${viewport.name}.png` });
  }
  results.push('390x844 y 573x844: video cubre escena sin deformación ni overflow horizontal.');
  await page.setViewportSize({ width: 1280, height: 720 }); await page.reload(); await page.waitForSelector('.is-cinematic');
  await page.getByRole('button', { name: 'Ver sin animación' }).click(); await page.waitForTimeout(350);
  assert.equal(await page.locator('.pin-spacer').count(), 0, 'static mode remains pinned');
  assert.ok(await page.locator('.thermo-video').evaluate(video => video.currentTime > video.duration * .9 && +getComputedStyle(video).opacity > .99), 'static mode lacks final video frame');
  results.push('Static mode: frame hero final visible, sin dependencia de ScrollTrigger.');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload(); await page.waitForTimeout(500);
  assert.equal(await page.locator('.pin-spacer').count(), 0, 'reduced motion remains pinned');
  assert.ok(await page.locator('.thermo-video').evaluate(video => video.currentTime > video.duration * .9), 'reduced motion lacks stable hero frame');
  results.push('Reduced motion: frame hero estable y contenido en flujo natural.');
  assert.deepEqual(errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify({ pass: true, metadata, results }, null, 2));
  console.log(JSON.stringify({ pass: true, metadata, results }, null, 2));
} finally { await browser.close(); }
