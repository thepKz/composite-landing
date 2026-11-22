// Vòng 5: chụp mọi trang phụ ở ba khung và quét lỗi. Chạy: node scripts/kiem-trang-phu-v5.mjs <thư-mục-ra> [chỉ-một-khung: 1366|390|600]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const out = process.argv[2]; const only = process.argv[3];
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const paths = ['/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-nuoi-trong-thuy-san', '/san-pham/thung-cho-tom-ca', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/san-pham/be-phot-composite', '/san-pham/be-xu-ly-nuoc-thai', '/san-pham/bon-chua-hoa-chat', '/san-pham/xe-gom-rac', '/san-pham/composite-theo-yeu-cau', '/du-an', '/hoi-dap', '/lien-he', '/huong-dan-dat-hang', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat', '/trang-khong-ton-tai'];
const sizes = [[1366, 768], [390, 844], [600, 360]].filter(([w]) => !only || String(w) === only);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); }); page.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  for (const path of paths) {
    errs.length = 0;
    const name = (path === '/' ? 'home' : path.replace(/^\//, '').replace(/\W+/g, '-'));
    await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
    await page.screenshot({ path: join(out, `${w}-${name}-dau.png`) });
    // cuộn hết trang để ảnh lười tải
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.8)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
    for (const sel of ['.tp-strip-track', '.pg-thumbs']) { const n = await page.locator(sel).count(); for (let i = 0; i < n; i++) { if (!(await page.locator(sel).nth(i).isVisible())) continue; await page.locator(sel).nth(i).scrollIntoViewIfNeeded(); for (let k = 0; k < 8; k++) { await page.locator(sel).nth(i).evaluate(el => el.scrollBy(el.clientWidth * 0.7, 0)); await page.waitForTimeout(120); } await page.locator(sel).nth(i).evaluate(el => el.scrollTo(0, 0)); } }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
    await page.screenshot({ path: join(out, `${w}-${name}-full.png`), fullPage: true });
    const r = await page.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
      const imgs = [...document.querySelectorAll('main img, dialog img')].filter(vis).filter(i => !(i.getAttribute('src') || '').startsWith('/images/decor/') && !i.closest('[class*="backdrop"]') && !i.closest('dialog:not([open])'));
      const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
      const decor = el => !!el.closest('[aria-hidden="true"], .tl-fs__bg, .tl-fs__backdrop, .tl-backdrop, .tl-pt, [class*="backdrop"], [class*="pattern"]');
      const clipped = [];
      for (const img of imgs) { let el = img, depth = 0; while (el && el.tagName !== 'MAIN' && depth < 5) { const cs = getComputedStyle(el); if ((cs.clipPath && cs.clipPath !== 'none') || (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none')) { clipped.push(img.getAttribute('src') + ' <- ' + el.className); break; } el = el.parentElement; depth++; } }
      const cover = imgs.filter(i => getComputedStyle(i).objectFit === 'cover' && !decor(i) && i.naturalWidth).map(i => { const r = i.getBoundingClientRect(); const dev = Math.abs((r.width / r.height) / (i.naturalWidth / i.naturalHeight) - 1); return { src: i.getAttribute('src'), dev: +(dev * 100).toFixed(1) }; }).filter(x => x.dev > 3);
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const small = [...document.querySelectorAll('main a, main button, header a, header button')].filter(vis).filter(e => !e.closest('.tp-sr') && e.getBoundingClientRect().height < (innerWidth < 500 ? 44 : 36) && e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'inline').map(e => `${e.tagName}.${String(e.className).slice(0, 30)}:${Math.round(e.getBoundingClientRect().height)} ${(e.textContent || '').trim().slice(0, 18)}`);
      const fs = [...document.querySelectorAll('main p, main li, main dd')].filter(vis).map(e => parseFloat(getComputedStyle(e).fontSize)).filter(v => v < 15.5).length;
      return { imgs: imgs.length, broken, clipped, cover, overflow, small, smallFont: fs };
    });
    report.push({ w, path, errs: [...errs], ...r });
    console.log(w, path, 'ảnh', r.imgs, 'vỡ', r.broken.length, 'clip', r.clipped.length, 'cover lệch', r.cover.length, 'tràn', r.overflow, 'nút nhỏ', r.small.length, 'chữ <15.5', r.smallFont, 'lỗi', errs.length);
  }
  await ctx.close();
}
await b.close();
writeFileSync(join(out, `bao-cao-${only || 'tat-ca'}.json`), JSON.stringify(report, null, 1));
