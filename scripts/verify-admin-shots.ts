// Chụp mọi màn quản trị và các trạng thái của trang soạn bài ở 1366x768, 390x844, 600x360, kèm đo tràn ngang và lỗi console.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-admin-shots.ts <thư-mục-ra>
// Tạo tài khoản, bài và yêu cầu tạm, xoá đúng những thứ đó ở cuối kể cả khi lỗi. Mật khẩu tự sinh, không in ra.
import { chromium, type Page } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const out = process.argv[2];
if (!out) { console.error('Thiếu thư mục ra.'); process.exit(1); }
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });

const run = randomUUID().slice(0, 8);
const userId = randomUUID();
const email = `anh-${run}@example.test`;
const password = randomBytes(24).toString('hex');
const postIds = [randomUUID(), randomUUID(), randomUUID()];
const inquiryIds = [randomUUID(), randomUUID()];
const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }];
const report: Record<string, unknown>[] = [];

async function seed() {
  const media = await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at LIMIT 2");
  const cover = media.rows[0]?.id ?? null;
  const content = JSON.stringify({ type: 'doc', content: [p('Bài mẫu để chụp giao diện quản trị, sẽ tự xoá.'), { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Chuẩn bị hố đào' }] }, p('Hút cạn nước, lót cát đầm chặt rồi mới hạ bể.')] });
  const insert = "INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,'article',$6,$7,$8)";
  await db.query(insert, [postIds[0], `Bài mẫu đang đăng ${run}: cách chọn dung tích bể biogas cho trại lợn quy mô vừa và nhỏ ở vùng đất trũng`, `mau-dang-${run}`, 'Tóm tắt bài mẫu.', content, 'published', cover, new Date(Date.now() - 86400000)]);
  await db.query(insert, [postIds[1], `Bài mẫu nháp ${run}`, `mau-nhap-${run}`, '', content, 'draft', null, null]);
  await db.query(insert, [postIds[2], `Bài mẫu hẹn giờ ${run}`, `mau-hen-${run}`, 'Sẽ đăng sau.', content, 'published', cover, new Date(Date.now() + 5 * 86400000)]);
  const q = "INSERT INTO inquiries(id,name,phone,product,message,status,consent_at) VALUES ($1,$2,$3,$4,$5,$6,now())";
  await db.query(q, [inquiryIds[0], `Khách mẫu ${run}`, '0912345678', 'Bể biogas composite', 'Tỉnh thành: Thanh Hóa\nQuy mô: 30 con lợn\nLời nhắn: Gọi giúp em buổi chiều.', 'new']);
  await db.query(q, [inquiryIds[1], `Khách mẫu hai ${run}`, '0987654321', '', 'Cần tư vấn thêm.', 'contacted']);
}
async function cleanup() {
  await db.query('DELETE FROM post_media WHERE post_id = ANY($1)', [postIds]).catch(() => {});
  await db.query('DELETE FROM posts WHERE id = ANY($1) OR title LIKE $2', [postIds, `%${run}%`]);
  await db.query('DELETE FROM inquiries WHERE id = ANY($1)', [inquiryIds]);
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
}

async function metrics(page: Page) {
  return page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - window.innerWidth }));
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Chị Lan Anh', await hashPassword(password)]);
  await seed();
  for (const size of sizes) {
    if (process.env.ONLY_SIZE && process.env.ONLY_SIZE !== size.tag) continue;
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce', isMobile: size.width < 500, hasTouch: size.width < 500 });
    context.setDefaultTimeout(30000);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 200)));
    page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !/favicon|Download the React DevTools/.test(m.text())) errors.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
    page.on('response', async r => { if (r.status() >= 400 && !/favicon/.test(r.url())) errors.push(`${r.request().method()} ${r.status()} ${r.url().replace(origin, '')} ${(await r.text().catch(() => '')).slice(0, 160)}`); });
    const shot = async (name: string, full = false) => {
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(out, `${size.tag}-${name}.png`), fullPage: full });
      report.push({ size: size.tag, name, ...(await metrics(page)) });
    };
    const attempt = async (name: string, fn: () => Promise<void>) => { try { await fn(); } catch (e) { report.push({ size: size.tag, name, failed: String(e).slice(0, 200) }); await page.screenshot({ path: path.join(out, `${size.tag}-${name}-that-bai.png`) }).catch(() => {}); } };

    await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
    await shot('dang-nhap');
    await page.getByLabel('Email quản trị').fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL(origin + '/admin', { timeout: 60000 });
    await page.waitForTimeout(400);
    await shot('tong-quan');
    for (const [name, route] of [['bai-viet', '/admin/bai-viet'], ['thu-vien', '/admin/thu-vien'], ['yeu-cau', '/admin/yeu-cau'], ['san-pham', '/admin/san-pham'], ['cai-dat', '/admin/cai-dat']] as const) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await shot(name);
      if (name === 'thu-vien') await attempt('thu-vien-chon-nhieu', async () => {
        await page.getByRole('button', { name: 'Chọn nhiều' }).click();
        const tiles = page.locator('.adm-media-tile:not([disabled])');
        await tiles.nth(1).waitFor();
        await tiles.nth(0).click(); await tiles.nth(1).click();
        await shot('thu-vien-chon-nhieu');
      });
    }

    // Trang soạn: rỗng
    await page.goto(origin + '/admin/bai-viet/moi', { waitUntil: 'networkidle' });
    await shot('soan-rong');
    // đang viết
    await attempt('soan-viet', async () => {
      await page.getByLabel('Tiêu đề bài viết', { exact: true }).fill(`Cách chọn dung tích bể biogas cho trại lợn ${run} ${size.tag}`);
      await page.getByLabel('Tóm tắt ngắn').fill('Hướng dẫn nhanh chọn dung tích theo số đầu lợn.');
      await page.getByLabel('Tiêu đề bài viết', { exact: true }).press('Enter');
      await page.locator('.ed-prose:focus').waitFor();
      await page.keyboard.type('Đoạn mở đầu của bài mẫu, đủ dài để thấy chữ trong vùng viết. ');
      await page.keyboard.press('Enter');
      await page.keyboard.type('Đoạn thứ hai.');
      await shot('soan-viet');
    });
    await attempt('soan-slash', async () => {
      await page.keyboard.press('Enter');
      await page.keyboard.type('/');
      await page.getByRole('listbox', { name: 'Chèn khối' }).waitFor();
      await shot('soan-slash');
      await page.keyboard.press('Escape');
      await page.keyboard.press('Backspace');
    });
    await attempt('soan-thiet-lap', async () => {
      const toggle = page.getByRole('button', { name: 'Mở thiết lập bài' });
      if (await toggle.isVisible()) { await toggle.click(); await page.waitForTimeout(450); }
      else await page.locator('.ed-aside').scrollIntoViewIfNeeded();
      await shot('soan-thiet-lap');
      const hen = page.getByLabel('Hẹn giờ đăng');
      report.push({ size: size.tag, name: 'hen-gio-gia-tri', type: await hen.evaluate(el => (el as HTMLInputElement).type).catch(() => null) });
      const close = page.locator('.ed-aside').getByRole('button', { name: 'Đóng', exact: true });
      if (await close.isVisible()) await close.click();
      await page.waitForTimeout(450);
    });
    await attempt('soan-thu-vien', async () => {
      await page.locator('.ed-prose').click();
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.type('/anh');
      await page.keyboard.press('Enter');
      await page.getByRole('dialog', { name: 'Chèn ảnh vào bài' }).waitFor();
      await shot('soan-thu-vien');
      await page.getByRole('dialog', { name: 'Chèn ảnh vào bài' }).locator('.adm-media-tile').first().click();
      await shot('soan-thu-vien-chon');
      await page.getByRole('dialog', { name: 'Chèn ảnh vào bài' }).getByRole('button', { name: 'Chèn vào bài' }).click();
      await page.locator('.ed-figure').first().waitFor();
      await page.locator('.ed-figure img').first().click();
      await shot('soan-anh-chon');
      await page.getByRole('button', { name: 'Cắt, xoay, lật ảnh' }).click();
      await page.getByRole('dialog', { name: 'Chỉnh sửa ảnh' }).waitFor();
      await shot('soan-chinh-anh');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    });
    await attempt('soan-xem-truoc', async () => {
      await page.getByRole('button', { name: 'Xem trước' }).click();
      await page.waitForTimeout(900);
      await shot('soan-xem-truoc');
      await page.getByRole('button', { name: 'Tiếp tục viết' }).click();
    });
    await attempt('soan-dang-luu', async () => {
      await page.route('**/api/admin/posts', async route => { if (route.request().method() === 'POST') await new Promise(r => setTimeout(r, 2500)); await route.continue(); });
      await page.keyboard.press('Control+s');
      await page.waitForTimeout(400);
      await shot('soan-dang-luu');
      await page.waitForTimeout(3000);
      await page.unroute('**/api/admin/posts');
    });
    await attempt('soan-menu-them', async () => {
      await page.goto(origin + '/admin/bai-viet/moi', { waitUntil: 'networkidle' });
      const more = page.getByRole('toolbar', { name: 'Công cụ soạn bài' }).getByRole('button', { name: 'Thêm', exact: true });
      if (await more.isVisible()) { await more.click(); await shot('soan-menu-them'); await page.keyboard.press('Escape'); }
      await page.getByLabel('Tiêu đề bài viết', { exact: true }).fill(`Bài thử bảng và xuất bản ${run} ${size.tag}`);
      await page.getByLabel('Tiêu đề bài viết', { exact: true }).press('Enter');
      await page.locator('.ed-prose:focus').waitFor();
      await page.keyboard.type('Đoạn mở đầu đủ dài để xuất bản được bài mẫu này.');
      await page.keyboard.press('Enter');
      await page.keyboard.type('/bang');
      await page.keyboard.press('Enter');
      await page.getByRole('toolbar', { name: 'Công cụ bảng' }).waitFor();
      await shot('soan-bang');
      await page.waitForTimeout(500);
      const publish = page.locator('.ed-mobilebar, .ed-top-save').getByRole('button', { name: /^Xuất bản$/ }).filter({ visible: true }).first();
      await publish.click();
      await page.locator('.adm-toast-action', { hasText: 'Xem bài' }).waitFor();
      await shot('soan-sau-xuat-ban');
      const toggle = page.getByRole('button', { name: 'Mở thiết lập bài' });
      if (await toggle.isVisible()) { await toggle.click(); await page.waitForTimeout(500); }
      await shot('soan-viec-tiep-theo');
      const close = page.locator('.ed-aside').getByRole('button', { name: 'Đóng', exact: true });
      if (await close.isVisible()) await close.click();
    });
    await attempt('soan-loi', async () => {
      await page.goto(origin + '/admin/bai-viet/moi', { waitUntil: 'networkidle' });
      const publish = page.getByRole('button', { name: /^Xuất bản$/ }).filter({ visible: true }).first();
      await publish.click();
      await shot('soan-loi');
    });
    await attempt('soan-bai-co-san', async () => {
      await page.goto(origin + `/admin/bai-viet/${postIds[2]}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await shot('soan-bai-hen-gio');
    });
    report.push({ size: size.tag, name: 'console', errors });
    await context.close();
  }
} finally {
  await cleanup().catch(e => console.error('Dọn dữ liệu mẫu lỗi:', e));
  const left = await db.query("SELECT (SELECT count(*) FROM posts)::int AS posts, (SELECT count(*) FROM inquiries)::int AS inquiries, (SELECT count(*) FROM media_assets)::int AS media, (SELECT count(*) FROM users)::int AS users");
  console.log('Còn lại sau khi dọn:', JSON.stringify(left.rows[0]));
  await browser.close(); await db.end();
  writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  for (const r of report) if (r.failed || (r.overflowX as number) > 0 || (r.errors as string[] | undefined)?.length) console.log(JSON.stringify(r));
}
