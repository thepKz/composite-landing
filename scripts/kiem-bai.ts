// Kiểm độc lập, lượt ba: mục lục bài viết, thẻ sản phẩm trang chủ, điểm dừng Tab thiếu viền ở 390.
// Tạo một bài thử có post_media rồi xoá. Chạy: SITE_URL=... node --env-file=.env --import tsx scripts/kiem-bai.ts
import { chromium } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';

const origin = process.env.SITE_URL!;
const out = 'docs/nang-cap-2026-11/kiem-doc-lap';
const id = randomUUID(); const slug = `kiem-doc-lap-${id.slice(0, 8)}`;
const para = (t: string) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] });
const head = (l: number, t: string) => ({ type: 'heading', attrs: { level: l }, content: [{ type: 'text', text: t }] });
const content = { type: 'doc', content: [para('Mở đầu bài thử.'), head(2, 'Chuẩn bị hố đào'), para('Hút cạn nước, lót nền phẳng. '.repeat(30)), head(3, 'Các bước hạ bể'), para('Hạ bể đúng vị trí. '.repeat(30)), head(2, 'Bảng chọn dung tích'), para('Đối chiếu số vật nuôi. '.repeat(40)), head(2, 'Sửa chữa khi va đập'), para('Mài nhám và đắp vá. '.repeat(60))] };
const res: Record<string, unknown> = {};
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const media = (await db.query<{ id: string }>("SELECT id FROM media_assets WHERE mime_type LIKE 'image/%' ORDER BY created_at LIMIT 1")).rows[0]?.id ?? null;
  await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())', [id, 'Kiểm độc lập bài có mục lục', slug, 'Bài thử.', JSON.stringify(content), 'article', 'published', media]);
  if (media) await db.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2)', [id, media]);
  for (const [tag, w, h] of [['1366', 1366, 768], ['390', 390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    await ctx.addInitScript('window.__name = (f) => f');
    const page = await ctx.newPage();
    await page.goto(origin + `/tin-tuc/${slug}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${tag}-bai-co-anh-fold.png` });
    const toc = await page.evaluate(() => [...document.querySelectorAll('nav, aside')].map(n => ({ tag: n.tagName, label: n.getAttribute('aria-label'), cls: String(n.className).slice(0, 30), kids: [...n.querySelectorAll('a,button')].slice(0, 6).map(a => `${a.tagName}:${a.getAttribute('href') ?? ''}:${(a.textContent ?? '').trim().slice(0, 20)}`) })).filter(n => /mục lục/i.test(n.label ?? '') || n.kids.some(k => k.includes('#'))));
    res[`toc${tag}`] = toc;
    // thanh tiến độ đọc
    res[`progress${tag}`] = await page.evaluate(() => !!document.querySelector('[class*=progress], [role=progressbar]'));
    try {
      if (w < 768) { const b = page.getByRole('button', { name: /Mục lục/ }).first(); await b.click(); await page.waitForTimeout(500); await page.screenshot({ path: `${out}/${tag}-muc-luc-mo.png` }); }
      const link = page.locator('a[href^="#"]').filter({ hasText: /Bảng chọn dung tích/ }).first();
      await link.click({ timeout: 5000 }); await page.waitForTimeout(1500);
      const info = await page.evaluate(() => { const h = [...document.querySelectorAll('h2')].find(x => /Bảng chọn dung tích/.test(x.textContent ?? '')); return { y: Math.round(scrollY), top: h ? Math.round(h.getBoundingClientRect().top) : null, hash: location.hash }; });
      await page.screenshot({ path: `${out}/${tag}-muc-luc-sau-bam.png` });
      res[`tocClick${tag}`] = info;
    } catch (e) { res[`tocClick${tag}`] = String(e).split('\n')[0]; }
    // thẻ sản phẩm trang chủ
    await page.goto(origin + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
    const card = page.locator('a.tl-bento-card:visible, a.tl-feature:visible').first();
    res[`cardCount${tag}`] = await page.locator('a.tl-bento-card:visible, a.tl-feature:visible').count();
    try { await card.scrollIntoViewIfNeeded({ timeout: 5000 }); await page.waitForTimeout(800); await card.hover({ timeout: 5000 }); await page.waitForTimeout(400); await page.screenshot({ path: `${out}/${tag}-the-hover.png` }); await Promise.all([page.waitForURL(/san-pham\//, { timeout: 10000 }), card.click()]); res[`cardClick${tag}`] = page.url().replace(origin, ''); }
    catch (e) { res[`cardClick${tag}`] = String(e).split('\n')[0]; }
    if (w < 500) {
      await page.goto(origin + '/lien-he', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
      const stops: string[] = [];
      for (let i = 0; i < 24; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(40); stops.push(await page.evaluate(() => { const e = document.activeElement as HTMLElement; const s = getComputedStyle(e); const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'; const r = e.getBoundingClientRect(); return `${(e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 16)}|${ring ? 'viền' : 'KHÔNG VIỀN'}|${Math.round(r.top)}|${e.tagName}.${String(e.className).slice(0, 22)}`; })); }
      res.tab390 = stops;
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  await db.query('DELETE FROM post_media WHERE post_id=$1', [id]).catch(() => undefined);
  await db.query('DELETE FROM posts WHERE id=$1', [id]).catch(() => undefined);
  await db.end();
  console.log(JSON.stringify(res, null, 1));
}
