// Kiểm bảy mục trau chuốt vòng 7: vị trí mục ảnh, hộp chọn, header ảnh, lỗi API. Không lưu sản phẩm nào.
// Chạy: SITE_URL=http://127.0.0.1:3002 [MODE=before] node --env-file=.env --import tsx scripts/kiem-p2-vong7.ts
// Tài khoản tạm tự sinh và xoá trong finally. Dòng product_media thử tự thêm và tự xoá.
import { chromium, type Browser, type Page } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const origin = process.env.SITE_URL!;
const before = process.env.MODE === 'before';
const out = path.join('docs', 'nang-cap-2026-11', 'vong-7', 'p2');
mkdirSync(out, { recursive: true });
const run = randomUUID().slice(0, 8);
const userId = randomUUID();
const email = `p2-${run}@example.test`;
const password = randomBytes(24).toString('hex');
const counts = async () => (await db.query(`SELECT (SELECT count(*) FROM posts)::int AS posts, (SELECT count(*) FROM inquiries)::int AS inquiries, (SELECT count(*) FROM media_assets)::int AS media,
  (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM product_media)::int AS product_media, (SELECT count(*) FROM products WHERE cover_id IS NOT NULL)::int AS covers`)).rows[0];

async function login(page: Page) {
  await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email quản trị').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL(origin + '/admin', { timeout: 60000 });
}

