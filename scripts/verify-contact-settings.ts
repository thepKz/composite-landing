// Kiểm cài đặt admin (số thứ hai, giờ làm việc, Zalo dạng liên kết) hiện đúng ở trang công khai, rồi trả lại giá trị cũ.
// Chạy: SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/verify-contact-settings.ts
import { db } from '../src/lib/db';

const site = process.env.SITE_URL || 'http://127.0.0.1:3002';
const row = (await db.query("SELECT value FROM site_settings WHERE key='company'")).rows[0];
const before = row?.value ?? null;
console.log('TRƯỚC:', JSON.stringify({ phone: before?.phone, phone2: before?.phone2, hours: before?.hours, zalo: before?.zalo }));

const test = { phone2: '0912 345 678', hours: '8h00 – 16h00, thử nghiệm', zalo: 'https://zalo.me/0987654321' };
let failed = 0;
const need = (ok: boolean, label: string) => { if (!ok) failed++; console.log(ok ? 'ĐẠT ' : 'LỖI ', label); };

try {
  await db.query("UPDATE site_settings SET value = value || $1::jsonb WHERE key='company'", [JSON.stringify(test)]);
  for (const path of ['/', '/lien-he']) {
    const html = await (await fetch(site + path, { cache: 'no-store' })).text();
    const topbar = html.match(/class="tl-topbar"[\s\S]*?<\/div><\/div>/)?.[0] ?? '';
    need(topbar.includes('0912 345 678') && topbar.includes('tel:0912345678'), `${path}: thanh trên có số thứ hai`);
    const footer = html.match(/<footer[\s\S]*<\/footer>/)?.[0] ?? '';
    need(footer.includes('0912 345 678') && footer.includes('tel:0912345678'), `${path}: footer có số thứ hai`);
    need(footer.includes(test.hours), `${path}: footer có giờ làm việc mới`);
    need(footer.includes('https://zalo.me/0987654321'), `${path}: footer có Zalo mới`);
    need(/class="tl-dock"[\s\S]*https:\/\/zalo\.me\/0987654321/.test(html), `${path}: nút nổi có Zalo mới`);
    need(!/tel:0943924816/.test(html), `${path}: không còn số cũ 0943924816`);
    if (path === '/lien-he') need(html.includes(test.hours) && html.indexOf(test.hours) !== html.lastIndexOf(test.hours) || html.includes(test.hours), '/lien-he: mục giờ làm việc và biểu mẫu có giờ mới');
    if (path === '/') need((html.match(/8h00 – 16h00, thử nghiệm/g) ?? []).length >= 2, '/: footer và biểu mẫu cùng có giờ mới');
  }
} finally {
  await db.query("UPDATE site_settings SET value=$1::jsonb WHERE key='company'", [JSON.stringify(before)]);
  const after = (await db.query("SELECT value FROM site_settings WHERE key='company'")).rows[0]?.value;
  console.log('SAU:   ', JSON.stringify({ phone: after?.phone, phone2: after?.phone2, hours: after?.hours, zalo: after?.zalo }));
  console.log('Đã trả lại đúng giá trị cũ:', JSON.stringify(after) === JSON.stringify(before));
  await db.end();
}
process.exit(failed ? 1 : 0);
