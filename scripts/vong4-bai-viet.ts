// Vòng bốn, vùng bài viết: chụp tin tức, dự án, bài viết, dự án chi tiết (rỗng và có bài mẫu), đo lề trái phải bằng toạ độ thật,
// đo số ký tự mỗi dòng, thử morph từ danh sách sang bài và quay lại, đếm dữ liệu trước và sau.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/vong4-bai-viet.ts <thư-mục-ra> [rong|co-bai|morph|all]
// Bài mẫu chèn tạm (slug bm-v4-*) và luôn xoá khi xong, kể cả khi lỗi hoặc bị ngắt.
import { chromium, type Page, type Browser } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { db } from '../src/lib/db';

const out = process.argv[2];
const mode = process.argv[3] ?? 'all';
if (!out) { console.error('Thiếu thư mục ra.'); process.exit(1); }
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });

const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }];
const marginSizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '768', width: 768, height: 1024 }, { tag: '390', width: 390, height: 844 }];

async function counts() {
  const one = async (sql: string) => Number((await db.query<{ n: string }>(sql)).rows[0].n);
  return { posts: await one('select count(*) n from posts'), inquiries: await one('select count(*) n from inquiries'), media: await one('select count(*) n from media_assets'), users: await one('select count(*) n from users') };
}

const ids: string[] = [];
const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const h = (level: number, text: string) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
const cell = (type: string, text: string) => ({ type, attrs: { colspan: 1, rowspan: 1 }, content: [p(text)] });
const list = (type: string, items: string[]) => ({ type, content: items.map(t => ({ type: 'listItem', content: [p(t)] })) });
const long = 'Khi đào hố ở vùng đất trũng cần dùng máy bơm hút cạn nước, gia cố nền đáy bằng cát đầm chặt hoặc bê tông lót phẳng, không để gạch đá sắc nhọn chạm vào thân bể. Sau khi hạ bể cần bơm nước vào lòng bể ngay để cân bằng với lực đẩy nổi của nước ngầm bên ngoài, rồi mới lấp đất mịn theo từng lớp và đầm đều tay.';

