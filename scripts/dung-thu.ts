// Tự dùng thử như người thường, KHÔNG giảm chuyển động, ở 1366x768 và 390x844:
// mở menu, đổi cảnh banner, cuộn hết trang chủ (chụp khung giữa chừng, đo khối kẹt ẩn), đi tới chi tiết biogas,
// chọn quy mô, bấm Nhận báo giá, điền biểu mẫu tới bước cuối, gửi THẬT một yêu cầu thử, kiểm bản ghi rồi xoá đúng bản ghi đó theo id.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/dung-thu.ts <thư-mục-ra>
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from '../src/lib/db';

const out = process.argv[2];
const origin = process.env.SITE_URL;
if (!out || !origin) { console.error('Thiếu thư mục ra hoặc SITE_URL.'); process.exit(1); }
mkdirSync(out, { recursive: true });
const report: Record<string, unknown>[] = [];
const wait = (page: Page, ms: number) => page.waitForTimeout(ms);
const testName = 'Kiểm thử giao diện';
const createdIds: string[] = [];

async function stuck(page: Page) {
  return page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-reveal],[data-art-reveal],.tl-rise')].filter(el => {
    const r = el.getBoundingClientRect();
    const inView = r.width > 0 && r.height > 0 && r.top < innerHeight * 0.8 && r.bottom > 0 && r.left < innerWidth && r.right > 0;
    return inView && getComputedStyle(el).opacity === '0' && !el.closest('[data-active="false"]');
  }).map(el => `${el.tagName}.${String(el.className).slice(0, 30)}`));
}

