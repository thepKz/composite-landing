// Tự dùng thử vùng trang-phu bằng Playwright, không bật giảm chuyển động. In từng bước đạt hay không, kèm lỗi console.
// Chạy: SITE_URL=http://127.0.0.1:3002 node scripts/kiem-tuong-tac-trang-phu.mjs
import { chromium } from '@playwright/test';
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const results = []; const errors = [];
const ok = (name, pass, extra = '') => { results.push({ name, pass }); console.log(pass ? 'ĐẠT ' : 'LỖI ', name, extra); };
async function ctxFor(w, h, extra = {}) { const c = await b.newContext({ viewport: { width: w, height: h }, ...extra }); const p = await c.newPage(); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(w + ' ' + m.text().slice(0, 160)); }); p.on('pageerror', e => errors.push('pageerror ' + e.message.slice(0, 160))); return { c, p }; }

{ const { c, p } = await ctxFor(1366, 768);
  await p.goto(origin + '/san-pham/be-biogas-composite', { waitUntil: 'networkidle' });
  // hộp xem ảnh
  const opener = p.getByRole('button', { name: 'Phóng to' });
  await opener.click(); await p.waitForTimeout(350);
  ok('Hộp phóng to mở', await p.locator('dialog.tp-lightbox[open]').count() === 1);
  const zoomSrc = await p.locator('dialog.tp-lightbox img').first().getAttribute('src');
  ok('Hộp phóng to dùng bản đủ khung không cắt', /-full\.webp/.test(zoomSrc || ''), zoomSrc);
  ok('Tiêu điểm vào nút đóng', await p.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Đóng ảnh'));
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  ok('Tab giữ bên trong hộp', await p.evaluate(() => !!document.activeElement?.closest('dialog')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(350);
  ok('Esc đóng hộp', await p.locator('dialog.tp-lightbox[open]').count() === 0);
  ok('Tiêu điểm về nút Phóng to', await p.evaluate(() => document.activeElement?.textContent?.includes('Phóng to')));
  // mũi tên đổi ảnh
  await p.locator('.tp-gallery-stage').focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
  ok('Mũi tên phải đổi ảnh (2 / 2)', (await p.locator('.tp-gallery-count').first().textContent())?.includes('2 / 2'));
  // chọn quy mô
  await p.getByRole('button', { name: '30 – 50 con lợn' }).first().click(); await p.waitForTimeout(400);
  ok('Chọn quy mô sáng đúng một dòng bảng', await p.locator('.tp-table tbody tr.is-active').count() === 1);
  // tăng cỡ vùng bấm hàng bảng
  const h = await p.locator('.tp-row-pick').first().evaluate(e => e.getBoundingClientRect().height); ok('Nút trong bảng cao từ 36px', h >= 36, Math.round(h) + 'px');
  // cuộn tới thanh dính
  await p.evaluate(() => window.scrollTo(0, 1400)); await p.waitForTimeout(600);
  ok('Thanh dính hiện sau khi cuộn', await p.locator('.tp-sticky.is-visible').count() === 1);
  await p.screenshot({ path: 'docs/nang-cap-2026-11/vong-2/trang-phu/sau/tuong-tac-biogas-bang.png' });
  await c.close(); }

{ const { c, p } = await ctxFor(1366, 768);
  await p.goto(origin + '/gioi-thieu', { waitUntil: 'networkidle' });
  const track = p.locator('.tp-strip-track'); await track.scrollIntoViewIfNeeded();
  const before = await track.evaluate(e => e.scrollLeft);
  await p.getByRole('button', { name: 'Ảnh sau' }).click(); await p.waitForTimeout(700);
  const after = await track.evaluate(e => e.scrollLeft);
  ok('Nút Ảnh sau cuộn dải ảnh', after > before, before + ' sang ' + after);
  ok('Nút Ảnh trước bật lại sau khi cuộn', await p.getByRole('button', { name: 'Ảnh trước' }).isEnabled());
  await track.focus(); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600);
  ok('Phím mũi tên cuộn dải ảnh', (await track.evaluate(e => e.scrollLeft)) > after);
  await c.close(); }

{ const { c, p } = await ctxFor(1366, 768);
  await p.goto(origin + '/hoi-dap', { waitUntil: 'networkidle' });
  const item = p.locator('.tp-faq-item').first(); const body = item.locator('p');
  const samples = []; await item.locator('summary').click();
  for (let i = 0; i < 6; i++) { samples.push(Math.round(await item.evaluate(e => e.getBoundingClientRect().height))); await p.waitForTimeout(50); }
  ok('Hỏi đáp mở dần theo nhiều bước chiều cao', new Set(samples).size >= 3, samples.join(','));
  await item.locator('summary').click(); await p.waitForTimeout(500);
  ok('Hỏi đáp đóng lại', !(await item.evaluate(e => e.open)));
  await c.close(); }

{ const { c, p } = await ctxFor(390, 844, { isMobile: true, hasTouch: true });
  for (const path of ['/san-pham', '/san-pham/be-biogas-composite', '/du-an', '/lien-he']) { await p.goto(origin + path, { waitUntil: 'networkidle' }); ok('Không tràn ngang ' + path, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
  await c.close(); }

{ // giảm chuyển động: không có gì kẹt ở opacity 0
  const { c, p } = await ctxFor(1366, 768, { reducedMotion: 'reduce' });
  for (const path of ['/gioi-thieu', '/san-pham', '/du-an', '/huong-dan-dat-hang']) {
    await p.goto(origin + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    const hidden = await p.evaluate(() => [...document.querySelectorAll('main *')].filter(e => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().height > 20).length);
    ok('Giảm chuyển động: không khối kẹt ẩn ' + path, hidden === 0, String(hidden)); }
  await c.close(); }

{ // không có JavaScript
  const c = await b.newContext({ viewport: { width: 1366, height: 768 }, javaScriptEnabled: false }); const p = await c.newPage();
  await p.goto(origin + '/du-an', { waitUntil: 'load' });
  const hidden = await p.evaluate(() => [...document.querySelectorAll('main *')].filter(e => getComputedStyle(e).opacity === '0' && e.getBoundingClientRect().height > 20).length);
  ok('Không JavaScript: nội dung vẫn thấy /du-an', hidden === 0, String(hidden)); await c.close(); }

await b.close();
console.log('\nLỗi console:', errors.length ? '\n' + [...new Set(errors)].join('\n') : 'không có');
console.log('Đạt', results.filter(r => r.pass).length, '/', results.length);
