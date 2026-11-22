// Kiểm luồng: bấm thẻ sản phẩm sang trang chi tiết rồi quay lại, giảm chuyển động, tắt JavaScript, tiêu điểm bàn phím.
import { chromium } from '@playwright/test';
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const browser = await chromium.launch({ channel: 'chrome' });
const res = {};
{
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  const errors = []; page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); }); page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.locator('#san-pham').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector('.tl-lead').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(800);
  const names = await page.evaluate(() => [...document.querySelectorAll('[style*="view-transition-name"]')].map(e => e.style.viewTransitionName));
  const dup = names.length - new Set(names).size;
  await page.locator('.tl-lead').first().click();
  await page.waitForURL(/san-pham\//, { timeout: 15000 }); await page.waitForLoadState('networkidle');
  res.detailUrl = page.url(); res.detailH1 = await page.locator('h1').first().innerText();
  await page.goBack(); await page.waitForURL(origin + '/'); await page.waitForTimeout(1200);
  res.backOk = await page.evaluate(() => !!document.querySelector('.tl-hero') && document.querySelectorAll('.tl-fs').length);
  res.viewTransitionNames = names.length; res.viewTransitionDuplicates = dup; res.errors = errors;
  await page.context().close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(origin + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(150); }
  res.reduced = await page.evaluate(() => ({
    hiddenReveal: [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity < 0.99 && e.getClientRects().length).length,
    heroCopyOpacity: getComputedStyle(document.querySelector('.tl-hero-slide[data-active=true] .tl-hero-text')).opacity,
    count15: document.querySelector('[data-count="15"]')?.textContent, scrollW: document.documentElement.scrollWidth,
  }));
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(origin + '/', { waitUntil: 'load' }); await page.waitForTimeout(600);
  res.noJs = await page.evaluate(() => ({
    title: !!document.querySelector('.tl-hero-title') && getComputedStyle(document.querySelector('.tl-hero-slide[data-active=true] .tl-hero-title')).visibility,
    revealStuck: [...document.querySelectorAll('[data-reveal]')].filter(e => getComputedStyle(e).opacity < 0.99).length,
    count15: document.querySelector('[data-count="15"]')?.textContent,
  }));
  await page.screenshot({ path: process.env.OUT + '/khong-js-1366.png', fullPage: false });
  await ctx.close();
}
{
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  const seq = [];
  for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); seq.push(await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return (a.textContent || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 22) + ' | outline ' + s.outlineStyle + ' ' + s.outlineWidth; })); }
  res.tabOrder = seq;
  await page.context().close();
}
await browser.close();
console.log(JSON.stringify(res, null, 2));
