import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { db } from '../src/lib/db';
import { mailConfigured } from '../src/lib/mail';

const origin = process.env.SITE_URL!;
const password = process.env.TEST_ADMIN_PASSWORD;
if (!password || process.env.AUTH_PROVIDER !== 'supabase') throw new Error('Set TEST_ADMIN_PASSWORD and AUTH_PROVIDER=supabase.');
const tag = `supabase-check-${randomUUID()}`;
let cookie = '';
const media: string[] = [];
let productId = '';
let checks = 0;
function check(value: unknown, label: string) { assert.ok(value, label); checks++; console.log(`PASS ${label}`); }
async function request(endpoint: string, method = 'GET', body?: unknown, authenticated = true) {
  return fetch(origin + endpoint, { method, headers: { Origin:origin, ...(authenticated ? { Cookie:cookie } : {}), ...(body ? { 'Content-Type':'application/json' } : {}) }, body:body ? JSON.stringify(body) : undefined, redirect:'manual' });
}
async function directUpload(bytes: Uint8Array, name: string, type: string, expected = 201) {
  const init = await request('/api/admin/media/upload','POST',{ name, type, size:bytes.length });
  check(init.status === 200, 'signed upload initialized');
  const target = await init.json();
  const cors = await fetch(target.url,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'apikey,content-type'}});
  check(cors.ok && ['*',origin].includes(cors.headers.get('access-control-allow-origin') || ''), 'storage permits browser upload CORS');
  const uploaded = await fetch(target.url,{method:'PUT',headers:{'Content-Type':type,apikey:target.publicKey},body:new Uint8Array(bytes)});
  check(uploaded.ok,'direct upload reached private storage');
  const done = await request('/api/admin/media/upload','PUT',{ticket:target.ticket});
  check(done.status === expected, `finalize validates bytes (${expected})`);
  if (expected !== 201) return null;
  const result = await done.json(); media.push(result.id);
  check((await request('/api/admin/media/upload','PUT',{ticket:target.ticket})).status === 409,'upload ticket cannot be replayed');
  return result;
}
try {
  const users = (await db.query('SELECT email FROM users')).rows;
  const email = process.env.TEST_ADMIN_EMAIL || (users.length === 1 ? users[0].email : undefined);
  if (!email) throw new Error('Set TEST_ADMIN_EMAIL.');
  check((await request('/api/admin/products','GET',undefined,false)).status === 401,'anonymous admin access denied');
  const login = await request('/api/auth/login','POST',{email,password},false);
  check(login.status === 200,'Supabase administrator login');
  cookie = login.headers.get('set-cookie')!.split(';')[0];
  check(Boolean(cookie),'HTTP-only app session issued');
  for (const page of ['/admin','/admin/san-pham','/admin/thu-vien','/admin/yeu-cau']) check((await request(page)).status === 200,`admin route ${page}`);
  const forbidden = await fetch(origin+'/api/admin/media/upload',{method:'POST',headers:{Cookie:cookie,Origin:'https://invalid.example','Content-Type':'application/json'},body:'{}'});
  check(forbidden.status === 403,'cross-origin write rejected');
  const bytes = await sharp(randomBytes(1500*1200*3),{raw:{width:1500,height:1200,channels:3}}).png().toBuffer();
  check(bytes.length > 4.5 * 1024 * 1024,'test upload exceeds Vercel request body limit');
  const picture = await directUpload(bytes,`${tag}.png`,'image/png');
  check((await request(`/api/media/${picture.id}`,'GET',undefined,false)).status === 404,'unpublished image remains private');
  const imageResponse = await request(`/api/media/${picture.id}`);
  check(imageResponse.status === 200 && (await imageResponse.arrayBuffer()).byteLength > 0,'authenticated image served from Supabase');
  const range = await fetch(origin+`/api/media/${picture.id}`,{headers:{Cookie:cookie,Range:'bytes=0-63'}});
  check(range.status === 206 && (await range.arrayBuffer()).byteLength === 64,'storage byte ranges preserved');
  const edited = await request(`/api/admin/media/${picture.id}/edit`,'POST',{rotate:90});
  check(edited.status === 201,'image editing persists new object');
  media.push((await edited.json()).id);
  await directUpload(new TextEncoder().encode('<svg onload="alert(1)"></svg>'),`${tag}-invalid.png`,'image/png',415);
  const created = await request('/api/admin/products','POST',{name:'Integration check',slug:tag,category:'Test',description:'Temporary integration verification product.',specifications:[],applications:[],cover_id:picture.id,media_ids:[picture.id],is_published:false,sort_order:9999});
  check(created.status === 200,'product saved with Supabase media');
  let product = await created.json(); productId = product.id;
  const updated = await request('/api/admin/products','POST',{...product,name:'Integration check updated'});
  check(updated.status === 200,'product update persisted');
  check((await request('/api/admin/products','POST',{...product,name:'Stale update'})).status === 409,'stale product update rejected');
  if (!mailConfigured()) {
    const inquiry = await request('/api/inquiries','POST',{name:tag,phone:'0900000000',product:'Integration check',message:'Temporary integration verification.',consent:'yes'},false);
    check(inquiry.status === 201,'inquiry persisted');
    check((await db.query('SELECT 1 FROM inquiries WHERE name=$1',[tag])).rowCount === 1,'inquiry exists in Supabase');
  } else console.log('SKIP inquiry submission: notification email configured.');
  for (const table of ['users','sessions','inquiries','media_assets']) {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${table}?select=*`,{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!}});
    check(response.status === 401 || response.status === 403,'anonymous Data API denied: '+table);
  }
  console.log(`${checks} integration checks passed.`);
} finally {
  if (productId) await db.query('DELETE FROM products WHERE id=$1',[productId]);
  for (const id of media.reverse()) check((await request(`/api/admin/media/${id}`,'DELETE')).status === 200,'temporary media removed');
  await db.query('DELETE FROM inquiries WHERE name=$1',[tag]);
  if (cookie) {
    check((await request('/api/auth/logout','POST')).status === 200,'logout succeeds');
    check((await request('/api/admin/products')).status === 401,'logged-out session denied');
  }
  await db.end();
}
