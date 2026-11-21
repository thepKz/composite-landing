// Chụp các trạng thái tương tác của trang sản phẩm: chọn quy mô, bảng sáng dòng, thư viện ảnh phóng to,
// thanh mua dính, bảng dạng thẻ ở điện thoại, trạng thái bộ lọc danh mục. Có chuyển động thật (không giảm chuyển động).
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/shots-trang-phu.ts <thư-mục-ra>
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
if (!out) { console.error('Thiếu thư mục ra.'); process.exit(1); }
const origin = process.env.SITE_URL!;
mkdirSync(out, { recursive: true });
const checks: Record<string, unknown>[] = [];
const errors: string[] = [];

async function open(page: Page, path: string) {
  const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(700);
  return response?.status();
}
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const size of [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, isMobile: size.width < 500, hasTouch: size.width < 500 });
    const page = await context.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(`${size.tag}: ${m.text().slice(0, 200)}`); });
    page.on('pageerror', e => errors.push(`${size.tag} pageerror: ${e.message.slice(0, 200)}`));

    // 1. Chọn quy mô trên biogas
    await open(page, '/san-pham/be-biogas-composite');
    await page.screenshot({ path: join(out, `quy-mo-0-chua-chon-${size.tag}.png`) });
    await page.getByRole('button', { name: '15 – 30 con lợn' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(out, `quy-mo-1-da-chon-${size.tag}.png`) });
    const active = await page.evaluate(() => ({
      rows: document.querySelectorAll('.tp-table tbody tr.is-active').length,
      lead: document.querySelector('.tp-table tbody tr.is-active th')?.textContent,
      suggest: document.querySelector('.tp-scale-answer strong')?.textContent,
    }));
    await page.evaluate(() => document.getElementById('tp-scale-table')!.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(out, `quy-mo-2-bang-${size.tag}.png`) });
    const before = await page.evaluate(() => window.scrollY);
    await page.getByRole('button', { name: 'Nhận báo giá' }).first().click();
    await page.waitForTimeout(1200);
    const formTop = await page.evaluate(() => Math.round(document.getElementById('tu-van')!.getBoundingClientRect().top));
    const prefilled = await page.evaluate(() => (document.querySelector('#tu-van textarea[name="message"]') as HTMLTextAreaElement | null)?.value ?? null);
    await page.screenshot({ path: join(out, `quy-mo-3-cuon-toi-form-${size.tag}.png`) });
    checks.push({ size: size.tag, step: 'chọn quy mô', ...active, scrolledFrom: before, formTopAfterClick: formTop, prefilled, overflowX: await overflow(page) });

    // 2. Thư viện ảnh phóng to và điều hướng
    await open(page, '/san-pham/be-biogas-composite');
    await page.getByRole('button', { name: 'Phóng to' }).click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: join(out, `anh-phong-to-1-${size.tag}.png`) });
    const first = await page.evaluate(() => document.querySelector('.tp-lightbox img')?.getAttribute('src'));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(450);
    const second = await page.evaluate(() => document.querySelector('.tp-lightbox img')?.getAttribute('src'));
    await page.screenshot({ path: join(out, `anh-phong-to-2-${size.tag}.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const closed = await page.evaluate(() => !(document.querySelector('.tp-lightbox') as HTMLDialogElement).open);
    const focusBack = await page.evaluate(() => document.activeElement?.textContent?.trim());
    checks.push({ size: size.tag, step: 'ảnh phóng to', changedByArrow: first !== second, closedByEscape: closed, focusReturnedTo: focusBack });

    if (size.width > 1000) {
      // 3. Thanh mua dính
      await open(page, '/san-pham/be-biogas-composite');
      await page.mouse.wheel(0, 1500);
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(out, `thanh-dinh-${size.tag}.png`) });
      checks.push({ size: size.tag, step: 'thanh dính', visible: await page.evaluate(() => document.querySelector('.tp-sticky')?.classList.contains('is-visible')) });
      // 4. Bộ lọc danh mục
      await open(page, '/san-pham');
      await page.getByRole('button', { name: /^Thủy sản/ }).click();
      await page.waitForTimeout(700);
      await page.screenshot({ path: join(out, `danh-muc-loc-thuy-san-${size.tag}.png`) });
      checks.push({ size: size.tag, step: 'lọc thủy sản', cards: await page.locator('.tp-card').count() });
    } else {
      await open(page, '/san-pham/be-phot-composite');
      await page.getByRole('button', { name: 'Gia đình 3 – 6 người' }).click();
      await page.waitForTimeout(400);
      await page.evaluate(() => document.getElementById('tp-scale-table')!.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(out, `bang-the-dien-thoai-${size.tag}.png`) });
      checks.push({ size: size.tag, step: 'bảng dạng thẻ', overflowX: await overflow(page) });
    }

    // 5. Trạng thái 404 trả đúng mã
    checks.push({ size: size.tag, step: '404', status: await open(page, '/duong-dan-khong-ton-tai') });
    await context.close();
  }
} finally {
  await browser.close();
  writeFileSync(join(out, 'tuong-tac.json'), JSON.stringify({ checks, errors }, null, 2));
  console.log(JSON.stringify({ checks, errors }, null, 2));
}
