// Kiểm chuyển động và morph của các trang phụ vòng bốn (Playwright, Chrome thật).
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/kiem-chuyen-dong-trang-phu-v4.mjs
import { chromium } from '@playwright/test';
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const res = []; const ok = (name, pass, detail = '') => { res.push({ name, pass }); console.log(pass ? 'ĐẠT ' : 'LỖI ', name, detail); };
const scrollAll = async page => page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } await new Promise(r => setTimeout(r, 400)); });

// 1. Có chuyển động: số đếm tới giá trị cuối, đường vẽ có dash, ảnh trượt có transform, không khối nào kẹt ẩn sau khi cuộn
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage(); const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); }); page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
  await page.goto(origin + '/gioi-thieu', { waitUntil: 'networkidle' });
  const before = await page.evaluate(() => [...document.querySelectorAll('[data-count]')].map(e => e.textContent));
  await scrollAll(page);
  const info = await page.evaluate(() => ({
    counts: [...document.querySelectorAll('.tp4-metric__v [data-count]')].map(e => e.textContent + '/' + e.getAttribute('data-count')),
    year: document.querySelector('.tl-stat__num[data-count]')?.textContent,
    drawn: [...document.querySelectorAll('[data-draw]')].map(p => getComputedStyle(p).strokeDasharray),
    par: [...document.querySelectorAll('[data-parallax]')].map(e => getComputedStyle(e).transform).filter(t => t !== 'none').length,
    parTotal: document.querySelectorAll('[data-parallax]').length,
    depth: [...document.querySelectorAll('[data-depth]')].map(e => getComputedStyle(e).transform).filter(t => t !== 'none').length,
    hidden: [...document.querySelectorAll('.tp-rv')].filter(e => getComputedStyle(e).opacity === '0').length,
  }));
  ok('Giới thiệu: số đếm về giá trị cuối', info.counts.every(c => c.split('/')[0].replace(/\D/g, '') === c.split('/')[1]), JSON.stringify(info.counts) + ' năm ' + info.year);
  ok('Giới thiệu: đường data-draw có nét đứt vẽ dần', info.drawn.length >= 2 && info.drawn.every(d => d !== 'none'), JSON.stringify(info.drawn));
  ok('Giới thiệu: ảnh trong khung trượt chậm (data-parallax có transform)', info.par > 0, `${info.par}/${info.parTotal}`);
  ok('Giới thiệu: cụm chồng lớp tách theo độ sâu (data-depth)', info.depth > 0, String(info.depth));
  ok('Giới thiệu: không khối nào kẹt ẩn sau khi cuộn', info.hidden === 0, String(info.hidden));
  ok('Giới thiệu: không lỗi console', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
// 2. Giảm chuyển động: nội dung đủ, số đúng ngay, không transform trượt
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const path of ['/gioi-thieu', '/san-pham/be-biogas-composite', '/huong-dan-dat-hang', '/hoi-dap']) {
    await page.goto(origin + path, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll('.tp-rv')].filter(e => getComputedStyle(e).opacity === '0').length,
      moved: [...document.querySelectorAll('[data-parallax],[data-depth]')].filter(e => getComputedStyle(e).transform !== 'none').length,
      counts: [...document.querySelectorAll('[data-count]')].map(e => e.textContent).join(','),
    }));
    ok(`Giảm chuyển động ${path}: không ẩn, không trượt`, r.hidden === 0 && r.moved === 0, JSON.stringify(r));
  }
  await ctx.close();
}
// 3. Không JavaScript: nội dung vẫn đủ
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  for (const path of ['/gioi-thieu', '/san-pham', '/san-pham/be-nuoi-trong-thuy-san', '/lien-he']) {
    await page.goto(origin + path, { waitUntil: 'load' });
    const r = await page.evaluate(() => ({ hidden: [...document.querySelectorAll('main .tp-rv')].filter(e => getComputedStyle(e).opacity === '0').length, h1: document.querySelector('main h1')?.textContent, imgs: document.querySelectorAll('main img').length }));
    ok(`Không JS ${path}: nội dung thấy đủ`, r.hidden === 0 && !!r.h1, JSON.stringify(r));
  }
  await ctx.close();
}
// 4. Morph danh sách sang chi tiết rồi quay lại
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    const orig = document.startViewTransition?.bind(document); window.__vt = [];
    if (!orig) return;
    document.startViewTransition = (cb) => { const t = orig(cb); t.ready.then(() => { window.__vt.push([...new Set(document.getAnimations().map(a => a.effect?.pseudoElement).filter(Boolean))]); }).catch(e => window.__vt.push(['ready-rejected ' + e])); return t; };
  });
  await page.goto(origin + '/san-pham', { waitUntil: 'networkidle' });
  const supported = await page.evaluate(() => typeof document.startViewTransition === 'function');
  ok('Trình duyệt có View Transitions', supported);
  await page.evaluate(async () => { for (let y = 0; y < 900; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } });
  await page.waitForTimeout(800);
  const link = page.locator('a.tp-card[href="/san-pham/be-biogas-composite"]').first();
  await link.click();
  await page.waitForURL('**/san-pham/be-biogas-composite'); await page.waitForTimeout(1200);
  const fwd = await page.evaluate(() => window.__vt.flat());
  const want = ['::view-transition-group(tl-product-photo-be-biogas-composite)', '::view-transition-group(tl-product-title-be-biogas-composite)'];
  ok('Morph tới trang chi tiết: có cặp ảnh và cặp tên', want.every(w => fwd.includes(w)), fwd.filter(x => x.includes('tl-product')).join(' ') || fwd.slice(0, 6).join(' '));
  const h1 = await page.locator('main h1').textContent(); ok('Trang chi tiết có tiêu đề', /biogas/i.test(h1 || ''), h1 || '');
  await page.evaluate(() => { window.__vt.length = 0; });
  await page.locator('.tp4-crumbs a', { hasText: 'Sản phẩm' }).click(); await page.waitForURL('**/san-pham'); await page.waitForTimeout(1500);
  const back = await page.evaluate(() => window.__vt.flat());
  ok('Quay lại danh sách bằng đường dẫn: có cặp morph ảnh (thẻ nằm dưới màn đầu nên cặp chỉ có phía cũ, tên thẻ không dựng cặp)', back.some(x => x.includes('(tl-product-photo-be-biogas-composite)')), back.filter(x => x.includes('group(tl-product')).join(' ') || back.slice(0, 4).join(' '));
  const stable = await page.evaluate(() => ({ cards: document.querySelectorAll('a.tp-card').length, y: Math.round(scrollY) }));
  ok('Quay lại danh sách: thẻ còn đủ', stable.cards >= 7, JSON.stringify(stable));
  await page.evaluate(() => { window.__vt.length = 0; });
  await page.goBack(); await page.waitForTimeout(1200);
  const hist = await page.evaluate(() => window.__vt.flat().length);
  console.log('GHI CHÚ nút Quay lại của trình duyệt (popstate): số lượt chuyển cảnh ghi nhận', hist);
  await ctx.close();
}
// 5. Thanh tab trang chi tiết: bấm Chọn dung tích rồi các tab còn lại vẫn bấm được, tiêu đề khối nằm dưới thanh
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(origin + '/san-pham/be-biogas-composite', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 1000)); await page.waitForTimeout(500);
  const nav = page.locator('.tp-sticky-nav');
  ok('Thanh tab hiện sau khi cuộn qua đầu trang', await page.locator('.tp-sticky.is-visible').count() === 1);
  for (const [label, id] of [['Chọn dung tích', 'bang-chon'], ['Cấu tạo', 'cau-tao'], ['Đặt hàng', 'dat-hang'], ['Hỏi đáp', 'hoi-dap']]) {
    await nav.getByText(label, { exact: true }).click(); await page.waitForTimeout(700);
    const r = await page.evaluate(i => { const bar = document.querySelector('.tp-sticky'); const h = document.querySelector('#' + i + ' h2:not(.tp-sr), #' + i + ' .tp4-h2') ; return { visible: bar.classList.contains('is-visible'), barBottom: Math.round(bar.getBoundingClientRect().bottom), headTop: h ? Math.round(h.getBoundingClientRect().top) : null }; }, id);
    ok(`Bấm "${label}": thanh vẫn hiện, tiêu đề nằm dưới thanh`, r.visible && (r.headTop === null || r.headTop >= r.barBottom), JSON.stringify(r));
  }
  await ctx.close();
}
await browser.close();
const fail = res.filter(r => !r.pass).length;
console.log(`\nTổng ${res.length}, đạt ${res.length - fail}, lỗi ${fail}`);
process.exit(fail ? 1 : 0);
