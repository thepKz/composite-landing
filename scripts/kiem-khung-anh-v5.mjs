// Vòng 5: quét mọi ảnh trong khung ảnh trên các trang. Không clip-path hay mask khác none trên ảnh và tổ tiên gần,
// ảnh không bị cắt (object-fit cover thì tỉ lệ khung lệch tỉ lệ ảnh quá 3% là lỗi), không tràn ngang, không ảnh vỡ, console không lỗi.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/kiem-khung-anh-v5.mjs [thư-mục-ra] [đường-dẫn...]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'docs/nang-cap-2026-11/vong-5/trang-chu';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
let failed = 0;
for (const path of paths) {
  for (const [width, height] of [[1366, 768], [390, 844], [600, 360]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)));
    await page.goto(origin + path, { waitUntil: 'networkidle' });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(height * 0.7)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(160); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    // Dải ảnh cuộn ngang: cuộn tới cuối để ảnh lười tải đủ.
    await page.evaluate(async () => {
      const track = document.querySelector('.tl-strip-track');
      if (track) { for (let x = 0; x <= track.scrollWidth; x += 400) { track.scrollLeft = x; await new Promise(r => setTimeout(r, 120)); } track.scrollLeft = 0; }
    });
    await page.waitForTimeout(600);
    const result = await page.evaluate(() => {
      const none = v => !v || v === 'none';
      const rows = [];
      for (const img of document.querySelectorAll('.tl-sf img, .pc-media img, .tl-lightbox img')) {
        if (!img.getClientRects().length) continue;
        if (img.closest('dialog:not([open])')) continue;
        const problems = [];
        let node = img;
        let depth = 0;
        while (node && !(node.classList && node.classList.contains('tl-fs')) && node.tagName !== 'MAIN' && node.tagName !== 'BODY') {
          const cs = getComputedStyle(node);
          const mask = cs.maskImage || cs.webkitMaskImage;
          if (!none(cs.clipPath)) problems.push(`clip-path ở ${node.tagName.toLowerCase()}.${String(node.className).split(' ')[0]}`);
          if (!none(mask)) problems.push(`mask ở ${node.tagName.toLowerCase()}.${String(node.className).split(' ')[0]}`);
          node = node.parentElement; depth += 1;
        }
        const cs = getComputedStyle(img);
        const box = (img.closest('.tl-sf__mask') ?? img.closest('.pc-media') ?? img.parentElement).getBoundingClientRect();
        const nat = img.naturalWidth / img.naturalHeight;
        const frameRatio = box.width / box.height;
        let cut = false;
        if (cs.objectFit === 'cover' || cs.objectFit === 'fill') cut = Math.abs(frameRatio / nat - 1) > 0.03;
        if (cut) problems.push(`cover lệch tỉ lệ ${(Math.abs(frameRatio / nat - 1) * 100).toFixed(1)}%`);
        // contain: ảnh thấy trọn nghĩa là hộp ảnh hiển thị nằm trong khung
        if (cs.objectFit === 'contain') {
          const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
          if (scale <= 0) problems.push('ảnh không có kích thước');
        }
        if (img.complete && img.naturalWidth === 0) problems.push('ảnh vỡ');
        rows.push({ src: (img.currentSrc || img.src).split('/').slice(-1)[0], fit: cs.objectFit, frame: `${box.width.toFixed(0)}x${box.height.toFixed(0)}`, natRatio: Number(nat.toFixed(3)), frameRatio: Number(frameRatio.toFixed(3)), problems });
      }
      const distinctStrip = new Set([...document.querySelectorAll('.tl-strip-item img')].map(i => (i.getAttribute('srcset') || i.src).split(' ')[0].replace(/-\d+\.webp.*$/, '')));
      // UX: vùng bấm và cỡ chữ (chỉ đo phần tử đang hiện trong trang, bỏ chữ ẩn cho trình đọc màn hình)
      const isVisible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !el.closest('[inert],[aria-hidden=true],.tl-sr,dialog:not([open])'); };
      const smallTargets = [...document.querySelectorAll('main a[href],main button,main summary,header a,header button,footer a,footer button,.tl-dock a')].filter(isVisible).filter(el => { const r = el.getBoundingClientRect(); const inline = getComputedStyle(el).display === 'inline'; return !inline && r.height < (innerWidth < 768 ? 44 : 36) - 0.5; }).map(el => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(el.getBoundingClientRect().height)}px: ${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}`);
      const smallText = new Set();
      for (const el of document.querySelectorAll('main p,main li,main dd,main td,main h3,main summary,main a,main span,footer p,footer a,footer li,footer span')) {
        if (!isVisible(el) || el.closest('.tl-stat,.tl-stackcard,svg')) continue;
        const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (own && parseFloat(getComputedStyle(el).fontSize) < 15) smallText.add(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${getComputedStyle(el).fontSize}: ${el.textContent.trim().slice(0, 24)}`);
      }
      return { smallTargets, smallText: [...smallText], rows, stripCount: document.querySelectorAll('.tl-strip-item').length, stripDistinct: distinctStrip.size, scrollWidth: document.documentElement.scrollWidth, innerWidth, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc) };
    });
    const bad = result.rows.filter(r => r.problems.length);
    const overflow = result.scrollWidth > result.innerWidth + 1;
    failed += bad.length + (overflow ? 1 : 0) + result.broken.length + errors.length;
    report.push({ path, width, height, anh: result.rows.length, cover: result.rows.filter(r => r.fit === 'cover').length, contain: result.rows.filter(r => r.fit === 'contain').length, loi: bad, tranNgang: overflow, vo: result.broken, console: errors, daiAnh: result.stripCount, daiAnhKhacNhau: result.stripDistinct, vungBamNho: result.smallTargets, chuNho: result.smallText });
    await context.close();
  }
}
await browser.close();
writeFileSync(join(out, 'kiem-khung-anh.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map(r => ({ ...r, loi: r.loi.slice(0, 5) })), null, 1));
console.log(failed === 0 ? 'ĐẠT: 0 lỗi' : `CÓ ${failed} LỖI`);
process.exit(failed ? 1 : 0);
