// Vòng 5: thử bộ xem ảnh sản phẩm bằng Playwright. Chạy: node scripts/kiem-bo-xem-anh-v5.mjs
import { chromium } from '@playwright/test';
const origin = process.env.SITE_URL || 'http://127.0.0.1:3002';
const slugs = ['be-biogas-composite', 'be-nuoi-trong-thuy-san', 'thung-cho-tom-ca', 'xe-gom-rac', 'composite-theo-yeu-cau'];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const res = []; const ok = (name, pass, extra = '') => { res.push({ name, pass, extra }); console.log(pass ? 'ĐẠT ' : 'LỖI ', name, extra); };
const errs = [];
for (const [w, h, touch] of [[1366, 768, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch, reducedMotion: 'reduce' });
  const page = await ctx.newPage(); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
  for (const slug of slugs) {
    const tag = `${w} ${slug}`;
    await page.goto(`${origin}/san-pham/${slug}`, { waitUntil: 'networkidle' });
    const g = page.locator('.pg').first();
    const count = +(await g.getAttribute('data-count'));
    const first = g.locator('.pg-photo');
    ok(`${tag}: số ảnh`, count >= 1, String(count));
    ok(`${tag}: ảnh đầu tải ngay`, (await first.getAttribute('loading')) === 'eager' && (await first.getAttribute('fetchpriority')) === 'high' && await first.evaluate(i => i.complete && i.naturalWidth > 0));
    if (count > 1) {
      const thumbs = g.locator('.pg-thumbs button');
      ok(`${tag}: dải ảnh nhỏ đủ`, (await thumbs.count()) === count);
      const lazyThumbs = await g.locator('.pg-thumbs img[loading="lazy"]').count();
      ok(`${tag}: ảnh nhỏ xa tải lười`, count <= 4 || lazyThumbs > 0, `lười ${lazyThumbs}`);
      const srcs = await g.locator('.pg-thumbs img').evaluateAll(a => a.map(i => i.getAttribute('src')));
      ok(`${tag}: không lặp ảnh`, new Set(srcs).size === srcs.length);
      const txt = () => g.locator('.pg-stage .pg-count').innerText();
      await thumbs.nth(2).click(); await page.waitForTimeout(150);
      ok(`${tag}: bấm ảnh nhỏ thứ 3`, (await txt()) === `3 / ${count}`, await txt());
      const mainSrc = await g.locator('.pg-photo').getAttribute('src');
      ok(`${tag}: ảnh chính đổi theo ảnh nhỏ`, (await thumbs.nth(2).locator('img').getAttribute('src')).replace('-t.webp', '') === mainSrc.replace('-m.webp', ''));
      await g.locator('.pg-arrow.is-next').first().click(); await page.waitForTimeout(100);
      ok(`${tag}: mũi tên sau`, (await txt()) === `${(3 % count) + 1} / ${count}`, await txt());
      await g.locator('.pg-arrow.is-prev').first().click(); await page.waitForTimeout(100);
      ok(`${tag}: mũi tên trước`, (await txt()) === `3 / ${count}`);
      await g.locator('.pg-stage').focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
      ok(`${tag}: phím phải`, (await txt()) === `${(3 % count) + 1} / ${count}`);
      await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(100);
      ok(`${tag}: phím trái`, (await txt()) === `2 / ${count}`, await txt());
      // vòng quanh
      await thumbs.nth(0).click(); await g.locator('.pg-arrow.is-prev').first().click(); await page.waitForTimeout(100);
      ok(`${tag}: vòng về ảnh cuối`, (await txt()) === `${count} / ${count}`);
      await thumbs.nth(0).click();
      const bt = await thumbs.first().boundingBox(); ok(`${tag}: vùng bấm ảnh nhỏ >=44`, bt.width >= 44 && bt.height >= 44, `${Math.round(bt.width)}x${Math.round(bt.height)}`);
      const ar = await g.locator('.pg-arrow').first().boundingBox(); ok(`${tag}: vùng bấm mũi tên >=44`, ar.width >= 44 && ar.height >= 44);
      if (touch) {
        const stage = g.locator('.pg-stage'); const box = await stage.boundingBox();
        await stage.evaluate((el, [x, y]) => { const mk = (t, cx) => el.dispatchEvent(new PointerEvent(t, { pointerType: 'touch', clientX: cx, clientY: y, bubbles: true, isPrimary: true })); mk('pointerdown', x + 250); mk('pointerup', x + 80); }, [box.x, box.y + box.height / 2]);
        await page.waitForTimeout(150); ok(`${tag}: vuốt trái sang ảnh sau`, (await txt()) === `2 / ${count}`, await txt());
        await stage.evaluate((el, [x, y]) => { const mk = (t, cx) => el.dispatchEvent(new PointerEvent(t, { pointerType: 'touch', clientX: cx, clientY: y, bubbles: true, isPrimary: true })); mk('pointerdown', x + 60); mk('pointerup', x + 260); }, [box.x, box.y + box.height / 2]);
        await page.waitForTimeout(150); ok(`${tag}: vuốt phải về ảnh trước`, (await txt()) === `1 / ${count}`);
      }
    }
    // phóng to
    const expand = g.locator('.pg-expand'); await expand.click(); await page.waitForTimeout(250);
    const dlg = page.locator('dialog.pg-lightbox'); ok(`${tag}: mở phóng to`, await dlg.evaluate(d => d.open));
    ok(`${tag}: tiêu điểm vào nút đóng`, await page.evaluate(() => document.activeElement?.classList.contains('pg-close')));
    const bw = await dlg.locator('img').first().boundingBox(); const vp = page.viewportSize();
    ok(`${tag}: ảnh phóng to nằm trong màn`, bw.x >= -1 && bw.y >= -1 && bw.x + bw.width <= vp.width + 1 && bw.y + bw.height <= vp.height + 1, `${Math.round(bw.width)}x${Math.round(bw.height)}`);
    if (count > 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100); ok(`${tag}: phím mũi tên trong phóng to`, (await dlg.locator('.pg-count').innerText()) === `2 / ${count}`); }
    // giữ tiêu điểm: Tab nhiều lần vẫn trong hộp
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    ok(`${tag}: Tab giữ trong hộp`, await page.evaluate(() => !!document.activeElement?.closest('dialog.pg-lightbox')));
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    ok(`${tag}: Esc đóng`, !(await dlg.evaluate(d => d.open)));
    ok(`${tag}: tiêu điểm về nút phóng to`, await page.evaluate(() => document.activeElement?.classList.contains('pg-expand')));
    ok(`${tag}: không tràn ngang`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  await ctx.close();
}
await b.close();
console.log('lỗi console:', errs.length, errs.slice(0, 3));
const bad = res.filter(r => !r.pass); console.log(`TỔNG ${res.length - bad.length}/${res.length} đạt`); if (bad.length) { console.log(bad.map(x => x.name + ' ' + x.extra).join('\n')); process.exit(1); }
