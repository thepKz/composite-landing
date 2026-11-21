// Kiểm độc lập: tự dùng thử luồng công khai và admin bằng Playwright, KHÔNG bật giảm chuyển động.
// Chặn yêu cầu gửi báo giá bằng page.route nên không ghi vào cơ sở dữ liệu.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/kiem-tuong-tac.ts [--only=public|admin] [--sizes=1366,390]
import { chromium, type Page, type BrowserContext } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const origin = process.env.SITE_URL!;
const out = 'docs/nang-cap-2026-11/kiem-doc-lap';
mkdirSync(out, { recursive: true });
const only = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];
const sizeArg = process.argv.find(a => a.startsWith('--sizes='))?.split('=')[1]?.split(',');
const allSizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }, { tag: '1920', width: 1920, height: 1080 }];
const sizes = allSizes.filter(s => !sizeArg || sizeArg.includes(s.tag));

const userId = randomUUID();
const email = `kiem-doc-lap-${userId}@example.test`;
const password = randomBytes(24).toString('hex');
const myTitle = 'Kiểm độc lập bài thử';
const log: { size: string; step: string; ok: boolean; note: string }[] = [];
const rec = (size: string, step: string, ok: boolean, note = '') => { log.push({ size, step, ok, note }); console.log(`${ok ? 'OK ' : 'LOI'} [${size}] ${step} ${note}`); };
const consoleErrors: Record<string, string[]> = {};
const netFail: Record<string, string[]> = {};

async function cleanup() {
  try {
    const ids = (await db.query<{ id: string }>('SELECT id FROM posts WHERE title LIKE $1 OR slug LIKE $2', [`${myTitle}%`, 'kiem-doc-lap-%'])).rows.map(r => r.id);
    if (ids.length) {
      const tabs = (await db.query<{ table_name: string }>("SELECT DISTINCT table_name FROM information_schema.columns WHERE column_name='post_id' AND table_schema='public'")).rows;
      for (const t of tabs) await db.query(`DELETE FROM "${t.table_name}" WHERE post_id = ANY($1)`, [ids]).catch(() => undefined);
      await db.query('DELETE FROM posts WHERE id = ANY($1)', [ids]);
    }
    await db.query('DELETE FROM users WHERE id=$1', [userId]);
    await db.query("DELETE FROM users WHERE email LIKE 'kiem-doc-lap-%@example.test'");
  } catch (e) { console.error('Dọn lỗi:', e); }
}

const shot = async (page: Page, name: string, full = false) => { await page.screenshot({ path: `${out}/${name}.png`, fullPage: full }); };
const wrapStep = async (size: string, step: string, fn: () => Promise<string | void>) => { try { const note = await fn(); rec(size, step, true, note || ''); } catch (e) { rec(size, step, false, String(e).split('\n')[0].slice(0, 220)); } };

function watch(page: Page, size: string) {
  consoleErrors[size] ??= []; netFail[size] ??= [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors[size].push(`${page.url().replace(origin, '')}: ${m.text().slice(0, 160)}`); });
  page.on('pageerror', e => consoleErrors[size].push(`${page.url().replace(origin, '')}: pageerror ${e.message.slice(0, 160)}`));
  page.on('requestfailed', r => netFail[size].push(`${r.url().slice(0, 110)} ${r.failure()?.errorText ?? ''}`));
  page.on('response', r => { if (r.status() >= 400) netFail[size].push(`${r.status()} ${r.url().slice(0, 110)}`); });
}

const frameProbe = async (page: Page) => page.evaluate(async () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  const frames: number[] = []; let last = performance.now(); let running = true;
  const tick = (t: number) => { frames.push(t - last); last = t; if (running) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  let animMax = 0;
  for (let y = 0; y <= total; y += 60) { window.scrollTo(0, y); animMax = Math.max(animMax, document.getAnimations().length); await new Promise(r => setTimeout(r, 16)); }
  running = false; await new Promise(r => setTimeout(r, 50));
  const sorted = [...frames].sort((a, b) => a - b);
  return { n: frames.length, p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), max: +Math.max(...frames).toFixed(1), over50: frames.filter(f => f > 50).length, over100: frames.filter(f => f > 100).length, animMax };
});

