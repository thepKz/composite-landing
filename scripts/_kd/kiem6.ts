import { chromium, type Page } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from '../../src/lib/db';
import { hashPassword } from '../../src/lib/security';

const origin = 'http://127.0.0.1:3002';
const out = 'docs/nang-cap-2026-11/vong-6/kiem-doc-lap';
mkdirSync(out, { recursive: true });
const log: Record<string, unknown> = {};
const note = (k: string, v: unknown) => { log[k] = v; console.log(k, JSON.stringify(v).slice(0, 700)); writeFileSync(join(out, 'ket-qua-kiem.json'), JSON.stringify(log, null, 2)); };

const userId = randomUUID(); const email = `kd6-${userId}@example.test`; const password = randomBytes(24).toString('hex');
const tempProductId = randomUUID(); const tempSlug = `kd6-an-${tempProductId.slice(0, 8)}`;
let before: any;
const PRODUCT = 'Bồn chứa hóa chất composite';
const SLUG = 'bon-chua-hoa-chat';

async function snapshotDb() {
  const q = async (s: string) => (await db.query(s)).rows;
  return {
    posts: (await q('select count(*)::int c from posts'))[0].c, inquiries: (await q('select count(*)::int c from inquiries'))[0].c,
    media: (await q('select count(*)::int c from media_assets'))[0].c, users: (await q('select count(*)::int c from users'))[0].c,
    product_media: (await q('select count(*)::int c from product_media'))[0].c, products: (await q('select count(*)::int c from products'))[0].c,
    covers: await q('select slug,cover_id,updated_at from products order by slug'),
  };
}
async function login(page: Page) {
  await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email quản trị').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL(origin + '/admin', { timeout: 30000 });
}
const api = (page: Page, method: string, url: string, body?: unknown) => page.evaluate(async ([method, url, body]) => {
  const r = await fetch(url as string, { method: method as string, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json: any = null; try { json = await r.json(); } catch {}
  return { status: r.status, json };
}, [method, url, body] as const);

const FORBID = /[·—;! ]|&nbsp;/;
const TECH = /\b(id|media|slug|database|seo|uuid|api|json|upload|url|http|error|null|undefined)\b/i;
async function scanText(page: Page, selector: string) {
  const r: any = await page.evaluate((sel) => {
    const root = document.querySelector(sel); if (!root) return { missing: true };
    const texts = new Set<string>();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) { const t = (walker.currentNode.textContent || '').trim(); if (t) texts.add(t); }
    root.querySelectorAll('[aria-label],[placeholder],[title],img[alt]').forEach(e => { for (const a of ['aria-label', 'placeholder', 'title', 'alt']) { const v = e.getAttribute(a); if (v) texts.add('@' + a + ': ' + v); } });
    return { texts: [...texts] };
  }, selector);
  if (r.missing) return r;
  const bad = r.texts.filter((t: string) => FORBID.test(t) || TECH.test(t) || /[A-ZÀ-Ỹ]{2,}(\s+[A-ZÀ-Ỹ]{2,})+/.test(t));
  return { count: r.texts.length, bad, texts: r.texts };
}
async function metrics(page: Page) { return page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - window.innerWidth })); }
async function small(page: Page, selector: string) {
  return page.evaluate((sel) => [...document.querySelectorAll<HTMLElement>(sel)].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { label: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }; }), selector);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const consoleErrors: Record<string, string[]> = {};
function watch(page: Page, tag: string) { consoleErrors[tag] = []; page.on('console', m => { if (m.type() === 'error') consoleErrors[tag].push(m.text().slice(0, 250)); }); page.on('pageerror', e => consoleErrors[tag].push('pageerror: ' + e.message.slice(0, 250))); }

async function openProduct(page: Page) {
  await page.goto(origin + '/admin/san-pham', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: `Chỉnh sửa ${PRODUCT}`, exact: true }).click();
  await page.getByRole('heading', { name: 'Ảnh sản phẩm' }).waitFor();
}

