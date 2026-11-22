import { db } from '../../src/lib/db';
const q=async(s:string)=>(await db.query(s)).rows;
console.log(JSON.stringify({
 posts:(await q('select count(*)::int c from posts'))[0].c,
 inquiries:(await q('select count(*)::int c from inquiries'))[0].c,
 media:(await q('select count(*)::int c from media_assets'))[0].c,
 users:(await q('select count(*)::int c from users'))[0].c,
 pm:(await q('select count(*)::int c from product_media'))[0].c,
 covers:await q('select slug,cover_id,is_published,updated_at from products order by slug'),
 images:(await q("select count(*)::int c from media_assets where mime_type like 'image/%'"))[0].c,
}));
await db.end();
