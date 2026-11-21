// Kiểm độc lập, lượt hai: làm rõ các nghi vấn của lượt một. Không ghi dữ liệu.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/kiem-tiep.ts
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const origin = process.env.SITE_URL!;
const out = 'docs/nang-cap-2026-11/kiem-doc-lap';
const res: Record<string, unknown> = {};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
await ctx.addInitScript('window.__name = (f) => f');
const page = await ctx.newPage();

// 1. Esc đóng menu Sản phẩm
await page.goto(origin + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
const trig = page.locator('button.tl-menu-trigger');
await trig.click(); await page.waitForTimeout(500);
const openState = await trig.getAttribute('aria-expanded');
const focusAfterOpen = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
await page.keyboard.press('Escape'); await page.waitForTimeout(500);
res.menuEsc = { openState, afterEsc: await trig.getAttribute('aria-expanded'), focusAfterOpen, focusAfterEsc: await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80)) };
// click ra ngoài
await trig.click(); await page.waitForTimeout(400); await page.mouse.click(700, 600); await page.waitForTimeout(500);
res.menuClickOutside = await trig.getAttribute('aria-expanded');
// rê chuột ra
await trig.hover(); await page.waitForTimeout(400); const hov = await trig.getAttribute('aria-expanded'); await page.mouse.move(700, 700); await page.waitForTimeout(700);
res.menuHover = { opened: hov, afterLeave: await trig.getAttribute('aria-expanded') };

// 2. Banner tự chuyển cảnh, đo 3 lần mỗi 4s
await page.goto(origin + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
await page.mouse.move(5, 5);
const seq: string[] = [];
for (let i = 0; i < 6; i++) { seq.push(await page.evaluate(() => document.querySelector('.tl-hero-slide[data-active="true"]')?.getAttribute('aria-label') ?? '?')); await page.waitForTimeout(3500); }
res.heroAuto = seq;

// 3. Thẻ sản phẩm trang chủ: vì sao hover quá thời gian
await page.goto(origin + '/', { waitUntil: 'networkidle' });
await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
await page.waitForTimeout(800);
res.cards = await page.evaluate(() => [...document.querySelectorAll('a[href^="/san-pham/"]')].map(a => { const r = a.getBoundingClientRect(); const s = getComputedStyle(a); return { href: a.getAttribute('href'), txt: (a.textContent ?? '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), op: s.opacity, vis: s.visibility }; }).slice(0, 14));
const c = page.locator('a[href="/san-pham/be-biogas-composite"]').filter({ hasText: /Bể biogas composite/ });
res.cardCount = await c.count();
try { await c.first().scrollIntoViewIfNeeded({ timeout: 5000 }); await c.first().hover({ timeout: 5000 }); await page.waitForTimeout(400); await page.screenshot({ path: `${out}/1366-the-hover.png` }); res.hover = 'ok'; }
catch (e) { res.hover = String(e).split('\n').slice(0, 6).join(' | '); await page.screenshot({ path: `${out}/1366-the-hover-loi.png` }); }

// 4. Reveal có đặt lại khi cuộn ngược không
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1200);
res.revealAfterUp = await page.evaluate(() => { const els = [...document.querySelectorAll('[data-reveal]')]; return { total: els.length, hidden: els.filter(e => parseFloat(getComputedStyle(e).opacity) < 0.1).length }; });
await page.evaluate(() => window.scrollTo(0, 2400)); await page.waitForTimeout(250);
const mid = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).map(e => +parseFloat(getComputedStyle(e).opacity).toFixed(2)));
await page.waitForTimeout(1200);
const end = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).map(e => +parseFloat(getComputedStyle(e).opacity).toFixed(2)));
res.revealJump = { after250ms: mid, after1450ms: end };
// cuộn xuống đáy rồi chờ lâu
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(2500);
res.revealBottomStuck = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && parseFloat(getComputedStyle(e).opacity) < 0.9; }).map(e => (e.textContent ?? '').trim().slice(0, 30)));
await page.screenshot({ path: `${out}/1366-home-day-trang.png` });

// 5. Hộp xem ảnh: Tab có lọt ra phần tử trang phía sau không
await page.goto(origin + '/san-pham/be-biogas-composite', { waitUntil: 'networkidle' }); await page.waitForTimeout(700);
await page.getByRole('button', { name: /Phóng to/ }).first().click(); await page.waitForTimeout(500);
const trail: string[] = [];
for (let i = 0; i < 10; i++) { await page.keyboard.press('Tab'); trail.push(await page.evaluate(() => { const e = document.activeElement; return e ? `${e.tagName}${e.closest('dialog') ? '(trong hộp)' : '(NGOÀI)'}:${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 18)}` : 'null'; })); }
res.lightboxTab = trail;

// 6. Nút nổi: tương phản nhãn, che chữ
await page.goto(origin + '/du-an', { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
res.floating = await page.evaluate(() => [...document.querySelectorAll('[class*=contact-shortcut],[class*=float],[class*=fab]')].slice(0, 12).map(e => { const s = getComputedStyle(e); return `${e.tagName}.${String(e.className).slice(0, 30)} color=${s.color} bg=${s.backgroundColor} op=${s.opacity} fs=${s.fontSize} "${(e.textContent ?? '').trim().slice(0, 12)}"`; }));

// 7. Bản đồ
const maps: string[] = [];
const p2 = await ctx.newPage();
p2.on('response', r => { if (/google\.com\/maps|gstatic|googleapis/.test(r.url())) maps.push(`${r.status()} ${r.url().slice(0, 70)}`); });
p2.on('requestfailed', r => { if (/google|gstatic/.test(r.url())) maps.push(`FAIL ${r.failure()?.errorText} ${r.url().slice(0, 70)}`); });
await p2.goto(origin + '/lien-he', { waitUntil: 'networkidle' }); await p2.waitForTimeout(500);
await p2.locator('iframe').first().scrollIntoViewIfNeeded(); await p2.waitForTimeout(5000);
res.maps = maps; await p2.screenshot({ path: `${out}/1366-ban-do.png` });

writeFileSync(`${out}/du-lieu-tiep.json`, JSON.stringify(res, null, 1));
await browser.close();
console.log(JSON.stringify(res, null, 1));