async function fixture() {
  const media = await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at");
  const m: string[] = [];
  const probe = randomUUID(); ids.push(probe);
  await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now())', [probe, 'Bài dò ảnh tạm', 'bm-v4-do-' + probe.slice(0, 6), '', JSON.stringify({ type: 'doc', content: [] }), 'article', 'published']);
  for (const r of media.rows.slice(0, 14)) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [probe, r.id]);
  let portrait: string | null = null; let landscape: string | null = null;
  for (const r of media.rows.slice(0, 14)) {
    const res = await fetch(`${origin}/api/media/${r.id}`).catch(() => null);
    if (!res?.ok) continue;
    m.push(r.id);
    const info = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
    if (info.width && info.height) { if (info.height > info.width * 1.1) portrait ??= r.id; else landscape ??= r.id; }
    if (m.length >= 5 && portrait && landscape) break;
  }
  console.log('Ảnh dùng được:', m.length, '| dọc:', !!portrait, '| ngang:', !!landscape);
  const image = (i: number, alt: string, extra: Record<string, unknown> = {}) => m[i] ? [{ type: 'image', attrs: { src: `/api/media/${m[i]}`, alt, title: alt, ...extra } }] : [];
  const insert = 'INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
  const add = async (key: string, title: string, excerpt: string, content: unknown, kind: string, cover: string | null, daysAgo: number) => {
    const id = randomUUID(); ids.push(id);
    const slug = `bm-v4-${key}-${id.slice(0, 6)}`;
    await db.query(insert, [id, title, slug, excerpt, JSON.stringify(content), kind, 'published', cover, new Date(Date.now() - daysAgo * 86400000 - 60000)]);
    for (const mid of m.slice(0, 5)) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, mid]);
    return slug;
  };
  const wideTable = { type: 'table', content: [
    { type: 'tableRow', content: ['Mã sản phẩm', 'Dung tích danh định', 'Kích thước phủ bì', 'Quy mô đàn phù hợp', 'Thời gian lắp đặt', 'Ghi chú vận chuyển'].map(t => cell('tableHeader', t)) },
    ...[['TLC-BIO-1.5', '1,5 m³', '1,2 x 1,2 x 1,3 m', '5 đến 10 con lợn', '1 ngày', 'Một người nâng được'], ['TLC-BIO-2.25', '6,0 m³', '2,2 x 2,2 x 1,6 m', '15 đến 30 con lợn', '1 đến 2 ngày', 'Cần xe tải nhỏ'], ['TLC-BIO-2.40', '7,2 m³', '2,4 x 2,4 x 1,7 m', '30 đến 50 con lợn', '2 ngày', 'Cần xe cẩu nhỏ']].map(r => ({ type: 'tableRow', content: r.map(t => cell('tableCell', t)) })),
  ] };
  const rich = { type: 'doc', content: [
    p(long), h(2, 'Chuẩn bị hố đào ở vùng đất trũng'), p(long), p(long), ...image(0, 'Bể composite tại xưởng', { align: 'center' }),
    h(3, 'Các bước hạ bể'), list('orderedList', ['Hút cạn nước trong hố', 'Lót cát đầm chặt hoặc bê tông phẳng', 'Hạ bể đúng vị trí rồi bơm nước vào lòng bể', 'Lấp đất mịn theo từng lớp và đầm đều tay']),
    { type: 'blockquote', content: [p('Bơm nước vào lòng bể ngay khi hạ để cân bằng với lực đẩy nổi của nước ngầm bên ngoài.')] },
    h(2, 'Bảng chọn dung tích theo quy mô đàn'), wideTable, p(long),
    ...image(1, 'Bể composite tại công trình', { align: 'wide', caption: 'Dàn bể xếp tại xưởng, chờ vận chuyển' }),
    ...image(2, 'Ảnh thứ ba', { align: 'left', width: 40 }), p(long), p(long),
    h(2, 'Sửa chữa khi va đập'), p(long), list('bulletList', ['Mài nhám vùng nứt', 'Đắp sợi thủy tinh và nhựa nền', 'Chờ đóng rắn rồi thử kín']),
    { type: 'codeBlock', content: [{ type: 'text', text: 'Kiểm tra: đổ nước đầy bể, đánh dấu mực nước, chờ 24 giờ rồi đo lại.' }] },
    h(3, 'Lưu ý sau cùng'), p(long),
  ] };
  const thin = { type: 'doc', content: [p(long), h(2, 'Chỉ một tiêu đề'), p(long)] };
  const slugs: Record<string, string> = {};
  slugs.rich = await add('rich', 'Bài mẫu kiểm thử: lắp bể biogas composite ở vùng đất trũng, nhiều nước ngầm', 'Hút cạn hố, lót nền phẳng, bơm nước đối trọng rồi lấp đất theo lớp. Bài mẫu chỉ để kiểm giao diện, sẽ tự xoá.', rich, 'article', landscape ?? m[0] ?? null, 3);
  if (portrait) slugs.portrait = await add('doc', 'Bài mẫu ảnh bìa dọc: lắp bể biogas composite ở vùng đất trũng', 'Bài mẫu có ảnh bìa dọc để kiểm khung vòm, sẽ tự xoá.', rich, 'article', portrait, 4);
  slugs.nocover = await add('khonganh', 'Bài mẫu không ảnh bìa và chỉ một tiêu đề', 'Bài mẫu để kiểm bài ít tiêu đề, mục lục phải ẩn.', thin, 'article', null, 7);
  slugs.project = await add('duan', 'Dự án mẫu kiểm thử: dàn bể tròn composite cho trang trại', 'Dự án mẫu để kiểm giao diện trang dự án, sẽ tự xoá.', rich, 'project', m[2] ?? null, 9);
  slugs.project2 = await add('duan2', 'Dự án mẫu thứ hai: bể nuôi thủy sản đáy phễu', 'Dự án mẫu thứ hai, sẽ tự xoá.', thin, 'project', m[3] ?? null, 12);
  slugs.project3 = await add('duan3', 'Dự án mẫu thứ ba không ảnh bìa', 'Dự án mẫu không có ảnh bìa, sẽ tự xoá.', thin, 'project', null, 15);
  for (let i = 0; i < 6; i++) await add(`n${i}`, `Bài mẫu số ${i + 1}: hướng dẫn chọn bể composite cho từng nhu cầu sử dụng`, 'Tóm tắt ngắn của bài mẫu để kiểm lưới thẻ, hai dòng là đủ, bài sẽ tự xoá sau khi chụp.', thin, i % 3 === 2 ? 'project' : 'article', i % 4 === 3 ? null : (m[i % Math.max(m.length, 1)] ?? null), 10 + i);
  await db.query('DELETE FROM post_media WHERE post_id=$1', [probe]);
  await db.query('DELETE FROM posts WHERE id=$1', [probe]);
  return slugs;
}
async function cleanup() {
  if (!ids.length) return;
  await db.query('DELETE FROM post_media WHERE post_id = ANY($1)', [ids]);
  await db.query('DELETE FROM posts WHERE id = ANY($1)', [ids]);
}

