// Kiểm lưới an toàn của hiện dần: nhảy cuộn từng 2000px, chụp sau 500ms, đếm khối [data-reveal] đang nằm trong khung nhìn mà còn mờ.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/kiem-hien-dan.ts <thư-mục-ra>
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const out = process.argv[2];
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });
const report: Record<string, unknown>[] = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[1366, 768], [390, 844]] as const) {
  for (const [name, path] of [['home', '/'], ['biogas', '/san-pham/be-biogas-composite'], ['du-an', '/du-an']] as const) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(origin + path, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const total = await page.evaluate('document.documentElement.scrollHeight') as number;
    let worst = 0; const blank: string[] = [];
    let index = 0;
    for (let y = 2000; y < total; y += 2000) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await page.waitForTimeout(500);
      const faint = await page.evaluate("[...document.querySelectorAll('[data-reveal], .tp-rv, [data-art-reveal]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && getComputedStyle(el).opacity < 0.9; }).length") as number;
      worst = Math.max(worst, faint);
      if (faint) blank.push(`y=${y}: ${faint} khối còn mờ`);
      if (index < 2 && name === 'home') await page.screenshot({ path: join(out, `hien-dan-${name}-${w}-${index}.png`) });
      index += 1;
    }
    report.push({ khung: `${w}x${h}`, trang: name, soLanNhay: index, khoiMoToiDa: worst, chiTiet: blank });
    await page.close();
  }
}
await browser.close();
writeFileSync(join(out, 'kiem-hien-dan.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report));
