// Vòng hai, vùng khung và trang chủ: chụp banner ba cảnh, từng khối trang chủ và đo đè, tràn, cỡ chữ, vùng bấm, khung hình khi cuộn.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/vong2-khung.ts <thư-mục-ra>
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const origin = process.env.SITE_URL;
if (!out || !origin) { console.error('Thiếu thư mục ra hoặc SITE_URL.'); process.exit(1); }
mkdirSync(out, { recursive: true });

const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }];
const report: Record<string, unknown>[] = [];

async function heroOverlap(page: Page) {
  return page.evaluate(() => {
    const slide = document.querySelector<HTMLElement>('.tl-hero-slide[data-active=true]');
    if (!slide) return { error: 'không có cảnh' };
    const box = (el: Element) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const hit = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1;
    const actions = [...slide.querySelectorAll('.tl-hero-actions a')].map(box);
    const controls = [...document.querySelectorAll('.tl-hero-controls button')].map(box);
    const title = slide.querySelector('.tl-hero-title');
    const clash: string[] = [];
    actions.forEach((a, i) => controls.forEach((c, j) => { if (hit(a, c)) clash.push(`nút ${i} đè điều khiển ${j}`); }));
    const textBlocks = [...slide.querySelectorAll('.tl-hero-kicker,.tl-hero-title,.tl-hero-text')].map(box);
    textBlocks.forEach((a, i) => controls.forEach((c, j) => { if (hit(a, c)) clash.push(`chữ ${i} đè điều khiển ${j}`); }));
    const t = title ? box(title) : null;
    const firstBtn = actions[0];
    return { clash, titleInView: t ? t.t >= 0 && t.b <= innerHeight : false, ctaInView: firstBtn ? firstBtn.t >= 0 && firstBtn.b <= innerHeight : false, ctaBottom: firstBtn?.b, vh: innerHeight };
  });
}

async function measure(page: Page) {
  return page.evaluate(() => {
    const wide = [...document.querySelectorAll<HTMLElement>('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.tl-hero-slide-media,.tl-bento-leads,.tl-steps,.tl-strip-track,.tl-hscroll'); }).slice(0, 5).map(el => `${el.tagName}.${String(el.className).slice(0, 40)}`);
    const hiddenReveal = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(el => getComputedStyle(el).opacity === '0').length;
    const smallText = [...document.querySelectorAll<HTMLElement>('main p, main li, main dd, main span, footer p, footer a')].filter(el => el.offsetParent && el.children.length === 0 && el.textContent?.trim() && parseFloat(getComputedStyle(el).fontSize) < 14).map(el => `${el.tagName}.${String(el.className).slice(0, 24)}:${el.textContent!.trim().slice(0, 20)}`).slice(0, 6);
    const smallTargets = [...document.querySelectorAll<HTMLElement>('header a, header button, .tl-dock a, .tl-form button, .tl-hero button, .tl-hero a, main a.pressable, main button')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && el.offsetParent && r.height < (innerWidth < 600 ? 44 : 36); }).map(el => `${el.tagName}.${String(el.className).slice(0, 30)}:${Math.round(el.getBoundingClientRect().height)}`).slice(0, 8);
    const banned = (document.body.innerText.match(/[·—;!]|&nbsp;| | |⁠/g) || []).length;
    const brokenImages = [...document.images].filter(img => img.complete && img.naturalWidth === 0 && img.currentSrc).map(img => img.currentSrc.slice(-60));
    const emptyImages = [...document.images].filter(img => img.loading === 'lazy' && !img.complete).length;
    return { scrollWidth: document.documentElement.scrollWidth, innerWidth, wide, hiddenReveal, smallText, smallTargets, banned, brokenImages, emptyImages };
  });
}

