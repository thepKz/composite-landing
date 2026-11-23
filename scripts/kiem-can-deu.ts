// Chụp cận các khối chữ sau khi căn đều hai bên, và đo khoảng trắng rộng nhất giữa hai chữ trong mỗi đoạn.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const out = process.argv[2] ?? 'docs/nang-cap-2026-11/vong-8/can-deu-can';
mkdirSync(out, { recursive: true });
const pages: [string, string, string][] = [
  ['gioi-thieu', '/gioi-thieu', 'Chữ tín làm gốc'],
  ['home', '/', ''],
  ['san-pham', '/san-pham/be-biogas-composite', ''],
];
const sizes = [{ w: 1366, h: 768 }, { w: 600, h: 360 }, { w: 390, h: 844 }];

async function main() {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const [name, path, anchor] of pages) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      if (anchor) {
        await page.getByText(anchor, { exact: true }).first().scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -120));
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${out}/${name}-${size.w}.png` });
      }
      // Khoảng trắng rộng nhất giữa hai từ liền nhau trên cùng một dòng, tính theo bội số của bề rộng dấu cách thường.
      const worst = await page.evaluate(() => {
        const rows: { gap: number; text: string }[] = [];
        for (const p of Array.from(document.querySelectorAll<HTMLElement>('.public-site p'))) {
          const style = getComputedStyle(p);
          if (style.textAlign !== 'justify' || !p.offsetParent) continue;
          const space = parseFloat(style.fontSize) * 0.28;
          const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
          let max = 0;
          let prev: DOMRect | null = null;
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent ?? '';
            const re = /\S+/g;
            for (let m = re.exec(text); m; m = re.exec(text)) {
              const range = document.createRange();
              range.setStart(node, m.index);
              range.setEnd(node, m.index + m[0].length);
              const rect = range.getClientRects()[0];
              if (!rect) continue;
              if (prev && Math.abs(prev.top - rect.top) < 4) max = Math.max(max, (rect.left - prev.right) / space);
              prev = rect;
            }
          }
          if (max > 0) rows.push({ gap: Math.round(max * 10) / 10, text: (p.textContent ?? '').trim().slice(0, 50) });
        }
        rows.sort((a, b) => b.gap - a.gap);
        return { count: rows.length, top: rows.slice(0, 4), overflowX: document.documentElement.scrollWidth - innerWidth };
      });
      console.log(size.w, name, JSON.stringify(worst));
    }
    await context.close();
  }
  await browser.close();
}
main();
