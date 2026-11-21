// Chụp các trang vùng trang-phu ở 1366x768, 390x844, 600x360 và đo nhanh. Không cần cơ sở dữ liệu.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/shots-vong2-trang-phu.mjs <thư-mục-ra> [--only=a,b]
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const out = process.argv[2]; const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const only = process.argv.find(a => a.startsWith('--only='))?.split('=')[1]?.split(',');
mkdirSync(out, { recursive: true });
const routes = [
  ['gioi-thieu', '/gioi-thieu'], ['san-pham', '/san-pham'], ['sp-biogas', '/san-pham/be-biogas-composite'],
  ['sp-nhom-phot', '/san-pham/be-phot-va-xu-ly-nuoc-thai'], ['sp-thuy-san', '/san-pham/be-nuoi-trong-thuy-san'],
  ['sp-phot', '/san-pham/be-phot-composite'], ['sp-hoa-chat', '/san-pham/bon-chua-hoa-chat'], ['sp-rac', '/san-pham/xe-gom-rac'],
  ['du-an', '/du-an'], ['lien-he', '/lien-he'], ['huong-dan', '/huong-dan-dat-hang'], ['bao-hanh', '/chinh-sach-bao-hanh'],
  ['bao-mat', '/chinh-sach-bao-mat'], ['hoi-dap', '/hoi-dap'], ['404', '/trang-khong-ton-tai'],
].filter(([n]) => !only || only.includes(n));
const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }];
const report = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const s of sizes) {
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, reducedMotion: 'reduce', isMobile: s.width < 500, hasTouch: s.width < 500 });
  const page = await ctx.newPage();
  for (const [name, path] of routes) {
    const errors = [];
    const on = m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); };
    page.on('console', on); page.on('pageerror', e => errors.push('pageerror ' + e.message.slice(0, 200)));
    const r = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => { errors.push(String(e).slice(0, 150)); return null; });
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(out, `${name}-${s.tag}-fold.png`) });
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(500);
    if (s.tag !== '600') await page.screenshot({ path: join(out, `${name}-${s.tag}.png`), fullPage: true });
    const m = await page.evaluate(() => {
      const vw = innerWidth;
      const out = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > vw + 1 && getComputedStyle(e).position !== 'fixed'; }).length;
      const small = [...document.querySelectorAll('a,button,[role=button],input,select,summary')].filter(e => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.height < (vw < 500 ? 44 : 36) && e.offsetParent !== null && !e.closest('[aria-hidden=true]') && !(e.tagName === 'A' && getComputedStyle(e).display === 'inline'); }).map(e => (e.tagName + '.' + String(e.className).slice(0, 40) + ' ' + Math.round(e.getBoundingClientRect().height) + 'px ' + (e.textContent || '').trim().slice(0, 24)));
      // dòng cuối lẻ một từ ở tiêu đề, nhãn
      const orphan = [...document.querySelectorAll('h1,h2,h3,h4,.chip,button,a[class*=button]')].filter(e => e.offsetParent !== null).filter(e => {
        const t = (e.textContent || '').trim(); if (t.split(/\s+/).length < 3) return false;
        const rg = document.createRange(); rg.selectNodeContents(e); const rs = [...rg.getClientRects()]; if (!rs.length) return false;
        const lines = [...new Set(rs.map(r => Math.round(r.top)))]; if (lines.length < 2) return false;
        const lastTop = Math.max(...lines); const last = rs.filter(r => Math.round(r.top) === lastTop); const w = last.reduce((a, r) => a + r.width, 0);
        const total = Math.max(...rs.map(r => r.right)) - Math.min(...rs.map(r => r.left));
        return w < total * 0.2 && w < 90;
      }).map(e => (e.textContent || '').trim().slice(0, 50));
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0).length;
      return { overflowX: document.documentElement.scrollWidth - vw, outEls: out, small: small.slice(0, 12), orphan, broken };
    });
    page.removeListener('console', on);
    report.push({ name, size: s.tag, status: r?.status() ?? null, ...m, errors });
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
for (const r of report) if (r.overflowX > 0 || r.broken || r.errors.length || r.orphan.length || r.small.length) console.log(r.name, r.size, 'tràn', r.overflowX, 'vỡ', r.broken, 'lỗi', r.errors.length, 'lẻ', JSON.stringify(r.orphan), 'nhỏ', JSON.stringify(r.small));
