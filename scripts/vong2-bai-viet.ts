// Vòng 2, vùng bai-viet: chụp danh sách tin (1, 2, 3, 7 bài), bài dài đủ kiểu, ảnh bìa dọc, ngang, không bìa, dự án.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/vong2-bai-viet.ts <thư-mục-ra>
// Bài mẫu chèn tạm (slug bắt đầu bằng bm-v2-) và luôn xoá khi xong, kể cả khi lỗi.
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
const h = (level: number, text: string) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const cell = (type: string, text: string) => ({ type, attrs: { colspan: 1, rowspan: 1 }, content: [p(text)] });
const list = (type: string, items: string[]) => ({ type, content: items.map(t => ({ type: 'listItem', content: [p(t)] })) });
const long = 'Khi đào hố ở vùng đất trũng cần dùng máy bơm hút cạn nước, gia cố nền đáy bằng cát đầm chặt hoặc bê tông lót phẳng, không để gạch đá sắc nhọn chạm vào thân bể. Sau khi hạ bể cần bơm nước vào lòng bể ngay để cân bằng với lực đẩy nổi của nước ngầm bên ngoài, rồi mới lấp đất mịn theo từng lớp và đầm đều tay.';

type Media = { id: string; kind: 'portrait' | 'landscape' };
async function pickMedia(): Promise<Media[]> {
  const media = await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at");
  const probe = randomUUID(); ids.push(probe);
  await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now())', [probe, 'Bài dò ảnh tạm', 'bm-v2-do-' + probe.slice(0, 6), '', JSON.stringify({ type: 'doc', content: [] }), 'article', 'published']);
  for (const r of media.rows) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [probe, r.id]);
  const good: Media[] = [];
  for (const r of media.rows) {
    const res = await fetch(`${origin}/api/media/${r.id}`).catch(() => null);
    if (!res?.ok) continue;
    const info = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
    if (info.width && info.height) good.push({ id: r.id, kind: info.height > info.width * 1.1 ? 'portrait' : 'landscape' });
  }
  await db.query('DELETE FROM post_media WHERE post_id=$1', [probe]);
  await db.query('DELETE FROM posts WHERE id=$1', [probe]);
  ids.splice(ids.indexOf(probe), 1);
  return good;
}

const insert = 'INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
async function add(media: Media[], key: string, title: string, excerpt: string, content: unknown, kind: string, cover: string | null, daysAgo: number) {
  const id = randomUUID(); ids.push(id);
  const slug = `bm-v2-${key}-${id.slice(0, 6)}`;
  await db.query(insert, [id, title, slug, excerpt, JSON.stringify(content), kind, 'published', cover, new Date(Date.now() - daysAgo * 86400000 - 60000)]);
  for (const m of media) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, m.id]);
  return slug;
}
async function clearSamples() {
  await db.query("DELETE FROM post_media WHERE post_id IN (SELECT id FROM posts WHERE slug LIKE 'bm-v2-%')");
  await db.query("DELETE FROM posts WHERE slug LIKE 'bm-v2-%'");
  ids.length = 0;
}

