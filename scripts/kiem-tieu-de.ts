// Quét mọi tiêu đề, nhãn nút và liên kết ngắn trên các trang công khai: báo dòng cuối lẻ một từ, tiêu đề quá 3 dòng, nhãn nút xuống dòng.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/kiem-tieu-de.ts <tệp-json-ra> [đường-dẫn...]
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const origin = process.env.SITE_URL!;
const [out, ...extra] = process.argv.slice(2);
const paths = extra.length ? extra : ['/', '/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/du-an', '/tin-tuc', '/lien-he', '/huong-dan-dat-hang', '/hoi-dap', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat'];
const script = `(() => {
  const found = [];
  const targets = [...document.querySelectorAll('main h1, main h2, main h3, footer h2, footer h3, .tl-hero-title, button, a.tl-cta, .tl-cta, .tl-hero-button, .tl-button, .tl-form-button, summary, .tl-footer-grid nav a, .tl-nav a')];
  for (const el of targets) {
    const r0 = el.getBoundingClientRect();
    if (!r0.width || !r0.height || getComputedStyle(el).visibility === 'hidden') continue;
    if (el.closest('.tl-sr') || el.closest('[aria-hidden=true]') && !el.closest('.tl-hero')) continue;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const words = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      const re = new RegExp('[^ ]+', 'g'); let m;
      while ((m = re.exec(text))) { const range = document.createRange(); range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length); const rects = range.getClientRects(); if (rects.length) words.push({ word: m[0], top: Math.round(rects[0].top) }); }
    }
    if (!words.length) continue;
    const lines = []; for (const w of words) { const last = lines[lines.length - 1]; if (last && Math.abs(last.top - w.top) < 6) last.words.push(w.word); else lines.push({ top: w.top, words: [w.word] }); }
    window.__seen = (window.__seen||0)+1; if (lines.length>=2) window.__multi = (window.__multi||[]).concat([el.textContent.trim().slice(0,40)+' | '+lines.map(l=>l.words.length).join(',')]);
    const tag = el.tagName.toLowerCase();
    const heading = /^h[1-3]$/.test(tag) || el.classList.contains('tl-hero-title');
    const label = el.textContent.split(" ").filter(Boolean).join(" ").slice(0, 60);
    if (lines.length >= 2 && lines[lines.length - 1].words.length === 1 && words.length >= 3) found.push({ kind: 'dòng cuối lẻ một từ', tag, label, lines: lines.length });
    if (heading && lines.length > 3) found.push({ kind: 'tiêu đề hơn 3 dòng', tag, label, lines: lines.length });
    if (!heading && lines.length > 1 && (tag === 'button' || el.classList.contains('tl-cta') || el.classList.contains('tl-hero-button') || el.classList.contains('tl-form-button') || el.classList.contains('tl-button')) ) found.push({ kind: 'nhãn nút xuống dòng', tag, label, lines: lines.length });
  }
  const multi = window.__multi || []; window.__multi = [];
  return { found, seen: targets.length, multi };
})()`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report: Record<string, unknown>[] = [];
for (const width of [390, 1366]) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 768 } });
  for (const path of paths) {
    await page.goto(origin + path, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
    await page.waitForTimeout(500);
    const result = (await page.evaluate(script)) as { found: Record<string, unknown>[]; seen: number; multi: string[] };
    const found = result.found;
    console.log(width, path, "đã quét", result.seen, "khối, nhiều dòng:", result.multi.length);
    // gộp trùng
    const seen = new Set<string>();
    for (const item of found) { const key = `${item.kind}|${item.label}`; if (seen.has(key)) continue; seen.add(key); report.push({ width, path, ...item }); }
  }
  await page.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(report, null, 1));
for (const row of report) console.log(JSON.stringify(row));
console.log('Tổng', report.length);