type Report = Record<string, unknown>;
const report: Report[] = [];

/** Đo trong trình duyệt: lề trái phải của mọi cột chữ, ký tự mỗi dòng, tràn ngang, ảnh vỡ, ký tự cấm, vùng bấm, số dòng tiêu đề. */
const measure = () => {
  const cw = document.documentElement.clientWidth;
  const gap = (el: Element) => { const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(2), right: +(cw - r.right).toFixed(2), diff: +Math.abs(r.left - (cw - r.right)).toFixed(2), width: Math.round(r.width) }; };
  const columns: Record<string, unknown>[] = [];
  for (const el of document.querySelectorAll('main .tl-fs__inner, main .art-main, main .art-layout')) {
    const r = el.getBoundingClientRect(); if (r.width < 50 || r.height < 20) continue;
    columns.push({ sel: (el.className || el.tagName).toString().split(' ').slice(0, 2).join('.'), ...gap(el) });
  }
  const lines = (el: Element) => { const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3; return Math.round(el.getBoundingClientRect().height / lh); };
  const charsPerLine = (() => {
    const para = [...document.querySelectorAll('.art-prose > p')].sort((a, b) => (b.textContent?.length ?? 0) - (a.textContent?.length ?? 0))[1] ?? document.querySelector('.art-prose > p');
    if (!para) return null;
    const cs = getComputedStyle(para); const canvas = document.createElement('canvas').getContext('2d')!;
    canvas.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const text = para.textContent ?? ''; const avg = canvas.measureText(text).width / text.length;
    return { width: Math.round(para.getBoundingClientRect().width), fontSize: cs.fontSize, chars: +(para.getBoundingClientRect().width / avg).toFixed(1) };
  })();
  const small = cw <= 600 ? 44 : 36;
  const tiny = [...document.querySelectorAll('main a, main button, main summary')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'inline') return false; if (e.classList.contains('art-sr') || e.closest('.art-sr')) return false; return r.height < small - 0.5 && !e.closest('.pc-title'); }).map(e => `${e.className || e.tagName}:${Math.round(e.getBoundingClientRect().height)}`).slice(0, 8);
  const wrapLines = (el: Element) => { const out: string[] = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let lastTop = -1; let cur = ''; for (let n = walker.nextNode(); n; n = walker.nextNode()) { const t = n.textContent ?? ''; const re = new RegExp(String.fromCharCode(92)+"S+"+String.fromCharCode(92)+"s*", "g"); let m: RegExpExecArray | null; while ((m = re.exec(t))) { const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].trimEnd().length); const top = Math.round(r.getClientRects()[0]?.top ?? 0); if (lastTop !== -1 && Math.abs(top - lastTop) > 6) { out.push(cur.trim()); cur = ''; } lastTop = top; cur += m[0]; } } out.push(cur.trim()); return out; };
  const h1 = document.querySelector('main h1'); const h2s = [...document.querySelectorAll('main h2:not(.art-sr)')].filter(e => e.getBoundingClientRect().height > 0 && !e.closest('.art-prose')).map(e => ({ text: (e.textContent ?? '').slice(0, 40), lines: lines(e) }));
  return {
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 0).map(i => i.currentSrc || i.src).slice(0, 5),
    hiddenReveal: document.querySelectorAll('[data-art-reveal]:not(.is-in)').length,
    banned: (document.querySelector('main')?.innerText.match(/[·—;!]/g) ?? []).length,
    columns, charsPerLine, tiny, h1: h1 ? { text: (h1.textContent ?? '').slice(0, 40), lines: lines(h1), wrap: wrapLines(h1) } : null, h2s, wraps: [...document.querySelectorAll('main h2:not(.art-sr), main .lh-text p, main .art-excerpt')].filter(e => e.getBoundingClientRect().height > 0 && !e.closest('.art-prose')).map(wrapLines),
    shapes: [...new Set([...document.querySelectorAll('main [data-shape]')].map(e => e.getAttribute('data-shape')))],
  };
};