async function ui(browser: Browser, tag: 'desktop' | 'mobile') {
  const mobile = tag === 'mobile';
  const product = (await db.query('SELECT name FROM products ORDER BY sort_order, name LIMIT 1')).rows[0] as { name: string };
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 }, reducedMotion: 'reduce', isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await login(page);
  await page.goto(origin + '/admin/san-pham', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: `Chỉnh sửa ${product.name}` }).click();
  const section = page.locator('.pp-section');
  await section.waitFor();
  const pos = await page.evaluate(() => {
    const h = document.querySelector('.pp-section h2, .pp-section h3') as HTMLElement;
    const b = [...document.querySelectorAll('.pp-section button')].find(x => /Thêm ảnh/.test(x.textContent ?? '')) as HTMLElement;
    return { scrollY: Math.round(scrollY), headingTop: Math.round(h.getBoundingClientRect().top + scrollY), buttonTop: Math.round(b.getBoundingClientRect().top + scrollY), buttonBottom: Math.round(b.getBoundingClientRect().bottom + scrollY), innerHeight };
  });
  console.log(tag, 'vị trí mục ảnh', JSON.stringify(pos));
  if (before) { await context.close(); return; }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(out, `${tag}-1-sua-san-pham.png`) });
  await section.getByRole('button', { name: 'Thêm ảnh' }).click();
  const dialog = page.getByRole('dialog', { name: 'Thêm ảnh cho sản phẩm' });
  await dialog.locator('.adm-media-tile').first().waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll('[role=dialog] .adm-media-tile img')].slice(0, 8).every(x => (x as HTMLImageElement).complete));
  const bar = async () => page.evaluate(() => {
    const s = document.querySelector('.adm-pick-bar span[role=status]') as HTMLElement;
    return { text: s.textContent, scrollWidth: s.scrollWidth, clientWidth: s.clientWidth, textOverflow: getComputedStyle(s).textOverflow, whiteSpace: getComputedStyle(s).whiteSpace, height: Math.round(s.getBoundingClientRect().height) };
  });
  console.log(tag, 'thanh dưới chưa chọn', JSON.stringify(await bar()));
  const info = await page.evaluate(() => ({
    searchLabel: (document.querySelector('[role=dialog] .search-control input') as HTMLInputElement).getAttribute('aria-label'),
    titles: [...document.querySelectorAll('[role=dialog] .adm-media-tile [title]')].map(x => x.getAttribute('title')).slice(0, 3),
    tileLabels: [...document.querySelectorAll('[role=dialog] .adm-media-tile')].slice(0, 3).map(x => x.getAttribute('aria-label')),
    help: document.querySelector('[role=dialog] .adm-dropzone .field-help')?.textContent,
    uploadBtn: [...document.querySelectorAll('[role=dialog] .adm-dropzone button')].map(x => x.className),
    solid: [...document.querySelectorAll('[role=dialog] button.button:not(.button-outline):not(.button-danger)')].map(x => (x.textContent ?? '').trim()),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  console.log(tag, 'hộp chọn', JSON.stringify(info));
  await page.screenshot({ path: path.join(out, `${tag}-2-hop-chon-chua-chon.png`) });
  const tiles = dialog.locator('.adm-media-tile');
  for (let i = 0; i < 3; i++) await tiles.nth(i).click();
  console.log(tag, 'thanh dưới đã chọn 3', JSON.stringify(await bar()));
  const solid = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button.button:not(.button-outline):not(.button-danger)')].map(x => (x.textContent ?? '').trim()));
  console.log(tag, 'nút nền đậm khi đã chọn', JSON.stringify(solid));
  await page.screenshot({ path: path.join(out, `${tag}-3-hop-chon-da-chon-3.png`) });
  await page.keyboard.press('Escape');
  await context.close();
}

async function cache(browser: Browser) {
  const pub = (await db.query('SELECT id FROM products WHERE is_published=true ORDER BY sort_order LIMIT 1')).rows[0] as { id: string };
  const imgs = (await db.query("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at, id LIMIT 2")).rows.map(r => r.id as string);
  const [publicImg, privateImg] = imgs;
  const context = await browser.newContext();
  const login = await context.request.post(origin + '/api/auth/login', { data: { email, password }, headers: { Origin: origin } });
  if (!login.ok()) throw new Error('đăng nhập thất bại ' + login.status());
  await db.query('INSERT INTO product_media(product_id,media_id,position) VALUES($1,$2,0)', [pub.id, publicImg]);
  try {
    const show = async (label: string, id: string, headers: Record<string, string> = {}, admin = false) => {
      const r = admin ? await context.request.get(`${origin}/api/media/${id}`, { headers }) : await fetch(`${origin}/api/media/${id}`, { headers });
      const get = (k: string) => (admin ? (r as Awaited<ReturnType<typeof context.request.get>>).headers()[k] : (r as Response).headers.get(k)) ?? null;
      const status = admin ? (r as Awaited<ReturnType<typeof context.request.get>>).status() : (r as Response).status;
      console.log(label, JSON.stringify({ status, cache: get('cache-control'), etag: get('etag'), length: get('content-length') }));
      return get('etag');
    };
    const tag = await show('khach, anh cong khai', publicImg);
    await show('khach, anh cong khai, If-None-Match khop', publicImg, { 'if-none-match': tag ?? '' });
    await show('khach, anh cong khai, If-None-Match sai', publicImg, { 'if-none-match': '"abc"' });
    await show('khach, anh chua cong khai', privateImg);
    await show('khach, anh chua cong khai, If-None-Match tuy y', privateImg, { 'if-none-match': tag ?? '"x"' });
    const t2 = await show('admin, anh chua cong khai', privateImg, {}, true);
    await show('admin, anh chua cong khai, If-None-Match', privateImg, { 'if-none-match': t2 ?? '"x"' }, true);
    await show('admin, anh cong khai', publicImg, {}, true);
    // Lỗi kiểm dữ liệu của API sản phẩm (đều bị chặn trước khi ghi)
    const list = await (await context.request.get(origin + '/api/admin/products')).json() as (Record<string, unknown> & { id: string })[];
    const { media_ids: _ignored, ...base } = list[0];
    const send = async (label: string, extra: object) => {
      const r = await context.request.post(origin + '/api/admin/products', { data: { ...base, ...extra }, headers: { Origin: origin } });
      console.log(label, r.status(), await r.text());
    };
    await send('ma rac', { media_ids: ['rác'] });
    await send('21 anh', { media_ids: Array.from({ length: 21 }, () => randomUUID()) });
    await send('61 anh', { media_ids: Array.from({ length: 61 }, () => randomUUID()) });
    await send('media_ids null', { media_ids: null });
    await send('media_ids chuoi', { media_ids: 'x' });
  } finally {
    await db.query('DELETE FROM product_media WHERE product_id=$1 AND media_id=$2', [pub.id, publicImg]);
    await context.close();
  }
}

const start = await counts();
await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra trau chuốt', await hashPassword(password)]);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await ui(browser, 'desktop');
  await ui(browser, 'mobile');
  if (!before) await cache(browser);
} finally {
  await browser.close();
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
  console.log('đếm trước', JSON.stringify(start));
  console.log('đếm sau  ', JSON.stringify(await counts()));
  await db.end();
}
