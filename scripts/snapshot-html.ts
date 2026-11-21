// Lưu một trang đã dựng thành tệp HTML tự đủ (CSS nhúng, bỏ script, ảnh trỏ về máy chủ) để chạy ui_audit.py và contrast.py của skill.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/snapshot-html.ts <đường-dẫn> <tệp-ra> [rộng]
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const [path, out, width = '1366'] = process.argv.slice(2);
const origin = process.env.SITE_URL!;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(origin + path, { waitUntil: 'networkidle' });
await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
await page.waitForTimeout(800);
const html = await page.evaluate(async origin => {
  const clone = document.documentElement.cloneNode(true) as HTMLElement;
  for (const script of clone.querySelectorAll('script,noscript,iframe')) script.remove();
  for (const link of [...clone.querySelectorAll('link[rel=stylesheet]')]) {
    const css = await fetch((link as HTMLLinkElement).href).then(r => r.text()).catch(() => '');
    const style = document.createElement('style'); style.textContent = css; link.replaceWith(style);
  }
  for (const element of clone.querySelectorAll('[data-reveal]')) element.setAttribute('data-revealed', 'true');
  const base = document.createElement('base'); base.href = origin + '/'; clone.querySelector('head')!.prepend(base);
  return '<!doctype html>' + clone.outerHTML;
}, origin);
writeFileSync(out, html);
await browser.close();
console.log(out, html.length);
