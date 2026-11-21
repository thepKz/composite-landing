// Đếm dữ liệu hiện có để đối chiếu trước và sau khi kiểm. Chỉ đọc.
import { db } from '../src/lib/db';
const q = async (s: string) => (await db.query(s)).rows;
console.log('posts', JSON.stringify(await q('SELECT count(*)::int n FROM posts')));
console.log('inquiries', JSON.stringify(await q('SELECT count(*)::int n FROM inquiries')).slice(0, 100));
console.log('media', JSON.stringify(await q('SELECT count(*)::int n FROM media_assets')));
console.log('test users', JSON.stringify(await q("SELECT count(*)::int n FROM users WHERE email LIKE '%@example.test'")));
console.log('all users', JSON.stringify(await q('SELECT count(*)::int n FROM users')));
try { console.log('settings', JSON.stringify(await q('SELECT * FROM site_settings LIMIT 5')).slice(0, 600)); } catch (e) { console.log('settings err', String(e).slice(0, 100)); }
await db.end();
