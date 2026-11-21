// Đo đoạn chữ có dòng cuối chỉ một từ (rớt từ lẻ) trong vùng main, theo từng từ thật trên màn hình.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/kiem-rot-chu-trang-phu.mjs [rộng] [bỏ-qua-chân-đầu]
import { chromium } from '@playwright/test';
const width = +(process.argv[2] || 1366);
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const only = (process.argv[3] || '').split(',').filter(Boolean);
const paths0 = ['/gioi-thieu','/san-pham','/san-pham/be-biogas-composite','/san-pham/be-phot-va-xu-ly-nuoc-thai','/san-pham/be-nuoi-trong-thuy-san','/san-pham/be-phot-composite','/san-pham/bon-chua-hoa-chat','/san-pham/xe-gom-rac','/du-an','/lien-he','/huong-dan-dat-hang','/chinh-sach-bao-hanh','/chinh-sach-bao-mat','/hoi-dap','/trang-khong-ton-tai'];
const paths = only.length ? paths0.filter(p => only.some(o => p.includes(o))) : paths0;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width, height: width < 500 ? 844 : 768 }, reducedMotion: 'reduce', isMobile: width < 500 });
const page = await ctx.newPage();
let total = 0;
for (const path of paths) {
  await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
  const found = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main li, main dd, main figcaption, main summary, main dt, main td, main th')) {
      if ((!el.offsetParent && getComputedStyle(el).position !== 'fixed') || el.classList.contains('tp-sr') || el.closest('details:not([open])')) continue;
      if (el.closest('form, .tl-form, .inquiry-form, iframe')) continue;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const words = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const re = /\S+/g; let m; while ((m = re.exec(n.nodeValue))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const bb = r.getBoundingClientRect(); if (bb.width) words.push({ w: m[0], top: Math.round(bb.top) }); }
      }
      if (words.length < 3) continue;
      const lastTop = words[words.length - 1].top; const tops = new Set(words.map(x => x.top));
      if (tops.size < 2) continue;
      const lastLine = words.filter(x => Math.abs(x.top - lastTop) < 6);
      if (lastLine.length === 1) out.push(el.tagName + ': ' + words.map(x => x.w).join(' ').slice(0, 70) + ' ... [' + lastLine[0].w + ']');
    }
    return [...new Set(out)];
  });
  total += found.length;
  if (found.length) console.log(width, path, '\n  ' + found.join('\n  '));
}
console.log('Tổng', total);
await b.close();
