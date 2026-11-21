// Chụp riêng trang bài viết và danh sách tin tức: hộp xem ảnh, mục lục điện thoại, trạng thái rỗng,
// bài có tiêu đề rất dài và bảng 6 cột, bài không ảnh bìa, bài ít tiêu đề.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/shots-bai-viet.ts <thư-mục-ra>
// Bài mẫu chèn tạm vào cơ sở dữ liệu và luôn xoá khi xong, kể cả khi lỗi hoặc bị ngắt.
import { chromium, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { db } from '../src/lib/db';

const out = process.argv[2];
if (!out) { console.error('Thiếu thư mục ra.'); process.exit(1); }
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });

const ids: string[] = [];
const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const link = (text: string, href: string) => ({ type: 'paragraph', content: [{ type: 'text', text: 'Xem thêm tại ' }, { type: 'text', text, marks: [{ type: 'link', attrs: { href } }] }, { type: 'text', text: ' và ' }, { type: 'text', text: 'trang liên hệ', marks: [{ type: 'link', attrs: { href: '/lien-he' } }] }, { type: 'text', text: '.' }] });
const h = (level: number, text: string) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const cell = (type: string, text: string) => ({ type, attrs: { colspan: 1, rowspan: 1 }, content: [p(text)] });
const list = (type: string, items: string[]) => ({ type, content: items.map(t => ({ type: 'listItem', content: [p(t)] })) });
const long = 'Khi đào hố ở vùng đất trũng cần dùng máy bơm hút cạn nước, gia cố nền đáy bằng cát đầm chặt hoặc bê tông lót phẳng, không để gạch đá sắc nhọn chạm vào thân bể. Sau khi hạ bể cần bơm nước vào lòng bể ngay để cân bằng với lực đẩy nổi của nước ngầm bên ngoài, rồi mới lấp đất mịn theo từng lớp và đầm đều tay.';

async function fixture() {
  const media = await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at");
  // Ảnh chỉ phục vụ công khai khi gắn với bài đã xuất bản (như shots.ts). Thử qua một bài dò, chỉ giữ ảnh có tệp thật.
  const m: string[] = [];
  const probe = randomUUID(); ids.push(probe);
  await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now())', [probe, 'Bài dò ảnh tạm', 'bm-baiviet-do-' + probe.slice(0, 6), '', JSON.stringify({ type: 'doc', content: [] }), 'article', 'published']);
  for (const r of media.rows.slice(0, 12)) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [probe, r.id]);
  for (const r of media.rows.slice(0, 12)) { if (m.length >= 4) break; const res = await fetch(`${origin}/api/media/${r.id}`).catch(() => null); if (res?.ok) m.push(r.id); }