try {
  for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, hasTouch: size.width < 600, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text().slice(0, 200)); });
    page.on('pageerror', error => errors.push(String(error).slice(0, 200)));
    const shot = (name: string) => page.screenshot({ path: join(out, `dung-thu-${name}-${size.tag}.png`) });

    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    await wait(page, 1600);
    await shot('01-banner-canh-1');

    // Menu
    if (size.width >= 961) {
      await page.getByRole('button', { name: 'Sản phẩm', exact: true }).hover();
      await wait(page, 500);
    } else {
      await page.getByRole('button', { name: 'Mở menu' }).click();
      await wait(page, 600);
    }
    await shot('02-menu');
    await page.keyboard.press('Escape');
    await wait(page, 400);
    if (size.width >= 961) await page.mouse.move(700, 600);

    // Đổi cảnh banner, chụp giữa lúc chuyển và sau khi xong
    for (const scene of [2, 3]) {
      await page.getByRole('button', { name: new RegExp(`^Cảnh ${scene}:`) }).click();
      await wait(page, 450);
      await shot(`03-canh-${scene}-giua-chuyen`);
      await wait(page, 1700);
      await shot(`03-canh-${scene}-xong`);
    }
    await page.mouse.move(size.width - 5, 5);

    // Cuộn hết trang chủ
    const heights: number[] = [];
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    heights.push(total);
    const frames: string[] = [];
    let index = 0;
    for (let y = 0; y < total; y += Math.round(size.height * 0.85)) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await wait(page, 800);
      const hidden = await stuck(page);
      if (hidden.length) frames.push(`y=${y}: ${hidden.slice(0, 4).join(', ')}`);
      if (index % 3 === 1) await shot(`04-cuon-${String(index).padStart(2, '0')}`);
      index += 1;
    }
    report.push({ size: size.tag, step: 'cuộn hết trang chủ', pageHeight: total, khoiKetAn: frames });

    // Tới chi tiết biogas qua thẻ sản phẩm
    await page.evaluate(() => scrollTo(0, 0));
    await page.locator('a.tl-bento-card[href="/san-pham/be-biogas-composite"]').first().scrollIntoViewIfNeeded();
    await wait(page, 700);
    await page.locator('a.tl-bento-card[href="/san-pham/be-biogas-composite"]').first().click();
    await page.waitForURL('**/san-pham/be-biogas-composite', { timeout: 20000 });
    await wait(page, 1500);
    await shot('05-chi-tiet-biogas');
    await page.getByRole('button', { name: /15 – 30 con lợn/ }).first().click();
    await wait(page, 500);
    await shot('06-chon-quy-mo');
    await page.getByRole('button', { name: /^Nhận báo giá/ }).first().click();
    await wait(page, 1600);
    await shot('07-bieu-mau-chon-san');
    const preselected = await page.evaluate(() => {
      const checked = document.querySelector<HTMLInputElement>('.tl-form input[type=radio]:checked');
      const title = document.querySelector('.tl-form-title')?.textContent;
      return { checkedLabel: checked?.closest('label')?.textContent?.trim(), title };
    });
    report.push({ size: size.tag, step: 'bấm quy mô rồi Nhận báo giá', ...preselected });

    // Điền biểu mẫu tới bước cuối và gửi thật
    const form = page.locator('.tl-form').first();
    await form.getByRole('button', { name: 'Tiếp tục' }).click();
    await wait(page, 500);
    await shot('08-buoc-lien-he');
    await form.getByLabel('Họ và tên').fill(testName);
    await form.getByLabel('Số điện thoại có Zalo').fill('09' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'));
    await form.getByLabel('Tỉnh thành').fill('Phú Thọ');
    await form.getByRole('button', { name: 'Tiếp tục' }).click();
    await wait(page, 600);
    await shot('09-buoc-cuoi');
    await form.getByLabel('Ghi chú').fill('Yêu cầu thử từ kịch bản kiểm giao diện, sẽ bị xoá.');
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Gửi yêu cầu' }).click();
    await form.getByText('Đã nhận yêu cầu').waitFor({ timeout: 20000 });
    await wait(page, 700);
    await shot('10-thanh-cong');
    const hot = JSON.parse(await page.evaluate("(() => { const a = document.querySelector('.tl-form-success a.tl-form-button.is-solid'); const s = getComputedStyle(a); return JSON.stringify({ color: s.color, bg: s.backgroundColor }); })()") as string) as { color: string; bg: string };
    const rgb = (text: string) => (text.match(/[0-9.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = (c: number[]) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const ratio = (Math.max(lum(rgb(hot.color)), lum(rgb(hot.bg))) + 0.05) / (Math.min(lum(rgb(hot.color)), lum(rgb(hot.bg))) + 0.05);
    report.push({ size: size.tag, step: 'nút Gọi hotline ở màn thành công', color: hot.color, background: hot.bg, tuongPhan: Number(ratio.toFixed(2)), dat: ratio >= 4.5 });

    const rows = await db.query<{ id: string; name: string; product: string; message: string }>('SELECT id,name,product,message FROM inquiries WHERE name=$1 ORDER BY consent_at DESC LIMIT 1', [testName]);
    const row = rows.rows[0];
    if (row) createdIds.push(row.id);
    report.push({
      size: size.tag, step: 'bản ghi trong cơ sở dữ liệu', found: !!row, product: row?.product,
      coTinhThanh: !!row?.message.includes('Tỉnh thành: Phú Thọ'), coQuyMo: !!row?.message.includes('Quy mô: 15 – 30 con lợn'), message: row?.message,
    });
    if (row) {
      const deleted = await db.query('DELETE FROM inquiries WHERE id=$1', [row.id]);
      report.push({ size: size.tag, step: 'xoá bản ghi thử theo id', deleted: deleted.rowCount });
    }
    report.push({ size: size.tag, consoleErrors: errors });
    await browser.close();
  }
} finally {
  // Dự phòng: bản ghi thử còn sót (nếu kịch bản dừng giữa chừng) bị xoá theo id đã biết.
  for (const id of createdIds) await db.query('DELETE FROM inquiries WHERE id=$1', [id]).catch(() => {});
  await (db as unknown as { end?: () => Promise<void> }).end?.();
}
writeFileSync(join(out, 'dung-thu-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
