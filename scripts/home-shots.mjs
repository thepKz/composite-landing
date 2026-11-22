// Chụp trang chủ: màn đầu, toàn trang ở 1366x768, 390x844, 600x360, thêm từng khung nhìn khi cuộn ở 1366.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/home-shots.mjs <thư-mục-ra> [path]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const path = process.argv[3] ?? '/';
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
mkdirSync(out, { recursive: true });
const sizes = [[1366, 768], [390, 844], [600, 360]];
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
for (const [width, height] of sizes) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)));
  await page.goto(origin + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: join(out, `home-${width}-dau.png`) });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = [];
  for (let y = 0; y < total; y += Math.round(height * 0.8)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(350); steps.push(y); }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  if (width === 1366) {
    let i = 0;
    for (const y of steps) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(700); await page.screenshot({ path: join(out, `khung-nhin-1366-${String(i).padStart(2, '0')}.png`) }); i += 1; }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(out, `home-${width}-toan-trang.png`), fullPage: true });
  const info = await page.evaluate(() => ({
    innerWidth, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
    broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc),
  }));
  report.push({ width, height, ...info, errors });
  await context.close();
}
await browser.close();
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
