// Kiểm từng cảnh của banner ở 1366x768, 768x1024, 390x844, 600x360: tiêu đề và nút "Nhận báo giá" nằm trọn trong khung nhìn, không rớt từ lẻ, không tràn ngang.
import { chromium } from '@playwright/test';
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const browser = await chromium.launch({ channel: 'chrome' });
const out = [];
for (const [w, h] of [[1366, 768], [768, 1024], [390, 844], [600, 360]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 3; i++) {
    await page.locator('.tl-hero-dot').nth(i).click({ force: true });
    await page.waitForTimeout(1500); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
    out.push({ w, h, scene: i, ...(await page.evaluate(() => {
      const slide = document.querySelector('.tl-hero-slide[data-active=true]');
      const title = slide.querySelector('.tl-hero-title'); const btn = slide.querySelector('.tl-hero-button.is-primary'); const text = slide.querySelector('.tl-hero-text');
      const tb = title.getBoundingClientRect(), bb = btn.getBoundingClientRect();
      const lastWord = el => {
        const words = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
        while ((n = walker.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.textContent))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const b = r.getClientRects()[0]; if (b && b.width) words.push({ t: Math.round(b.top), w: m[0] }); } }
        const tops = [...new Set(words.map(x => x.t))].sort((a, b) => a - b); const last = words.filter(x => x.t === tops[tops.length - 1]);
        return { lines: tops.length, orphan: tops.length > 1 && last.length === 1 ? last[0].w : null };
      };
      return { titleInView: tb.top >= 0 && tb.bottom <= innerHeight, buttonInView: bb.top >= 0 && bb.bottom <= innerHeight, buttonH: Math.round(bb.height), title: lastWord(title), text: getComputedStyle(text).display === 'none' ? 'ẩn' : lastWord(text), scrollW: document.documentElement.scrollWidth };
    })) });
  }
  await page.context().close();
}
await browser.close();
console.log(out.map(o => JSON.stringify(o)).join('\n'));
