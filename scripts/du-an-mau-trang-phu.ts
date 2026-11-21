// Tạo dự án mẫu tạm (kind project) với 1, 2, 3, 5 mục, chụp trang /du-an ở ba cỡ, rồi xoá hết dự án mẫu.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/du-an-mau-trang-phu.ts <thư-mục-ra>
import { chromium } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { db } from '../src/lib/db';

const out = process.argv[2]; const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });
const titles = [
  'Dự án mẫu kiểm thử: dàn bể tròn composite cho trang trại',
  'Dự án mẫu kiểm thử: bể biogas 10 m³ cho hộ chăn nuôi',
  'Dự án mẫu kiểm thử: hệ bể phốt cho khu nhà trọ',
  'Dự án mẫu kiểm thử: thùng chở hải sản sống',
  'Dự án mẫu kiểm thử: bể cá Koi sân vườn',
];
const ids: string[] = [];
const media = (await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at LIMIT 6")).rows.map(r => r.id);
async function seed(n: number) {
  await clean();
  for (let i = 0; i < n; i++) {
    const id = randomUUID(); ids.push(id);
    await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now() - ($9 || \' minutes\')::interval)',
      [id, titles[i], `du-an-mau-kiem-thu-${id.slice(0, 8)}`, 'Dự án mẫu để kiểm giao diện trang dự án, sẽ tự xoá. Quy mô, mục đích sử dụng và mặt bằng do khách cung cấp.', JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nội dung mẫu.' }] }] }), 'project', 'published', media[i] ?? null, String(i)]);
    if (media[i]) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [id, media[i]]);
  }
}
async function clean() { if (ids.length) { await db.query('DELETE FROM post_media WHERE post_id = ANY($1)', [ids]); await db.query('DELETE FROM posts WHERE id = ANY($1)', [ids]); ids.length = 0; } }
const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }, { tag: '600', width: 600, height: 360 }];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const n of [1, 2, 3, 5]) {
    await seed(n);
    for (const s of sizes) {
      const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, reducedMotion: 'reduce', isMobile: s.width < 500, hasTouch: s.width < 500 });
      const page = await ctx.newPage();
      await page.goto(origin + '/du-an', { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(out, `du-an-${n}-${s.tag}.png`), fullPage: s.tag !== '600' });
      const m = await page.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - innerWidth, cards: document.querySelectorAll('.tp-project-card').length, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length }));
      console.log(n, s.tag, JSON.stringify(m));
      await ctx.close();
    }
  }
} finally {
  await clean();
  await browser.close();
  const left = await db.query("SELECT (SELECT count(*) FROM posts) AS posts, (SELECT count(*) FROM posts WHERE title LIKE 'Dự án mẫu kiểm thử%') AS mau, (SELECT count(*) FROM media_assets) AS media, (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM inquiries) AS inq").catch(e => ({ rows: [String(e).slice(0, 120)] }));
  console.log('Đếm lại', JSON.stringify(left.rows)); await db.end();
}
