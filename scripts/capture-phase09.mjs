import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.env.TEST_URL || 'http://localhost:3110';
const states = {
  thermo: [['action', 3.35], ['mixing', 5.2], ['hero', 6.05], ['hold', 6.55], ['exit', 7.12]],
  nocarb: [['action', 7.45], ['mixing', 9.55], ['hero', 10.55], ['hold', 11.1], ['exit', 11.72]],
  beauty: [['action', 11.95], ['mixing', 14.0], ['hero', 15.0], ['hold', 15.75], ['exit', 16.45]],
};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await mkdir('test-results/phase09', { recursive: true });
  for (const [product, captures] of Object.entries(states)) for (const [label, time] of captures) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForSelector('.is-cinematic');
    await page.evaluate(time => window.scrollTo(0, innerHeight * 16 * time / 20.1), time);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `test-results/phase09/${product}-${label}.png` });
    await page.close();
  }
  const columns = ['action', 'mixing', 'hero', 'hold', 'exit'];
  const rows = Object.keys(states).map(product => `<section><h2>${product.toUpperCase()}</h2><div class="grid">${columns.map(label => `<figure><img src="${product}-${label}.png" alt="${product} ${label}"><figcaption>${label}</figcaption></figure>`).join('')}</div></section>`).join('');
  await writeFile('test-results/phase09/editorial-comparison.html', `<!doctype html><meta charset="utf-8"><title>FUXION Phase 09 editorial comparison</title><style>body{margin:32px;background:#111;color:#eee;font:14px Arial}h1{font-size:28px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}figure{margin:0;background:#1b1b1b}img{width:100%;display:block}figcaption{padding:9px;text-transform:uppercase;letter-spacing:.12em;font-size:11px}</style><h1>Phase 09 — Editorial progression</h1>${rows}`);
} finally { await browser.close(); }
