// Vòng ba: chụp banner ba cảnh ở 390 và đo tương phản chữ trắng với nền thật dưới chữ (ẩn chữ rồi chụp lại, lấy phân vị 99 của độ sáng nền).
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/vong3-banner-tuong-phan.ts <thư-mục-ra>
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const out = process.argv[2];
const lin = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[390, 844], [1366, 768], [600, 360]] as const) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500 })).newPage();
  await page.addInitScript('window.__name = (f) => f;');
  await page.goto(process.env.SITE_URL + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    await page.evaluate((n: number) => (document.querySelectorAll('.tl-hero-dot')[n] as HTMLElement).click(), i);
    await page.waitForTimeout(2300);
    await page.evaluate(() => scrollTo(0, 0));
    if (w === 390) await page.screenshot({ path: `${out}/hero-390-canh-${i + 1}.png` });
    // ẩn chữ để đo nền thật dưới chữ
    const box = await page.evaluate(() => {
      const slide = document.querySelector('.tl-hero-slide[data-active=true]')!;
      const parts = [...slide.querySelectorAll('.tl-hero-title,.tl-hero-text,.tl-hero-kicker')].map(e => e.getBoundingClientRect()).filter(p => p.width > 0);
      return { x: Math.max(0, Math.floor(Math.min(...parts.map(p => p.left)))), y: Math.max(0, Math.floor(Math.min(...parts.map(p => p.top)))), r: Math.ceil(Math.max(...parts.map(p => p.right))), b: Math.ceil(Math.max(...parts.map(p => p.bottom))) };
    });
    const style = await page.addStyleTag({ content: '.tl-hero-copy *{color:transparent!important;text-shadow:none!important}.tl-hero-copy svg{visibility:hidden}' });
    await page.waitForTimeout(150);
    const clip = { x: box.x, y: box.y, width: Math.min(w, box.r) - box.x, height: Math.min(h, box.b) - box.y };
    const buf = await page.screenshot({ clip });
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    const lums: number[] = [];
    for (let k = 0; k < data.length; k += info.channels) lums.push(0.2126 * lin(data[k]) + 0.7152 * lin(data[k + 1]) + 0.0722 * lin(data[k + 2]));
    lums.sort((a, b) => a - b);
    const bright = lums[Math.floor(lums.length * 0.99)];
    console.log(`${w}x${h} cảnh ${i + 1}: nền sáng nhất dưới chữ (phân vị 99) tương phản với trắng = ${(1.05 / (bright + 0.05)).toFixed(2)}:1, vùng ${clip.width}x${clip.height}`);
    await style.evaluate(e => (e as HTMLElement).remove());
  }
}
await browser.close();