async function publicFlows(ctx: BrowserContext, size: { tag: string; width: number; height: number }) {
  const s = size.tag; const mobile = size.width < 768;
  const page = await ctx.newPage(); watch(page, s);
  await page.route('**/api/inquiries', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.goto(origin + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
  await shot(page, `${s}-home-fold`);
  await wrapStep(s, 'tràn ngang trang chủ', async () => { const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) throw new Error('tràn ' + o + 'px'); });

  // Menu
  if (!mobile) {
    await wrapStep(s, 'menu Sản phẩm mở bằng chuột', async () => {
      const t = page.locator('button.tl-menu-trigger');
      await t.hover(); await page.waitForTimeout(450);
      let open = await t.getAttribute('aria-expanded');
      if (open !== 'true') { await t.click(); await page.waitForTimeout(450); open = await t.getAttribute('aria-expanded'); }
      await shot(page, `${s}-menu-san-pham`);
      if (open !== 'true') throw new Error('không mở');
      const items = await page.locator('#tl-products a, [id^=tl-produ] a').count();
      await page.keyboard.press('Escape'); await page.waitForTimeout(400);
      const closed = await t.getAttribute('aria-expanded');
      const focused = await page.evaluate(() => document.activeElement?.className.toString().slice(0, 30));
      if (closed === 'true') throw new Error('Esc không đóng');
      return `mở được, ${items} liên kết, sau Esc tiêu điểm ở "${focused}"`;
    });
  } else {
    await wrapStep(s, 'menu điện thoại mở/đóng', async () => {
      await page.getByRole('button', { name: 'Mở menu' }).click(); await page.waitForTimeout(500);
      await shot(page, `${s}-menu-mo`);
      const inside = await page.evaluate(() => !!document.activeElement?.closest('#tl-drawer'));
      // Tab 25 lần xem có thoát khỏi hộp không
      let escaped = false; for (let i = 0; i < 25; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement?.closest('#tl-drawer')))) { escaped = true; break; } }
      await page.locator('.tl-drawer-toggle').first().click().catch(() => undefined); await page.waitForTimeout(450); await shot(page, `${s}-menu-san-pham`);
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
      const closed = await page.locator('#tl-drawer').getAttribute('data-open');
      const back = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      if (closed === 'true') throw new Error('Esc không đóng hộp menu');
      if (escaped) throw new Error('Tab thoát khỏi hộp menu');
      return `tiêu điểm vào trong=${inside}, sau đóng tiêu điểm về "${back}"`;
    });
  }

  // Hero
  await wrapStep(s, 'banner đổi cảnh', async () => {
    const label = () => page.evaluate(() => document.querySelector('.tl-hero-slide[data-active="true"]')?.getAttribute('aria-label') ?? '');
    const a = await label();
    await page.getByRole('button', { name: 'Cảnh sau' }).click(); await page.waitForTimeout(250); await shot(page, `${s}-hero-chuyen-giua`); await page.waitForTimeout(1100);
    const b = await label(); await shot(page, `${s}-hero-canh-2`);
    await page.getByRole('button', { name: /Cảnh 3/ }).click(); await page.waitForTimeout(1300); const c = await label(); await shot(page, `${s}-hero-canh-3`);
    if (a === b || b === c) throw new Error(`không đổi: ${a} | ${b} | ${c}`);
    const anim = await page.evaluate(() => document.querySelectorAll('.tl-hero-slide').length);
    // tự chuyển
    await page.getByRole('button', { name: 'Cảnh trước' }).click(); await page.waitForTimeout(1200);
    const before = await label(); await page.mouse.move(size.width - 5, size.height - 5); await page.waitForTimeout(9000); const after = await label();
    return `đổi tay ok (${anim} cảnh); tự chuyển sau 9s: ${before !== after ? 'có' : 'KHÔNG (cùng cảnh)'}`;
  });

  // Cuộn
  await wrapStep(s, 'cuộn hết trang chủ, khung hình', async () => {
    const r = await frameProbe(page); await page.waitForTimeout(800);
    const stuck = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && parseFloat(getComputedStyle(e).opacity) < 0.9 && e.textContent?.trim(); }).map(e => (e.textContent ?? '').trim().slice(0, 30)));
    await shot(page, `${s}-home-sau-cuon`, true);
    if (stuck.length) throw new Error(`kẹt ẩn ${stuck.length}: ${stuck.slice(0, 3).join(' | ')}; khung ${JSON.stringify(r)}`);
    return `khung hình ${JSON.stringify(r)}`;
  });

  // Thẻ sản phẩm
  await wrapStep(s, 'bấm thẻ sản phẩm trang chủ', async () => {
    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    const card = page.locator('a[href^="/san-pham/"]').filter({ hasText: /Bể biogas composite/ }).first();
    await card.scrollIntoViewIfNeeded(); await card.hover(); await page.waitForTimeout(300); await shot(page, `${s}-the-hover`);
    await Promise.all([page.waitForURL(/san-pham\//), card.click()]); await page.waitForTimeout(900);
    await shot(page, `${s}-sau-bam-the`);
    return page.url().replace(origin, '');
  });

  // Trang sản phẩm: ảnh phóng to
  await page.goto(origin + '/san-pham/be-biogas-composite', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
  await wrapStep(s, 'hộp xem ảnh', async () => {
    const opener = page.getByRole('button', { name: /Phóng to/ }).first();
    await opener.click(); await page.waitForTimeout(500); await shot(page, `${s}-lightbox`);
    const inDialog = await page.evaluate(() => !!document.activeElement?.closest('dialog'));
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300);
    let tabsEscaped = false; for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement?.closest('dialog')))) { tabsEscaped = true; break; } }
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const open = await page.evaluate(() => !!document.querySelector('dialog[open]'));
    const backOk = await page.evaluate(() => /Phóng to/.test(document.activeElement?.textContent ?? ''));
    if (open) throw new Error('Esc không đóng');
    if (!inDialog || tabsEscaped || !backOk) throw new Error(`tiêu điểm: vào trong=${inDialog}, Tab thoát=${tabsEscaped}, về nút mở=${backOk}`);
  });
  await wrapStep(s, 'chọn quy mô trên trang sản phẩm', async () => {
    const chip = page.getByRole('button', { name: /15 – 30 con lợn/ }).first();
    await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(500); await shot(page, `${s}-chon-quy-mo`);
    const res = await page.locator('.tp-scale-result').innerText();
    if (!/6 m³|6,0/.test(res)) throw new Error('gợi ý sai: ' + res.slice(0, 80));
    return res.replace(/\s+/g, ' ').slice(0, 80);
  });

  // Biểu mẫu
  await wrapStep(s, 'biểu mẫu báo giá đi hết bước', async () => {
    const form = page.locator('form.tl-form').first(); await form.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    await shot(page, `${s}-form-b0`);
    // đang ở bước mấy
    const cur = () => page.evaluate(() => document.querySelector('.tl-form-steps [aria-current="step"]')?.getAttribute('aria-label') ?? '');
    const first = await cur();
    // bỏ trống bấm tiếp
    const choice = page.locator('.tl-choices label').first(); if (await choice.count()) { await choice.click(); await page.waitForTimeout(800); }
    await form.getByRole('button', { name: /Tiếp tục/ }).click().catch(() => undefined); await page.waitForTimeout(600);
    await shot(page, `${s}-form-b1-trong`);
    const afterEmpty = await cur();
    const errs = await page.locator('.tl-form [role=alert], .tl-form .tl-field-error, .tl-form [id$=-error]').allInnerTexts();
    if (/Liên hệ/.test(afterEmpty) || /Bước 1/.test(afterEmpty)) {
      await form.getByLabel(/Họ và tên/).fill('Kiểm Thử'); await form.getByLabel(/Số điện thoại/).fill('123');
      await form.getByLabel(/Tỉnh thành/).fill('Phú Thọ');
      await form.getByRole('button', { name: /Tiếp tục/ }).click(); await page.waitForTimeout(600); await shot(page, `${s}-form-b1-sai-sdt`);
      await form.getByLabel(/Số điện thoại/).fill('0912345678');
      await form.getByRole('button', { name: /Tiếp tục/ }).click(); await page.waitForTimeout(700);
    }
    await shot(page, `${s}-form-b4`);
    const cur4 = await cur();
    const consent = form.getByRole('checkbox'); if (await consent.count()) await consent.first().check({ force: true });
    await form.getByRole('button', { name: /Gửi yêu cầu/ }).click(); await page.waitForTimeout(1200);
    await shot(page, `${s}-form-thanh-cong`);
    const ok = await page.locator('.tl-form-success').count();
    if (!ok) throw new Error(`không ra màn thành công; bước đầu "${first}", sau trống "${afterEmpty}", bước cuối "${cur4}"`);
    return `bước đầu "${first}", lỗi hiện khi bỏ trống: ${errs.length ? errs.join('/').slice(0, 80) : 'không thấy'}`;
  });

  // Hỏi đáp
  await page.goto(origin + '/hoi-dap', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  await wrapStep(s, 'hỏi đáp mở/đóng', async () => {
    const q = page.locator('summary, button[aria-expanded]').filter({ hasText: /Bể composite có bền hơn/ }).first();
    const panelH = () => page.evaluate(() => { const d = document.querySelector('details[open]') ?? document.querySelector('[aria-expanded="true"]')?.parentElement; return d ? Math.round(d.getBoundingClientRect().height) : 0; });
    const h0 = await panelH();
    await q.click(); const samples: number[] = []; for (let i = 0; i < 8; i++) { await page.waitForTimeout(40); samples.push(await panelH()); }
    await shot(page, `${s}-hoi-dap-mo`);
    await page.waitForTimeout(500); const hEnd = await panelH();
    await q.click(); await page.waitForTimeout(500); const hClosed = await panelH();
    const smooth = new Set(samples).size > 2;
    return `chiều cao ${h0} -> ${samples.join(',')} -> ${hEnd} -> sau đóng ${hClosed}; chuyển mượt: ${smooth ? 'có' : 'không (nhảy ngay)'}`;
  });

  // Bàn phím: Tab qua header
  await page.goto(origin + '/lien-he', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  await wrapStep(s, 'Tab qua header và biểu mẫu', async () => {
    const stops: string[] = []; let weak = 0;
    for (let i = 0; i < 22; i++) {
      await page.keyboard.press('Tab'); await page.waitForTimeout(60);
      const info = await page.evaluate(() => { const e = document.activeElement as HTMLElement | null; if (!e || e === document.body) return null; const st = getComputedStyle(e); const r = e.getBoundingClientRect(); return { tag: e.tagName, t: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 22), outline: st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0 ? `${st.outlineWidth} ${st.outlineColor}` : '', shadow: st.boxShadow !== 'none' ? st.boxShadow.slice(0, 40) : '', y: Math.round(r.top), vis: r.bottom > 0 && r.top < innerHeight }; });
      if (!info) { stops.push('(thân trang)'); continue; }
      if (!info.outline && !info.shadow) weak++;
      stops.push(`${info.t || info.tag}${info.outline || info.shadow ? '' : ' [KHÔNG VIỀN]'}${info.vis ? '' : ' [ngoài khung]'}`);
      if (i === 3 || i === 8 || i === 14) await shot(page, `${s}-tab-${i}`);
    }
    if (weak > 0) throw new Error(`${weak} điểm dừng không thấy viền: ${stops.join(' > ')}`);
    return stops.slice(0, 12).join(' > ');
  });
  await page.close();
}

