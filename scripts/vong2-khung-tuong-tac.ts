// Vòng hai, vùng khung và trang chủ: kiểm tương tác và chuyển động có nghĩa.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/vong2-khung-tuong-tac.ts <thư-mục-ra>
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const origin = process.env.SITE_URL;
if (!out || !origin) { console.error('Thiếu thư mục ra hoặc SITE_URL.'); process.exit(1); }
mkdirSync(out, { recursive: true });
const result: Record<string, unknown> = {};
const errors: string[] = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function open(width: number, height: number, reduced = false) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference', hasTouch: width < 500 });
  const page = await context.newPage();
  await page.addInitScript('window.__name = (f) => f;');
  page.on('console', m => { if (m.type() === 'error') errors.push(`${width}${reduced ? 'r' : ''}: ${m.text().slice(0, 200)}`); });
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 120)); });
  page.on('pageerror', e => errors.push(`${width}${reduced ? 'r' : ''}: ${String(e).slice(0, 200)}`));
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  return { context, page };
}

// 1. Đường quy trình chạy theo cuộn (1366, có chuyển động)
{
  const { context, page } = await open(1366, 768);
  const lineScale = () => page.evaluate(() => {
    const el = document.querySelector('.tl-steps')!;
    const t = getComputedStyle(el, '::after').transform;
    const halo = [...document.querySelectorAll('.tl-step-number')].map(n => Number(getComputedStyle(n, '::before').opacity).toFixed(2));
    return { transform: t, halo, supported: CSS.supports('animation-timeline: view()') };
  });
  const samples: unknown[] = [];
  const top = await page.evaluate(() => { const r = document.querySelector('.tl-steps')!.getBoundingClientRect(); return r.top + scrollY; });
  for (const offset of [-200, 40, 180, 300, 420]) {
    await page.evaluate(([y]) => scrollTo(0, y), [top - 768 + 768 * 0 + offset + 400]);
    await page.waitForTimeout(350);
    samples.push({ stepsTopInViewport: await page.evaluate(() => Math.round(document.querySelector('.tl-steps')!.getBoundingClientRect().top)), ...(await lineScale()) });
  }
  result.duongQuyTrinh = samples;
  await context.close();
}

// 2. Số liệu đếm lên một lần
{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.addInitScript('window.__name = (f) => f;');
  await page.goto(origin + '/', { waitUntil: 'commit' });
  const seen: string[] = [];
  for (let i = 0; i < 24; i++) { await page.waitForTimeout(120); seen.push(await page.evaluate(() => (document.querySelector('.tl-metric-value [aria-hidden]') as HTMLElement | null)?.textContent || '-').catch(() => '-')); }
  await page.waitForTimeout(800);
  await page.evaluate(() => scrollTo(0, 900)); await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1600);
  const again: string[] = [];
  for (let i = 0; i < 5; i++) { await page.waitForTimeout(100); again.push(await page.evaluate(() => (document.querySelector('.tl-metric-value [aria-hidden]') as HTMLElement).textContent || '')); }
  result.demSo = { khiTai: Array.from(new Set(seen)), quayLaiSauKhiCuon: Array.from(new Set(again)) };
  await context.close();
}

