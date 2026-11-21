// Đếm cụm chữ theo cỡ trên các trang công khai và liệt kê nơi còn 14px hoặc dưới 14px, cùng màu chữ khác mực đậm trên nền sáng.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --import tsx scripts/do-chu.ts <tệp-json-ra>
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const origin = process.env.SITE_URL!;
const out = process.argv[2];
const paths = ['/', '/gioi-thieu', '/san-pham', '/san-pham/be-biogas-composite', '/san-pham/be-phot-va-xu-ly-nuoc-thai', '/du-an', '/tin-tuc', '/lien-he', '/huong-dan-dat-hang', '/hoi-dap', '/chinh-sach-bao-hanh', '/chinh-sach-bao-mat'];
const script = `(() => {
  const rows = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.split(' ').filter(Boolean).join(' ');
    if (!text) continue;
    const el = node.parentElement;
    if (!el || el.closest('script,style,noscript,.tl-sr,.art-toast')) continue;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (!box.width || !box.height || style.visibility === 'hidden' || style.display === 'none') continue;
    rows.push({ size: Math.round(parseFloat(style.fontSize) * 10) / 10, color: style.color, tag: el.tagName.toLowerCase(), cls: String(el.className).split(' ')[0] || '', text: text.slice(0, 30) });
  }
  return rows;
})()`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report: Record<string, unknown> = {};
for (const width of [1366, 390]) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 768 } });
  let under14 = 0, at14 = 0, at15 = 0, big = 0;
  const where14 = new Map<string, number>();
  const colors = new Map<string, number>();
  for (const path of paths) {
    await page.goto(origin + path, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
    await page.waitForTimeout(400);
    const rows = (await page.evaluate(script)) as { size: number; color: string; tag: string; cls: string; text: string }[];
    for (const row of rows) {
      if (row.size < 14) { under14++; where14.set(`<14 ${row.tag}.${row.cls}: ${row.text}`, (where14.get(`<14 ${row.tag}.${row.cls}: ${row.text}`) ?? 0) + 1); }
      else if (row.size < 15) { at14++; const key = `14 ${row.tag}.${row.cls}`; where14.set(key, (where14.get(key) ?? 0) + 1); }
      else if (row.size < 16) at15++; else big++;
      colors.set(row.color, (colors.get(row.color) ?? 0) + 1);
    }
  }
  report[String(width)] = { duoi14: under14, dung14: at14, dung15: at15, tu16: big, noi14: [...where14.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25), mauChu: [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12) };
  await page.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(report, null, 1));
for (const w of ['1366', '390']) { const r = report[w] as { duoi14: number; dung14: number; dung15: number; tu16: number }; console.log(w, 'dưới 14:', r.duoi14, '| đúng 14:', r.dung14, '| 15:', r.dung15, '| từ 16:', r.tu16); }
