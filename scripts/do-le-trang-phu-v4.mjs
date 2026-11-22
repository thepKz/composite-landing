// Đo lề trái và lề phải của cột chữ ở từng khối của các trang phụ, bằng toạ độ thật (getBoundingClientRect), ở 1366, 768, 390.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/do-le-trang-phu-v4.mjs [thư-mục-ra]
// Mỗi khối FlowSection có cột .tl-fs__inner (hoặc .tl-fs__body). Lề trái = left, lề phải = chiều rộng khung nhìn trừ right. Lệch tối đa cho phép 1px.
// Thêm: mọi phần tử chữ thấy được phải nằm trong cột (không tràn ra ngoài hai lề của cột quá 1px, trừ ảnh và hoa văn).
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const out = process.argv[2] || 'docs/nang-cap-2026-11/vong-4/trang-phu';
mkdirSync(out, { recursive: true });
const paths = ['/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-nuoi-trong-thuy-san', '/san-pham/thung-cho-tom-ca', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/san-pham/be-phot-composite', '/san-pham/bon-chua-hoa-chat', '/san-pham/xe-gom-rac', '/san-pham/composite-theo-yeu-cau', '/hoi-dap', '/lien-he', '/huong-dan-dat-hang', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat', '/trang-khong-ton-tai'];
const widths = [1366, 768, 390];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rows = []; let worst = 0; const bad = [];
for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 768 }, reducedMotion: 'reduce', isMobile: width < 500 });
  const page = await ctx.newPage();
  for (const path of paths) {
    await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const cols = [...document.querySelectorAll('main .tl-fs')].map((fs, i) => {
        const col = fs.querySelector(':scope > .tl-fs__inner') || fs.querySelector(':scope > .tl-fs__body');
        const b = col.getBoundingClientRect();
        const left = Math.round(b.left * 100) / 100, right = Math.round((vw - b.right) * 100) / 100;
        // chữ lệch ra ngoài cột
        let outside = 0; let textMin = 1e9; let textMax = -1e9;
        for (const el of col.querySelectorAll('h1,h2,h3,p,li,dt,dd,summary,label,a,button,strong')) {
          if (el.closest('.tp-sr,.tl-sf,.tl-stack__float,.tp-strip-track,.tp-table-scroll,.tl-sr,.tp-filters,.tp-tablist,svg,[aria-hidden=true]')) continue;
          const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          const rg = document.createRange(); rg.selectNodeContents(el);
          for (const rc of rg.getClientRects()) { if (!rc.width) continue; textMin = Math.min(textMin, rc.left); textMax = Math.max(textMax, rc.right); if (rc.left < b.left - 1 || rc.right > b.right + 1) { outside++; (window.__o ||= []).push(el.tagName + '.' + String(el.className).slice(0, 30) + ' ' + (el.textContent || '').trim().slice(0, 30) + ' L' + Math.round(rc.left) + ' R' + Math.round(rc.right)); } }
        }
        return { i, cls: fs.className.replace('tl-fs ', '').slice(0, 40), left, right, diff: Math.abs(left - right), outside, textLeft: Math.round(textMin * 10) / 10, textRightGap: Math.round((vw - textMax) * 10) / 10 };
      });
      return { vw, cols, scrollW: document.documentElement.scrollWidth, o: window.__o || [] };
    });
    const diff = Math.max(...r.cols.map(c => c.diff)); const outside = r.cols.reduce((a, c) => a + c.outside, 0);
    worst = Math.max(worst, diff);
    rows.push({ width, path, blocks: r.cols.length, maxDiff: diff, textOutside: outside, overflowX: r.scrollW - r.vw, cols: r.cols });
    if (diff > 1 || outside || r.scrollW > r.vw) bad.push(`${width} ${path} lệch ${diff} chữ-ngoài-cột ${outside} tràn ${r.scrollW - r.vw} ${r.o.slice(0, 3).join(' | ')}`);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(out, 'do-le.json'), JSON.stringify(rows, null, 2));
console.log('trang x cỡ:', rows.length, '| lệch lớn nhất giữa lề trái và lề phải của cột:', worst, 'px');
for (const w of widths) { const sub = rows.filter(x => x.width === w); console.log(w, 'lệch tối đa', Math.max(...sub.map(x => x.maxDiff)), 'khối đo', sub.reduce((a, x) => a + x.blocks, 0)); }
console.log(bad.length ? 'KHÔNG ĐẠT:\n' + bad.join('\n') : 'Đạt: mọi cột lệch tối đa 1px, chữ nằm trong cột, không tràn ngang');
