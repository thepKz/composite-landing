// Chụp TỪNG KHUNG NHÌN khi cuộn (không phải ảnh toàn trang) để thấy mép cong thật. Chạy: SITE_URL=... node scripts/chup-khung-nhin-trang-phu-v4.mjs <thư-mục-ra> [rộng] 
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const out = process.argv[2]; const width = +(process.argv[3] || 1366); const height = width < 500 ? 844 : 768;
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const paths = ['/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-nuoi-trong-thuy-san', '/san-pham/thung-cho-tom-ca', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/san-pham/be-phot-composite', '/san-pham/bon-chua-hoa-chat', '/san-pham/xe-gom-rac', '/san-pham/composite-theo-yeu-cau', '/hoi-dap', '/lien-he', '/huong-dan-dat-hang', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat', '/trang-khong-ton-tai'];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await b.newContext({ viewport: { width, height }, reducedMotion: 'reduce', isMobile: width < 500 })).newPage();
for (const path of paths) {
  const dir = join(out, String(width), path.replace(/\W+/g, '_').replace(/^_/, '')); mkdirSync(dir, { recursive: true });
  await page.goto(origin + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let n = 0; for (let y = 0; y < total; y += Math.round(height * 0.85)) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(250); await page.screenshot({ path: join(dir, `v${String(n++).padStart(2, '0')}.png`) }); }
}
await b.close(); console.log('xong', width);
