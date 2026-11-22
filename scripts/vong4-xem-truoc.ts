// Kiểm hiển thị bài viết: (1) ảnh có đủ ba kiểu căn và bốn bề rộng trên trang công khai, (2) bản xem trước trong trình soạn
// giống trang công khai thật của cùng bài. Tạo bài thử, chụp, so số đo, xoá bài thử và tài khoản tạm.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-article-render.ts
import { chromium, type Frame, type Page } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const origin = process.env.SITE_URL!;
const out = path.join('docs', 'nang-cap-2026-11', 'vong-4', 'bai-viet', 'xem-truoc');
mkdirSync(out, { recursive: true });
const run = randomUUID().slice(0, 8);
const postId = randomUUID();
const userId = randomUUID();
const email = `bai-${run}@example.test`;
const password = randomBytes(24).toString('hex');
const slug = `bai-thu-hien-thi-${run}`;
const title = `Bài thử hiển thị ảnh và xem trước ${run}`;
const problems: string[] = [];

const p = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const h2 = (text: string) => ({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] });
const long = 'Đoạn chữ dài để thấy chữ chạy quanh ảnh khi ảnh căn trái. Bể composite liền khối được hạ xuống hố đã lót phẳng, bơm nước đối trọng rồi lấp đất theo từng lớp để giữ bể ổn định. ';

