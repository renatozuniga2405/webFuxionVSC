import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.TEST_URL || 'http://localhost:3110';
const DURATION = 20.1;
const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-573', width: 573, height: 844 },
];
const report = { pass: true, checks: [], measurements: {}, limitations: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  await mkdir('test-results/phase08', { recursive: true });
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__phase08LongTasks = [];
      if ('PerformanceObserver' in window) {
        try { new PerformanceObserver(list => window.__phase08LongTasks.push(...list.getEntries().map(entry => entry.duration))).observe({ type: 'longtask', buffered: true }); } catch {}
      }
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('.is-cinematic');
    const seek = async time => {
      await page.evaluate(({ time, duration }) => {
        const scrollDistance = innerHeight * (innerWidth < 700 ? 13 : 16);
        window.scrollTo(0, scrollDistance * time / duration);
      }, { time, duration: DURATION });
      await page.waitForTimeout(180);
    };
    const snapshot = () => page.evaluate(() => ({
      pins: document.querySelectorAll('.pin-spacer').length,
      hidden: [...document.querySelectorAll('.scene')].filter(scene => scene.getAttribute('aria-hidden') === 'true').length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      videos: [...document.querySelectorAll('video')].map(video => ({
        className: video.className,
        preload: video.preload,
        time: video.currentTime,
        duration: video.duration,
        paused: video.paused,
        readyState: video.readyState,
      })),
      longTasks: window.__phase08LongTasks,
    }));

    const initial = await snapshot();
    assert.equal(initial.pins, 1, `${viewport.name}: exactly one GSAP pin must exist`);
    assert.equal(initial.videos.length, 4, `${viewport.name}: exactly four cinematic videos must exist`);
    assert.equal(initial.videos.filter(video => video.preload === 'auto').length, 2, `${viewport.name}: only intro and Thermo preload fully at startup`);
    assert.ok(initial.videos.every(video => video.paused), `${viewport.name}: no video may autoplay`);

    for (const [name, time, selector] of [
      ['intro', 1.2, '.intro-video'], ['thermo', 4.5, '.thermo-video'], ['nocarb', 9.1, '.nocarb-video'], ['beauty', 14.5, '.beauty-video'],
    ]) {
      await seek(time);
      await page.waitForTimeout(220);
      const state = await page.locator(selector).evaluate(video => ({ time: video.currentTime, duration: video.duration, paused: video.paused, readyState: video.readyState }));
      assert.ok(state.readyState >= 1 && state.duration > 0, `${viewport.name}/${name}: metadata unavailable`);
      assert.ok(state.paused, `${viewport.name}/${name}: scrub must remain paused`);
      await page.screenshot({ path: `test-results/phase08/${viewport.name}-${name}.png` });
    }

    for (const time of [3.05, 2.85, 3.15, 2.78, 7.12, 6.95, 7.28, 6.88, 12.22, 12.05, 12.4, 11.95, 17.1, .2, 10.1, 13.9]) await seek(time);
    await page.waitForTimeout(1100);
    const afterFastScroll = await snapshot();
    assert.equal(afterFastScroll.pins, 1, `${viewport.name}: fast scrolling duplicated a pin`);
    assert.ok(afterFastScroll.videos.every(video => video.paused && video.readyState >= 1), `${viewport.name}: a video did not settle after direction changes`);
    assert.equal(afterFastScroll.overflow, false, `${viewport.name}: horizontal overflow`);
    assert.deepEqual(errors, [], `${viewport.name}: uncaught browser errors`);

    if (viewport.name === 'desktop') {
      for (let pass = 0; pass < 2; pass++) {
        await page.locator('.view-toggle').evaluate(button => button.click());
        await page.waitForTimeout(250);
        assert.equal(await page.locator('.pin-spacer').count(), 0, 'static mode must remove the pin');
        await page.locator('.view-toggle').evaluate(button => button.click());
        await page.waitForSelector('.is-cinematic');
        await page.waitForTimeout(250);
        assert.equal(await page.locator('.pin-spacer').count(), 1, 'cinematic remount must restore one pin');
      }
    }
    report.measurements[viewport.name] = { initial, afterFastScroll };
    report.checks.push(`${viewport.name}: pins, preload, paused scrub, fast-direction and overflow checks passed`);
    await page.close();
  }
  const staticPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await staticPage.goto(url, { waitUntil: 'networkidle' });
  await staticPage.waitForSelector('.is-cinematic');
  await staticPage.locator('.view-toggle').evaluate(button => button.click());
  await staticPage.waitForTimeout(350);
  assert.equal(await staticPage.locator('.pin-spacer').count(), 0, 'static mode must not retain a ScrollTrigger pin');
  assert.equal(await staticPage.locator('.scene[inert]').count(), 0, 'static mode must not leave scenes inert');
  assert.ok(await staticPage.locator('.thermo-video').evaluate(video => video.currentTime > video.duration * .9), 'static Thermo frame is not stable');
  report.checks.push('Static mode: no pin, no inert scenes and final video frame passed');
  await staticPage.close();

  const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
  await reducedPage.goto(url, { waitUntil: 'networkidle' });
  await reducedPage.waitForTimeout(400);
  assert.equal(await reducedPage.locator('.pin-spacer').count(), 0, 'reduced motion must not create a pin');
  assert.equal(await reducedPage.locator('.scene[inert]').count(), 0, 'reduced motion must not leave scenes inert');
  assert.ok(await reducedPage.locator('.beauty-video').evaluate(video => video.currentTime > video.duration * .9 && video.paused), 'reduced motion Beauty frame is not stable');
  report.checks.push('Reduced motion: natural flow and paused final video frames passed');
  await reducedPage.close();

  const noJsPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1280, height: 720 } });
  await noJsPage.goto(url, { waitUntil: 'networkidle' });
  assert.ok(await noJsPage.getByRole('heading', { name: 'BEAUTY-IN', exact: true }).isVisible(), 'no-JS document is not readable');
  report.checks.push('No JavaScript: product content remains readable');
  await noJsPage.close();
  console.log(JSON.stringify(report, null, 2));
  await writeFile('test-results/phase08/report.json', JSON.stringify(report, null, 2));
} catch (error) {
  report.pass = false;
  report.error = error instanceof Error ? error.message : String(error);
  await writeFile('test-results/phase08/report.json', JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
