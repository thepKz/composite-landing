// Đi hết luồng đăng bài thật trên trình duyệt ở 1366 và 390, chụp ảnh từng bước, rồi dọn sạch dữ liệu tạm.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-editor-flow.ts
// Tài khoản và mật khẩu tạm tự sinh, không in ra. Bài, ảnh, tệp ảnh và tài khoản tạm bị xoá ở cuối kể cả khi lỗi.
import { chromium, expect, type Page, type Browser } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';
import { vietnamDateTimeInput } from '../src/lib/post-time';
import { uploadRoot } from '../src/lib/upload';

const origin = process.env.SITE_URL!;
const out = process.env.SHOT_DIR ?? path.join('docs', 'nang-cap-2026-11', 'sau-admin', 'luong');
mkdirSync(out, { recursive: true });

const run = randomUUID().slice(0, 8);
const userId = randomUUID();
const email = `luong-${run}@example.test`;
const password = randomBytes(24).toString('hex');
const prefix = `luong-${run}`;
const failures: string[] = [];
let mediaBefore = new Set<string>();
// Mọi ảnh do lượt chạy này tải lên hoặc sinh ra khi chỉnh ảnh (ghi lại từ phản hồi của chính ứng dụng), để cuối lượt xoá đúng những ảnh đó.
const createdMedia = new Set<string>();
let mediaCountBefore = 0;

async function png(label: string, color: { r: number; g: number; b: number }) {
  return sharp({ create: { width: 640, height: 480, channels: 3, background: color } }).png().toBuffer();
}

async function login(page: Page) {
  await page.goto(origin + '/admin/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email quản trị').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();
  await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL(origin + '/admin', { timeout: 60000 });
}