const report: Record<string, unknown>[] = [];
async function shoot(page: Page, name: string, path: string, tag: string, full = true) {
  const errors: string[] = [];
  const onConsole = (msg: { type(): string; text(): string }) => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 300)); };
  const onPageError = (e: Error) => errors.push('pageerror: ' + e.message.slice(0, 300));
  page.on('console', onConsole); page.on('pageerror', onPageError);
  const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => { errors.push('goto: ' + String(e).slice(0, 200)); return null; });
  await page.waitForTimeout(700);
  // Cách của kiểm viên: cuộn tức thì xuống cuối từng bước 400px, chờ, rồi scrollTo(0,0), rồi chụp toàn trang.
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }); await new Promise(r => setTimeout(r, 70)); } await new Promise(r => setTimeout(r, 600)); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(out, `${name}-${tag}.png`), fullPage: full });
  const tocAfterShot = await page.evaluate(() => ({ y: Math.round(window.scrollY), active: [...document.querySelectorAll('.art-toc a.is-active')].map(e => e.textContent) }));
  // Màn đầu (không cuộn) để xem "thấy gì trước"
  await page.screenshot({ path: join(out, `${name}-${tag}-dau.png`), fullPage: false });
  const metrics = await page.evaluate(() => {
    // Dòng cuối chỉ có một từ: đo bằng Range trên từng khối chữ
    const orphans: string[] = [];
    const sel = '.art h1, .art-excerpt, .art-prose p, .art-prose li, .art-prose h2, .art-prose h3, .pc-title, .pc-excerpt, .nl h1, .art-neighbour-title, .art-cta h2, .art-cta p, .nl-cta h2, .nl-cta p, .art-related h2';
    document.querySelectorAll(sel).forEach(el => {
      const node = el as HTMLElement;
      if (node.offsetParent === null) return;
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      const rects: { top: number; text: string }[] = [];
      let t: Node | null;
      while ((t = walker.nextNode())) {
        const text = t.textContent ?? '';
        const re = /\S+/g; let m: RegExpExecArray | null;
        while ((m = re.exec(text))) { const r = document.createRange(); r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length); const b = r.getClientRects()[0]; if (b) rects.push({ top: Math.round(b.top), text: m[0] }); }
      }
      if (rects.length < 4) return;
      const last = rects[rects.length - 1].top;
      const lastLine = rects.filter(x => Math.abs(x.top - last) < 4);
      const lines = new Set(rects.map(x => Math.round(x.top / 6))).size;
      if (lines > 1 && lastLine.length === 1) orphans.push((node.className || node.tagName) + ': ' + lastLine[0].text + ' | ' + (node.textContent ?? '').slice(0, 40));
    });
    const small: string[] = [];
    document.querySelectorAll('a, button, summary').forEach(el => {
      const r = (el as HTMLElement).getBoundingClientRect(); const cs = getComputedStyle(el as HTMLElement);
      if (r.width === 0 || cs.visibility === 'hidden' || (el as HTMLElement).closest('[hidden], .art-lightbox:not([open])')) return;
      if (r.height > 0 && r.height < (window.innerWidth < 500 ? 44 : 36) - 0.5 && cs.display !== 'inline') small.push(`${(el.textContent ?? '').trim().slice(0, 24) || el.getAttribute('aria-label')} ${Math.round(r.height)}`);
    });
    return {
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map(i => i.currentSrc || i.src).slice(0, 5),
      hiddenReveal: document.querySelectorAll('[data-art-reveal]:not(.is-in)').length,
      orient: document.querySelector('.art')?.getAttribute('data-orient') ?? null,
      banned: (document.querySelector('main')?.innerText.match(/[·—;!]/g) ?? []).length,
      prose: (() => { const el = document.querySelector('.art-prose p'); if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); const ch = Math.round(r.width / (parseFloat(cs.fontSize) * 0.5)); return { width: Math.round(r.width), fontSize: cs.fontSize, approxChars: ch }; })(),
      orphans, small: small.slice(0, 12),
      gridCols: (() => { const g = document.querySelector('.nl-grid'); return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : null; })(),
    };
  });
  page.off('console', onConsole); page.off('pageerror', onPageError);
  report.push({ name, path, size: tag, tocAfterShot, status: response?.status() ?? null, ...metrics, errors });
}

const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let exitCode = 0;
const onSignal = () => { clearSamples().finally(() => process.exit(130)); };
process.on('SIGINT', onSignal); process.on('SIGTERM', onSignal);

async function withPages(fn: (page: Page, tag: string) => Promise<void>) {
  for (const size of sizes) {
    const mobile = size.width < 500;
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce', deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    await fn(page, size.tag);
    await context.close();
  }
}

