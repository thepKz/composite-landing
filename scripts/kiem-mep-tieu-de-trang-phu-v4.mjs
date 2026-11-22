// Vòng sửa: (1) mép cong thấy thật ở từng khung nhìn, (2) chữ đầu của khối sau cách điểm thấp nhất của mép cong, (3) tiêu đề không quá số dòng và không rớt từ lẻ.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/kiem-mep-tieu-de-trang-phu-v4.mjs [thư-mục-ảnh]
// Mép cong: ở khối sau có mép trên cong, chụp khung nhìn đặt mép ở giữa màn, đọc màu điểm sát lề trái và điểm giữa ngay dưới đỉnh mép. Mép thẳng thì hai màu bằng nhau.
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const out = process.argv[2] || 'docs/nang-cap-2026-11/vong-4/trang-phu/vong-sua';
mkdirSync(out, { recursive: true });
const paths = ['/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-nuoi-trong-thuy-san', '/san-pham/thung-cho-tom-ca', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/san-pham/be-phot-composite', '/san-pham/bon-chua-hoa-chat', '/san-pham/xe-gom-rac', '/san-pham/composite-theo-yeu-cau', '/hoi-dap', '/lien-he', '/huong-dan-dat-hang', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat', '/trang-khong-ton-tai'];
const sizes = [{ w: 1366, h: 768, gap: 64 }, { w: 390, h: 844, gap: 40 }, { w: 600, h: 360, gap: 40 }];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const bad = []; const rows = [];
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, reducedMotion: 'reduce', isMobile: s.w < 500 });
  const page = await ctx.newPage();
  for (const path of paths) {
    await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => {
      const fss = [...document.querySelectorAll('main .tl-fs')];
      const list = fss.map((fs, i) => {
        const ov = (fs => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;width:0;height:var(--ov-top)'; fs.appendChild(d); const h = d.getBoundingClientRect().height; d.remove(); return h; })(fs);
        const top = fs.getBoundingClientRect().top + scrollY;
        const topEdge = fs.dataset.top;
        // chữ đầu tiên thấy được của khối
        let first = null;
        for (const el of fs.querySelectorAll('.tl-fs__body h1,.tl-fs__body h2,.tl-fs__body h3,.tl-fs__body p,.tl-fs__body li,.tl-fs__body a,.tl-fs__body button')) {
          if (el.closest('.tl-stack__float,.tl-sf')) continue; if (el.classList.contains('tp-sr') || el.closest('.tp-sr')) continue;
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; first = r.top + scrollY; break;
        }
        return { i, edge: topEdge, ov, top, firstGap: first === null ? null : Math.round(first - (top + ov)) };
      });
      // tiêu đề: số dòng và dòng cuối lẻ
      const heads = [];
      for (const el of document.querySelectorAll('main h1, main h2, main h3')) {
        if (el.closest('.tp-sr') || el.classList.contains('tp-sr') || !el.getClientRects().length || el.closest('details:not([open])') || el.closest('form,.tl-form,.inquiry-form')) continue;
        const w = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) { const re = /\\S+/g; let m; while ((m = re.exec(n.nodeValue))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); const b = r.getBoundingClientRect(); if (b.width) w.push({ t: m[0], top: Math.round(b.top) }); } }
        if (!w.length) continue; const lines = [...new Set(w.map(x => x.top))].length; const lastTop = w[w.length - 1].top; const lastCount = w.filter(x => Math.abs(x.top - lastTop) < 6).length;
        heads.push({ tag: el.tagName, text: w.map(x => x.t).join(' ').slice(0, 60), lines, orphan: lines > 1 && lastCount === 1 && w.length > 2 });
      }
      return { list, heads };
    });
    // mép cong: chụp từng khối có mép cong
    for (const f of info.list) {
      if (!['dome', 'arc', 'wave'].includes(f.edge) || f.i === 0) continue;
      await page.evaluate(i => { const fs = document.querySelectorAll('main .tl-fs')[i]; window.scrollTo(0, fs.getBoundingClientRect().top + scrollY - innerHeight / 2); }, f.i); await page.waitForTimeout(350);
      const fresh = await page.evaluate(i => { const fs = document.querySelectorAll('main .tl-fs')[i]; return { top: fs.getBoundingClientRect().top, ov: (fs => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;width:0;height:var(--ov-top)'; fs.appendChild(d); const h = d.getBoundingClientRect().height; d.remove(); return h; })(fs) }; }, f.i);
      const buf = await page.screenshot();
      const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      const at = (x, yy) => { const o = (yy * im.width + x) * im.channels; return data[o] + data[o + 1] + data[o + 2]; };
      const ys = [0.2, 0.4, 0.6, 0.8].map(k => Math.min(im.height - 1, Math.max(0, Math.round(fresh.top + fresh.ov * k))));
      const xs = [0.03, 0.2, 0.35, 0.5, 0.65, 0.8, 0.97].map(k => Math.round(im.width * k));
      let diff = 0; for (const yy of ys) { const v = xs.map(x => at(x, yy)); diff = Math.max(diff, Math.max(...v) - Math.min(...v)); }
      f.curveDiff = diff;
      if (f.i === 1 || f.i === 2) await page.screenshot({ path: join(out, `${s.w}-${path.replace(/\W+/g, '_')}-mep${f.i}.png`) });
    }
    for (const f of info.list) {
      if (f.i === 0 || f.firstGap === null) continue;
      if (f.firstGap < s.gap - 1) bad.push(`${s.w} ${path} khối ${f.i} (${f.edge}) chữ đầu cách ${f.firstGap}px < ${s.gap}`);
      if (['dome', 'arc', 'wave'].includes(f.edge) && f.curveDiff !== undefined && f.curveDiff < 60) bad.push(`${s.w} ${path} khối ${f.i} (${f.edge}) mép KHÔNG cong (lệch màu ${f.curveDiff})`);
    }
    for (const h of info.heads) {
      const max = s.w >= 1000 ? 1 : 2; const isHero = h.tag === 'H1';
      if (h.orphan && s.w < 1000 && h.tag !== 'H3') bad.push(`${s.w} ${path} rớt từ lẻ: ${h.text}`);
      if (h.orphan && s.w >= 1000 && h.tag !== 'H3') bad.push(`${s.w} ${path} rớt từ lẻ: ${h.text}`);
      if (h.lines > (s.w >= 1000 ? 2 : 2) && h.tag !== 'H3') bad.push(`${s.w} ${path} ${h.lines} dòng: ${h.text}`);
      void max; void isHero;
    }
    rows.push({ w: s.w, path, blocks: info.list.length, minGap: Math.min(...info.list.filter(f => f.i && f.firstGap !== null).map(f => f.firstGap)), curved: info.list.filter(f => f.curveDiff !== undefined).map(f => f.curveDiff) });
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(out, 'mep-tieu-de.json'), JSON.stringify(rows, null, 2));
console.log(bad.length ? 'CÒN LỖI (' + bad.length + '):\n' + bad.join('\n') : 'Đạt: mép cong thật, chữ khối sau cách mép đủ, tiêu đề không quá hai dòng, không từ lẻ');
