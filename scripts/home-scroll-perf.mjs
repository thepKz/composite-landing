// Đo khung rớt khi cuộn hết trang chủ ở 1366x768, 2400 px/s. In số khung trên 33 ms, lớn nhất, trung vị, và vị trí cuộn của các khung rớt.
import { chromium } from '@playwright/test';
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const runs = Number(process.env.RUNS ?? 3);
const browser = await chromium.launch({ channel: 'chrome' });
for (let r = 0; r < runs; r++) {
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  if (process.env.THROTTLE) { const c = await page.context().newCDPSession(page); await c.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.THROTTLE) }); }
  await page.goto(origin + '/', { waitUntil: process.env.COLD ? 'domcontentloaded' : 'networkidle' }); await page.waitForTimeout(Number(process.env.WAIT ?? 2500));
  if (process.env.CSS) await page.addStyleTag({ content: process.env.CSS });
  if (process.env.WARM) { await page.evaluate(async () => { const imgs = [...document.querySelectorAll('img')]; imgs.forEach(i => { i.loading = 'eager'; }); await Promise.all(imgs.map(i => i.decode().catch(() => {}))); }); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300); }
  const res = await page.evaluate(() => new Promise(done => {
    const total = document.documentElement.scrollHeight - innerHeight, speed = 2400; const frames = []; let last = performance.now(), start = last;
    const tick = now => { const y = Math.min(total, ((now - start) / 1000) * speed); scrollTo(0, y); frames.push({ dt: now - last, y: Math.round(y) }); last = now; if (y < total) requestAnimationFrame(tick); else done(frames); };
    requestAnimationFrame(tick);
  }));
  const dts = res.map(f => f.dt).sort((a, b) => a - b);
  const slow = res.filter(f => f.dt > 33);
  console.log(`lần ${r + 1}: ${res.length} khung, trung vị ${dts[Math.floor(dts.length / 2)].toFixed(1)} ms, rớt >33ms: ${slow.length}, lớn nhất ${Math.max(...dts).toFixed(0)} ms`, JSON.stringify(slow.map(s => [Math.round(s.dt), s.y])));
  await page.context().close();
}
await browser.close();
