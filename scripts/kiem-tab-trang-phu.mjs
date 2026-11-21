// Đi Tab qua một trang, báo phần tử đang nhận tiêu điểm và có viền tiêu điểm hay không.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/kiem-tab-trang-phu.mjs /lien-he 390
import { chromium } from '@playwright/test';
const [p0 = 'lien-he', width = '390'] = process.argv.slice(2); const path = '/' + p0.replace(/^[/]+/, '');
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: +width, height: +width < 500 ? 844 : 768 }, reducedMotion: 'reduce', isMobile: +width < 500, hasTouch: +width < 500 });
const page = await ctx.newPage();
await page.goto(origin + path, { waitUntil: 'networkidle' });
const rows = [];
for (let i = 0; i < 80; i++) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(40);
  const r = await page.evaluate(() => {
    const e = document.activeElement; if (!e || e === document.body) return null;
    const cs = getComputedStyle(e); const bb = e.getBoundingClientRect();
    const own = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    const shadow = cs.boxShadow !== 'none';
    const par = e.closest('.is-focused, [data-focus]');
    return { tag: e.tagName, cls: String(e.className).slice(0, 40), text: (e.textContent || e.getAttribute('aria-label') || e.getAttribute('title') || e.getAttribute('name') || '').trim().slice(0, 30), type: e.getAttribute('type'), outline: own ? cs.outlineWidth + ' ' + cs.outlineColor : 'không', shadow, h: Math.round(bb.height), w: Math.round(bb.width), visible: bb.width > 0 && bb.height > 0 };
  });
  if (!r) continue;
  rows.push(r);
  if (rows.length > 1 && JSON.stringify(rows.at(-1)) === JSON.stringify(rows.at(-2))) break;
}
for (const r of rows) console.log(r.tag, r.cls, '|', r.text, '|', r.type ?? '', '| outline:', r.outline, r.shadow ? '| bóng' : '', r.visible ? '' : '| ẨN', r.w + 'x' + r.h);
await b.close();