console.log('Ảnh dùng được:', m.length);
  // Phân loại ảnh dọc và ngang theo kích thước thật để chụp đủ hai kiểu ảnh bìa.
  let portraitCover: string | null = null; let landscapeCover: string | null = null;
  for (const id of m) {
    const buffer = Buffer.from(await (await fetch(`${origin}/api/media/${id}`)).arrayBuffer());
    const info = await sharp(buffer).metadata();
    if (info.width && info.height) { if (info.height > info.width * 1.1) portraitCover ??= id; else landscapeCover ??= id; }
  }
  console.log('Ảnh bìa dọc:', portraitCover ? 'có' : 'không có', '| ảnh bìa ngang:', landscapeCover ? 'có' : 'không có');
  const image = (i: number, alt: string, extra: Record<string, unknown> = {}) => m[i] ? [{ type: 'image', attrs: { src: `/api/media/${m[i]}`, alt, title: alt, ...extra } }] : [];
  const insert = 'INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
  const add = async (key: string, title: string, excerpt: string, content: unknown, kind: string, cover: string | null, daysAgo: number) => {
    const id = randomUUID(); ids.push(id);
    await db.query(insert, [id, title, `bm-baiviet-${key}-${id.slice(0, 6)}`, excerpt, JSON.stringify(content), kind, 'published', cover, new Date(Date.now() - daysAgo * 86400000 - 60000)]);
    for (const mid of m.slice(0, 4)) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, mid]);
    return `bm-baiviet-${key}-${id.slice(0, 6)}`;
  };
  const wideTable = { type: 'table', content: [
    { type: 'tableRow', content: ['Mã sản phẩm', 'Dung tích danh định', 'Kích thước phủ bì', 'Quy mô đàn phù hợp', 'Thời gian lắp đặt', 'Ghi chú vận chuyển'].map(t => cell('tableHeader', t)) },
    ...[['TLC-BIO-1.5', '1,5 m³', '1,2 x 1,2 x 1,3 m', '5 đến 10 con lợn', '1 ngày', 'Một người nâng được trên dốc ngắn']
      , ['TLC-BIO-2.25', '6,0 m³', '2,2 x 2,2 x 1,6 m', '15 đến 30 con lợn', '1 đến 2 ngày', 'Cần xe tải nhỏ và hai người']
      , ['TLC-BIO-2.40', '7,2 m³', '2,4 x 2,4 x 1,7 m', '30 đến 50 con lợn', '2 ngày', 'Cần xe cẩu nhỏ khi hạ xuống hố']
      , ['TLC-BIO-3.00', '10,0 m³', '3,0 x 3,0 x 1,8 m', '50 đến 80 con lợn', '2 ngày', 'Cần xe cẩu và khảo sát đường vào']].map(r => ({ type: 'tableRow', content: r.map(t => cell('tableCell', t)) })),
  ] };
  const rich = { type: 'doc', content: [
    p(long), h(2, 'Chuẩn bị hố đào ở vùng đất trũng'), p(long), ...image(0, 'Bể composite tại xưởng', { align: 'center' }),
    h(3, 'Các bước hạ bể'), list('orderedList', ['Hút cạn nước trong hố', 'Lót cát đầm chặt hoặc bê tông phẳng', 'Hạ bể đúng vị trí rồi bơm nước vào lòng bể', 'Lấp đất mịn theo từng lớp và đầm đều tay']),
    { type: 'blockquote', content: [p('Bơm nước vào lòng bể ngay khi hạ để cân bằng với lực đẩy nổi của nước ngầm bên ngoài.')] },
    h(2, 'Bảng chọn dung tích theo quy mô đàn'), wideTable, link('trang Facebook của công ty', 'https://www.facebook.com/thanhloicompositevn/'),
    ...image(1, 'Bể composite tại công trình', { align: 'wide', caption: 'Dàn bể xếp tại xưởng, chờ vận chuyển' }),
    ...image(2, 'Ảnh thứ ba', { align: 'left', width: 40 }), p(long), p(long),
    h(2, 'Sửa chữa khi va đập'), p(long), list('bulletList', ['Mài nhám vùng nứt', 'Đắp sợi thủy tinh và nhựa nền', 'Chờ đóng rắn rồi thử kín']),
    { type: 'codeBlock', content: [{ type: 'text', text: 'Kiểm tra: đổ nước đầy bể, đánh dấu mực nước, chờ 24 giờ rồi đo lại.' }] },
    { type: 'horizontalRule' }, h(3, 'Lưu ý sau cùng'), p(long),
  ] };
  const thin = { type: 'doc', content: [p(long), h(2, 'Chỉ một tiêu đề'), p(long)] };
  const veryLong = 'Bể biogas composite liền khối dành cho trang trại chăn nuôi quy mô vừa ở vùng đồi núi có nền đất yếu, nhiều nước ngầm và đường vào hẹp, so sánh chi phí lắp đặt với hầm xây gạch truyền thống';
  const slugs: Record<string, string> = {};
  slugs.rich = await add('rich', 'Bài mẫu kiểm thử: lắp bể biogas composite ở vùng đất trũng, nhiều nước ngầm', 'Hút cạn hố, lót nền phẳng, bơm nước đối trọng rồi lấp đất theo lớp. Bài mẫu chỉ để kiểm giao diện, sẽ tự xoá.', rich, 'article', m[0] ?? null, 3);
  slugs.long = await add('dai', veryLong, 'Tiêu đề rất dài để kiểm xuống dòng, bài mẫu sẽ tự xoá.', rich, 'article', m[1] ?? null, 5);
  if (portraitCover) slugs.portrait = await add('doc', 'Bài mẫu ảnh bìa dọc: lắp bể biogas composite ở vùng đất trũng', 'Bài mẫu có ảnh bìa dọc để kiểm bố cục hai cột, sẽ tự xoá.', rich, 'article', portraitCover, 4);
  if (landscapeCover) slugs.landscape = await add('ngang', 'Bài mẫu ảnh bìa ngang: lắp bể biogas composite ở vùng đất trũng', 'Bài mẫu có ảnh bìa ngang để kiểm bố cục một cột, sẽ tự xoá.', rich, 'article', landscapeCover, 6);
  slugs.nocover = await add('khonganh', 'Bài mẫu không ảnh bìa và chỉ một tiêu đề', 'Bài mẫu để kiểm bài ít tiêu đề, mục lục phải ẩn.', thin, 'article', null, 7);
  slugs.project = await add('duan', 'Dự án mẫu kiểm thử: dàn bể tròn composite cho trang trại', 'Dự án mẫu để kiểm giao diện trang dự án, sẽ tự xoá.', rich, 'project', m[2] ?? null, 9);
  for (let i = 0; i < 9; i++) await add(`n${i}`, `Bài mẫu số ${i + 1}: hướng dẫn chọn bể composite cho từng nhu cầu sử dụng`, 'Tóm tắt ngắn của bài mẫu để kiểm lưới thẻ, hai dòng là đủ, bài sẽ tự xoá sau khi chụp.', thin, i % 3 === 2 ? 'project' : 'article', i % 4 === 3 ? null : (m[i % Math.max(m.length, 1)] ?? null), 10 + i);
  // Bỏ bài dò để không lẫn vào danh sách chụp
  await db.query('DELETE FROM post_media WHERE post_id=$1', [probe]);
  await db.query('DELETE FROM posts WHERE id=$1', [probe]);
  return slugs;
}
async function cleanup() {
  if (!ids.length) return;
  await db.query('DELETE FROM post_media WHERE post_id = ANY($1)', [ids]);
  await db.query('DELETE FROM posts WHERE id = ANY($1)', [ids]);
}

