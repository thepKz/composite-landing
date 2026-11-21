// Điền phần "Thông tin website" (bảng site_settings, khoá company) bằng dữ kiện trong src/lib/site-facts.ts,
// CHỈ cho ô đang trống (và địa chỉ đang đúng chữ "Phú Thọ"). Không ghi đè ô người dùng đã tự điền. Chạy lại không đổi thêm.
// Chạy: node --env-file=.env --import tsx scripts/apply-company-settings.ts
import { db } from '../src/lib/db';
import { facts } from '../src/lib/site-facts';

type Settings = Record<string, string>;
const defaults: Settings = {
  name: facts.shortName,
  phone: facts.hotlines[0].display,
  phone2: facts.hotlines[1]?.display ?? '',
  email: facts.email,
  address: facts.address,
  // Màn Thông tin website và máy chủ yêu cầu dạng https://zalo.me/<số>.
  zalo: `https://zalo.me/${facts.zalo.replace(/\D/g, '')}`,
  hours: facts.hours,
};

const row = (await db.query("SELECT value FROM site_settings WHERE key='company'")).rows[0];
const current: Settings = { ...(row?.value ?? {}) };
const next: Settings = { ...current };
const changes: string[] = [];

for (const [key, fallback] of Object.entries(defaults)) {
  const value = String(current[key] ?? '').trim();
  const blank = key === 'address' ? !value || value === 'Phú Thọ' : !value;
  if (blank && fallback) { next[key] = fallback; changes.push(`${key}: "${value}" -> "${fallback}"`); }
}
if (!String(next.description ?? '').trim()) { next.description = 'Bồn bể composite cho dân dụng, chăn nuôi, thủy sản và công nghiệp.'; changes.push('description: đã điền mô tả ngắn'); }

if (!changes.length) console.log('Không có ô nào cần đổi. Giữ nguyên.');
else {
  await db.query("INSERT INTO site_settings(key,value) VALUES ('company',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()", [JSON.stringify(next)]);
  console.log('Đã đổi:\n  ' + changes.join('\n  '));
}
await db.end();
