// Luồng thật: chủ doanh nghiệp thêm 3 ảnh từ thư viện cho một sản phẩm, đổi thứ tự, lưu, rồi khách mở trang sản phẩm.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/kiem-anh-san-pham.ts
// Máy bàn 1366x768 thử sản phẩm đã có ảnh tĩnh (bể biogas), điện thoại 390x844 thử sản phẩm chưa có ảnh (bể phốt).
// Tài khoản tạm tự sinh, không in mật khẩu. Cuối lượt (kể cả khi lỗi): gỡ 3 ảnh khỏi sản phẩm, trả cover_id về giá trị ban đầu,
// xoá ảnh thử tải lên, xoá tài khoản tạm, rồi in số đếm trước và sau.
import { chromium, expect, type Browser, type Page } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const origin = process.env.SITE_URL!;
const out = process.env.SHOT_DIR ?? path.join('docs', 'nang-cap-2026-11', 'vong-6', 'admin-anh');
mkdirSync(out, { recursive: true });

const run = randomUUID().slice(0, 8);
const userId = randomUUID();
const email = `anh-sp-${run}@example.test`;
const password = randomBytes(24).toString('hex');
const failures: string[] = [];
const createdMedia = new Set<string>();
const touched: { id: string; cover: string | null }[] = [];
const forbidden = /[·—;!]/;

type Product = { id: string; name: string; slug: string; cover_id: string | null };
const counts = async () => (await db.query(`SELECT (SELECT count(*) FROM posts)::int AS posts, (SELECT count(*) FROM inquiries)::int AS inquiries, (SELECT count(*) FROM media_assets)::int AS media,
  (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM product_media)::int AS product_media`)).rows[0];
const covers = async () => (await db.query('SELECT slug, cover_id FROM products ORDER BY sort_order, name')).rows as { slug: string; cover_id: string | null }[];

async function login(page: Page) {
  await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email quản trị').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL(origin + '/admin', { timeout: 60000 });
}

function check(ok: boolean, message: string) { if (!ok) throw new Error(message); }

