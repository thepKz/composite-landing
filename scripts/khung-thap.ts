// Chụp màn đầu trang chủ ở khung thấp (600x360, 800x600) và đo: phần trình duyệt bị thanh cố định chiếm, tiêu đề banner có bị cắt, có thấy nút kêu gọi.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/khung-thap.ts <thư-mục-ra> <truoc|sau>
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [out, tag] = process.argv.slice(2);
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[600, 360], [800, 600]] as const) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: w < 700 });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(out, `khung-thap-${tag}-${w}x${h}.png`) });
  const data = await page.evaluate("(() => { const q = s => document.querySelector(s); const r = el => el ? el.getBoundingClientRect() : null; const header = r(q('.tl-header')), top = r(q('.tl-topbar')), dock = r(q('.tl-dock')); const title = r(q('.tl-hero-slide[data-active=true] .tl-hero-title')); const cta = r(q('.tl-hero-slide[data-active=true] .tl-hero-button')); const dockVisible = dock && getComputedStyle(q('.tl-dock')).visibility !== 'hidden' && getComputedStyle(q('.tl-dock')).opacity !== '0'; const topH = top && top.bottom > 0 ? Math.round(top.height) : 0; const used = topH + Math.round(header.height) + (dockVisible && dock.top > innerHeight / 2 ? Math.round(innerHeight - dock.top) : 0); const dockBox = dockVisible ? dock : null; return JSON.stringify({ viewport: [innerWidth, innerHeight], thanhTren: topH, header: Math.round(header.height), dockCao: dockBox ? Math.round(dockBox.height) : 0, tongThanhCoDinh: used, tieuDe: title && [Math.round(title.top), Math.round(title.bottom)], tieuDeBiCat: title ? title.bottom > innerHeight - (dockVisible && dock.top > innerHeight/2 ? innerHeight - dock.top : 0) : null, nutKeuGoi: cta && [Math.round(cta.top), Math.round(cta.bottom)], thayNut: cta ? cta.bottom <= innerHeight - (dockVisible && dock.top > innerHeight/2 ? innerHeight - dock.top : 0) && cta.top >= 0 : false }); })()");
  console.log(w + 'x' + h, data);
  await page.close();
}
await browser.close();