try {
  await clearSamples();
  const media = await pickMedia();
  // Trạng thái thật: chưa có bài nào (chỉ đúng khi cơ sở dữ liệu không còn bài của agent khác)
  const nowPosts = await db.query('SELECT count(*)::int n FROM posts').then(r => r.rows[0].n);
  console.log('Số bài hiện có trước khi chụp trạng thái 0 bài:', nowPosts);
  await withPages(async (page, tag) => { await shoot(page, 'tin-tuc-0-bai', '/tin-tuc', tag); });
  const portrait = media.find(m => m.kind === 'portrait');
  const landscapes = media.filter(m => m.kind === 'landscape');
  console.log('Ảnh dùng được:', media.length, '| dọc:', media.filter(m => m.kind === 'portrait').length);
  const image = (m: Media | undefined, alt: string, extra: Record<string, unknown> = {}) => m ? [{ type: 'image', attrs: { src: `/api/media/${m.id}`, alt, title: alt, ...extra } }] : [];
  const wideTable = { type: 'table', content: [
    { type: 'tableRow', content: ['Mã sản phẩm', 'Dung tích danh định', 'Kích thước phủ bì', 'Quy mô đàn phù hợp', 'Thời gian lắp đặt', 'Ghi chú vận chuyển'].map(t => cell('tableHeader', t)) },
    ...[['TLC-BIO-1.5', '1,5 m³', '1,2 x 1,2 x 1,3 m', '5 đến 10 con lợn', '1 ngày', 'Một người nâng được trên dốc ngắn'], ['TLC-BIO-2.25', '6,0 m³', '2,2 x 2,2 x 1,6 m', '15 đến 30 con lợn', '1 đến 2 ngày', 'Cần xe tải nhỏ và hai người'], ['TLC-BIO-3.00', '10,0 m³', '3,0 x 3,0 x 1,8 m', '50 đến 80 con lợn', '2 ngày', 'Cần xe cẩu và khảo sát đường vào']].map(r => ({ type: 'tableRow', content: r.map(t => cell('tableCell', t)) })),
  ] };
  const rich = { type: 'doc', content: [
    p(long), h(2, 'Chuẩn bị hố đào ở vùng đất trũng'), p(long), ...image(landscapes[0], 'Bể composite tại xưởng', { align: 'center', caption: 'Bể composite chờ xuất xưởng' }),
    h(3, 'Các bước hạ bể'), list('orderedList', ['Hút cạn nước trong hố', 'Lót cát đầm chặt hoặc bê tông phẳng', 'Hạ bể đúng vị trí rồi bơm nước vào lòng bể', 'Lấp đất mịn theo từng lớp và đầm đều tay']),
    { type: 'blockquote', content: [p('Bơm nước vào lòng bể ngay khi hạ để cân bằng với lực đẩy nổi của nước ngầm bên ngoài.')] },
    h(2, 'Bảng chọn dung tích theo quy mô đàn'), wideTable,
    ...image(portrait ?? landscapes[1], 'Ảnh dọc trong bài', { align: 'center', caption: 'Ảnh dọc đặt giữa cột đọc' }),
    ...image(landscapes[1], 'Ảnh rộng', { align: 'wide', caption: 'Dàn bể xếp tại xưởng, chờ vận chuyển' }), p(long), p(long),
    h(2, 'Sửa chữa khi va đập'), p(long), list('bulletList', ['Mài nhám vùng nứt', 'Đắp sợi thủy tinh và nhựa nền', 'Chờ đóng rắn rồi thử kín']),
    { type: 'horizontalRule' }, h(3, 'Lưu ý sau cùng'), p(long),
  ] };
  const three = { type: 'doc', content: [p(long), h(2, 'Mục thứ nhất'), p(long), h(2, 'Mục thứ hai'), p(long), h(2, 'Mục thứ ba'), p(long)] };
  const thin = { type: 'doc', content: [p(long), h(2, 'Chỉ một tiêu đề'), p(long)] };
  const slugs: Record<string, string> = {};
  slugs.rich = await add(media, 'rich', 'Bài mẫu kiểm thử: lắp bể biogas composite ở vùng đất trũng, nhiều nước ngầm', 'Hút cạn hố, lót nền phẳng, bơm nước đối trọng rồi lấp đất theo lớp. Bài mẫu chỉ để kiểm giao diện, sẽ tự xoá.', rich, 'article', landscapes[0]?.id ?? null, 3);
  if (portrait) slugs.portrait = await add(media, 'doc', 'Bài mẫu ảnh bìa dọc: lắp bể biogas composite ở vùng đất trũng', 'Bài mẫu có ảnh bìa dọc để kiểm bố cục hai cột, sẽ tự xoá.', rich, 'article', portrait.id, 4);
  slugs.three = await add(media, 'ba', 'Bài mẫu ba mục để kiểm mục lục điện thoại', 'Bài có đúng ba tiêu đề h2.', three, 'article', landscapes[2]?.id ?? null, 6);
  slugs.nocover = await add(media, 'khonganh', 'Bài mẫu không ảnh bìa và chỉ một tiêu đề', 'Bài mẫu để kiểm bài ít tiêu đề, mục lục phải ẩn.', thin, 'article', null, 7);
  slugs.project = await add(media, 'duan', 'Dự án mẫu kiểm thử: dàn bể tròn composite cho trang trại', 'Dự án mẫu để kiểm giao diện trang dự án, sẽ tự xoá.', rich, 'project', landscapes[3]?.id ?? landscapes[0]?.id ?? null, 9);

  await withPages(async (page, tag) => {
    await shoot(page, 'bai-viet', `/tin-tuc/${slugs.rich}`, tag);
    if (slugs.portrait) await shoot(page, 'bai-viet-anh-doc', `/tin-tuc/${slugs.portrait}`, tag);
    await shoot(page, 'bai-viet-ba-muc', `/tin-tuc/${slugs.three}`, tag);
    await shoot(page, 'bai-viet-khong-anh', `/tin-tuc/${slugs.nocover}`, tag);
    await shoot(page, 'du-an-chi-tiet', `/du-an/${slugs.project}`, tag);
  });
  // Tương tác thật (bật chuyển động)
  for (const size of sizes) {
    const mobile = size.width < 500;
    const live = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'no-preference', isMobile: mobile, hasTouch: mobile });
    const pg = await live.newPage();
    const errors: string[] = [];
    pg.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 300)); });
    pg.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 300)));
    const checks: Record<string, unknown> = {};
    await pg.goto(origin + '/tin-tuc/' + slugs.rich, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(600);
    checks.tocActiveAtTop = await pg.locator('[data-toc-link].is-active').count();
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.45));
    await pg.waitForTimeout(500);
    checks.tocActiveMid = await pg.locator('[data-toc-link].is-active').allInnerTexts();
    checks.progressMid = await pg.locator('.art-progress > div').evaluate(el => (el as HTMLElement).style.transform);
    await pg.screenshot({ path: join(out, 'tuong-tac-giua-bai-' + size.tag + '.png') });
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(500);
    checks.tocActiveBackAtTop = await pg.locator('[data-toc-link].is-active').count();
    // hàng chia sẻ cuối bài: ba nút cùng một hàng
    const share = await pg.locator('.art-share.is-row .art-share-btn').evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }));
    checks.shareRow = share;
    checks.shareSameRow = new Set(share.map(s => s.top)).size === 1;
    // mục lục điện thoại có hiện ở bài đúng ba mục
    await pg.goto(origin + '/tin-tuc/' + slugs.three, { waitUntil: 'networkidle' });
    checks.tocMobileVisibleThreeHeadings = await pg.locator('.art-toc-mobile').isVisible().catch(() => false);
    checks.tocDesktopVisibleThreeHeadings = await pg.locator('.art-toc').isVisible().catch(() => false);
    // hộp ảnh: mở, đóng, tiêu điểm
    await pg.goto(origin + '/tin-tuc/' + slugs.rich, { waitUntil: 'networkidle' });
    const zoom = pg.locator('.art-prose .art-zoom').first();
    await zoom.scrollIntoViewIfNeeded(); await zoom.focus(); await zoom.click(); await pg.waitForTimeout(450);
    checks.lightboxOpen = await pg.evaluate(() => (document.querySelector('.art-lightbox') as HTMLDialogElement | null)?.open === true);
    await pg.screenshot({ path: join(out, 'hop-xem-anh-' + size.tag + '.png') });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(450);
    checks.lightboxClosed = await pg.evaluate(() => (document.querySelector('.art-lightbox') as HTMLDialogElement | null)?.open === false);
    checks.focusReturned = await pg.evaluate(() => document.activeElement?.classList.contains('art-zoom') === true);
    // ảnh trong thẻ hiện dần: không ảnh nào kẹt ẩn sau khi tải xong
    await pg.goto(origin + '/tin-tuc', { waitUntil: 'networkidle' });
    await pg.waitForTimeout(900);
    await pg.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } });
    await pg.waitForTimeout(700);
    checks.cardImagesStuckHidden = await pg.evaluate(() => [...document.querySelectorAll('img[data-fade]')].filter(i => getComputedStyle(i).opacity !== '1').length);
    // tìm nhanh: gõ rồi chờ, địa chỉ đổi và kết quả đổi không cần bấm
    await pg.goto(origin + '/tin-tuc', { waitUntil: 'networkidle' });
    const t0 = Date.now();
    await pg.locator('#nl-q').fill('zzzkhongco');
    await pg.waitForURL(/q=zzzkhongco/, { timeout: 5000 }).catch(() => {});
    checks.liveSearchMs = Date.now() - t0;
    await pg.waitForTimeout(500);
    checks.liveSearchEmpty = await pg.locator('.nl-empty').count();
    report.push({ name: 'tuong-tac', size: size.tag, checks, errors });
    await live.close();
  }
  // Dự án bằng đường tin-tuc phải chuyển hướng: không chụp. Xoá bài lẻ trước khi chụp danh sách để đếm đúng.
  await clearSamples();

  for (const n of [1, 2, 3, 7]) {
    const cover = (i: number) => (i % 4 === 3 ? null : landscapes[i % Math.max(landscapes.length, 1)]?.id ?? null);
    for (let i = 0; i < n; i++) await add(media, `l${n}-${i}`, `Bài mẫu số ${i + 1}: hướng dẫn chọn bể composite cho từng nhu cầu sử dụng`, 'Tóm tắt ngắn của bài mẫu để kiểm lưới thẻ, hai dòng là đủ, bài sẽ tự xoá sau khi chụp.', thin, i % 3 === 2 ? 'project' : 'article', cover(i), 2 + i);
    await withPages(async (page, tag) => { await shoot(page, `tin-tuc-${n}-bai`, '/tin-tuc', tag); });
    if (n === 3) await withPages(async (page, tag) => { await shoot(page, 'tin-tuc-loc-ra-0', '/tin-tuc?q=khongcoketqua', tag); });
    await clearSamples();
  }
  await withPages(async (page, tag) => { await shoot(page, 'tin-tuc-rong', '/tin-tuc?q=khongcoketqua', tag); });
} catch (error) {
  console.error(error); exitCode = 1;
} finally {
  await clearSamples().catch(e => { console.error('Dọn bài mẫu lỗi:', e); exitCode = 1; });
  const left = await db.query('SELECT count(*)::int AS n FROM posts WHERE slug LIKE $1', ['bm-v2-%']).then(r => r.rows[0].n).catch(() => -1);
  console.log(`Bài mẫu còn lại sau khi dọn: ${left}`);
  await browser.close(); await db.end();
  writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));
  const bad = report.filter(r => ((r.errors as string[] | undefined)?.length ?? 0) || ((r.overflowX as number | undefined) ?? 0) > 0 || ((r.status as number | undefined) ?? 0) >= 500);
  console.log(`Đã chụp ${report.length} mục. Mục có vấn đề: ${bad.length}`);
  for (const r of bad) console.log(JSON.stringify(r).slice(0, 400));
  process.exitCode = exitCode;
}
