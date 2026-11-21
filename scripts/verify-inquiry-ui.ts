// Kiểm màn Yêu cầu tư vấn với một yêu cầu thử có đủ các dòng của biểu mẫu công khai (tỉnh thành, quy mô, kích thước, địa điểm, lời nhắn nhiều dòng).
// Tin nhắn được dựng bằng chính hàm inquiryMessage của biểu mẫu. Chụp ở 1366 và 390, xoá đúng bản ghi thử và tài khoản tạm.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-inquiry-ui.ts
import { chromium, expect } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';
import { inquiryMessage, inquirySchema } from '../src/lib/inquiry-details';

const origin = process.env.SITE_URL!;
const out = path.join('docs', 'nang-cap-2026-11', 'sau-admin');
mkdirSync(out, { recursive: true });
const inquiryId = randomUUID();
const userId = randomUUID();
const email = `yc-${userId}@example.test`;
const password = randomBytes(24).toString('hex');
const failures: string[] = [];

const parsed = inquirySchema.parse({
  name: 'Nguyễn Văn Kiểm Thử', phone: '0912345678', email: 'khach.thu@example.test', product: 'Bể biogas composite',
  dimensions: '6 m3', location: 'Xã thử nghiệm, huyện thử nghiệm', province: 'Thanh Hóa', scale: '30 con lợn', scaleHint: 'Dung tích khoảng 6 m3',
  purpose: 'quotation', message: 'Nhà em ở vùng đất trũng, cần tư vấn cách lắp.\nGọi giúp em buổi chiều.', consent: 'yes',
});
const message = inquiryMessage(parsed);
const before = (await db.query('SELECT count(*)::int AS total FROM inquiries')).rows[0].total as number;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra yêu cầu', await hashPassword(password)]);
  await db.query("INSERT INTO inquiries(id,name,phone,product,message,status,consent_at) VALUES ($1,$2,$3,$4,$5,'new',now())", [inquiryId, parsed.name, parsed.phone, parsed.product, message]);
  for (const [tag, width, height] of [['1366', 1366, 768], ['390', 390, 844]] as const) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', isMobile: width < 500, hasTouch: width < 500 });
    context.setDefaultTimeout(60000);
    const page = await context.newPage();
    await page.goto(origin + '/admin/login');
    await page.getByLabel('Email quản trị').fill(email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL(origin + '/admin');
    await page.goto(origin + '/admin/yeu-cau', { waitUntil: 'networkidle' });
    const item = page.locator('.adm-inquiry-item', { hasText: parsed.name });
    await item.waitFor();
    if (width < 500) await item.click();
    const detail = width < 500 ? page.getByRole('dialog', { name: 'Chi tiết yêu cầu' }) : page.getByRole('region', { name: 'Chi tiết yêu cầu' });
    await expect(detail).toBeVisible();
    for (const [label, value] of [['Tỉnh thành', 'Thanh Hóa'], ['Quy mô', '30 con lợn'], ['Kích thước / dung tích', '6 m3'], ['Địa điểm', parsed.location], ['Email', parsed.email], ['Nội dung liên hệ', 'Yêu cầu báo giá']]) {
      const term = detail.locator('dt', { hasText: new RegExp(`^${label.replace(/[/]/g, '\\/')}$`) });
      await expect(term, `thiếu trường ${label}`).toBeVisible();
      await expect(term.locator('xpath=following-sibling::dd[1]')).toContainText(value);
    }
    // Lời nhắn nhiều dòng phải hiện thành hai dòng, không dính liền
    const note = detail.locator('.adm-message');
    await expect(note).toContainText('Gọi giúp em buổi chiều.');
    const lines = await note.evaluate(el => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    if (lines < 3) failures.push(`${tag}: lời nhắn có vẻ bị dính dòng (${lines} dòng)`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) failures.push(`${tag}: tràn ngang ${overflow}px`);
    await page.screenshot({ path: path.join(out, `admin-yeu-cau-chi-tiet-${tag}.png`) });
    await context.close();
    console.log('PASS', tag);
  }
} finally {
  await browser.close();
  await db.query('DELETE FROM inquiries WHERE id=$1', [inquiryId]);
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
  const after = (await db.query('SELECT count(*)::int AS total FROM inquiries')).rows[0].total as number;
  console.log(`Yêu cầu trước ${before}, sau khi xoá bản thử ${after}`);
  if (after !== before) failures.push('còn sót bản ghi thử');
  await db.end();
}
if (failures.length) { console.error('VẤN ĐỀ:\n' + failures.join('\n')); process.exit(1); }
console.log('Xong: màn yêu cầu tư vấn hiện đủ tỉnh thành, quy mô và các dòng khác.');
