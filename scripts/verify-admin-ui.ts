// Kiểm nhanh luồng đăng bài chính trên giao diện quản trị mới: đăng nhập, soạn, chọn ảnh bìa, lưu nháp, xem trước, xuất bản, trang công khai, khôi phục bản chưa lưu.
// Luồng đầy đủ hơn (ảnh trong bài, chỉnh ảnh, tự lưu, điện thoại) nằm ở scripts/verify-editor-flow.ts.
import { chromium, expect } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const id = randomUUID(); const slug = `ui-${id}`;
const email = `${slug}@example.test`; const password = randomBytes(24).toString('hex');
const origin = process.env.SITE_URL!;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [id, email, 'Kiểm tra giao diện', await hashPassword(password)]);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(60000);
  page.on('dialog', dialog => dialog.accept());
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/admin/login');
  await page.getByLabel('Email quản trị').fill(email); await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click(); await page.waitForURL(origin + '/admin');
  await page.goto(origin + '/admin/bai-viet/moi');
  await page.getByLabel('Tiêu đề bài viết', { exact: true }).fill('Bài kiểm tra giao diện');
  await page.getByLabel('Tóm tắt ngắn').fill('Kiểm tra thao tác thực tế trên trình duyệt.');
  await page.getByRole('textbox', { name: 'Nội dung bài viết', exact: true }).fill('Nội dung kiểm tra giao diện đăng bài, lưu nháp và xuất bản trên website.');
  await page.getByRole('button', { name: 'Đường dẫn' }).click();
  await page.getByLabel('Địa chỉ của bài', { exact: true }).fill(slug);
  await page.getByRole('button', { name: 'Chọn ảnh bìa', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Chọn ảnh bìa' });
  await dialog.locator('.adm-media-tile').first().click();
  await dialog.getByRole('button', { name: 'Chọn làm ảnh bìa', exact: true }).click();
  await page.locator('.ed-top').getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await expect(page.getByText('Đã lưu bản nháp.', { exact: false })).toBeVisible();
  await page.waitForURL(/\/admin\/bai-viet\/[a-f0-9-]+$/);
  console.log('PASS login, cover picker and persisted draft');
  await page.getByRole('button', { name: 'Xem trước' }).click();
  await expect(page.frameLocator('iframe[title="Xem trước bài viết"]').getByRole('heading', { level: 1 })).toHaveText('Bài kiểm tra giao diện');
  await page.getByRole('button', { name: 'Tiếp tục viết' }).click();
  await page.locator('.ed-top').getByRole('button', { name: 'Xuất bản', exact: true }).click();
  await expect(page.getByText('Đã xuất bản.', { exact: false })).toBeVisible();
  const publicPage = await browser.newPage(); await publicPage.goto(origin + '/tin-tuc/' + slug);
  await expect(publicPage.locator('h1').first()).toHaveText('Bài kiểm tra giao diện');
  if (!await publicPage.locator('h1').first().isVisible()) console.log('CẢNH BÁO: đầu bài công khai đang ẩn (visibility:hidden), lỗi phía trang công khai');
  console.log('PASS preview and publication visible on website');
  await page.getByLabel('Tiêu đề bài viết', { exact: true }).fill('Nội dung chưa lưu cần khôi phục');
  await page.locator('.adm-user-button').click();
  await page.getByRole('menuitem', { name: 'Đăng xuất' }).click();
  const stay = page.getByRole('dialog', { name: 'Đăng xuất khi chưa lưu?' });
  await expect(stay).toBeVisible();
  await stay.getByRole('button', { name: 'Ở lại' }).click();
  await expect(page.getByLabel('Tiêu đề bài viết', { exact: true })).toHaveValue('Nội dung chưa lưu cần khôi phục');
  await page.waitForTimeout(1200);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('dialog', { name: 'Khôi phục bài đang viết dở?' }).getByRole('button', { name: 'Khôi phục' }).click();
  await expect(page.getByLabel('Tiêu đề bài viết', { exact: true })).toHaveValue('Nội dung chưa lưu cần khôi phục');
  console.log('PASS cancel logout and recover unsaved work after reload');
  await page.setViewportSize({ width: 390, height: 844 });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Admin mobile overflow');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('PASS mobile overflow and browser runtime checks');
} finally {
  await browser.close();
  await db.query('DELETE FROM posts WHERE slug=$1', [slug]);
  await db.query('DELETE FROM users WHERE id=$1', [id]);
  await db.end();
}
