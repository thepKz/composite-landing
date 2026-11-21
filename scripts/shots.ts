// Chụp ảnh mọi màn (công khai + admin) ở máy bàn 1366x768 và điện thoại 390x844.
// Chạy: node --env-file=.env --import tsx scripts/shots.ts <thư-mục-ra> [--only=public|admin]
// Cần SITE_URL trỏ đúng bản đang chạy. Tạo tài khoản và bài mẫu tạm, xoá khi xong.
import { chromium, type Page } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const out = process.argv[2];
if (!out) { console.error('Thiếu thư mục ra.'); process.exit(1); }
const only = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });

const userId = randomUUID();
const email = `shots-${userId}@example.test`;
const password = randomBytes(24).toString('hex');
const postId = randomUUID();
const postSlug = `bai-mau-kiem-thu-${postId.slice(0, 8)}`;
const projectId = randomUUID();
const projectSlug = `du-an-mau-kiem-thu-${projectId.slice(0, 8)}`;

const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const h = (level: number, text: string) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const cell = (type: string, text: string) => ({ type, attrs: { colspan: 1, rowspan: 1 }, content: [p(text)] });

async function fixture() {
  const media = await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at LIMIT 3");
  const ids = media.rows.map(r => r.id);
  const image = (i: number, alt: string) => ids[i] ? [{ type: 'image', attrs: { src: `/api/media/${ids[i]}`, alt, title: alt } }] : [];
  const content = { type: 'doc', content: [
    p('Bài mẫu chỉ dùng để kiểm giao diện, sẽ tự xoá sau khi chụp. Nội dung lấy từ phần hỏi đáp trong hồ sơ nội dung của công ty.'),
    h(2, 'Chuẩn bị hố đào ở vùng đất trũng'),
    p('Khi đào hố cần dùng máy bơm hút cạn nước, gia cố nền đáy bằng cát đầm chặt hoặc bê tông lót phẳng, không để gạch đá sắc nhọn.'),
    ...image(0, 'Bể composite tại xưởng'),
    h(3, 'Các bước hạ bể'),
    { type: 'orderedList', attrs: { start: 1 }, content: ['Hút cạn nước trong hố', 'Lót cát đầm chặt hoặc bê tông phẳng', 'Hạ bể đúng vị trí rồi bơm nước vào lòng bể', 'Lấp đất mịn theo từng lớp và đầm đều tay'].map(t => ({ type: 'listItem', content: [p(t)] })) },
    { type: 'blockquote', content: [p('Bơm nước vào lòng bể ngay khi hạ để cân bằng với lực đẩy nổi của nước ngầm bên ngoài.')] },
    h(2, 'Bảng chọn dung tích theo quy mô đàn'),
    { type: 'table', content: [
      { type: 'tableRow', content: [cell('tableHeader', 'Mã sản phẩm'), cell('tableHeader', 'Dung tích'), cell('tableHeader', 'Quy mô đàn')] },
      { type: 'tableRow', content: [cell('tableCell', 'TLC-BIO-1.5'), cell('tableCell', '1,5 m³'), cell('tableCell', '5 đến 10 con lợn')] },
      { type: 'tableRow', content: [cell('tableCell', 'TLC-BIO-2.25'), cell('tableCell', '6,0 m³'), cell('tableCell', '15 đến 30 con lợn')] },
      { type: 'tableRow', content: [cell('tableCell', 'TLC-BIO-2.40'), cell('tableCell', '7,2 m³'), cell('tableCell', '30 đến 50 con lợn')] },
    ] },
    ...image(1, 'Bể composite tại công trình'),
    h(2, 'Sửa chữa khi va đập'),
    p('Kỹ thuật viên có thể mài nhám và đắp vá lại bằng chính sợi thủy tinh và nhựa nền tại chỗ. Vị trí gia cố sau khi đóng rắn sẽ liền khối.'),
    { type: 'bulletList', content: ['Mài nhám vùng nứt', 'Đắp sợi thủy tinh và nhựa nền', 'Chờ đóng rắn rồi thử kín'].map(t => ({ type: 'listItem', content: [p(t)] })) },
  ] };
  const insert = 'INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())';
  await db.query(insert, [postId, 'Bài mẫu kiểm thử: lắp bể biogas composite ở vùng đất trũng, nhiều nước ngầm', postSlug, 'Bài mẫu để kiểm giao diện trang bài viết. Hút cạn hố, lót nền phẳng, bơm nước đối trọng rồi lấp đất theo lớp.', JSON.stringify(content), 'article', 'published', ids[0] ?? null]);
  await db.query(insert, [projectId, 'Dự án mẫu kiểm thử: dàn bể tròn composite', projectSlug, 'Dự án mẫu để kiểm giao diện trang dự án, sẽ tự xoá.', JSON.stringify(content), 'project', 'published', ids[1] ?? null]);
  for (const id of ids.slice(0, 2)) { await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [postId, id]); await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [projectId, id]); }
}
async function cleanup() {
  await db.query('DELETE FROM post_media WHERE post_id = ANY($1)', [[postId, projectId]]);
  await db.query('DELETE FROM posts WHERE id = ANY($1)', [[postId, projectId]]);
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
}

