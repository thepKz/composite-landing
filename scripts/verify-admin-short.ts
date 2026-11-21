// Kiểm các màn admin ở khung thấp 600x360 (khung chủ dự án hay xem): tổng quan, danh sách bài, thư viện, yêu cầu, cài đặt, sản phẩm, soạn bài.
// Soạn bài: đo vùng viết còn lại khi cuộn, mở và đóng ngăn thiết lập, không tràn ngang. Bài thử và tài khoản tạm bị xoá cuối lượt.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-admin-short.ts
import { chromium, expect } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';

const origin = process.env.SITE_URL!;
const out = path.join('docs', 'nang-cap-2026-11', 'sau-admin', 'khung-thap');
mkdirSync(out, { recursive: true });
const userId = randomUUID();
const postId = randomUUID();
const email = `thap-${userId}@example.test`;
const password = randomBytes(24).toString('hex');
const title = `Bài thử khung thấp ${userId.slice(0, 8)}`;
const failures: string[] = [];
const text = (value: string) => ({ type: 'paragraph', content: [{ type: 'text', text: value }] });
const body = Array.from({ length: 14 }, (_, i) => text(`Đoạn thứ ${i + 1} của bài thử để có đủ chiều dài mà cuộn. Bể composite liền khối được hạ xuống hố đã lót phẳng, bơm nước đối trọng rồi lấp đất theo từng lớp.`));

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra khung thấp', await hashPassword(password)]);
  await db.query("INSERT INTO posts(id,title,slug,excerpt,content,kind,status) VALUES ($1,$2,$3,$4,$5,'article','draft')",
    [postId, title, `thap-${userId.slice(0, 8)}`, 'Bài thử để đo vùng viết ở khung thấp.', JSON.stringify({ type: 'doc', content: body })]);
  const context = await browser.newContext({ viewport: { width: 600, height: 360 }, reducedMotion: 'reduce' });
  context.setDefaultTimeout(60000);
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/admin/login');
  await page.screenshot({ path: path.join(out, 'dang-nhap.png') });
  await page.getByLabel('Email quản trị').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL(origin + '/admin');
  const screens: [string, string][] = [['tong-quan', '/admin'], ['danh-sach-bai', '/admin/bai-viet'], ['thu-vien', '/admin/thu-vien'], ['yeu-cau', '/admin/yeu-cau'], ['cai-dat', '/admin/cai-dat'], ['san-pham', '/admin/san-pham']];
  for (const [name, route] of screens) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) failures.push(`${name}: tràn ngang ${overflow}px`);
    // Phần đầu của nội dung chính phải thấy ngay, không bị thanh dính chiếm hết
    const heading = await page.locator('.adm-content h1').first().boundingBox();
    if (!heading || heading.y > 120) failures.push(`${name}: tiêu đề trang nằm quá thấp (${heading?.y})`);
    await page.screenshot({ path: path.join(out, `${name}.png`) });
  }

  // Soạn bài
  await page.goto(`${origin}/admin/bai-viet/${postId}`, { waitUntil: 'networkidle' });
  await expect(page.locator('.ed-prose')).toContainText('Đoạn thứ 1');
  const measure = () => page.evaluate(`(() => { var r = function (s) { var el = document.querySelector(s); return el ? el.getBoundingClientRect() : null; }; var top = r('.ed-top'), tool = r('.ed-toolbar-wrap'), prose = r('.ed-prose'); return { topBottom: top.bottom, toolBottom: tool.bottom, proseTop: prose.top, overflow: document.documentElement.scrollWidth - window.innerWidth, shellBar: r('.adm-topbar') ? r('.adm-topbar').bottom : 0 }; })()`) as Promise<{ topBottom: number; toolBottom: number; proseTop: number; overflow: number; shellBar: number }>;
  const first = await measure();
  await page.screenshot({ path: path.join(out, 'soan-bai-dau.png') });
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(500);
  const scrolled = await measure();
  const writable = 360 - scrolled.toolBottom;
  console.log('khi cuộn: thanh trên cùng cao', Math.round(scrolled.topBottom), ', hết thanh công cụ ở', Math.round(scrolled.toolBottom), ', vùng viết còn', Math.round(writable), 'px');
  if (writable < 240) failures.push(`soạn bài: vùng viết chỉ còn ${Math.round(writable)}px`);
  if (scrolled.overflow > 0) failures.push(`soạn bài: tràn ngang ${scrolled.overflow}px`);
  await page.screenshot({ path: path.join(out, 'soan-bai-cuon.png') });

  // Ngăn thiết lập
  const aside = page.locator('#ed-aside');
  await expect(aside).toBeHidden();
  await page.getByRole('button', { name: 'Mở thiết lập bài' }).click();
  await expect(aside).toBeVisible();
  await expect(aside.getByText('Xuất bản').first()).toBeVisible();
  await page.screenshot({ path: path.join(out, 'soan-bai-ngan-thiet-lap.png') });
  await page.keyboard.press('Escape');
  await expect(aside).toBeHidden();
  // Ba nút hành động trong thanh trên đủ và không bị cắt
  const buttons = await page.locator('.ed-top').getByRole('button').evaluateAll(list => list.map(el => { const r = el.getBoundingClientRect(); return { right: r.right, clipped: el.scrollWidth > el.clientWidth + 1, text: (el.textContent || '').trim(), visible: r.width > 0 }; }));
  for (const button of buttons.filter(item => item.visible)) {
    if (button.right > 600) failures.push(`nút "${button.text}" tràn ra ngoài khung`);
    if (button.clipped) failures.push(`nút "${button.text}" bị cắt chữ`);
  }
  // Xem trước cũng dùng được
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('button', { name: 'Xem trước' }).click();
  await page.frameLocator('iframe[title="Xem trước bài viết"]').locator('.art-head h1').waitFor();
  await page.screenshot({ path: path.join(out, 'soan-bai-xem-truoc.png') });
  if (errors.length) failures.push('lỗi trình duyệt: ' + errors.join(' | '));
  console.log('Đầu trang soạn bài: thanh trên hết ở', Math.round(first.topBottom), ', vùng viết bắt đầu ở', Math.round(first.proseTop));
  await context.close();
} finally {
  await browser.close();
  await db.query('DELETE FROM posts WHERE id=$1', [postId]);
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
  await db.end();
}
if (failures.length) { console.error('VẤN ĐỀ:\n' + failures.join('\n')); process.exit(1); }
console.log('Đạt: các màn admin dùng được ở 600x360.');