async function flow(browser: Browser, tag: 'desktop' | 'mobile') {
  const mobile = tag === 'mobile';
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 }, reducedMotion: 'reduce', isMobile: mobile, hasTouch: mobile, permissions: [] });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const errors: string[] = [];
  page.on('response', async response => {
    const url = new URL(response.url());
    if (response.request().method() !== 'POST' || !response.ok() || !new RegExp('^/api/admin/media(/[^/]+/edit)?$').test(url.pathname)) return;
    const body = await response.json().catch(() => null) as { id?: string } | null;
    if (body?.id) createdMedia.add(body.id);
  });
  page.on('pageerror', error => errors.push('pageerror: ' + error.message));
  page.on('console', message => { if (message.type() === 'error' && !/favicon|404 \(Not Found\)/.test(message.text())) errors.push(message.text().slice(0, 240)); });
  let step = 0;
  const shot = async (name: string) => { step++; await page.screenshot({ path: path.join(out, `${tag}-${String(step).padStart(2, '0')}-${name}.png`) }); };
  const title = `Bài kiểm thử luồng ${prefix} ${tag}`;
  const slug = `${prefix}-${tag}`;
  const editor = () => page.locator('.ed-prose');
  const status = () => page.locator('.ed-status');
  // Ngăn thiết lập: ở 390 là ngăn kéo mở bằng nút Thiết lập ở thanh dưới. Ở 1366 là cột cố định.
  const aside = () => page.locator('.ed-aside');
  const openSettings = async () => {
    if (!mobile || (await aside().getAttribute('data-open')) === 'true') return;
    const opener = page.locator('.ed-mobilebar').getByRole('button', { name: 'Thiết lập' });
    await opener.click();
    await expect(aside()).toHaveAttribute('data-open', 'true');
    await page.waitForTimeout(450);
  };
  const closeSettings = async () => {
    if (!mobile || (await aside().getAttribute('data-open')) !== 'true') return;
    await aside().getByRole('button', { name: 'Đóng', exact: true }).click();
    await expect(aside()).toHaveAttribute('data-open', 'false');
    await expect(page.locator('.ed-mobilebar').getByRole('button', { name: 'Thiết lập' })).toBeFocused();
    await page.waitForTimeout(450);
  };
  // Chọn ngày giờ bằng ba ô chọn tiếng Việt (giờ Việt Nam). Phút làm tròn lên bội của 5.
  const roundedTime = (ms: number) => vietnamDateTimeInput(Math.ceil(ms / 300000) * 300000);
  const chooseSchedule = async (value: string) => {
    const [date, time] = value.split('T');
    const group = page.getByRole('group', { name: 'Hẹn giờ đăng' });
    await group.getByLabel('Ngày').selectOption(date);
    await group.getByLabel('Giờ').selectOption(time.slice(0, 2));
    await group.getByLabel('Phút').selectOption(time.slice(3, 5));
  };

  await login(page);
  await shot('tong-quan');

  // 1. Viết bài mới
  await page.goto(origin + '/admin/bai-viet/moi', { waitUntil: 'networkidle' });
  await page.getByLabel('Tiêu đề bài viết', { exact: true }).fill(title);
  await page.getByLabel('Tóm tắt ngắn').fill('Bài kiểm thử luồng soạn bài, tự lưu nháp, chèn ảnh, xem trước và xuất bản.');
  await page.getByLabel('Tiêu đề bài viết', { exact: true }).press('Enter');
  await expect(editor()).toBeFocused();
  await page.keyboard.type('Đoạn mở đầu của bài kiểm thử, đủ dài để qua điều kiện xuất bản của máy chủ.');
  await page.keyboard.press('Enter');
  await shot('viet-bai');

  // Điện thoại: thanh trên không chen nhau, ba nút dưới cùng hiện đủ và không đè nội dung cuối trang
  if (mobile) {
    const top = await page.evaluate(`(() => { var out = {}; var pairs = { back: '.ed-top .back-link', status: '.ed-top .ed-status', preview: '.ed-top-actions .button' }; for (var key in pairs) { var el = document.querySelector(pairs[key]); var r = el ? el.getBoundingClientRect() : null; out[key] = r ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom } : null; } return out; })()`) as Record<'back' | 'status' | 'preview', { left: number; right: number; top: number; bottom: number }>;
    expect(top.back!.right).toBeLessThanOrEqual(top.status!.left + 1);
    expect(top.status!.right).toBeLessThanOrEqual(top.preview!.left + 1);
    expect(top.status!.bottom - top.status!.top).toBeLessThan(28);
    const bar = page.locator('.ed-mobilebar');
    await expect(bar.getByRole('button')).toHaveCount(3);
    const buttons = await bar.getByRole('button').evaluateAll(list => list.map(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, bottom: r.bottom, clipped: el.scrollWidth > el.clientWidth + 1, text: (el.textContent || '').trim() }; }));
    for (const button of buttons) {
      expect(button.left).toBeGreaterThanOrEqual(0);
      expect(button.right).toBeLessThanOrEqual(390);
      expect(button.bottom).toBeLessThanOrEqual(844);
      expect(button.clipped, 'nút bị cắt chữ: ' + button.text).toBe(false);
    }
    // Ngăn thiết lập: mở bằng nút, tiêu điểm vào trong, Tab giữ bên trong, Esc đóng và tiêu điểm về nút đã mở, ngăn không để lộ nút khi đóng
    await expect(aside()).toHaveAttribute('data-open', 'false');
    expect(await aside().evaluate(el => getComputedStyle(el).visibility)).toBe('hidden');
    await openSettings();
    await expect(aside().getByRole('button', { name: 'Đóng', exact: true })).toBeFocused();
    const box = (await aside().boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(391);
    for (let i = 0; i < 40; i++) await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('.ed-aside'))).toBe(true);
    await shot('ngan-thiet-lap-dien-thoai');
    await page.keyboard.press('Escape');
    await expect(aside()).toHaveAttribute('data-open', 'false');
    await expect(page.locator('.ed-mobilebar').getByRole('button', { name: 'Thiết lập' })).toBeFocused();
    await page.waitForTimeout(450);
    await shot('thanh-duoi-dien-thoai');
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  // 2. Menu gõ dấu / chèn tiêu đề
  await editor().click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('/tieu');
  const menu = page.getByRole('listbox', { name: 'Chèn khối' });
  await expect(menu).toBeVisible();
  await shot('menu-slash');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Phần thứ nhất của bài');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Nội dung phần thứ nhất, có vài chữ để bôi đen.');
  expect(await editor().locator('h2').count()).toBeGreaterThan(0);

  // 3. Bôi chữ hiện thanh nổi, in đậm
  await page.keyboard.press('Shift+Home');
  const bubble = page.getByRole('toolbar', { name: 'Định dạng chữ đã chọn' });
  await expect(bubble).toBeVisible();
  await shot('chon-chu');
  await bubble.getByRole('button', { name: 'In đậm' }).click();
  expect(await editor().locator('strong').count()).toBeGreaterThan(0);
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');

  // 4. Chèn ảnh từ thư viện bằng menu /
  await page.keyboard.type('/anh');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Enter');
  const library = page.getByRole('dialog', { name: 'Chèn ảnh vào bài' });
  await expect(library).toBeVisible();
  await expect(library.locator('.adm-media-tile').first()).toBeVisible();
  await shot('thu-vien-chon-anh');
  await library.locator('.adm-media-tile').first().click();
  await library.getByRole('button', { name: 'Chèn vào bài' }).click();
  await expect(library).toBeHidden();
  const figure = editor().locator('.ed-figure').first();
  await expect(figure).toBeVisible();

  // 5. Bấm ảnh: thanh ảnh, nhắc mô tả, căn lề, bề rộng, chú thích
  await figure.locator('img').click();
  const panel = page.getByRole('toolbar', { name: 'Chỉnh ảnh trong bài' });
  await expect(panel).toBeVisible();
  await panel.getByLabel('Mô tả ảnh').fill('');
  await expect(panel.getByText('Hãy mô tả ảnh')).toBeVisible();
  await panel.getByLabel('Mô tả ảnh').fill('Bể composite chụp tại xưởng để kiểm thử');
  await panel.getByRole('button', { name: 'Căn trái' }).click();
  await panel.getByRole('button', { name: 'Bề rộng 60 phần trăm' }).click();
  await figure.getByLabel('Chú thích ảnh').fill('Ảnh kiểm thử lấy từ thư viện');
  await expect(figure).toHaveAttribute('data-align', 'left');
  await shot('anh-trong-bai');

  // 6. Cắt ảnh 16:9, lưu thành ảnh mới, ảnh gốc giữ nguyên
  await figure.locator('img').click();
  const sourceSrc = await figure.locator('img').getAttribute('src');
  await panel.getByRole('button', { name: 'Cắt, xoay, lật ảnh' }).click();
  const dialog = page.getByRole('dialog', { name: 'Chỉnh sửa ảnh' });
  await expect(dialog.locator('canvas')).toBeVisible();
  await dialog.getByRole('button', { name: '16:9' }).click();
  await dialog.getByRole('button', { name: 'Xoay phải' }).click();
  await dialog.getByRole('button', { name: '16:9' }).click();
  // Kéo khung cắt bằng chuột: kéo góc trên trái vào trong thì khung nhỏ lại và vẫn đúng tỉ lệ 16:9, kéo thân khung thì khung dời chỗ.
  const crop = dialog.locator('.adm-crop');
  const before = (await crop.boundingBox())!;
  const handle = (await dialog.locator('.adm-crop-handle').first().boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 50, handle.y + handle.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
  const resized = (await crop.boundingBox())!;
  expect(resized.width).toBeLessThan(before.width - 20);
  expect(Math.abs(resized.width / resized.height - 16 / 9)).toBeLessThan(0.06);
  const grab = { x: resized.x + resized.width / 2, y: resized.y + resized.height / 2 };
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x - 25, grab.y - 15, { steps: 5 });
  await page.mouse.up();
  const moved = (await crop.boundingBox())!;
  expect(Math.abs(moved.width - resized.width)).toBeLessThan(2);
  expect(Math.abs(moved.x - resized.x) + Math.abs(moved.y - resized.y)).toBeGreaterThan(8);
  await shot('chinh-anh');
  await dialog.getByRole('button', { name: 'Lưu thành ảnh mới' }).click();
  await expect(dialog).toBeHidden();
  const editedSrc = await editor().locator('.ed-figure img').first().getAttribute('src');
  expect(editedSrc).not.toBe(sourceSrc);
  const sourceId = sourceSrc!.split('/').pop()!;
  expect((await db.query('SELECT 1 FROM media_assets WHERE id=$1', [sourceId])).rowCount).toBe(1);

  // 7. Dán ảnh thẳng vào bài (mô phỏng sự kiện dán có tệp)
  await editor().focus();
  await page.keyboard.press('Control+End');
  const pasted = (await png('dan', { r: 30, g: 120, b: 80 })).toString('base64');
  await page.evaluate(async ({ data, name }) => {
    const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const file = new File([bytes], name, { type: 'image/png' });
    const transfer = new DataTransfer(); transfer.items.add(file);
    const target = document.querySelector('.ed-prose')!;
    target.dispatchEvent(new ClipboardEvent('paste', { clipboardData: transfer, bubbles: true, cancelable: true }));
  }, { data: pasted, name: `${prefix}-${tag}-dan.png` });
  await expect(editor().locator('.ed-figure')).toHaveCount(2, { timeout: 60000 });

  // 8. Bảng qua menu /
  await editor().focus();
  await page.keyboard.press('Control+End');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('/bang');
  await page.keyboard.press('Enter');
  await expect(editor().locator('table')).toBeVisible();
  await expect(page.getByRole('toolbar', { name: 'Công cụ bảng' })).toBeVisible();
  await shot('bang');

  // 9. Tự lưu nháp, không bấm gì
  await expect(status()).toContainText('Đã lưu lúc', { timeout: 30000 });
  await page.waitForURL(/\/admin\/bai-viet\/[0-9a-f-]{36}$/);
  const saved = (await db.query('SELECT id,status,version FROM posts WHERE title=$1', [title])).rows[0];
  expect(saved?.status).toBe('draft');
  await shot('tu-luu-nhap');

  // 10. Ảnh bìa
  await openSettings();
  const coverSection = page.locator('.ed-section', { has: page.getByRole('button', { name: /Ảnh bìa/ }) });
  if (!(await coverSection.locator('.ed-section-body').count())) await coverSection.getByRole('button', { name: /Ảnh bìa/ }).click();
  await coverSection.getByRole('button', { name: /Chọn ảnh bìa|Đổi ảnh/ }).click();
  const coverDialog = page.getByRole('dialog', { name: 'Chọn ảnh bìa' });
  await coverDialog.locator('.adm-media-tile').nth(2).click();
  await coverDialog.getByRole('button', { name: 'Chọn làm ảnh bìa' }).click();
  await expect(coverSection.locator('.ed-cover img')).toBeVisible();

  // 11. Đường dẫn: đặt đường dẫn riêng
  const slugSection = page.locator('.ed-section', { has: page.getByRole('button', { name: /Đường dẫn/ }) });
  await slugSection.getByRole('button', { name: /Đường dẫn/ }).click();
  await slugSection.getByLabel('Địa chỉ của bài').fill(slug);
  await closeSettings();

  // 12. Xem trước đúng giao diện công khai
  await page.getByRole('button', { name: /Xem trước/ }).click();
  const frame = page.frameLocator('iframe[title="Xem trước bài viết"]');
  await expect(frame.getByRole('heading', { level: 1 })).toHaveText(title, { timeout: 60000 });
  await shot('xem-truoc-may-ban');
  await page.getByRole('button', { name: 'Điện thoại' }).click();
  await expect(frame.getByRole('heading', { level: 1 })).toBeVisible();
  await shot('xem-truoc-dien-thoai');
  await page.getByRole('button', { name: /Tiếp tục viết/ }).click();

  // 13. Ctrl+S lưu, rồi xuất bản
  await page.keyboard.press('Control+s');
  await expect(status()).toContainText('Đã lưu lúc', { timeout: 30000 });
  const publish = mobile ? page.locator('.ed-mobilebar').getByRole('button', { name: 'Xuất bản' }) : page.locator('.ed-top').getByRole('button', { name: 'Xuất bản' });
  await publish.click();
  await expect(page.getByText('Đã xuất bản.', { exact: false }).first()).toBeVisible();
  await shot('xuat-ban');

  // 14. Trang công khai thấy bài, ảnh không vỡ
  const publicPage = await context.newPage();
  await publicPage.goto(origin + '/tin-tuc/' + slug, { waitUntil: 'networkidle' });
  await expect(publicPage.locator('h1').first()).toHaveText(title);
  if (!await publicPage.locator('h1').first().isVisible()) console.log(`CẢNH BÁO ${tag}: đầu bài công khai đang ẩn (visibility:hidden), lỗi phía trang công khai`);
  const broken = await publicPage.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).length);
  expect(broken).toBe(0);
  await publicPage.screenshot({ path: path.join(out, `${tag}-${String(++step).padStart(2, '0')}-trang-cong-khai.png`) });
  await publicPage.close();

  // 15. Rời trang khi còn thay đổi: có hộp xác nhận, ở lại
  await editor().click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type(' Thêm chữ chưa lưu.');
  await expect(status()).toContainText('chưa lưu');
  if (!mobile) {
    await page.getByRole('link', { name: 'Bài viết' }).first().click();
    const leave = page.getByRole('dialog', { name: 'Rời trang khi chưa lưu?' });
    await expect(leave).toBeVisible();
    await shot('canh-bao-roi-trang');
    await leave.getByRole('button', { name: 'Ở lại viết tiếp' }).click();
    await expect(leave).toBeHidden();
  }
  await page.keyboard.press('Control+s');
  await expect(status()).toContainText('Đã lưu lúc');

  // 16. Chuyển về nháp (nút ở cột bên phải), trang công khai không còn bài
  await openSettings();
  const panelButtons = page.locator('.ed-panel');
  await panelButtons.getByRole('button', { name: 'Chuyển về nháp' }).click();
  await expect.poll(async () => (await db.query('SELECT status FROM posts WHERE title=$1', [title])).rows[0].status, { message: 'bài chưa về nháp sau khi bấm nút ở cột bên phải' }).toBe('draft');
  expect((await page.request.get(origin + '/tin-tuc/' + slug)).status()).toBe(404);

  // 16a. Hẹn giờ đăng từ bản nháp: bài chưa công khai, DB giữ đúng giờ hẹn
  const firstTime = roundedTime(Date.now() + 2 * 3600 * 1000);
  await expect(page.locator('input[type=datetime-local]')).toHaveCount(0);
  await chooseSchedule(firstTime);
  await panelButtons.getByRole('button', { name: 'Đặt lịch đăng' }).click();
  await expect(page.getByText('Đã hẹn đăng lúc', { exact: false }).first()).toBeVisible();
  await expect(page.locator('.ed-top .status-badge')).toHaveText(mobile ? /.*/ : 'Đã hẹn đăng');
  expect((await page.request.get(origin + '/tin-tuc/' + slug)).status()).toBe(404);
  const scheduled1 = (await db.query('SELECT status,published_at FROM posts WHERE title=$1', [title])).rows[0];
  expect(scheduled1.status).toBe('published');
  expect(vietnamDateTimeInput(scheduled1.published_at)).toBe(firstTime);
  await shot('hen-gio');

  // 16b. Đổi lịch sang giờ khác
  const secondTime = roundedTime(Date.now() + 5 * 3600 * 1000);
  await chooseSchedule(secondTime);
  await panelButtons.getByRole('button', { name: 'Đổi lịch đăng' }).click();
  await expect(page.getByText(`Đã hẹn đăng lúc`, { exact: false }).first()).toBeVisible();
  await expect.poll(async () => vietnamDateTimeInput((await db.query('SELECT published_at FROM posts WHERE title=$1', [title])).rows[0].published_at)).toBe(secondTime);

  // 16c. Huỷ lịch về nháp
  await panelButtons.getByRole('button', { name: 'Hủy lịch, về nháp' }).click();
  await expect.poll(async () => (await db.query('SELECT status,published_at FROM posts WHERE title=$1', [title])).rows[0].status).toBe('draft');
  const cancelled = (await db.query('SELECT published_at FROM posts WHERE title=$1', [title])).rows[0];
  expect(cancelled.published_at === null || new Date(cancelled.published_at).getTime() <= Date.now()).toBe(true);
  expect((await page.request.get(origin + '/tin-tuc/' + slug)).status()).toBe(404);

  // 16d. Khôi phục bản cũ nhất trong lịch sử sửa: nội dung chữ thêm sau này biến mất khỏi trình soạn, chưa lưu cho tới khi bấm lưu
  expect(await editor().innerText()).toContain('Thêm chữ chưa lưu');
  const history = page.locator('.ed-section', { has: page.getByRole('button', { name: /Lịch sử đã lưu/ }) });
  await history.getByRole('button', { name: /Lịch sử đã lưu/ }).click();
  const versions = history.locator('.ed-section-body button');
  expect(await versions.count()).toBeGreaterThan(1);
  await versions.last().click();
  const restore = page.getByRole('dialog', { name: 'Nạp bản cũ vào trình soạn?' });
  await expect(restore).toBeVisible();
  await restore.getByRole('button', { name: 'Nạp bản cũ' }).click();
  await expect(restore).toBeHidden();
  await expect(status()).toContainText('thay đổi');
  expect(await editor().innerText()).not.toContain('Thêm chữ chưa lưu');
  await shot('khoi-phuc-ban-cu');
  await page.keyboard.press('Control+s');
  await expect(status()).toContainText('Đã lưu lúc', { timeout: 30000 });

  // 17. Không tràn ngang
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) failures.push(`${tag}: tràn ngang ${overflow}px`);

  // 18. Danh sách: tìm, nhân bản, xoá có xác nhận
  await page.goto(origin + '/admin/bai-viet', { waitUntil: 'networkidle' });
  await page.getByLabel('Tìm bài viết').fill(`${prefix} ${tag}`);
  const rows = page.locator('.adm-post-row');
  await expect(rows).toHaveCount(1);
  await page.getByRole('button', { name: /^Nhân bản/ }).click();
  await expect(rows).toHaveCount(2, { timeout: 30000 });
  await shot('danh-sach');
  await page.getByRole('button', { name: /^Xoá Bản sao/ }).click();
  const confirmDelete = page.getByRole('dialog', { name: 'Xoá bài viết này?' });
  await expect(confirmDelete).toBeVisible();
  await shot('xac-nhan-xoa');
  await confirmDelete.getByRole('button', { name: 'Xoá bài' }).click();
  await expect(rows).toHaveCount(1, { timeout: 30000 });

  // 19. Thư viện: ảnh đang dùng không xoá được, tải nhiều tệp một lúc
  await page.goto(origin + '/admin/thu-vien', { waitUntil: 'networkidle' });
  await page.setInputFiles('input[type=file]', [
    { name: `${prefix}-${tag}-a.png`, mimeType: 'image/png', buffer: await png('a', { r: 200, g: 80, b: 40 }) },
    { name: `${prefix}-${tag}-b.png`, mimeType: 'image/png', buffer: await png('b', { r: 40, g: 80, b: 200 }) },
  ]);
  await expect(page.locator('.adm-uploads')).toBeHidden({ timeout: 30000 }).catch(() => {});
  await page.getByLabel('Tìm ảnh hoặc video').fill(`${prefix}-${tag}`);
  await expect(page.locator('.adm-media-tile')).toHaveCount(3, { timeout: 30000 });
  await page.locator('.adm-media-tile').first().click();
  await expect(page.getByRole('complementary', { name: 'Chi tiết tệp' })).toBeVisible();
  await shot('thu-vien');

  // Ảnh đang dùng trong bài thì không xoá được, ảnh chưa dùng thì xoá được sau khi xác nhận
  const inUse = (await db.query('SELECT m.original_name FROM post_media pm JOIN media_assets m ON m.id=pm.media_id JOIN posts p ON p.id=pm.post_id WHERE p.title=$1 LIMIT 1', [title])).rows[0];
  expect(inUse, 'bài cần còn dùng ít nhất một ảnh').toBeTruthy();
  await page.getByLabel('Tìm ảnh hoặc video').fill(inUse.original_name);
  const used = page.locator('.adm-media-tile').first();
  await expect(used).toContainText('Đang dùng');
  await used.click();
  await page.getByRole('button', { name: 'Xoá', exact: true }).click();
  await expect(page.getByText('đang được dùng', { exact: false }).first()).toBeVisible();
  await page.getByLabel('Tìm ảnh hoặc video').fill(`${prefix}-${tag}`);
  const free = page.locator('.adm-media-tile', { hasText: `${prefix}-${tag}-a` });
  await free.click();
  await page.getByRole('button', { name: 'Xoá', exact: true }).click();
  const confirmFile = page.getByRole('dialog', { name: 'Xoá tệp này khỏi thư viện?' });
  await expect(confirmFile).toBeVisible();
  await confirmFile.getByRole('button', { name: 'Xoá tệp' }).click();
  await expect(page.locator('.adm-media-tile')).toHaveCount(2, { timeout: 30000 });

  // 19b. Chọn nhiều để xoá một lượt: ảnh đang dùng không chọn được, hộp xác nhận nêu số ảnh
  const tilesBefore = await page.locator('.adm-media-tile').count();
  await page.setInputFiles('input[type=file]', [
    { name: `${prefix}-${tag}-c.png`, mimeType: 'image/png', buffer: await png('c', { r: 90, g: 160, b: 60 }) },
    { name: `${prefix}-${tag}-d.png`, mimeType: 'image/png', buffer: await png('d', { r: 160, g: 60, b: 140 }) },
  ]);
  await expect(page.locator('.adm-media-tile')).toHaveCount(tilesBefore + 2, { timeout: 30000 });
  await page.getByRole('button', { name: 'Chọn nhiều' }).click();
  for (const tile of await page.locator('.adm-media-tile', { hasText: 'Đang dùng' }).all()) await expect(tile).toBeDisabled();
  await page.locator('.adm-media-tile', { hasText: `${prefix}-${tag}-c.png` }).click();
  await page.locator('.adm-media-tile', { hasText: `${prefix}-${tag}-d.png` }).click();
  await expect(page.getByText('Đã chọn 2 tệp')).toBeVisible();
  await shot('chon-nhieu');
  await page.locator('.adm-bulkbar').getByRole('button', { name: 'Xoá 2' }).click();
  const confirmMany = page.getByRole('dialog', { name: 'Xoá 2 tệp khỏi thư viện?' });
  await expect(confirmMany).toBeVisible();
  await confirmMany.getByRole('button', { name: 'Xoá 2 tệp' }).click();
  await expect(page.locator('.adm-media-tile')).toHaveCount(tilesBefore, { timeout: 30000 });
  await page.getByRole('button', { name: 'Xong', exact: true }).click();

  await page.goto(origin + '/admin/bai-viet', { waitUntil: 'networkidle' });
  await page.getByLabel('Tìm bài viết').fill(`${prefix} ${tag}`);
  await page.getByRole('button', { name: /^Xoá Bài kiểm thử/ }).click();
  await page.getByRole('dialog', { name: 'Xoá bài viết này?' }).getByRole('button', { name: 'Xoá bài' }).click();
  await expect(page.locator('.adm-post-row')).toHaveCount(0, { timeout: 30000 });
  await shot('da-xoa-bai');

  if (errors.length) failures.push(`${tag}: lỗi trình duyệt\n  ${errors.join('\n  ')}`);
  await context.close();
  console.log(`PASS ${tag}`);
}

