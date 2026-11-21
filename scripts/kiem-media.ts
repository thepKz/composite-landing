// Đọc: kiểm từng ảnh trong thư viện có tải được không.
import { db } from '../src/lib/db';
const rows = (await db.query<{ id: string; mime_type: string; alt_text: string | null; original_name?: string }>("SELECT id, mime_type, alt AS alt_text FROM media_assets ORDER BY created_at")).rows;
let bad = 0;
for (const r of rows) {
  const res = await fetch(`${process.env.SITE_URL}/api/media/${r.id}`);
  const len = (await res.arrayBuffer()).byteLength;
  if (res.status !== 200 || len < 1000) { bad++; console.log('LOI', res.status, len, r.id, r.mime_type, (r.alt_text ?? '').slice(0, 50)); }
}
console.log('tổng', rows.length, 'lỗi', bad);
console.log(JSON.stringify((await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='media_assets'")).rows.map(r => r.column_name)));
await db.end();