// Dòng cuối chỉ một từ ở tiêu đề, nhãn, đoạn ngắn
async function orphans(page: Page) {
  return page.evaluate(() => {
    const found: string[] = [];
    document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main figcaption, footer p span, footer .tl-footer-cta p').forEach(el => {
      if (!el.offsetParent || !el.textContent || el.children.length > 3 || el.closest('.tl-sr') || el.classList.contains('tl-sr') || el.getBoundingClientRect().width < 20) return;
      const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent!.trim().length > 8);
      if (!node) return;
      const text = node.textContent!;
      const range = document.createRange();
      const lines: string[] = []; let lastTop = -1, current = '';
      const words = text.split(/(\s+)/);
      let offset = 0;
      for (const w of words) {
        if (!w.trim()) { offset += w.length; current += w; continue; }
        range.setStart(node, offset); range.setEnd(node, offset + w.length);
        const top = Math.round(range.getBoundingClientRect().top);
        if (lastTop !== -1 && Math.abs(top - lastTop) > 6) { lines.push(current.trim()); current = ''; }
        current += w; lastTop = top; offset += w.length;
      }
      lines.push(current.trim());
      if (lines.length > 1 && lines[lines.length - 1].split(/\s+/).length === 1) found.push(`${el.tagName}:${lines.join(' / ').slice(-110)}`);
    });
    return found;
  });
}

for (const size of sizes) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, hasTouch: size.width < 500 });
  const page = await context.newPage();
  await page.addInitScript("window.__name = (f) => f;");
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 160)); });
  page.on('pageerror', e => errors.push(String(e).slice(0, 300)));

  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  // Banner: ba cảnh
  for (let scene = 0; scene < 3; scene++) {
    await page.evaluate((i: number) => (document.querySelectorAll('.tl-hero-dot')[i] as HTMLElement).click(), scene);
    await page.waitForTimeout(2200);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: join(out, `hero-canh-${scene + 1}-${size.tag}.png`) });
    report.push({ size: size.tag, scene: scene + 1, hero: await heroOverlap(page) });
  }

  // Chụp toàn trang ngay, chưa cuộn: kiểm không có ô ảnh trống
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: join(out, `toan-trang-chua-cuon-${size.tag}.png`), fullPage: true });

  // Cuộn chậm hết trang để kích hoạt hiện dần và ảnh lười, đo khung hình
  const fps = await page.evaluate(async () => {
    const frames: number[] = [];
    let last = performance.now(); let running = true;
    const loop = (now: number) => { frames.push(now - last); last = now; if (running) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const total = document.documentElement.scrollHeight - innerHeight;
    for (let y = 0; y <= total; y += 90) { scrollTo(0, y); await new Promise(r => setTimeout(r, 16)); }
    running = false;
    const sorted = [...frames].sort((a, b) => a - b);
    return { frames: frames.length, p95: Math.round(sorted[Math.floor(sorted.length * .95)] * 10) / 10, worst: Math.round(sorted[sorted.length - 1]), over50: frames.filter(f => f > 50).length };
  });
  await page.waitForTimeout(900);
  report.push({ size: size.tag, scrollFrames: fps });

  // Chụp từng khối
  await page.evaluate(() => scrollTo(0, 0));
  const hide = await page.addStyleTag({ content: '.public-header{position:relative!important}.tl-dock{display:none!important}' });
  const sections = page.locator('main > section, main > div > section');
  const count = await sections.count();
  for (let i = 0; i < count; i++) {
    const s = sections.nth(i);
    await s.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const name = ((await s.getAttribute('class')) || `khoi${i}`).split(' ').find(c => c.startsWith('tl-') || c.startsWith('hm-')) || `khoi${i}`;
    await s.screenshot({ path: join(out, `khoi-${String(i).padStart(2, '0')}-${name}-${size.tag}.png`) });
  }
  await hide.evaluate(element => (element as HTMLElement).remove());
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `toan-trang-da-cuon-${size.tag}.png`), fullPage: true });
  // Chân trang
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(out, `chan-trang-${size.tag}.png`) });

  report.push({ size: size.tag, measure: await measure(page), orphans: await orphans(page), errors });
  await browser.close();
}
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