try {
  before = await snapshotDb(); note('truoc', { ...before, covers: before.covers.map((c: any) => `${c.slug}:${c.cover_id}`) });
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm độc lập 6', await hashPassword(password)]);
  const imgRows = (await db.query("SELECT id::text id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at DESC")).rows.map(r => r.id);

  // ===== DESKTOP =====
  const ctxD = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctxD.newPage(); watch(page, 'admin-1366');
  await login(page);
  await page.goto(origin + '/admin/san-pham', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(out, 'd01-danh-sach-san-pham.png') });
  await openProduct(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, 'd02-sua-san-pham-dau-trang.png') });
  const sec = page.locator('section.pp-section');
  const secBox = await sec.boundingBox(); const docY = await page.evaluate(() => window.scrollY);
  note('d_muc_anh_vi_tri_tren_trang_px', secBox ? Math.round(secBox.y + docY) : null);
  await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, 'd03-muc-anh-khong-anh.png') });
  note('d_muc_anh_rong_text', await scanText(page, 'section.pp-section'));

  // bàn phím: Tab tới nút thêm ảnh, bắt đầu từ ô ứng dụng ngay trước đó
  await page.locator('textarea').last().focus();
  let tabs = 0; let reached = false;
  for (; tabs < 15; tabs++) { await page.keyboard.press('Tab'); const lab = await page.evaluate(() => document.activeElement?.textContent?.trim()); if (lab === 'Thêm ảnh') { reached = true; break; } }
  note('d_ban_phim_tab_toi_nut_them_anh', { reached, tabs: tabs + 1 });
  await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  note('d_ban_phim_tieu_diem_vao_hop', await page.evaluate(() => { const a = document.activeElement; return { inDialog: !!a?.closest('[role=dialog]'), tag: a?.tagName, label: (a?.getAttribute('aria-label') || a?.textContent || '').trim().slice(0, 40) }; }));
  const stay: boolean[] = []; for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); stay.push(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))); }
  note('d_ban_phim_tab_giu_trong_hop', { allInside: stay.every(Boolean) });
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  note('d_ban_phim_esc_dong_va_tra_tieu_diem', await page.evaluate(() => ({ dialogOpen: !!document.querySelector('[role=dialog]'), active: document.activeElement?.textContent?.trim() })));

  // thêm 5 ảnh
  await page.getByRole('button', { name: 'Thêm ảnh', exact: true }).click(); await page.waitForTimeout(900);
  await page.screenshot({ path: join(out, 'd04-hop-chon-anh.png') });
  const tiles = page.locator('[role=dialog] .adm-media-tile');
  note('d_hop_so_anh_hien', await tiles.count());
  const chosen: string[] = [];
  for (let i = 0; i < 5; i++) { const t = tiles.nth(i); const src = await t.locator('img').first().getAttribute('src'); chosen.push(src!.match(/media\/([0-9a-f-]+)/)![1]); await t.click(); }
  await page.waitForTimeout(300);
  note('d_hop_thanh_chon_text', await page.locator('[role=dialog] .adm-pick-bar').innerText());
  await page.screenshot({ path: join(out, 'd05-hop-chon-5-anh.png') });
  note('d_hop_text_scan', await scanText(page, '[role=dialog]'));
  await page.getByRole('button', { name: /^Thêm 5 ảnh$/ }).click(); await page.waitForTimeout(700);
  const order = async () => page.$$eval('ol.pp-grid img', els => els.map(e => (e.getAttribute('src') || '').match(/media\/([0-9a-f-]+)/)![1]));
  const o1 = await order(); note('d_sau_them_dung_thu_tu_chon', JSON.stringify(o1) === JSON.stringify(chosen));
  note('d_sau_them_thong_bao', (await page.locator('.pp-count').innerText()) + ' | ' + (await page.locator('.pp-status').allInnerTexts()).join(' | '));
  await page.screenshot({ path: join(out, 'd06-sau-them-5-anh.png') });
  await page.getByRole('button', { name: 'Đưa ảnh 1 xuống sau' }).click();
  await page.getByRole('button', { name: 'Đưa ảnh 5 lên trước' }).click();
  const expected = [...chosen]; [expected[0], expected[1]] = [expected[1], expected[0]]; [expected[3], expected[4]] = [expected[4], expected[3]];
  const o2 = await order(); note('d_sau_doi_cho', { ok: JSON.stringify(o2) === JSON.stringify(expected) });
  await page.getByRole('button', { name: 'Bỏ ảnh 3' }).click(); const removed = expected.splice(2, 1)[0];
  const o3 = await order(); note('d_sau_bo_anh', { ok: JSON.stringify(o3) === JSON.stringify(expected), focusOn: await page.evaluate(() => document.activeElement?.textContent?.trim()) });
  note('d_truoc_luu_trang_thai', (await page.locator('.pp-status').allInnerTexts()).join(' | ') + ' || ' + await page.locator('.product-action-bar p').innerText());
  await page.screenshot({ path: join(out, 'd07-truoc-luu.png') });
  await page.getByRole('button', { name: 'Lưu sản phẩm', exact: true }).click(); await page.waitForTimeout(1500);
  note('d_sau_luu_trang_thai', (await page.locator('.pp-status').allInnerTexts()).join(' | ') + ' || ' + await page.locator('.product-action-bar p').innerText());
  await page.screenshot({ path: join(out, 'd08-sau-luu.png') });
  const dbOrder = (await db.query('SELECT media_id::text id FROM product_media pm JOIN products p ON p.id=pm.product_id WHERE p.slug=$1 ORDER BY position', [SLUG])).rows.map(r => r.id);
  note('d_csdl_thu_tu', { ok: JSON.stringify(dbOrder) === JSON.stringify(expected), rows: dbOrder.length, cover_ok: (await db.query('select cover_id::text c from products where slug=$1', [SLUG])).rows[0].c === expected[0] });
  await openProduct(page); await page.locator('section.pp-section').scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  note('d_tai_lai_thu_tu', { ok: JSON.stringify(await order()) === JSON.stringify(expected), count: expected.length });
  await page.screenshot({ path: join(out, 'd09-tai-lai.png') });
  note('d_muc_anh_co_anh_text', await scanText(page, 'section.pp-section'));
  note('d_vung_bam_desktop', await small(page, 'section.pp-section button'));
  note('d_overflow', await metrics(page));
  await page.getByRole('button', { name: 'Thêm ảnh', exact: true }).click(); await page.waitForTimeout(900);
  note('d_hop_da_them_badges', await page.locator('[role=dialog] .adm-media-used').count());
  await page.screenshot({ path: join(out, 'd10-hop-co-anh-da-them.png') });
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);

  // ===== trang công khai, khách chưa đăng nhập =====
  const guest = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const gp = await guest.newPage(); watch(gp, 'khach-1366');
  const imgResp: { url: string; status: number }[] = []; gp.on('response', r => { if (r.url().includes('/api/media/')) imgResp.push({ url: r.url().replace(origin, ''), status: r.status() }); });
  await gp.goto(`${origin}/san-pham/${SLUG}`, { waitUntil: 'networkidle' }); await gp.waitForTimeout(800);
  const thumbs = gp.locator('.pg-thumbs button');
  note('c_so_anh_nho', await thumbs.count());
  const thumbSrcs = await gp.$$eval('.pg-thumbs img', els => els.map(e => ((e as HTMLImageElement).currentSrc || e.getAttribute('src') || '').match(/media\/([0-9a-f-]+)/)?.[1] ?? e.getAttribute('src')));
  note('c_thu_tu_dung', { ok: JSON.stringify(thumbSrcs) === JSON.stringify(expected), thumbSrcs });
  note('c_dem', await gp.locator('.pg-count').first().innerText());
  await gp.screenshot({ path: join(out, 'c01-cong-khai-1366.png') });
  const stat: number[] = []; for (const id of expected) { const r = await gp.request.get(`${origin}/api/media/${id}`); stat.push(r.status()); }
  note('c_anh_tai_duoc_khach', stat); note('c_phan_hoi_trang', imgResp.slice(0, 20));
  note('c_anh_vo', await gp.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).length));
  await thumbs.nth(2).click(); await gp.waitForTimeout(500);
  const mainSrc = async () => gp.$eval('.pg-photo', e => (e.getAttribute('src') || '').match(/media\/([0-9a-f-]+)/)![1]);
  note('c_bam_anh_nho_3', { ok: (await mainSrc()) === expected[2], count: await gp.locator('.pg-count').first().innerText() });
  await gp.locator('.pg-arrow.is-next').first().click(); await gp.waitForTimeout(400);
  note('c_mui_ten_sau', { ok: (await mainSrc()) === expected[3] });
  await gp.locator('.pg-arrow.is-next').first().click(); await gp.waitForTimeout(400);
  note('c_mui_ten_vong_ve_dau', { ok: (await mainSrc()) === expected[0] });
  await gp.locator('.pg-arrow.is-prev').first().click(); await gp.waitForTimeout(400);
  note('c_mui_ten_truoc_vong_cuoi', { ok: (await mainSrc()) === expected[expected.length - 1] });
  await gp.locator('.pg-stage').focus(); await gp.keyboard.press('ArrowLeft'); await gp.waitForTimeout(400);
  note('c_phim_mui_ten', { ok: (await mainSrc()) === expected[expected.length - 2] });
  await gp.getByRole('button', { name: 'Phóng to ảnh' }).click(); await gp.waitForTimeout(600);
  note('c_phong_to', { open: await gp.evaluate(() => (document.querySelector('dialog.pg-lightbox') as HTMLDialogElement).open), focus: await gp.evaluate(() => document.activeElement?.getAttribute('aria-label')) });
  await gp.screenshot({ path: join(out, 'c02-phong-to.png') });
  await gp.keyboard.press('ArrowRight'); await gp.waitForTimeout(400);
  note('c_phong_to_mui_ten', await gp.locator('dialog.pg-lightbox .pg-count').innerText());
  await gp.keyboard.press('Escape'); await gp.waitForTimeout(500);
  note('c_esc', await gp.evaluate(() => ({ open: (document.querySelector('dialog.pg-lightbox') as HTMLDialogElement).open, focus: document.activeElement?.getAttribute('aria-label') })));
  note('c_overflow', await metrics(gp));

  // ===== MOBILE =====
  const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mp = await ctxM.newPage(); watch(mp, 'admin-390');
  await login(mp); await openProduct(mp);
  await mp.locator('section.pp-section').scrollIntoViewIfNeeded(); await mp.waitForTimeout(500);
  await mp.screenshot({ path: join(out, 'm01-muc-anh.png') });
  note('m_vung_bam_muc_anh', await small(mp, 'section.pp-section button'));
  note('m_overflow_sua', await metrics(mp));
  await mp.getByRole('button', { name: 'Thêm ảnh', exact: true }).tap(); await mp.waitForTimeout(900);
  await mp.screenshot({ path: join(out, 'm02-hop-chon.png') });
  note('m_vung_bam_hop', await small(mp, '[role=dialog] button, [role=dialog] input'));
  note('m_overflow_hop', await metrics(mp));
  await mp.locator('[role=dialog] .adm-media-tile:not([disabled])').first().tap(); await mp.waitForTimeout(300);
  await mp.screenshot({ path: join(out, 'm03-hop-chon-1-anh.png') });
  await mp.keyboard.press('Escape'); await mp.waitForTimeout(500);
  await mp.screenshot({ path: join(out, 'm04-sau-dong-hop.png') });
  note('m_so_anh_sau_dong_khong_luu', (await mp.$$('ol.pp-grid li')).length);
  const gm = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const gmp = await gm.newPage(); watch(gmp, 'khach-390');
  await gmp.goto(`${origin}/san-pham/${SLUG}`, { waitUntil: 'networkidle' }); await gmp.waitForTimeout(800);
  await gmp.screenshot({ path: join(out, 'm05-cong-khai-390.png') });
  note('m_cong_khai_overflow', await metrics(gmp));
  note('m_cong_khai_vung_bam', await small(gmp, '.pg button'));

  // ===== hồi quy thư viện ảnh khi có ảnh đang dùng =====
  await page.goto(origin + '/admin/thu-vien', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  note('r_thu_vien_so_tile', await page.locator('.adm-media-tile').count());
  note('r_thu_vien_dang_dung_badges', await page.locator('.adm-media-used').count());
  await page.screenshot({ path: join(out, 'r01-thu-vien.png') });
  await page.locator('.adm-media-tile', { has: page.locator('.adm-media-used') }).first().click(); await page.waitForTimeout(700);
  note('r_thu_vien_chi_tiet', await page.locator('aside.adm-media-details').innerText());
  await page.screenshot({ path: join(out, 'r02-thu-vien-chi-tiet-dang-dung.png') });
  await page.getByRole('button', { name: 'Xoá', exact: true }).click(); await page.waitForTimeout(700);
  await page.screenshot({ path: join(out, 'r03-xoa-anh-dang-dung.png') });
  note('r_xoa_anh_dang_dung_ui', { dialog: await page.locator('[role=dialog]').allInnerTexts(), toasts: await page.locator('.adm-toast').allInnerTexts(), mediaStill: (await db.query('select count(*)::int c from media_assets')).rows[0].c });
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Chọn nhiều', exact: true }).click(); await page.waitForTimeout(300);
  note('r_chon_nhieu_khoa_anh_dang_dung', await page.locator('.adm-media-tile[disabled]').count());
  note('e_xoa_anh_dang_dung_api', await api(page, 'DELETE', `/api/admin/media/${expected[0]}`));
  note('e_xoa_anh_dang_dung_van_con', (await db.query('select count(*)::int c from media_assets where id=$1', [expected[0]])).rows[0].c);
  note('e_anh_khong_ai_dung_khach', (await gp.request.get(`${origin}/api/media/${removed}`)).status());
  note('e_anh_khong_ai_dung_admin', (await page.request.get(`${origin}/api/media/${removed}`)).status());

  // hồi quy bài viết: hộp chọn ảnh bìa
  await page.goto(origin + '/admin/bai-viet/moi', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
  await page.screenshot({ path: join(out, 'r04-bai-viet-moi.png') });
  const coverBtn = page.getByRole('button', { name: 'Chọn ảnh bìa', exact: true });
  note('r_bai_viet_nut_bia', (await coverBtn.count()) ? await coverBtn.innerText() : 'khong-thay');
  if (await coverBtn.count()) {
    await coverBtn.click(); await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, 'r05-bai-viet-hop-chon-bia.png') });
    await page.locator('[role=dialog] .adm-media-tile').first().click(); await page.waitForTimeout(300);
    note('r_bai_viet_thanh_chon', await page.locator('[role=dialog] .adm-pick-bar').allInnerTexts());
    await page.screenshot({ path: join(out, 'r06-bai-viet-da-chon-1.png') });
    await page.getByRole('button', { name: 'Chọn làm ảnh bìa', exact: true }).click(); await page.waitForTimeout(700);
    note('r_bai_viet_sau_chon', { dialogOpen: await page.locator('[role=dialog]').count(), coverImgs: await page.locator('img[src*="/api/media/"]').count() });
    await page.screenshot({ path: join(out, 'r07-bai-viet-co-bia.png') });
  }
  note('r_bai_viet_so_bai_sau', (await db.query('select count(*)::int c from posts')).rows[0].c);

  // ===== BIÊN API =====
  const fresh = async () => ((await api(page, 'GET', '/api/admin/products')).json as any[]).find(p => p.slug === SLUG);
  const bodyOf = (p: any, extra: any) => ({ id: p.id, name: p.name, slug: p.slug, category: p.category, description: p.description, specifications: p.specifications, applications: p.applications, cover_id: p.cover_id, is_published: p.is_published, sort_order: p.sort_order, updated_at: p.updated_at, ...extra });
  const post = async (extra: any, stale?: string) => { const p = await fresh(); return api(page, 'POST', '/api/admin/products', bodyOf(p, { ...extra, ...(stale ? { updated_at: stale } : {}) })); };
  const pmCount = async () => (await db.query('select count(*)::int c from product_media pm join products p on p.id=pm.product_id where p.slug=$1', [SLUG])).rows[0].c;
  const r21 = await post({ media_ids: imgRows.slice(0, 21) }); note('e_21_anh_that', { status: r21.status, json: r21.json, pm: await pmCount() });
  const r21r = await post({ media_ids: Array.from({ length: 21 }, () => randomUUID()) }); note('e_21_id_ngau_nhien', { status: r21r.status, json: r21r.json });
  const r61 = await post({ media_ids: Array.from({ length: 61 }, () => randomUUID()) }); note('e_61_id', { status: r61.status, json: r61.json });
  const r20 = await post({ media_ids: imgRows.slice(0, 20) }); note('e_20_anh', { status: r20.status, n: r20.json?.media_ids?.length, err: r20.json?.error });
  const rjunk = await post({ media_ids: ['abc', '123'] }); note('e_id_rac', { status: rjunk.status, json: rjunk.json });
  const rnum = await post({ media_ids: [1, 2] }); note('e_id_so', { status: rnum.status, json: rnum.json });
  const rnull = await post({ media_ids: null }); note('e_media_null', { status: rnull.status, json: rnull.json });
  const rstr = await post({ media_ids: imgRows[0] }); note('e_media_la_chuoi', { status: rstr.status, json: rstr.json });
  const rdup = await post({ media_ids: [imgRows[1], imgRows[1], imgRows[2], imgRows[1]] }); note('e_id_trung', { status: rdup.status, ids: rdup.json?.media_ids, ok: JSON.stringify(rdup.json?.media_ids) === JSON.stringify([imgRows[1], imgRows[2]]), cover: rdup.json?.cover_id === imgRows[1], err: rdup.json?.error });
  const rgh = await post({ media_ids: [imgRows[1], randomUUID()] }); note('e_id_khong_ton_tai', { status: rgh.status, json: rgh.json, pmGiu: await pmCount() });
  const rstale = await post({ media_ids: [imgRows[3]] }, '2020-01-01T00:00:00.000Z'); note('e_ban_cu_updated_at', { status: rstale.status, json: rstale.json });
  const rcov = await post({ cover_id: randomUUID(), media_ids: undefined }); note('e_cover_id_khong_ton_tai_khong_gui_media', { status: rcov.status, json: rcov.json });
  const rkeep = await post({ media_ids: undefined }); note('e_khong_gui_media_giu_nguyen', { status: rkeep.status, ids: rkeep.json?.media_ids, pm: await pmCount() });
  note('e_origin_la', (await ctxD.request.post(origin + '/api/admin/products', { headers: { Origin: 'http://evil.example' }, data: bodyOf(await fresh(), { media_ids: [imgRows[5]] }) })).status());
  note('e_khong_dang_nhap_post', await (async () => { const r = await guest.request.post(origin + '/api/admin/products', { headers: { Origin: origin }, data: bodyOf(await fresh(), { media_ids: [imgRows[5]] }) }); return { status: r.status(), body: (await r.text()).slice(0, 200) }; })());
  note('e_khong_dang_nhap_get', { status: (await guest.request.get(origin + '/api/admin/products')).status() });
  note('e_khong_dang_nhap_media_admin', { list: (await guest.request.get(origin + '/api/admin/media')).status(), detail: (await guest.request.get(origin + `/api/admin/media/${imgRows[0]}`)).status(), del: (await guest.request.delete(origin + `/api/admin/media/${imgRows[0]}`, { headers: { Origin: origin } })).status() });
  note('e_pm_sau_khong_dang_nhap', await pmCount());

  // ảnh gắn vào sản phẩm KHÔNG hiển thị
  const hiddenImg = imgRows[10], coverOnly = imgRows[11];
  await db.query("INSERT INTO products(id,name,slug,category,description,specifications,applications,cover_id,is_published,sort_order) VALUES ($1,'Sản phẩm tạm kiểm',$2,'Tạm','Sản phẩm tạm để kiểm độc lập, sẽ tự xoá.','[]','[]',$3,false,9999)", [tempProductId, tempSlug, coverOnly]);
  await db.query('INSERT INTO product_media(product_id,media_id,position) VALUES ($1,$2,0)', [tempProductId, hiddenImg]);
  const g = (id: string) => guest.request.get(`${origin}/api/media/${id}`).then(r => r.status());
  note('h_sp_an_anh_trong_product_media_khach', await g(hiddenImg)); note('h_sp_an_anh_bia_khach', await g(coverOnly));
  note('h_sp_an_trang_cong_khai', (await guest.request.get(`${origin}/san-pham/${tempSlug}`)).status());
  note('h_sp_an_admin_xem_duoc', (await page.request.get(`${origin}/api/media/${hiddenImg}`)).status());
  await db.query('UPDATE products SET is_published=true WHERE id=$1', [tempProductId]);
  note('h_sp_cong_khai_roi_khach', { pm: await g(hiddenImg), bia: await g(coverOnly) });
  await db.query('UPDATE products SET is_published=false WHERE id=$1', [tempProductId]);
  note('h_sp_an_lai_khach', { pm: await g(hiddenImg), bia: await g(coverOnly) });
  note('h_xoa_anh_dung_boi_sp_an', await api(page, 'DELETE', `/api/admin/media/${hiddenImg}`));
  note('h_thu_vien_dem_dang_dung', (await api(page, 'GET', '/api/admin/media')).json.filter((m: any) => m.used_count > 0).length);

  // danh sách rỗng
  const rempty = await post({ media_ids: [] }); note('e_danh_sach_rong', { status: rempty.status, ids: rempty.json?.media_ids, cover: rempty.json?.cover_id, pm: await pmCount() });
  await gp.goto(`${origin}/san-pham/${SLUG}`, { waitUntil: 'networkidle' }); await gp.waitForTimeout(600);
  note('c_rong_trang', { gallery: await gp.locator('.tp-gallery').count(), thumbs: await gp.locator('.pg-thumbs button').count(), mainImgs: await gp.locator('.pg-photo').count(), h1: await gp.locator('h1').first().innerText(), brokenImgs: await gp.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).length), overflow: await metrics(gp) });
  await gp.screenshot({ path: join(out, 'c03-cong-khai-rong-1366.png') });
  await gmp.goto(`${origin}/san-pham/${SLUG}`, { waitUntil: 'networkidle' }); await gmp.screenshot({ path: join(out, 'm06-cong-khai-rong-390.png') });
  note('e_cu_roi_khach', { first: await g(expected[0]), last: await g(expected[expected.length - 1]) });
  await openProduct(page); await page.locator('section.pp-section').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await page.screenshot({ path: join(out, 'd11-muc-anh-sau-rong.png') });
  note('d_rong_sau_text', await page.locator('section.pp-section').innerText());

  note('console', consoleErrors);
  await ctxD.close(); await ctxM.close(); await guest.close(); await gm.close();
} catch (e) { note('LOI_SCRIPT', String(e).slice(0, 800)); note('console_khi_loi', consoleErrors); }
finally {
  try {
    await db.query('DELETE FROM product_media WHERE true');
    await db.query('DELETE FROM products WHERE id=$1', [tempProductId]);
    if (before) for (const c of before.covers) await db.query('UPDATE products SET cover_id=$2, updated_at=$3 WHERE slug=$1', [c.slug, c.cover_id, c.updated_at]);
    await db.query('DELETE FROM users WHERE id=$1', [userId]);
    const after = await snapshotDb();
    note('sau', { ...after, covers: after.covers.map((c: any) => `${c.slug}:${c.cover_id}`) });
    note('so_sanh_cover_va_updated_at_giong_truoc', JSON.stringify(before.covers) === JSON.stringify(after.covers));
  } catch (e) { note('LOI_DON', String(e).slice(0, 500)); }
  await browser.close(); await db.end();
}