// 3. Hộp xem ảnh, mũi tên dải ảnh, vùng bấm
for (const [width, height] of [[1366, 768], [390, 844]] as const) {
  const { context, page } = await open(width, height);
  await page.evaluate(() => document.querySelector('.tl-photos')!.scrollIntoView());
  await page.waitForTimeout(900);
  const info: Record<string, unknown> = {};
  info.mui_ten = await page.evaluate(() => [...document.querySelectorAll('.tl-strip-arrow')].map(b => Math.round(b.getBoundingClientRect().height)));
  const before = await page.evaluate(() => document.querySelector('.tl-strip-track')!.scrollLeft);
  await page.evaluate(() => document.querySelector('.tl-strip-bar')!.scrollIntoView({ block: 'center' })); await page.waitForTimeout(500);
  await page.locator('.tl-strip-arrow').nth(1).click();
  await page.waitForTimeout(900);
  info.cuonSangPhai = await page.evaluate(b => Math.round(document.querySelector('.tl-strip-track')!.scrollLeft - (b as number)), before);
  await page.evaluate(() => (document.querySelector('.tl-strip-photo') as HTMLElement).focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  info.hopMo = await page.evaluate(() => (document.querySelector('.tl-lightbox') as HTMLDialogElement).open);
  info.tieuDiemTrong = await page.evaluate(() => !!document.activeElement?.closest('.tl-lightbox'));
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  info.tabGiuTrong = await page.evaluate(() => !!document.activeElement?.closest('.tl-lightbox'));
  await page.keyboard.press('ArrowRight');
  info.anhSau = await page.evaluate(() => document.querySelector('.tl-lightbox figcaption span:last-child')!.textContent);
  await page.screenshot({ path: join(out, `hop-xem-anh-${width}.png`) });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  info.dong = await page.evaluate(() => !(document.querySelector('.tl-lightbox') as HTMLDialogElement).open);
  info.tieuDiemVe = await page.evaluate(() => document.activeElement?.classList.contains('tl-strip-photo'));
  result[`dai-anh-${width}`] = info;
  await context.close();
}

// 4. Nút ghim máy bàn, bản đồ chân trang
{
  const { context, page } = await open(1366, 768);
  const dock = () => page.evaluate(() => { const d = document.querySelector('.tl-dock') as HTMLElement; const s = getComputedStyle(d); const links = [...d.querySelectorAll('a')].filter(a => getComputedStyle(a).display !== 'none').map(a => `${a.getAttribute('aria-label')}:${Math.round(a.getBoundingClientRect().height)}`); return { visibility: s.visibility, links }; });
  result.nutGhimDauTrang = await dock();
  await page.evaluate(() => scrollTo(0, 1400)); await page.waitForTimeout(500);
  result.nutGhimSauCuon = await dock();
  const mapBefore = await page.evaluate(() => ({ iframe: !!document.querySelector('.tl-footer-map iframe'), holderText: document.querySelector('.tl-footer-map-holder')?.textContent }));
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(2500);
  const mapAfter = await page.evaluate(() => { const f = document.querySelector('.tl-footer-map-frame')!.getBoundingClientRect(); return { iframe: !!document.querySelector('.tl-footer-map iframe'), ready: document.querySelector('.tl-footer-map')!.getAttribute('data-ready'), w: Math.round(f.width), h: Math.round(f.height) }; });
  result.banDo = { khiMoiVaoTrang: mapBefore, sauKhiCuonXuong: mapAfter };
  await context.close();
}

// 5. Bản giảm chuyển động
{
  const { context, page } = await open(1366, 768, true);
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(800);
  result.giamChuyenDong = await page.evaluate(() => ({
    khoiAn: [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(e => getComputedStyle(e).opacity === '0').length,
    duongQuyTrinh: getComputedStyle(document.querySelector('.tl-steps')!, '::after').transform,
    chuTieuDe: getComputedStyle(document.querySelector('.tl-hero-slide[data-active=true] .tl-word > span')!).transform,
  }));
  await context.close();
}

// 6. Banner: đổi cảnh bằng mũi tên, không đè ở cả ba cỡ, giữa lúc chuyển
for (const [width, height] of [[1366, 768], [390, 844], [600, 360]] as const) {
  const { context, page } = await open(width, height);
  const rows: unknown[] = [];
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => (document.querySelector('[aria-label="Cảnh sau"]') as HTMLElement).click());
    await page.waitForTimeout(250);
    if (i === 0) await page.screenshot({ path: join(out, `hero-giua-chuyen-${width}.png`) });
    await page.waitForTimeout(1500);
    rows.push(await page.evaluate(() => {
      const slide = document.querySelector('.tl-hero-slide[data-active=true]')!;
      const box = (e: Element) => e.getBoundingClientRect();
      const hit = (a: DOMRect, b: DOMRect) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const controls = [...document.querySelectorAll('.tl-hero-controls button')].map(box);
      const parts = [...slide.querySelectorAll('.tl-hero-actions a, .tl-hero-title, .tl-hero-text, .tl-hero-kicker')].map(box);
      const clash = parts.some(p => controls.some(c => hit(p, c)));
      const frame = slide.querySelector('.tl-hero-frame');
      const metrics = document.querySelector('.tl-metrics')!.getBoundingClientRect();
      const frameHitsMetrics = frame ? box(frame).bottom > metrics.top : false;
      return { scene: slide.getAttribute('aria-label'), clash, frameHitsMetrics, ctaInView: box(slide.querySelector('.tl-hero-actions a')!).bottom <= innerHeight };
    }));
  }
  result[`banner-${width}x${height}`] = rows;
  await context.close();
}

// 7. Tab: mọi điểm dừng nằm trong khung nhìn ở 600x360 và 1366, iframe bản đồ không là điểm dừng, ô ảnh dải ảnh luôn có hình
for (const [width, height] of [[600, 360], [1366, 768]] as const) {
  const { context, page } = await open(width, height);
  const stops: string[] = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => { const e = document.activeElement as HTMLElement; const r = e.getBoundingClientRect(); return (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 24) + (r.bottom < 0 || r.top > innerHeight ? ' NGOÀI KHUNG' : ''); }));
  }
  result['tab-' + width] = stops;
  if (width === 1366) {
    result.iframeBanDo = await page.evaluate(() => document.querySelector('.tl-footer-map iframe') ? document.querySelector('.tl-footer-map iframe')!.getAttribute('tabindex') : 'chưa tải');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(2500);
    result.iframeBanDoSauKhiTai = await page.evaluate(() => document.querySelector('.tl-footer-map iframe')?.getAttribute('tabindex'));
    result.oAnhTrong = await page.evaluate(() => [...document.querySelectorAll('.tl-strip-photo img')].map(i => (i as HTMLImageElement).naturalWidth > 0));
  }
  await context.close();
}

result.loiConsole = errors;
await browser.close();
writeFileSync(join(out, 'tuong-tac.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 1));