async function articleFlows(ctx: BrowserContext, size: { tag: string; width: number; height: number }, slug: string) {
  const s = size.tag; const page = await ctx.newPage(); watch(page, s);
  await page.goto(origin + `/tin-tuc/${slug}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  await shot(page, `${s}-bai-viet-fold`);
  await wrapStep(s, 'mục lục bài viết', async () => {
    const mobile = size.width < 768;
    if (mobile) { await page.getByRole('button', { name: /Mục lục/ }).first().click().catch(() => undefined); await page.waitForTimeout(500); }
    const link = page.locator('a[href^="#"]').filter({ hasText: /Bảng chọn dung tích|Sửa chữa/ }).first();
    await shot(page, `${s}-muc-luc`);
    await link.click(); await page.waitForTimeout(1300);
    const y = await page.evaluate(() => scrollY); await shot(page, `${s}-muc-luc-sau-bam`);
    const hdr = await page.evaluate(() => { const h = document.querySelector('h2#bang-chon-dung-tich-theo-quy-mo-dan, h2:nth-of-type(2)'); return h ? Math.round(h.getBoundingClientRect().top) : -1; });
    if (y < 100) throw new Error('không cuộn tới mục');
    return `cuộn tới y=${y}, tiêu đề mục cách đỉnh khung ${hdr}px`;
  });
  await wrapStep(s, 'bài viết: khung hình khi cuộn', async () => { const r = await frameProbe(page); await shot(page, `${s}-bai-viet-full`, true); return JSON.stringify(r); });
  await page.close();
}

async function adminFlows(ctx: BrowserContext, size: { tag: string; width: number; height: number }) {
  const s = size.tag; const page = await ctx.newPage(); watch(page, s);
  await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email quản trị').fill(email); await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click(); await page.waitForURL(origin + '/admin', { timeout: 30000 });
  await wrapStep(s, 'admin: soạn bài và xuất bản', async () => {
    await page.goto(origin + '/admin/bai-viet/moi', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    await page.getByPlaceholder(/Tiêu đề bài viết/).fill(`${myTitle} ${Date.now() % 10000}`);
    const ed = page.locator('.ProseMirror').first(); await ed.click();
    await page.keyboard.type('Đoạn mở đầu để kiểm thử soạn bài. '); await page.keyboard.press('Enter');
    await page.keyboard.type('/'); await page.waitForTimeout(500); await shot(page, `${s}-admin-slash`);
    const menu = await page.locator('[role=listbox], [role=menu], .slash-menu, [class*=slash]').count();
    await page.keyboard.press('Escape'); await page.keyboard.press('Backspace');
    await page.keyboard.type('Dòng có chữ đậm. '); await page.keyboard.press('Control+A'); await page.keyboard.press('Control+B'); await page.keyboard.press('End');
    await page.waitForTimeout(500); await shot(page, `${s}-admin-soan`);
    await page.waitForTimeout(6000); await shot(page, `${s}-admin-tu-luu`);
    const status = await page.locator('body').innerText();
    const saved = /Đã lưu|Đang lưu|Tự lưu/.test(status);
    await page.getByRole('button', { name: /Xem trước/ }).first().click(); await page.waitForTimeout(900); await shot(page, `${s}-admin-xem-truoc`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    return `menu gạch chéo: ${menu ? 'thấy' : 'không thấy'}, tự lưu hiện chữ trạng thái: ${saved}`;
  });
  await wrapStep(s, 'admin: các màn không tràn ngang', async () => {
    const bad: string[] = [];
    for (const p of ['/admin', '/admin/bai-viet', '/admin/thu-vien', '/admin/san-pham', '/admin/yeu-cau', '/admin/cai-dat', '/admin/bai-viet/moi']) {
      await page.goto(origin + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
      const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) bad.push(`${p} +${o}`);
    }
    if (bad.length) throw new Error(bad.join(', '));
  });
  await page.close();
}

// Đánh giá màn rỗng trước khi tạo bài thử
async function emptyStates(ctx: BrowserContext, size: { tag: string; width: number; height: number }) {
  const s = size.tag; const page = await ctx.newPage(); watch(page, s);
  for (const [name, path] of [['tin-tuc-rong', '/tin-tuc'], ['du-an-rong', '/du-an'], ['404-demo', '/trang-khong-ton-tai']] as const) {
    await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(400); await shot(page, `${s}-${name}`, true);
  }
  await page.close();
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm độc lập', await hashPassword(password)]);
  const slug = `kiem-doc-lap-${userId.slice(0, 8)}`;
  const para = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
  const head = (level: number, text: string) => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] });
  const media = (await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at LIMIT 2")).rows.map(r => r.id);
  const content = { type: 'doc', content: [para('Mở đầu ngắn của bài thử.'), head(2, 'Chuẩn bị hố đào'), para('Hút cạn nước, lót nền phẳng, hạ bể đúng vị trí.'), head(2, 'Bảng chọn dung tích'), para('Đối chiếu số vật nuôi thực tế.'), head(2, 'Sửa chữa khi va đập'), para('Mài nhám và đắp vá bằng sợi thủy tinh. '.repeat(8))] };
  for (const size of sizes) {
    const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, isMobile: size.width < 500, hasTouch: size.width < 500 });
    await ctx.addInitScript('window.__name = (f) => f');
    if (only !== 'admin') {
      await emptyStates(ctx, size);
      await publicFlows(ctx, size);
      if (size.tag === '1366' || size.tag === '390') {
        await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())', [randomUUID(), `${myTitle} công khai`, slug, 'Bài thử độc lập.', JSON.stringify(content), 'article', 'published', media[0] ?? null]).catch(() => undefined);
        await articleFlows(ctx, size, slug);
      }
    }
    if (only !== 'public') await adminFlows(ctx, size);
    await ctx.close();
  }
} finally {
  await browser.close();
  await cleanup();
  await db.end();
  writeFileSync(`${out}/du-lieu-tuong-tac.json`, JSON.stringify({ log, consoleErrors: Object.fromEntries(Object.entries(consoleErrors).map(([k, v]) => [k, [...new Set(v)]])), netFail: Object.fromEntries(Object.entries(netFail).map(([k, v]) => [k, [...new Set(v)]])) }, null, 1));
  console.log('Đã ghi du-lieu-tuong-tac.json');
}
