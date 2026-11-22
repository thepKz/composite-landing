// Đo lề chữ bằng toạ độ thật (Range.getClientRects của từng nút chữ).
// 1) Mỗi cột chữ (.tl-wrap, .container): khoảng trống trái = khoảng trống phải so với hai mép khung nhìn (lệch tối đa 1px).
// 2) Mọi dòng chữ nằm trong cột (không lòi ra ngoài hơn 1px), trừ phần tử cố ý tràn (dải ảnh cuộn ngang).
// 3) Khối chữ căn giữa (.tl-title, .tl-faq-call, số liệu): tâm của từng dòng lệch khỏi trục khối tối đa 1px.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/home-margins.mjs [path] > số-đo.json
import { chromium } from '@playwright/test';

const path = process.argv[2] ?? '/';
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const browser = await chromium.launch({ channel: 'chrome' });
const result = [];
const only = process.env.WIDTHS?.split(',').map(Number);
for (const [width, height] of [[1366, 768], [768, 1024], [390, 844], [600, 360]].filter(([w]) => !only || only.includes(w))) {
  const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
  await page.goto(origin + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 600) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const lines = el => {
      const lineRects = [];
      const rects = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        const parent = node.parentElement;
        const style = getComputedStyle(parent);
        if (style.visibility === 'hidden' || style.display === 'none' || parent.closest('.tl-sr,[inert],[aria-hidden=true],details:not([open]) > :not(summary),.tl-lightbox,.tl-compare[hidden]')) continue;
        if (parent.closest('.tl-strip-track, .tl-leads')) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) rects.push({ left: r.left, right: r.right, top: r.top, text: node.textContent.trim().slice(0, 30) });
      }
      return rects;
    };
    const columns = [...document.querySelectorAll('.tl-wrap, .container, .tl-fs__inner')].filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'none');
    const colReport = columns.map(el => {
      const box = el.getBoundingClientRect();
      const ls = lines(el);
      const out = ls.filter(r => r.left < box.left - 1 || r.right > box.right + 1);
      return { cls: el.className.toString().slice(0, 30), left: +box.left.toFixed(2), right: +(vw - box.right).toFixed(2), diff: +Math.abs(box.left - (vw - box.right)).toFixed(2), lines: ls.length, outside: out.length, sample: out.slice(0, 2).map(r => r.text) };
    });
    const centered = [...document.querySelectorAll('.tl-title, .tl-faq-call, .tl-metric')].filter(el => el.getClientRects().length).map(el => {
      const box = el.getBoundingClientRect();
      const axis = (box.left + box.right) / 2;
      let ls = lines(el.classList.contains('tl-faq-call') ? el.querySelector('p') : el);
      if (el.classList.contains('tl-metric')) { const v = ls.filter(r => r.top < el.querySelector('.tl-metric-label').getBoundingClientRect().top - 2); const rest = ls.filter(r => !v.includes(r)); ls = [{ left: Math.min(...v.map(r => r.left)), right: Math.max(...v.map(r => r.right)), top: v[0].top, text: 'value' }, ...rest]; }
      const byTop = new Map();
      for (const r of ls) { const key = Math.round(r.top / 6); const g = byTop.get(key) ?? { left: Infinity, right: -Infinity }; g.left = Math.min(g.left, r.left); g.right = Math.max(g.right, r.right); byTop.set(key, g); }
      const worst = [...byTop.values()].reduce((m, g) => Math.max(m, Math.abs((g.left + g.right) / 2 - axis)), 0);
      const isMetric = el.classList.contains('tl-metric');
      return { cls: el.className.toString().slice(0, 20), axisOffset: isMetric ? 0 : +Math.abs(axis - vw / 2).toFixed(2), worstLineCenter: +worst.toFixed(2), lines: byTop.size };
    });
    // Dòng cuối chỉ một từ (rớt từ lẻ) ở tiêu đề, đoạn, mục danh sách.
    const orphans = [];
    for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, footer p, main summary > span:first-child, main li > span, main td > span')) {
      if (!el.getClientRects().length || el.closest('.tl-sr,[inert],[aria-hidden=true],details:not([open]) > :not(summary),.tl-lightbox,.tl-metric-value,.tl-stat,.tl-lead-stat,.tl-spec')) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      const words = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const re = /\S+/g; let m;
        while ((m = re.exec(node.textContent))) {
          const r = document.createRange(); r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
          const box = r.getClientRects()[0]; if (box) words.push({ top: Math.round(box.top), text: m[0] });
        }
      }
      if (words.length < 3) continue;
      const tops = [...new Set(words.map(w => w.top))].sort((a, b) => a - b);
      if (tops.length < 2) continue;
      const last = words.filter(w => w.top === tops[tops.length - 1]);
      if (last.length === 1) orphans.push({ text: el.textContent.trim().slice(0, 60), orphan: last[0].text, lines: tops.length });
    }
    const titleLines = [...document.querySelectorAll('.tl-title, .tl-hero-slide[data-active=true] .tl-hero-title')].filter(e => e.getClientRects().length).map(e => ({ text: e.textContent.trim().slice(0, 40), lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)), hero: e.classList.contains('tl-hero-title') }));
    return { vw, titleLines, colReport, centered, orphans, scrollWidth: document.documentElement.scrollWidth };
  });
  const maxDiff = Math.max(...data.colReport.map(c => c.diff));
  const outside = data.colReport.reduce((s, c) => s + c.outside, 0);
  const maxAxis = Math.max(...data.centered.map(c => c.axisOffset));
  const maxLine = Math.max(...data.centered.map(c => c.worstLineCenter));
  result.push({ width, columns: data.colReport.length, maxColumnDiff: maxDiff, textOutsideColumn: outside, centeredBlocks: data.centered.length, maxAxisOffset: maxAxis, maxLineCenterOffset: maxLine, scrollWidth: data.scrollWidth, orphans: data.orphans, titleLines: data.titleLines, detail: data.colReport.filter(c => c.outside || c.diff > 1), centeredWorst: data.centered.filter(c => c.axisOffset > 1 || c.worstLineCenter > 1) });
  await page.context().close();
}
await browser.close();
console.log(JSON.stringify(result, null, 2));