async function flow(browser: Browser, tag: 'desktop' | 'mobile', slug: string, staticCount: number) {
  const mobile = tag === 'mobile';
  const product = (await db.query('SELECT id,name,slug,cover_id FROM products WHERE slug=$1', [slug])).rows[0] as Product;
  touched.push({ id: product.id, cover: product.cover_id });
  const library = (await db.query("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at, id LIMIT 3")).rows.map(row => row.id as string);
  check(library.length === 3, 'thư viện có ít hơn 3 ảnh');
  const [a, b, c] = library;
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 }, reducedMotion: 'reduce', isMobile: mobile, hasTouch: mobile, permissions: [] });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const errors: string[] = [];
  page.on('response', async response => {
    const url = new URL(response.url());
    if (response.request().method() === 'POST' && response.ok() && url.pathname === '/api/admin/media') {
      const body = await response.json().catch(() => null) as { id?: string } | null;
      if (body?.id) createdMedia.add(body.id);
    }
  });
  page.on('pageerror', error => errors.push('pageerror: ' + error.message));
  page.on('console', message => { if (message.type() === 'error' && !/favicon|404 \(Not Found\)/.test(message.text())) errors.push(message.text().slice(0, 240)); });
  const shot = (name: string) => page.screenshot({ path: path.join(out, `${tag}-${name}.png`) });
  const gridIds = async () => (await page.locator('.pp-grid img').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).getAttribute('src') ?? ''))).map(src => src.replace('/api/media/', ''));

  await login(page);
  await page.goto(origin + '/admin/san-pham', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: `Chỉnh sửa ${product.name}` }).click();
  const section = page.locator('.pp-section');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole('heading', { name: 'Ảnh sản phẩm' })).toBeVisible();
  check((await gridIds()).length === 0, 'sản phẩm thử đang có sẵn ảnh admin');
  await section.scrollIntoViewIfNeeded();
  await shot('1-khong-anh');

  // Thử tải ảnh mới ngay trong hộp: chọn sẵn ảnh vừa tải, đóng hộp không thêm (ảnh thử bị xoá ở cuối lượt).
  await section.getByRole('button', { name: 'Thêm ảnh' }).click();
  const dialog = page.getByRole('dialog', { name: 'Thêm ảnh cho sản phẩm' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.adm-media-tile').first()).toBeVisible();
  const fileInput = dialog.locator('input[type=file]');
  const sample = await sharp({ create: { width: 640, height: 480, channels: 3, background: { r: 40, g: 120, b: 90 } } }).png().toBuffer();
  await fileInput.setInputFiles({ name: `anh-thu-${run}-${tag}.png`, mimeType: 'image/png', buffer: sample });
  await expect(dialog.getByText('Đã chọn 1 ảnh', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(section.getByRole('button', { name: 'Thêm ảnh' })).toBeFocused();
  check((await gridIds()).length === 0, 'đóng hộp bằng Esc vẫn thêm ảnh');

  // Chọn đúng 3 ảnh từ thư viện, theo thứ tự a, b, c.
  await section.getByRole('button', { name: 'Thêm ảnh' }).click();
  await expect(dialog).toBeVisible();
  for (const id of [a, b, c]) await dialog.locator(`.adm-media-tile:has(img[src="/api/media/${id}"])`).click();
  await expect(dialog.getByText('Đã chọn 3 ảnh', { exact: true })).toBeVisible();
  const dialogText = await dialog.innerText();
  check(!forbidden.test(dialogText), 'hộp chọn ảnh có ký tự cấm: ' + dialogText.match(forbidden)?.[0]);
  await shot('3-hop-chon-mo');
  await dialog.getByRole('button', { name: 'Thêm 3 ảnh' }).click();
  await expect(dialog).toBeHidden();
  let order = await gridIds();
  check(JSON.stringify(order) === JSON.stringify([a, b, c]), 'thứ tự sau khi thêm sai: ' + order.join(','));
  await expect(section.getByText('3 ảnh, nên có khoảng 10')).toBeVisible();

  // Đổi thứ tự bằng nút: a b c, đưa ảnh 3 lên trước thành a c b, đưa ảnh 1 xuống sau thành c a b.
  await section.getByRole('button', { name: 'Đưa ảnh 3 lên trước' }).click();
  await section.getByRole('button', { name: 'Đưa ảnh 1 xuống sau' }).click();
  order = await gridIds();
  check(JSON.stringify(order) === JSON.stringify([c, a, b]), 'thứ tự sau khi đổi sai: ' + order.join(','));
  await expect(section.getByText('Ảnh đại diện', { exact: true })).toHaveCount(1);
  await expect(section.locator('.pp-tile').first().getByText('Ảnh đại diện', { exact: true })).toBeVisible();
  const text = await section.innerText();
  check(!forbidden.test(text), 'mục ảnh có ký tự cấm: ' + text.match(forbidden)?.[0]);
  check(!/\b(slug|media|id)\b/i.test(text), 'mục ảnh có chữ kỹ thuật');
  if (mobile) {
    const small = await section.locator('button').evaluateAll(nodes => nodes.filter(node => !(node as HTMLButtonElement).disabled).map(node => { const r = node.getBoundingClientRect(); return { h: r.height, w: r.width, label: node.getAttribute('aria-label') ?? node.textContent }; }).filter(item => item.h < 43.5 || item.w < 43.5));
    check(small.length === 0, 'nút dưới 44px ở điện thoại: ' + JSON.stringify(small));
    check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'tràn ngang ở màn sửa sản phẩm');
  }
  await section.scrollIntoViewIfNeeded();
  await shot('2-co-anh');

  // Lưu, rồi xem trong cơ sở dữ liệu.
  await page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click();
  await expect(page.getByText('Đã lưu sản phẩm. Ảnh đã lên website.')).toBeVisible();
  const saved = (await db.query('SELECT media_id, position FROM product_media WHERE product_id=$1 ORDER BY position', [product.id])).rows;
  check(JSON.stringify(saved.map(row => row.media_id)) === JSON.stringify([c, a, b]) && saved.map(row => row.position).join() === '0,1,2', 'dòng lưu sai: ' + JSON.stringify(saved));
  const cover = (await db.query('SELECT cover_id FROM products WHERE id=$1', [product.id])).rows[0].cover_id;
  check(cover === c, 'cover_id không theo ảnh đầu danh sách');

  // Khách (không đăng nhập) mở trang sản phẩm.
  const guest = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  try {
    for (const id of [a, b, c]) check((await guest.request.get(`${origin}/api/media/${id}`)).status() === 200, 'khách không xem được ảnh ' + id);
    const visitor = await guest.newPage();
    await visitor.goto(`${origin}/san-pham/${slug}`, { waitUntil: 'networkidle' });
    const thumbs = await visitor.locator('.pg-thumbs button img').evaluateAll(nodes => nodes.map(node => (node as HTMLImageElement).getAttribute('src') ?? ''));
    check(thumbs.length === 3 + staticCount, `bộ xem ảnh có ${thumbs.length} ảnh, cần ${3 + staticCount}`);
    check(JSON.stringify(thumbs.slice(0, 3)) === JSON.stringify([c, a, b].map(id => `/api/media/${id}`)), 'ba ảnh đầu sai thứ tự: ' + thumbs.slice(0, 3).join(','));
    check(thumbs.slice(3).every(src => src.startsWith('/images/san-pham/')) && new Set(thumbs).size === thumbs.length, 'ảnh tĩnh phía sau sai hoặc bị lặp');
    const main = await visitor.locator('.pg-photo').getAttribute('src');
    check(main === `/api/media/${c}`, 'ảnh chính không phải ảnh đầu');
    check(await visitor.locator('.tp5-plain').count() === 0, 'vẫn còn bố cục hình vẽ thay cho bộ xem ảnh');
    check(await visitor.locator('.pg-count').first().innerText() === `1 / ${3 + staticCount}`, 'bộ đếm sai');
    const alt = await visitor.locator('.pg-photo').getAttribute('alt');
    check(Boolean(alt && alt.length > 3), 'ảnh chính thiếu alt');
    await visitor.screenshot({ path: path.join(out, `${tag}-4-trang-cong-khai.png`) });
  } finally { await guest.close(); }
  check(errors.length === 0, 'lỗi console: ' + errors.join(' | '));
  await context.close();
  console.log(`PASS ${tag} (${slug})`);
}

async function cleanup(browser: Browser) {
  // Gỡ ảnh đúng đường của ứng dụng: lưu danh sách rỗng (cover_id về rỗng), rồi lưu lại cover_id ban đầu không đụng danh sách.
  const context = await browser.newContext();
  try {
    const login = await context.request.post(origin + '/api/auth/login', { data: { email, password }, headers: { Origin: origin } });
    if (!login.ok()) throw new Error('đăng nhập dọn dẹp thất bại ' + login.status());
    const headers = { Origin: origin };
    for (const item of touched) {
      const list = await (await context.request.get(origin + '/api/admin/products')).json() as (Record<string, unknown> & { id: string })[];
      const row = list.find(entry => entry.id === item.id);
      if (!row) continue;
      const { media_ids: _ignored, ...base } = row;
      const first = await context.request.post(origin + '/api/admin/products', { data: { ...base, cover_id: null, media_ids: [] }, headers });
      if (!first.ok()) { failures.push('gỡ ảnh khỏi sản phẩm lỗi ' + first.status()); continue; }
      const after = await first.json() as Record<string, unknown>;
      const { media_ids: _also, ...afterBase } = after;
      const second = await context.request.post(origin + '/api/admin/products', { data: { ...afterBase, cover_id: item.cover }, headers });
      if (!second.ok()) failures.push('trả cover_id lỗi ' + second.status());
    }
    for (const id of createdMedia) {
      const response = await context.request.delete(origin + '/api/admin/media/' + id, { headers });
      if (!response.ok() && response.status() !== 404) failures.push('xoá ảnh thử ' + id + ' lỗi ' + response.status());
    }
  } finally { await context.close(); }
  for (const item of touched) {
    // Dự phòng: nếu đường của ứng dụng chưa dọn hết thì dọn thẳng, và ghi lại là có phải dọn thẳng.
    const left = (await db.query('SELECT count(*)::int AS n FROM product_media WHERE product_id=$1', [item.id])).rows[0].n;
    if (left) { failures.push('đường ứng dụng chưa gỡ hết ảnh, phải dọn thẳng'); await db.query('DELETE FROM product_media WHERE product_id=$1', [item.id]); }
    const cover = (await db.query('SELECT cover_id FROM products WHERE id=$1', [item.id])).rows[0]?.cover_id ?? null;
    if (cover !== item.cover) { failures.push('cover_id chưa về giá trị ban đầu, phải sửa thẳng'); await db.query('UPDATE products SET cover_id=$2 WHERE id=$1', [item.id, item.cover]); }
  }
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
}

const before = await counts();
const coversBefore = await covers();
console.log('TRƯỚC', JSON.stringify(before));
console.log('cover_id TRƯỚC', JSON.stringify(coversBefore));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra ảnh sản phẩm', await hashPassword(password)]);
  const plan = [['desktop', 'be-biogas-composite', 1], ['mobile', 'be-phot-composite', 0]] as const;
  for (const [tag, slug, staticCount] of plan) {
    try { await flow(browser, tag, slug, staticCount); } catch (error) { failures.push(`${tag}: ${(error as Error).message.split('\n').slice(0, 6).join(' | ')}`); }
  }
} finally {
  await cleanup(browser).catch(error => { failures.push('dọn dữ liệu tạm lỗi: ' + (error as Error).message); });
  await browser.close();
  const after = await counts();
  const coversAfter = await covers();
  console.log('SAU', JSON.stringify(after));
  console.log('cover_id SAU', JSON.stringify(coversAfter));
  if (JSON.stringify(before) !== JSON.stringify(after)) failures.push('số đếm sau khác trước');
  if (JSON.stringify(coversBefore) !== JSON.stringify(coversAfter)) failures.push('cover_id sau khác trước');
  await db.end();
}
if (failures.length) { console.error('THẤT BẠI:\n' + failures.join('\n')); process.exit(1); }
console.log('Xong: luồng thêm ảnh sản phẩm đạt ở cả hai cỡ.');
