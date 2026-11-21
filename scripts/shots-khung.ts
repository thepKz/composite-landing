// Chụp các trạng thái của khung chung và trang chủ mà shots.ts không chụp được:
// menu xổ xuống, ngăn kéo điện thoại, banner cảnh 2 và 3, biểu mẫu từng bước, lỗi, thành công, lỗi mạng,
// bản giảm chuyển động và khi tắt JavaScript. Yêu cầu gửi biểu mẫu được chặn ở trình duyệt, không ghi vào cơ sở dữ liệu.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/shots-khung.ts <thư-mục-ra>
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
const origin = process.env.SITE_URL;
if (!out || !origin) { console.error('Thiếu thư mục ra hoặc SITE_URL.'); process.exit(1); }
mkdirSync(out, { recursive: true });

const sizes = [{ tag: '1366', width: 1366, height: 768 }, { tag: '390', width: 390, height: 844 }];
const report: Record<string, unknown>[] = [];

async function settle(page: Page, ms = 700) { await page.waitForTimeout(ms); }
async function measure(page: Page) {
  return page.evaluate(() => {
    const wide = [...document.querySelectorAll<HTMLElement>('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.classList.contains('tl-hero-slide-image'); }).slice(0, 5).map(el => `${el.tagName}.${String(el.className).slice(0, 40)}`);
    const hiddenReveal = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(el => getComputedStyle(el).opacity === '0').map(el => String(el.className).slice(0, 30));
    const smallText = [...document.querySelectorAll<HTMLElement>('.public-site main p, .public-site main li, .public-site main dd, .public-site footer p, .public-site footer a')].filter(el => el.offsetParent && el.textContent?.trim() && parseFloat(getComputedStyle(el).fontSize) < 14).length;
    const smallTargets = [...document.querySelectorAll<HTMLElement>('header a, header button, .tl-dock a, .tl-form button, .tl-hero button, .tl-hero a')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < (innerWidth < 600 ? 44 : 36); }).map(el => `${el.tagName}.${String(el.className).slice(0, 30)}:${Math.round(el.getBoundingClientRect().height)}`).slice(0, 8);
    const banned = (document.body.innerText.match(/[·—;!]|&nbsp;| /g) || []).length;
    return { scrollWidth: document.documentElement.scrollWidth, innerWidth, wide, hiddenReveal, smallText, smallTargets, banned };
  });
}

for (const size of sizes) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, hasTouch: size.width < 600 });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text().slice(0, 300)); });
  page.on('response', response => { if (response.status() >= 400) errors.push('HTTP ' + response.status() + ' ' + response.url().slice(0, 160)); });
  page.on('pageerror', error => errors.push(String(error).slice(0, 300)));
  const shot = async (name: string, fullPage = false) => { await page.screenshot({ path: join(out, `${name}-${size.tag}.png`), fullPage }); };

  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await settle(page, 1500);
  await shot('khung-home-fold');

  // Menu xổ xuống hoặc ngăn kéo
  if (size.width >= 961) {
    await page.getByRole('button', { name: 'Sản phẩm', exact: true }).first().click();
    await settle(page, 450);
    await shot('khung-menu-san-pham');
    await page.keyboard.press('Escape');
    await settle(page, 300);
    const focusBack = await page.evaluate(() => document.activeElement?.textContent?.includes('Sản phẩm') ?? false);
    report.push({ size: size.tag, check: 'Esc đóng menu và trả tiêu điểm', ok: focusBack });
  } else {
    await page.getByRole('button', { name: 'Mở menu' }).click();
    await settle(page, 600);
    await shot('khung-ngan-keo');
    await page.getByRole('button', { name: 'Sản phẩm', exact: true }).click();
    await settle(page, 500);
    await shot('khung-ngan-keo-san-pham');
    const inside = await page.evaluate(() => !!document.activeElement?.closest('#tl-drawer'));
    for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
    const trapped = await page.evaluate(() => !!document.activeElement?.closest('#tl-drawer'));
    await page.keyboard.press('Escape');
    await settle(page, 500);
    const returned = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Mở menu');
    report.push({ size: size.tag, check: 'Ngăn kéo: tiêu điểm vào trong, Tab giữ bên trong, Esc đóng và trả tiêu điểm', inside, trapped, returned });
  }

  // Banner cảnh 2 và 3
  for (const scene of [2, 3]) {
    await page.getByRole('button', { name: new RegExp(`^Cảnh ${scene}:`) }).click();
    await settle(page, 2800);
    await shot(`khung-banner-canh-${scene}`);
  }

  // Cuộn qua trang chủ để chụp từng khối và đo
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 400);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += size.height * 0.8) { await page.evaluate(top => window.scrollTo(0, top), y); await page.waitForTimeout(160); }
  await settle(page, 900);
  report.push({ size: size.tag, screen: 'home sau khi cuộn hết', ...(await measure(page)) });
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.tl-metrics')!.getBoundingClientRect().top + scrollY - 200));
  await settle(page, 800);
  await shot('khung-home-so-lieu');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.tl-why')!.getBoundingClientRect().top + scrollY - 100));
  await settle(page, 1000);
  await shot('khung-home-so-sanh');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.tl-products')!.getBoundingClientRect().top + scrollY - 80));
  await settle(page, 1000);
  await shot('khung-home-san-pham');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.tl-faq')!.getBoundingClientRect().top + scrollY - 80));
  await settle(page, 800);
  await page.locator('.tl-faq-item summary').nth(1).click();
  await settle(page, 700);
  await shot('khung-home-hoi-dap');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.tl-news')?.getBoundingClientRect().top! + scrollY - 80 || 0));
  await settle(page, 800);
  await shot('khung-home-tin-tuc');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('.tl-process')!.getBoundingClientRect().top + scrollY - 80));
  await settle(page, 1200);
  await shot('khung-home-quy-trinh');

  // Biểu mẫu
  await page.route('**/api/inquiries', route => route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' }));
  await page.evaluate(() => document.querySelector('#tu-van')!.scrollIntoView({ block: 'start' }));
  await settle(page, 900);
  await shot('khung-form-buoc-1');
  const form = page.locator('.tl-form').first();
  await form.getByRole('button', { name: 'Tiếp tục' }).click();
  await settle(page, 500);
  await shot('khung-form-loi-buoc-1');
  await form.getByLabel('Họ và tên').fill('Nguyễn Văn Thử');
  await form.getByLabel('Số điện thoại có Zalo').fill('12345');
  await form.getByLabel('Tỉnh thành').fill('Phú Thọ');
  await form.getByLabel('Họ và tên').focus();
  await form.getByLabel('Số điện thoại có Zalo').blur();
  await settle(page, 300);
  await shot('khung-form-loi-so-dien-thoai');
  await form.getByLabel('Số điện thoại có Zalo').fill('0912345678');
  await form.getByRole('button', { name: 'Tiếp tục' }).click();
  await settle(page, 500);
  await shot('khung-form-buoc-2');
  await form.locator('label.tl-choice', { hasText: 'Bể biogas composite' }).click();
  await settle(page, 700);
  const radio = form.getByRole('radio', { name: /15 – 30 con lợn/ });
  await radio.focus();
  await page.keyboard.press('Space');
  await settle(page, 500);
  await shot('khung-form-buoc-3');
  await form.getByRole('button', { name: 'Tiếp tục' }).click();
  await settle(page, 600);
  await shot('khung-form-buoc-4');
  // quay lại không mất dữ liệu
  await form.getByRole('button', { name: 'Quay lại' }).click();
  await settle(page, 400);
  const keptScale = await form.locator('input[type=radio]:checked').count();
  await form.getByRole('button', { name: 'Tiếp tục' }).click();
  await settle(page, 400);
  await form.getByRole('button', { name: 'Nhận báo giá', exact: true }).click();
  await settle(page, 400);
  await shot('khung-form-loi-dong-y');
  await form.getByRole('checkbox').check();
  // lỗi mạng giữ nguyên dữ liệu
  await page.unroute('**/api/inquiries');
  await page.route('**/api/inquiries', route => route.abort('failed'));
  await form.getByRole('button', { name: 'Nhận báo giá', exact: true }).click();
  await settle(page, 600);
  await shot('khung-form-loi-mang');
  const stillThere = await form.getByRole('checkbox').isChecked();
  await page.unroute('**/api/inquiries');
  await page.route('**/api/inquiries', route => route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' }));
  await form.getByRole('button', { name: 'Nhận báo giá', exact: true }).click();
  await settle(page, 900);
  await shot('khung-form-thanh-cong');
  report.push({ size: size.tag, check: 'Biểu mẫu: quay lại giữ lựa chọn, lỗi mạng giữ dữ liệu', keptScale, stillThere });

  // Nút ghim
  await page.evaluate(() => window.scrollTo(0, 1500));
  await settle(page, 700);
  await shot('khung-nut-ghim');

  // Trang phụ để xem header và footer
  await page.goto(origin + '/gioi-thieu', { waitUntil: 'networkidle' });
  await settle(page, 900);
  await shot('khung-trang-phu-fold');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await settle(page, 1200);
  await shot('khung-footer');
  report.push({ size: size.tag, screen: 'gioi-thieu cuối trang', ...(await measure(page)) });
  report.push({ size: size.tag, consoleErrors: errors });
  await browser.close();

  // Giảm chuyển động
  const reducedBrowser = await chromium.launch({ channel: 'chrome', headless: true });
  const reduced = await reducedBrowser.newContext({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(origin + '/', { waitUntil: 'networkidle' });
  await reducedPage.waitForTimeout(1200);
  await reducedPage.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 60)); } scrollTo(0, 0); });
  await reducedPage.waitForTimeout(600);
  const heroMoving = await reducedPage.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running' && (animation as CSSAnimation).animationName === 'tl-fill').length);
  report.push({ size: size.tag, mode: 'giảm chuyển động', ...(await measure(reducedPage)), heroMoving });
  await reducedPage.screenshot({ path: join(out, `khung-giam-chuyen-dong-${size.tag}.png`), fullPage: true });
  await reducedBrowser.close();

  // Tắt JavaScript
  const plainBrowser = await chromium.launch({ channel: 'chrome', headless: true });
  const plain = await plainBrowser.newContext({ viewport: { width: size.width, height: size.height }, javaScriptEnabled: false });
  const plainPage = await plain.newPage();
  await plainPage.goto(origin + '/', { waitUntil: 'load' });
  await plainPage.waitForTimeout(800);
  report.push({ size: size.tag, mode: 'tắt JavaScript', ...(await measure(plainPage).catch(() => ({ note: 'không đo được khi tắt JavaScript' }))) });
  await plainPage.screenshot({ path: join(out, `khung-khong-js-${size.tag}.png`), fullPage: true });
  await plainBrowser.close();
}

writeFileSync(join(out, 'khung-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
