import { chromium } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
const origin = process.env.SITE_URL!; const out = 'docs/nang-cap-2026-11/kiem-doc-lap';
const id = randomUUID(); const slug = `kiem-doc-lap-${id.slice(0, 8)}`;
const para = (t: string) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] });
const head = (l: number, t: string) => ({ type: 'heading', attrs: { level: l }, content: [{ type: 'text', text: t }] });
const content = { type: 'doc', content: [para('Mở đầu.'), head(2, 'Chuẩn bị hố đào'), para('Hút cạn nước. '.repeat(60)), head(2, 'Bảng chọn dung tích'), para('Đối chiếu. '.repeat(80)), head(2, 'Sửa chữa khi va đập'), para('Mài nhám. '.repeat(120))] };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO posts(id,title,slug,excerpt,content,kind,status,published_at) VALUES ($1,$2,$3,$4,$5,$6,$7,now())', [id, 'Kiểm độc lập mục lục', slug, 'Bài thử.', JSON.stringify(content), 'article', 'published']);
  for (const [tag, w, h] of [['1366', 1366, 768], ['390', 390, 844]] as const) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    await ctx.addInitScript('window.__name = (f) => f');
    const page = await ctx.newPage();
    await page.goto(origin + `/tin-tuc/${slug}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1000);
    const info = await page.evaluate(() => { const a = [...document.querySelectorAll('.art-toc a')].find(x => /Bảng chọn/.test(x.textContent ?? '')) as HTMLElement; const r = a.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const top = document.elementFromPoint(cx, cy); const s = getComputedStyle(a.closest('.art-toc')!); return { rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], onTop: top ? `${top.tagName}.${String(top.className).slice(0, 30)}` : null, disp: s.display, vis: s.visibility, pos: s.position, tocParentDetails: !!a.closest('details') ? (a.closest('details') as HTMLDetailsElement).open : null }; });
    console.log(tag, JSON.stringify(info));
    if (w < 500) { await page.getByRole('button', { name: /Mục lục/ }).first().click({ timeout: 5000 }).catch(() => console.log('không có nút Mục lục')); await page.waitForTimeout(700); await page.screenshot({ path: `${out}/390-muc-luc-mo.png` }); }
    const link = (w < 500 ? page.locator('a[data-toc-link]:visible') : page.locator('.art-toc a')).filter({ hasText: /Bảng chọn/ }).first();
    try { await link.click({ timeout: 6000 }); await page.waitForTimeout(1600); const r = await page.evaluate(() => { const hh = [...document.querySelectorAll('h2')].find(x => /Bảng chọn/.test(x.textContent ?? '')); return { y: Math.round(scrollY), headingTop: hh ? Math.round(hh.getBoundingClientRect().top) : null, hash: location.hash, active: document.querySelector('.art-toc [aria-current], .art-toc .is-active')?.textContent }; }); console.log(tag, 'click ok', JSON.stringify(r)); await page.screenshot({ path: `${out}/${tag}-muc-luc-sau-bam.png` }); }
    catch (e) { console.log(tag, 'click loi', String(e).split('\n').slice(0, 8).join(' | ').slice(0, 600)); await page.screenshot({ path: `${out}/${tag}-muc-luc-loi.png` }); }
    await ctx.close();
  }
} finally { await browser.close(); await db.query('DELETE FROM posts WHERE id=$1', [id]).catch(() => undefined); await db.end(); }
