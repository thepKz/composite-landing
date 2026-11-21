// Kiểm độc lập: quét chữ hiện ra trên mọi màn công khai, ở 1366 và 390 và 600x360.
// Không ghi dữ liệu. Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/kiem-noidung.ts
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const origin = process.env.SITE_URL!;
const out = 'docs/nang-cap-2026-11/kiem-doc-lap';
mkdirSync(out, { recursive: true });
const routes = ['/', '/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/san-pham/be-phot-composite', '/san-pham/be-xu-ly-nuoc-thai', '/san-pham/be-nuoi-trong-thuy-san', '/san-pham/bon-chua-hoa-chat', '/san-pham/thung-cho-tom-ca', '/san-pham/xe-gom-rac', '/san-pham/composite-theo-yeu-cau', '/du-an', '/tin-tuc', '/lien-he', '/huong-dan-dat-hang', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat', '/hoi-dap', '/trang-khong-ton-tai'];
const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }, { tag: '1920', width: 1920, height: 1080 }];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const result: Record<string, unknown>[] = [];
for (const size of sizes) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, isMobile: size.width < 500, hasTouch: size.width < 500 });
  await context.addInitScript('window.__name = (f) => f');
  const page = await context.newPage();
  for (const route of routes) {
    const errors: string[] = []; const failed: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => errors.push('pageerror ' + e.message.slice(0, 200)));
    page.on('requestfailed', r => failed.push(r.url().slice(0, 120) + ' ' + (r.failure()?.errorText ?? '')));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(0, 120)); });
    const res = await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
    await page.waitForTimeout(600);
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(700);
    const data = await page.evaluate(() => {
      const vis = (el: Element) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const lum = (c: string) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]; const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return { l: 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]), a: m[3] ?? 1, rgb: m.slice(0, 3) }; };
      const bgOf = (el: Element) => { let e: Element | null = el; while (e) { const c = getComputedStyle(e).backgroundColor; const p = lum(c); if (p.a > 0.9) return p; e = e.parentElement; } return { l: 1, a: 1, rgb: [255, 255, 255] }; };
      const texts: { t: string; fs: number; contrast: number; color: string; op: number; tag: string; cls: string }[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      const seen = new Set<Element>();
      while ((n = walker.nextNode())) {
        const el = n.parentElement; if (!el || seen.has(el) || !n.textContent?.trim()) continue;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || !vis(el) || el.closest('nextjs-portal,[data-nextjs-toast]')) continue;
        seen.add(el);
        const s = getComputedStyle(el); const fg = lum(s.color); const bg = bgOf(el);
        let op = 1; let e: Element | null = el; while (e) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
        const [hi, lo] = fg.l > bg.l ? [fg.l, bg.l] : [bg.l, fg.l];
        texts.push({ t: n.textContent.trim().slice(0, 50), fs: parseFloat(s.fontSize), contrast: +((hi + 0.05) / (lo + 0.05)).toFixed(2), color: s.color, op: +op.toFixed(2), tag: el.tagName, cls: String(el.className).slice(0, 40) });
      }
      // dòng cuối lẻ một từ ở tiêu đề, nhãn, nút
      const orphans: string[] = [];
      document.querySelectorAll('h1,h2,h3,h4,button,a.btn,[class*=btn],[class*=title],summary,label').forEach(el => {
        if (!vis(el) || el.closest('nextjs-portal')) return;
        const tn = [...el.childNodes].filter(c => c.nodeType === 3 && c.textContent?.trim());
        if (!tn.length) return;
        const range = document.createRange(); range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter(r => r.width > 2);
        const tops = [...new Set(rects.map(r => Math.round(r.top / 4)))];
        if (tops.length < 2) return;
        const txt = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
        const words = txt.split(' ');
        // đo dòng cuối: các rect có top gần nhất với dưới cùng
        const lastTop = Math.max(...rects.map(r => r.top));
        const lastLineW = rects.filter(r => Math.abs(r.top - lastTop) < 6).reduce((a, r) => a + r.width, 0);
        const w = el.getBoundingClientRect().width;
        if (words.length >= 3 && lastLineW < w * 0.2 && lastLineW < 90) orphans.push(`${el.tagName}: ${txt.slice(0, 70)} (${tops.length} dòng, dòng cuối ${Math.round(lastLineW)}px)`);
      });
      // phần tử ẩn nhưng có nội dung (kẹt reveal)
      const stuck: string[] = [];
      document.querySelectorAll('[data-reveal],[class*=reveal]').forEach(el => {
        const s = getComputedStyle(el); const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && parseFloat(s.opacity) < 0.9 && el.textContent?.trim()) stuck.push(`${el.tagName}.${String(el.className).slice(0, 30)} op=${s.opacity} "${el.textContent.trim().slice(0, 30)}"`);
      });
      const small: string[] = [];
      document.querySelectorAll('a,button,input,select,summary,[role=button],[role=tab]').forEach(el => {
        if (!vis(el) || el.closest('nextjs-portal')) return;
        const r = el.getBoundingClientRect();
        if (r.height < 36 && r.width * r.height > 0 && (el.textContent?.trim() || el.getAttribute('aria-label'))) small.push(`${el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 25)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      const iframes = [...document.querySelectorAll('iframe')].map(f => ({ src: f.src.slice(0, 60), w: f.getBoundingClientRect().width, h: f.getBoundingClientRect().height }));
      const body = document.body.innerText;
      return { texts, orphans, stuck, small, iframes, overflowX: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length, title: document.title, bodyText: body, imgBroken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(-60)) };
    });
    result.push({ size: size.tag, route, status: res?.status(), errors: [...new Set(errors)], failed: [...new Set(failed)], ...data });
    page.removeAllListeners('console'); page.removeAllListeners('pageerror'); page.removeAllListeners('requestfailed'); page.removeAllListeners('response');
  }
  await context.close();
}
await browser.close();
writeFileSync(`${out}/du-lieu-noidung.json`, JSON.stringify(result));
console.log('xong', result.length);
