// Đo tương phản chữ trên ảnh ở ba cảnh banner: ẩn chữ, chụp nền thật dưới từng khối chữ, lấy điểm sáng nhất (xấu nhất cho chữ sáng).
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/do-tuong-phan-banner.ts <tệp-json-ra>
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
const origin = process.env.SITE_URL!;
const lum = (r: number, g: number, b: number) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const results: Record<string, unknown>[] = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  for (const scene of [1, 2, 3]) {
    await page.getByRole('button', { name: new RegExp(`^Cảnh ${scene}:`) }).click();
    await page.mouse.move(size.width - 3, 3);
    await page.waitForTimeout(2600);
    const boxes = await page.evaluate("(() => { const slide = document.querySelector('.tl-hero-slide[data-active=true]'); return [['.tl-hero-kicker','kicker'],['.tl-hero-title','title'],['.tl-hero-text','text'],['.tl-hero-call','call']].map(function (pair) { const el = slide.querySelector(pair[0]); if (!el) return null; const r = el.getBoundingClientRect(); return { selector: pair[0], color: pair[1], x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(Boolean); })()");
    await page.addStyleTag({ content: '.tl-hero-copy,.tl-hero-controls,.tl-hero-copy *{visibility:hidden!important}' });
    const png = await page.screenshot();
    const image = sharp(png);
    const meta = await image.metadata();
    for (const box of boxes as { selector: string; color: string; x: number; y: number; w: number; h: number }[]) {
      const left = Math.max(0, Math.floor(box.x)), top = Math.max(0, Math.floor(box.y));
      const width = Math.min(meta.width! - left, Math.ceil(box.w)), height = Math.min(meta.height! - top, Math.ceil(box.h));
      if (width < 2 || height < 2) continue;
      const { data, info } = await sharp(png).extract({ left, top, width, height }).raw().toBuffer({ resolveWithObject: true });
      const values: number[] = [];
      for (let i = 0; i < data.length; i += info.channels) values.push(lum(data[i], data[i + 1], data[i + 2]));
      values.sort((a, b) => a - b);
      const bright = values[Math.floor(values.length * 0.97)];
      const textLum = box.color === 'kicker' || box.color === 'call' ? lum(0xd3, 0xf5, 0x6b) : 1;
      results.push({ size: size.tag, scene, element: box.color, worstContrast: Number(ratio(textLum, bright).toFixed(2)), pass: ratio(textLum, bright) >= 4.5 });
    }
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
  }
  await page.close();
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