const publicRoutes: [string, string][] = [
  ['home', '/'], ['gioi-thieu', '/gioi-thieu'], ['san-pham', '/san-pham'],
  ['san-pham-biogas', '/san-pham/be-biogas-composite'], ['san-pham-nhom-phot', '/san-pham/be-phot-va-xu-ly-nuoc-thai'],
  ['san-pham-thuy-san', '/san-pham/be-nuoi-trong-thuy-san'],
  ['san-pham-phot', '/san-pham/be-phot-composite'], ['san-pham-hoa-chat', '/san-pham/bon-chua-hoa-chat'], ['san-pham-rac', '/san-pham/xe-gom-rac'], ['hoi-dap', '/hoi-dap'], ['chinh-sach-bao-hanh', '/chinh-sach-bao-hanh'],
  ['du-an', '/du-an'], ['du-an-chi-tiet', `/du-an/${projectSlug}`], ['tin-tuc', '/tin-tuc'], ['bai-viet', `/tin-tuc/${postSlug}`],
  ['lien-he', '/lien-he'], ['huong-dan-dat-hang', '/huong-dan-dat-hang'], ['chinh-sach-bao-mat', '/chinh-sach-bao-mat'], ['404', '/trang-khong-ton-tai'],
];
const adminRoutes: [string, string][] = [
  ['admin-tong-quan', '/admin'], ['admin-bai-viet', '/admin/bai-viet'], ['admin-bai-viet-moi', '/admin/bai-viet/moi'], ['admin-bai-viet-sua', `/admin/bai-viet/${postId}`],
  ['admin-san-pham', '/admin/san-pham'], ['admin-thu-vien', '/admin/thu-vien'], ['admin-yeu-cau', '/admin/yeu-cau'], ['admin-cai-dat', '/admin/cai-dat'],
];
const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }];
const report: Record<string, unknown>[] = [];

async function capture(page: Page, name: string, path: string, tag: string) {
  const errors: string[] = [];
  const onConsole = (m: { type(): string; text(): string }) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); };
  const onPageError = (e: Error) => errors.push('pageerror: ' + e.message.slice(0, 300));
  page.on('console', onConsole); page.on('pageerror', onPageError);
  const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => { errors.push('goto: ' + String(e).slice(0, 200)); return null; });
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(out, `${name}-${tag}-fold.png`) });
  // cuộn hết trang để ảnh lười tải và cảnh cuộn kịp hiện
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `${name}-${tag}.png`), fullPage: true });
  const metrics = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    height: document.documentElement.scrollHeight,
    brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5),
  }));
  page.off('console', onConsole); page.off('pageerror', onPageError);
  report.push({ name, path, size: tag, status: response?.status() ?? null, ...metrics, errors });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra giao diện', await hashPassword(password)]);
  await fixture();
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce', deviceScaleFactor: 1, isMobile: size.width < 500, hasTouch: size.width < 500 });
    const page = await context.newPage();
    if (only !== 'admin') for (const [name, path] of publicRoutes) await capture(page, name, path, size.tag);
    if (only !== 'public') {
      await capture(page, 'admin-dang-nhap', '/admin/login', size.tag);
      await page.getByLabel('Email quản trị').fill(email);
      await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
      await page.waitForURL(origin + '/admin', { timeout: 30000 });
      for (const [name, path] of adminRoutes) await capture(page, name, path, size.tag);
    }
    await context.close();
  }
} finally {
  await cleanup().catch(e => console.error('Dọn dữ liệu mẫu lỗi:', e));
  await browser.close(); await db.end();
  writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
  const bad = report.filter(r => (r.errors as string[]).length || (r.overflowX as number) > 0 || (r.brokenImages as string[]).length || (r.status as number) >= 500);
  console.log(`Đã chụp ${report.length} màn. Màn có vấn đề: ${bad.length}`);
  for (const r of bad) console.log(JSON.stringify(r));
}