async function shoot(page: Page, name: string, path: string, size: { tag: string; width: number; height: number }, shots = true) {
  const errors: string[] = [];
  const onConsole = (msg: { type(): string; text(): string }) => { if (msg.type() === 'error') errors.push(msg.text().slice(0, 300)); };
  const onPageError = (e: Error) => errors.push('pageerror: ' + e.message.slice(0, 300));
  page.on('console', onConsole); page.on('pageerror', onPageError);
  await page.setViewportSize({ width: size.width, height: size.height });
  const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 90000 }).catch(e => { errors.push('goto: ' + String(e).slice(0, 200)); return null; });
  await page.waitForTimeout(900);
  if (shots) await page.screenshot({ path: join(out, `${name}-${size.tag}-dau.png`) });
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 350) { window.scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); } window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }); await new Promise(r => setTimeout(r, 400)); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.waitForTimeout(700);
  if (shots) await page.screenshot({ path: join(out, `${name}-${size.tag}-toan-trang.png`), fullPage: true });
  const metrics = await page.evaluate(measure);
  page.off('console', onConsole); page.off('pageerror', onPageError);
  report.push({ name, path, size: size.tag, status: response?.status() ?? null, ...metrics, errors });
  console.log(name, size.tag, response?.status(), 'tràn', (metrics as { overflowX: number }).overflowX, 'lỗi', errors.length);
}

async function morph(browser: Browser, slug: string, height = 768) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height } });
  await ctx.addInitScript("window.__name=(f)=>f");
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    (window as unknown as { __vt: unknown[] }).__vt = [];
    const orig = document.startViewTransition?.bind(document);
    if (!orig) return;
    document.startViewTransition = ((cb?: () => void) => {
      const rec: { names: string[]; ready: boolean; err?: string; t: number } = { names: [], ready: false, t: performance.now() };
      (window as unknown as { __vt: unknown[] }).__vt.push(rec);
      const t = orig(cb as never);
      t.ready.then(() => {
        rec.ready = true;
        rec.names = document.getAnimations().map(a => (a.effect as unknown as { pseudoElement?: string })?.pseudoElement ?? '').filter(n => /tl-post/.test(n));
      }).catch((e: unknown) => { rec.err = String(e); });
      return t;
    }) as typeof document.startViewTransition;
  });
  const result: Record<string, unknown> = { slug };
  const grab = () => page.evaluate(() => (window as unknown as { __vt: unknown[] }).__vt);
  await page.goto(origin + '/tin-tuc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const card = page.locator(`a[href="/tin-tuc/${slug}"]`).first();
  await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  await card.click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(out, 'morph-giua-chuyen-di.png') });
  await page.waitForURL('**/tin-tuc/' + slug, { timeout: 20000 });
  await page.waitForTimeout(1200);
  result.forward = await grab();
  const heading = await page.evaluate(() => { const h = document.querySelector('main h1'); return h ? getComputedStyle(h.parentElement!).viewTransitionName + ' | ' + getComputedStyle(h).viewTransitionName : null; });
  result.titleVtName = heading;
  result.coverVtName = await page.evaluate(() => [...document.querySelectorAll('main .tl-sf')].map(e => getComputedStyle(e).viewTransitionName));
  await page.locator('.art-crumbs a[href="/tin-tuc"]').first().click();
  await page.waitForURL(u => u.pathname === '/tin-tuc', { timeout: 20000 }); await page.waitForTimeout(1500);
  result.afterCrumb = await grab();
  await page.goBack(); await page.waitForTimeout(1500);
  result.afterBrowserBack = (await grab() as unknown[]).length;
  await ctx.close();
  return result;
}

