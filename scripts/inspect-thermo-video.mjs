import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'test-results/phase05-source';
const points = [0, .12, .24, .38, .50, .62, .74, .86, .96];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent('<style>html,body{margin:0;background:#000}video{width:100vw;height:100vh;object-fit:contain}</style><video muted playsinline preload="auto" src="http://127.0.0.1:3110/references/thermo-t-preparation.mp4"></video>');
  await page.locator('video').evaluate(video => new Promise((resolve, reject) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) { resolve(); return; }
    video.addEventListener('loadeddata', resolve, { once: true });
    video.addEventListener('error', () => reject(video.error), { once: true });
  }));
  const metadata = await page.locator('video').evaluate(video => ({ duration: video.duration, width: video.videoWidth, height: video.videoHeight }));
  for (const progress of points) {
    await page.locator('video').evaluate((video, time) => new Promise(resolve => {
      video.addEventListener('seeked', resolve, { once: true }); video.currentTime = time;
    }), metadata.duration * progress);
    await page.screenshot({ path: `${output}/${String(Math.round(progress * 100)).padStart(2, '0')}.png` });
  }
  await writeFile(`${output}/metadata.json`, JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata));
} finally { await browser.close(); }