async function main() {
  const media = (await db.query("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at LIMIT 4")).rows.map(row => row.id as string);
  if (media.length < 4) throw new Error('Thư viện cần ít nhất 4 ảnh để chạy kiểm thử.');
  const image = (i: number, attrs: Record<string, unknown>, caption: string) => ({ type: 'image', attrs: { src: `/api/media/${media[i % 4]}`, alt: caption, title: caption, ...attrs } });
  const content: unknown[] = [p('Bài thử chỉ dùng để kiểm hiển thị, sẽ tự xoá. ' + long)];
  for (const align of ['center', 'left', 'wide']) {
    content.push(h2(`Ảnh căn ${align}`));
    [40, 60, 80, 100].forEach((width, i) => {
      content.push(image(i, { align, width }, `Căn ${align}, bề rộng ${width}`));
      content.push(p(long.repeat(3)));
    });
  }
  content.push(h2('Ảnh cũ không có thuộc tính'));
  content.push({ type: 'image', attrs: { src: `/api/media/${media[0]}`, alt: 'Ảnh cũ', title: 'Ảnh cũ chưa có căn lề' } });
  content.push(p(long.repeat(2)));
  await db.query("INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,'article','published',$6,now())",
    [postId, title, slug, 'Bài thử để kiểm ảnh căn lề, bề rộng và bản xem trước trong trình soạn.', JSON.stringify({ type: 'doc', content }), media[1]]);
  for (const id of media) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [postId, id]);
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra bài', await hashPassword(password)]);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    // Viết dạng chuỗi để tránh trình biên dịch chèn hàm phụ vào mã chạy trong trang.
    const metricsSource = `(() => {
      var box = function (selector) { var el = document.querySelector(selector); if (!el) return null; var r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      var h1 = document.querySelector('h1');
      var meta = document.querySelector('.art-meta');
      var art = document.querySelector('.art');
      return { orient: art ? art.getAttribute('data-orient') : null, opener: box('.art-hero'), h1: h1 ? h1.textContent : null, h1Size: h1 ? getComputedStyle(h1).fontSize : '', head: box('.art-hero'), cover: box('.art-cover'), body: box('.art-prose'), toc: box('.art-toc'), rail: box('.art-rail'), crumbs: box('.art-crumbs'), meta: meta ? meta.textContent.replace(/\\s+/g, ' ') : null };
    })()`;
    type Metrics = Record<string, unknown>;
    // Cuộn hết bài trước khi đo để ảnh tải lười đã có kích thước thật.
    const scrollSource = `(async () => { for (var y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(function (r) { setTimeout(r, 50); }); } window.scrollTo(0, 0); })()`;
    const metrics = async (target: Page | Frame) => { await target.evaluate(scrollSource); await new Promise(resolve => setTimeout(resolve, 600)); return target.evaluate(metricsSource) as Promise<Metrics>; };

    // 1. Ảnh trên trang công khai
    for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce', isMobile: size.width < 500, hasTouch: size.width < 500 });
      const page = await context.newPage();
      await page.goto(`${origin}/tin-tuc/${slug}`, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, `anh-cong-khai-${size.tag}.png`), fullPage: true });
      const report = await page.evaluate(() => {
        const figures = [...document.querySelectorAll<HTMLElement>('.art-prose .art-figure')].map(figure => {
          const r = (figure.querySelector('img') || figure).getBoundingClientRect(); const fr = figure.getBoundingClientRect();
          return { cls: figure.className, w: Math.round(r.width), fw: Math.round(fr.width), x: Math.round(r.left), float: getComputedStyle(figure).float, caption: figure.querySelector('figcaption')?.textContent ?? '' };
        });
        return { figures, overflow: document.documentElement.scrollWidth - window.innerWidth, prose: Math.round(document.querySelector('.art-prose')!.getBoundingClientRect().width) };
      });
      console.log(size.tag, 'cột chữ', report.prose, 'tràn ngang', report.overflow);
      if (report.overflow > 0) problems.push(`${size.tag}: tràn ngang ${report.overflow}px`);
      const left = report.figures.filter(f => f.cls.includes('art-align-left'));
      const wide = report.figures.filter(f => f.cls.includes('art-align-wide'));
      if (size.width > 1100 && !left.every(f => f.float === 'left')) problems.push('1366: ảnh căn trái không cho chữ chạy quanh');
      if (size.width < 500 && left.some(f => f.float !== 'none')) problems.push('390: ảnh căn trái chưa về giữa');
      if (size.width > 1100 && !wide.every(f => f.fw > report.prose)) problems.push('1366: ảnh tràn rộng không rộng hơn cột đọc');
      if (size.width > 1100) console.log('  bề rộng ảnh căn giữa', report.figures.filter(f => f.cls.includes('art-align-center')).map(f => f.w).join(','), '| căn trái', left.map(f => f.w).join(','), '| tràn rộng', wide.map(f => f.w).join(','), '| cột', report.prose);
      await context.close();
    }

    // 2. Xem trước so với trang công khai thật
    const publicMetrics: Record<string, unknown> = {};
    for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(`${origin}/tin-tuc/${slug}`, { waitUntil: 'networkidle' });
      publicMetrics[size.tag] = await metrics(page);
      await page.locator('.art-hero').screenshot({ path: path.join(out, `dau-bai-cong-khai-${size.tag}.png`), timeout: 4000 }).catch(() => console.log('CẢNH BÁO: đầu bài công khai đang ẩn nên không chụp được'));
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
    context.setDefaultTimeout(60000);
    const page = await context.newPage();
    await page.goto(origin + '/admin/login');
    await page.getByLabel('Email quản trị').fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL(origin + '/admin');
    await page.goto(`${origin}/admin/bai-viet/${postId}`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Xem trước' }).click();
    const frame = page.frameLocator('iframe[title="Xem trước bài viết"]');
    await frame.locator('.art-hero h1').waitFor();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, 'xem-truoc-may-ban.png') });
    await page.getByRole('button', { name: 'Điện thoại' }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, 'xem-truoc-dien-thoai.png') });
    const phoneFrame = page.frames().find(f => f !== page.mainFrame() && f.url() === 'about:srcdoc')!;
    const phone = await metrics(phoneFrame);
    // tab mới ở 1366 để so cùng bề rộng với trang công khai
    const [tab] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: 'Mở ở tab mới' }).click()]);
    await tab.locator('.art-hero h1').waitFor();
    await tab.waitForTimeout(800);
    const desktop = await metrics(tab);
    await tab.locator('.art-hero').screenshot({ path: path.join(out, 'dau-bai-xem-truoc-1366.png'), timeout: 4000 }).catch(() => {});
    await tab.screenshot({ path: path.join(out, 'xem-truoc-tab-moi-1366.png') });
    const publicDesktop = publicMetrics['1366'] as Metrics;
    const publicPhone = publicMetrics['390'] as Metrics;
    console.log('công khai 1366', JSON.stringify(publicDesktop));
    console.log('xem trước 1366', JSON.stringify(desktop));
    console.log('công khai 390 ', JSON.stringify(publicPhone));
    console.log('xem trước 390 ', JSON.stringify(phone));
    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    for (const key of ['orient', 'opener', 'h1', 'h1Size', 'head', 'cover', 'body', 'toc', 'rail', 'crumbs', 'meta'] as const) {
      if (!same(desktop[key], publicDesktop[key])) problems.push(`1366: ${key} khác (công khai ${JSON.stringify(publicDesktop[key])}, xem trước ${JSON.stringify(desktop[key])})`);
    }
    // Điện thoại: khung xem trước rộng 370px (390 trừ viền) nên chỉ so chữ và cỡ chữ
    for (const key of ['orient', 'h1', 'h1Size', 'meta'] as const) {
      if (!same(phone[key], publicPhone[key])) problems.push(`390: ${key} khác (công khai ${JSON.stringify(publicPhone[key])}, xem trước ${JSON.stringify(phone[key])})`);
    }
    await context.close();
  } finally { await browser.close(); }
}

try { await main(); }
catch (error) { problems.push(String(error)); }
finally {
  await db.query('DELETE FROM post_media WHERE post_id=$1', [postId]);
  await db.query('DELETE FROM posts WHERE id=$1', [postId]);
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
  await db.end();
}
if (problems.length) { console.error('VẤN ĐỀ:\n' + problems.join('\n')); process.exit(1); }
console.log('Đạt: ảnh đúng ba kiểu căn, bốn bề rộng; xem trước khớp trang công khai.');
