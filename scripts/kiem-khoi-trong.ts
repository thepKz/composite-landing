// Chụp khối chữ hiện ra khi trang Dự án và Tin tức chưa có bài, đo số dòng của tiêu đề và tràn ngang.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const out = process.argv[2] ?? 'docs/nang-cap-2026-11/vong-8/khoi-trong';
mkdirSync(out, { recursive: true });
const pages: [string, string, string][] = [['du-an', '/du-an', '.da-void-text'], ['tin-tuc', '/tin-tuc', '.nl-void-text']];
const sizes = [[1366, 768], [600, 360], [390, 844]];

async function launch() {
  try { return await chromium.launch({ channel: 'chrome' }); } catch { return await chromium.launch(); }
}

async function main() {
  const browser = await launch();
  for (const [w, h] of sizes) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const [name, path, selector] of pages) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      const block = page.locator(selector);
      if (await block.count() === 0) { console.log(w, name, 'không có khối trống, trang đã có bài'); continue; }
      await block.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, -80));
      await page.waitForTimeout(400);
      const measured = await block.evaluate(element => {
        const heading = element.querySelector('h2') as HTMLElement;
        const range = document.createRange();
        range.selectNodeContents(heading);
        const tops = Array.from(range.getClientRects()).map(rect => Math.round(rect.top));
        return { h2: heading.textContent, lines: new Set(tops).size, p: element.querySelector('p')?.textContent, overflowX: document.documentElement.scrollWidth - innerWidth };
      });
      console.log(w, name, JSON.stringify(measured));
      await page.screenshot({ path: `${out}/${name}-${w}.png` });
    }
    await context.close();
  }
  await browser.close();
}
main();