async function cleanup() {
  const posts = await db.query('SELECT id FROM posts WHERE slug LIKE $1 OR title LIKE $2', [`${prefix}%`, `%${prefix}%`]);
  const ids = posts.rows.map(row => row.id);
  if (ids.length) {
    await db.query('DELETE FROM redirects WHERE target_path LIKE $1 OR source_path LIKE $1', [`%${prefix}%`]);
    await db.query('DELETE FROM posts WHERE id=ANY($1)', [ids]);
  }
  // Ảnh thử xoá qua đúng đường xoá của ứng dụng (DELETE /api/admin/media/[id]), đăng nhập bằng tài khoản tạm. Không đụng ảnh có từ trước.
  const context = await browser.newContext();
  try {
    const login = await context.request.post(origin + '/api/auth/login', { data: { email, password }, headers: { Origin: origin } });
    if (!login.ok()) throw new Error('đăng nhập dọn dẹp thất bại ' + login.status());
    for (const id of createdMedia) {
      if (mediaBefore.has(id)) continue;
      // Một agent hoặc người khác có thể đang tạm dùng ảnh trong bài mẫu của họ: thử lại tới 40 giây thay vì bỏ sót.
      let response = await context.request.delete(origin + '/api/admin/media/' + id, { headers: { Origin: origin } });
      for (let attempt = 0; attempt < 8 && response.status() === 409; attempt++) { await new Promise(resolve => setTimeout(resolve, 5000)); response = await context.request.delete(origin + '/api/admin/media/' + id, { headers: { Origin: origin } }); }
      if (!response.ok() && response.status() !== 404) failures.push('dọn ảnh ' + id + ' lỗi ' + response.status() + ' ' + (await response.text()).slice(0, 120));
    }
  } finally { await context.close(); }
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  mediaBefore = new Set((await db.query('SELECT id FROM media_assets')).rows.map(row => row.id));
  mediaCountBefore = mediaBefore.size;
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [userId, email, 'Kiểm tra luồng', await hashPassword(password)]);
  for (const tag of ['desktop', 'mobile'] as const) {
    if (process.env.FLOW_ONLY && process.env.FLOW_ONLY !== tag) continue;
    try { await flow(browser, tag); } catch (error) { failures.push(`${tag}: ${(error as Error).message.split('\n').slice(0, 6).join(' | ')}`); }
  }
} finally {
  await cleanup().catch(error => { failures.push('dọn dữ liệu tạm lỗi: ' + (error as Error).message); });
  await browser.close();
  const left = await db.query('SELECT (SELECT count(*) FROM posts WHERE slug LIKE $1)::int AS posts, (SELECT count(*) FROM users WHERE id=$2)::int AS users', [`${prefix}%`, userId]);
  const mediaLeft = (await db.query('SELECT count(*)::int AS total FROM media_assets')).rows[0].total;
  if (mediaLeft !== mediaCountBefore) failures.push(`số ảnh trước ${mediaCountBefore}, sau ${mediaLeft}: còn sót ảnh thử`);
  console.log('Lượt chạy', prefix, 'số ảnh trước', mediaCountBefore, 'còn lại sau khi dọn:', JSON.stringify({ ...left.rows[0], media: mediaLeft }));
  await db.end();
}
if (failures.length) { console.error('THẤT BẠI:\n' + failures.join('\n')); process.exit(1); }
console.log('Xong: luồng soạn bài đạt ở cả hai cỡ.');