const report: Record<string, unknown>[] = [];
async function shoot(page: Page, name: string, path: string, tag: string, full = true) {
  const errors: string[] = [];
  const onConsole = (msg: { type(): string; text(): string }) => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 300)); };
  const onPageError = (e: Error) => errors.push('pageerror: ' + e.message.slice(0, 300));
  page.on('console', onConsole); page.on('pageerror', onPageError);
  const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => { errors.push('goto: ' + String(e).slice(0, 200)); return null; });
  await page.waitForTimeout(700);
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `${name}-${tag}.png`), fullPage: full });
  const metrics = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src).slice(0, 5),
    hiddenReveal: [...document.querySelectorAll('[data-art-reveal]:not(.is-in)')].length,
    smallBodyText: [...document.querySelectorAll('.art-prose p, .art-prose li, .pc-excerpt')].filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).length,
    orient: document.querySelector('.art')?.getAttribute('data-orient') ?? null,
    h1: (() => { const el = document.querySelector('.art h1'); if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); let hidden = false; for (let n: Element | null = el; n; n = n.parentElement) { const c = getComputedStyle(n); if (c.display === 'none' || c.visibility === 'hidden' || parseFloat(c.opacity) < 0.99) hidden = true; } return { visible: !hidden && r.width > 100 && r.height > 20 && r.left >= 0 && r.right <= window.innerWidth + 1, width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top + window.scrollY), fontSize: cs.fontSize, text: (el.textContent ?? '').slice(0, 40) }; })(),
    banned: (document.querySelector('main')?.innerText.match(/[·—;!]/g) ?? []).length,
    prose: (() => { const el = document.querySelector('.art-prose p'); if (!el) return null; const r = el.getBoundingClientRect(); return { width: Math.round(r.width), fontSize: getComputedStyle(el).fontSize }; })(),
  }));
  page.off('console', onConsole); page.off('pageerror', onPageError);
  report.push({ name, path, size: tag, status: response?.status() ?? null, ...metrics, errors });
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let exitCode = 0;
const onSignal = () => { cleanup().finally(() => process.exit(130)); };
process.on('SIGINT', onSignal); process.on('SIGTERM', onSignal);
try {
  const slugs = await fixture();
  for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
    const mobile = size.width < 500;
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce', deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    await shoot(page, 'tin-tuc', '/tin-tuc', size.tag);
    await shoot(page, 'tin-tuc-trang-2', '/tin-tuc?page=2', size.tag);
    await shoot(page, 'tin-tuc-loc-du-an', '/tin-tuc?kind=project', size.tag);
    await shoot(page, 'tin-tuc-rong', '/tin-tuc?q=khongcoketqua', size.tag);
    await shoot(page, 'bai-viet', `/tin-tuc/${slugs.rich}`, size.tag);
    await shoot(page, 'bai-viet-tieu-de-dai', `/tin-tuc/${slugs.long}`, size.tag);
    if (slugs.portrait) await shoot(page, 'bai-viet-anh-doc', `/tin-tuc/${slugs.portrait}`, size.tag);
    if (slugs.landscape) await shoot(page, 'bai-viet-anh-ngang', `/tin-tuc/${slugs.landscape}`, size.tag);
    await shoot(page, 'bai-viet-khong-anh', `/tin-tuc/${slugs.nocover}`, size.tag);
    await shoot(page, 'du-an-chi-tiet', `/du-an/${slugs.project}`, size.tag);
    await context.close();

    // Tương tác thật: bật chuyển động
    const live = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'no-preference', isMobile: mobile, hasTouch: mobile, permissions: ['clipboard-read', 'clipboard-write'] });
    const pg = await live.newPage();
    const errors: string[] = [];
    pg.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 300)); });
    pg.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 300)));
    await pg.goto(`${origin}/tin-tuc/${slugs.rich}`, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(600);
    const checks: Record<string, unknown> = {};
    // hộp xem ảnh: mở, chụp, Esc đóng, tiêu điểm trả về
    const zoom = pg.locator('.art-prose .art-zoom').first();
    await zoom.scrollIntoViewIfNeeded();
    await zoom.focus();
    await zoom.click();
    await pg.waitForTimeout(450);
    await pg.screenshot({ path: join(out, `hop-xem-anh-${size.tag}.png`) });
    checks.lightboxOpen = await pg.evaluate(() => (document.querySelector('.art-lightbox') as HTMLDialogElement | null)?.open === true);
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(450);
    checks.lightboxClosed = await pg.evaluate(() => (document.querySelector('.art-lightbox') as HTMLDialogElement | null)?.open === false);
    checks.focusReturned = await pg.evaluate(() => document.activeElement?.classList.contains('art-zoom') === true);
    // sao chép liên kết và thông báo
    const copy = pg.locator('[data-copy-link]:visible').first();
    await copy.scrollIntoViewIfNeeded();
    await copy.click();
    await pg.waitForTimeout(400);
    checks.toast = await pg.locator('.art-toast').innerText();
    await pg.screenshot({ path: join(out, `da-chep-lien-ket-${size.tag}.png`) });
    // mục lục
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(300);
    if (mobile) {
      await pg.locator('.art-toc-mobile summary').scrollIntoViewIfNeeded();
      await pg.locator('.art-toc-mobile summary').click();
      await pg.waitForTimeout(450);
      await pg.screenshot({ path: join(out, `muc-luc-dien-thoai-${size.tag}.png`) });
      await pg.locator('.art-toc-mobile a').nth(1).click();
      await pg.waitForTimeout(900);
      checks.tocClosedAfterClick = await pg.evaluate(() => (document.querySelector('.art-toc-mobile') as HTMLDetailsElement).open === false);
    } else {
      await pg.locator('.art-toc a').nth(1).click();
      await pg.waitForTimeout(1200);
      checks.activeToc = await pg.locator('.art-toc a.is-active').allInnerTexts();
      await pg.screenshot({ path: join(out, `muc-luc-may-ban-${size.tag}.png`) });
    }
    // bảng rộng
    const table = pg.locator('[data-table]').first();
    await table.scrollIntoViewIfNeeded();
    await pg.waitForTimeout(300);
    checks.tableScrollable = await table.evaluate(el => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, cls: el.className }));
    checks.pageOverflowX = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await pg.screenshot({ path: join(out, `bang-rong-${size.tag}.png`) });
    // thanh tiến độ và nút lên đầu trang
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
    await pg.waitForTimeout(500);
    checks.progress = await pg.locator('.art-progress > div').evaluate(el => (el as HTMLElement).style.transform);
    checks.topButtonOn = await pg.locator('.art-top.is-on').count();
    await pg.screenshot({ path: join(out, `giua-bai-${size.tag}.png`) });
    report.push({ name: 'tuong-tac', size: size.tag, checks, errors });
    await live.close();
  }
} catch (error) {
  console.error(error); exitCode = 1;
} finally {
  await cleanup().catch(e => { console.error('Dọn bài mẫu lỗi:', e); exitCode = 1; });
  const left = await db.query('SELECT count(*)::int AS n FROM posts WHERE slug LIKE $1', ['bm-baiviet-%']).then(r => r.rows[0].n).catch(() => -1);
  console.log(`Bài mẫu còn lại sau khi dọn: ${left}`);
  await browser.close(); await db.end();
  writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
  const bad = report.filter(r => ((r.errors as string[] | undefined)?.length ?? 0) || ((r.overflowX as number | undefined) ?? 0) > 0 || ((r.brokenImages as string[] | undefined)?.length ?? 0) || ((r.status as number | undefined) ?? 0) >= 500);
  console.log(`Đã chụp ${report.length} mục. Mục có vấn đề: ${bad.length}`);
  for (const r of bad) console.log(JSON.stringify(r));
  process.exitCode = exitCode;
}
