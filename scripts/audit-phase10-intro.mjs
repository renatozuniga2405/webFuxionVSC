import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.TEST_URL || 'http://localhost:3110';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { isolated: [], e2e: [], errors: [] };
try {
  await mkdir('test-results/phase10', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.setContent(`<video muted playsinline preload="auto" src="${url}/videos/intro/fuxion-intro-v1.mp4"></video>`);
  await page.locator('video').evaluate(video => new Promise((resolve, reject) => { const ready = () => video.readyState >= 1 && Number.isFinite(video.duration); if (ready()) resolve(); else { video.addEventListener('loadedmetadata', () => ready() && resolve(), { once: true }); video.addEventListener('error', () => reject(video.error), { once: true }); } }));
  const metadata = await page.locator('video').evaluate(video => ({ duration: video.duration, width: video.videoWidth, height: video.videoHeight, readyState: video.readyState }));
  for (const time of [0, .25, .5, .75, 1, 1.5, 2, 2.5, 3, 3.5, 3.93, 3.5, 3, 2.5, 2, 1.5, 1, .5, 0]) {
    const measurement = await page.locator('video').evaluate((video, time) => new Promise(resolve => {
      const started = performance.now();
      video.addEventListener('seeked', () => resolve({ requested: time, actual: video.currentTime, elapsed: performance.now() - started, readyState: video.readyState }), { once: true });
      video.currentTime = time;
    }), time);
    report.isolated.push(measurement);
  }
  await page.close();

  const e2e = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  e2e.on('pageerror', error => report.errors.push(error.message));
  await e2e.goto(url, { waitUntil: 'networkidle' });
  await e2e.waitForSelector('.is-cinematic');
  for (const progress of [0, .02, .05, .10, .18, .28, .42, .58, .76, .92]) {
    await e2e.evaluate(progress => window.scrollTo(0, innerHeight * 16 * progress), progress);
    await e2e.waitForTimeout(900);
    report.e2e.push(await e2e.evaluate(progress => {
      const video = document.querySelector('.intro-video'); const section = document.querySelector('#inicio');
      return { progress, scrollY, mappedProgress: Number(section.dataset.introProgress || 0), currentTime: video.currentTime, duration: video.duration, readyState: video.readyState, opacity: Number(getComputedStyle(video).opacity), pins: document.querySelectorAll('.pin-spacer').length };
    }, progress));
  }
  await e2e.close();
  report.metadata = metadata;
  await writeFile('test-results/phase10/intro-audit.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
