// Quét chữ và cỡ chữ trên mọi màn quản trị ở 1366 và 390: ký tự cấm, chữ nhỏ hơn 14px, chữ in hoa cả cụm, vùng bấm thấp, tràn ngang.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-admin-text.ts
import { chromium } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const origin = process.env.SITE_URL!;
const userId = randomUUID();
const email = `quet-${userId}@example.test`;
const password = randomBytes(24).toString('hex');
const routes = ['/admin', '/admin/bai-viet', '/admin/bai-viet/moi', '/admin/thu-vien', '/admin/san-pham', '/admin/yeu-cau', '/admin/cai-dat'];
const banned = /[·—;!]| | |⁠/;
const problems: string[] = [];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Quét chữ', await hashPassword(password)]);
  for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce', isMobile: size.width < 500, hasTouch: size.width < 500 });
    const page = await context.newPage();
    await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
    const scanLogin = async (route: string) => {
      const result = await page.evaluate(() => {
        const out = { text: [] as string[], small: [] as string[], upper: [] as string[], tiny: [] as string[], overflow: document.documentElement.scrollWidth - window.innerWidth };
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const seen = new Set<Element>();
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = (node.textContent ?? '').trim();
          const element = node.parentElement;
          if (!text || !element || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName) || element.closest('nextjs-portal,[data-nextjs-toast]')) continue;
          const style = getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden' || !element.getClientRects().length) continue;
          out.text.push(text);
          if (parseFloat(style.fontSize) < 14 && !seen.has(element)) { seen.add(element); out.small.push(`${style.fontSize} ${text.slice(0, 40)}`); }
          if (text.length > 5 && /[A-ZÀ-Ỹ]/.test(text) && text === text.toUpperCase() && !/^[A-Z0-9 .,/-]+$/.test(text)) out.upper.push(text.slice(0, 40));
        }
        for (const element of document.querySelectorAll<HTMLElement>('button, a[href], select, input:not([type=hidden]):not([type=file])')) {
          if (element.closest('nextjs-portal')) continue;
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height || getComputedStyle(element).visibility === 'hidden') continue;
          const minimum = window.innerWidth < 500 ? 44 : 36;
          const inline = element.tagName === 'A' && getComputedStyle(element).display === 'inline';
          if (rect.height < minimum - 0.5 && !inline && !element.closest('.adm-nav-group') && element.getAttribute('type') !== 'checkbox') out.tiny.push(`${Math.round(rect.height)}px ${(element.getAttribute('aria-label') || element.textContent || element.tagName).trim().slice(0, 30)}`);
        }
        return out;
      });
      const bad = result.text.filter(text => banned.test(text));
      if (bad.length) problems.push(`${size.tag} ${route}: ký tự cấm trong "${bad.slice(0, 3).join('" | "')}"`);
      if (result.small.length) problems.push(`${size.tag} ${route}: chữ nhỏ hơn 14px: ${result.small.slice(0, 4).join(' | ')}`);
      if (result.upper.length) problems.push(`${size.tag} ${route}: chữ in hoa cả cụm: ${result.upper.slice(0, 3).join(' | ')}`);
      if (result.tiny.length) problems.push(`${size.tag} ${route}: vùng bấm thấp: ${[...new Set(result.tiny)].slice(0, 5).join(' | ')}`);
      if (result.overflow > 0) problems.push(`${size.tag} ${route}: tràn ngang ${result.overflow}px`);
    };
    await scanLogin('/admin/login');
    await page.getByLabel('Email quản trị').fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL(origin + '/admin', { timeout: 60000 });
    for (const route of routes) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await scanLogin(route);
    }
    await context.close();
  }
} finally {
  await browser.close();
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
  await db.end();
}
if (problems.length) { console.error(`CÓ ${problems.length} VẤN ĐỀ:\n` + problems.join('\n')); process.exit(1); }
console.log('Sạch: không ký tự cấm, không chữ dưới 14px, không tràn ngang, vùng bấm đủ cao ở cả hai cỡ.');
