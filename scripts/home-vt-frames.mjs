// Quay các khung hình khi chuyển trang (thẻ sản phẩm sang chi tiết) bằng CDP screencast, đo độ sáng trung bình từng khung.
// Khung "trắng trơn" là khung có >92% điểm gần trắng. Chạy: node scripts/home-vt-frames.mjs [path] [selector]
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const origin = process.env.SITE_URL ?? 'http://127.0.0.1:3002';
const from = process.argv[2] ?? '/'; const sel = process.argv[3] ?? '.tl-lead';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
await page.goto(origin + from, { waitUntil: 'networkidle' }); await page.waitForTimeout(800);
await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await page.waitForTimeout(900);
const cdp = await page.context().newCDPSession(page); const frames = [];
cdp.on('Page.screencastFrame', f => { frames.push({ t: f.metadata.timestamp, data: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 50, everyNthFrame: 1 });
await page.waitForTimeout(150);
const t0 = Date.now(); await page.locator(sel).first().click(); await page.waitForURL(/\/san-pham\//); await page.waitForTimeout(1500);
await cdp.send('Page.stopScreencast');
const out = [];
for (const f of frames) {
  const { data, info } = await sharp(Buffer.from(f.data, 'base64')).resize(160).raw().toBuffer({ resolveWithObject: true });
  let white = 0, sum = 0; const n = info.width * info.height;
  for (let i = 0; i < data.length; i += info.channels) { const l = (data[i] + data[i + 1] + data[i + 2]) / 3; sum += l; if (l > 232) white++; }
  out.push({ ms: Math.round((f.t - frames[0].t) * 1000), mean: Math.round(sum / n), white: +(white / n).toFixed(2) });
}
console.log(out.length, 'khung. Trắng trơn (>92% gần trắng):', out.filter(o => o.white > 0.92).length);
console.log(out.map(o => `${o.ms}ms mean${o.mean} trắng${o.white}`).join('\n'));
await browser.close();