async function a11y(browser: Browser, slugs: Record<string, string>) {
  const out2: Record<string, unknown> = {};
  for (const [label, opts] of [["giam-chuyen-dong", { reducedMotion: "reduce" as const }], ["khong-js", { javaScriptEnabled: false }]] as const) {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, ...opts });
    await ctx.addInitScript("window.__name=(f)=>f");
    const page = await ctx.newPage();
    for (const path of ["/tin-tuc", "/du-an", "/tin-tuc/" + slugs.rich]) {
      await page.goto(origin + path, { waitUntil: "networkidle" }); await page.waitForTimeout(600);
      const r = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - innerWidth, faded: [...document.querySelectorAll("[data-art-reveal], .pc-media img")].filter(e => parseFloat(getComputedStyle(e).opacity) < 0.99).length, h1: !!document.querySelector("main h1"), cards: document.querySelectorAll(".pc-card").length }));
      out2[label + " " + path.replace(slugs.rich, "bai-mau")] = r;
      if (path.includes("bm-v4")) await page.screenshot({ path: join(out, "bai-viet-" + label + "-1366-dau.png") });
    }
    await ctx.close();
  }
  return out2;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let exitCode = 0;
const onSignal = () => { cleanup().finally(() => process.exit(130)); };
process.on('SIGINT', onSignal); process.on('SIGTERM', onSignal);
const before = await counts();
console.log('Trước:', JSON.stringify(before));
const extra: Record<string, unknown> = {};
try {
  const ctx = await browser.newContext();
  await ctx.addInitScript("window.__name=(f)=>f");
  const page = await ctx.newPage();
  if (mode === 'rong' || mode === 'all') {
    for (const s of sizes) { await shoot(page, 'tin-tuc-rong', '/tin-tuc', s); await shoot(page, 'du-an-rong', '/du-an', s); }
    for (const s of marginSizes.filter(x => x.tag === '768')) { await shoot(page, 'tin-tuc-rong', '/tin-tuc', s, false); await shoot(page, 'du-an-rong', '/du-an', s, false); }
  }
  if (mode === 'co-bai' || mode === 'morph' || mode === 'a11y' || mode === 'all') {
    const slugs = await fixture();
    await page.waitForTimeout(500);
    if (mode === 'a11y') extra.a11y = await a11y(browser, slugs);
    if (mode === 'co-bai' || mode === 'all') {
      for (const s of sizes) {
        await shoot(page, 'tin-tuc-co-bai', '/tin-tuc', s);
        await shoot(page, 'du-an-co-bai', '/du-an', s);
        await shoot(page, 'bai-viet', `/tin-tuc/${slugs.rich}`, s);
        await shoot(page, 'du-an-chi-tiet', `/du-an/${slugs.project}`, s);
        if (s.tag !== '600') { await shoot(page, 'bai-viet-anh-doc', `/tin-tuc/${slugs.portrait ?? slugs.rich}`, s); await shoot(page, 'bai-viet-khong-anh', `/tin-tuc/${slugs.nocover}`, s); }
      }
      for (const s of marginSizes.filter(x => x.tag === '768')) {
        await shoot(page, 'tin-tuc-co-bai', '/tin-tuc', s, false); await shoot(page, 'du-an-co-bai', '/du-an', s, false);
        await shoot(page, 'bai-viet', `/tin-tuc/${slugs.rich}`, s, false); await shoot(page, 'du-an-chi-tiet', `/du-an/${slugs.project}`, s, false);
      }
    }
    if (mode === 'morph' || mode === 'all') { extra.morph = await morph(browser, slugs.rich); extra.morphTall = await morph(browser, slugs.rich, 1300); }
  }
  await ctx.close();
} catch (error) {
  console.error(error); exitCode = 1;
} finally {
  await cleanup().catch(e => { console.error('Dọn lỗi', e); exitCode = 1; });
  await browser.close();
}
const after = await counts();
console.log('Sau:', JSON.stringify(after));
writeFileSync(join(out, `report-${mode}.json`), JSON.stringify({ before, after, extra, report }, null, 1));
process.exit(exitCode);
