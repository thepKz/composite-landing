import assert from 'node:assert/strict';
import { randomUUID,randomBytes } from 'node:crypto';
import { unlink,mkdtemp,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';
import { uploadRoot } from '../src/lib/upload';

const origin=process.env.SITE_URL!;
const userId=randomUUID();const tag=`qa-${randomUUID()}`;const email=`${tag}@example.test`;const password=randomBytes(24).toString('hex');
const mediaIds:string[]=[];const postIds:string[]=[];const productIds:string[]=[];let cookie='';const temporary=await mkdtemp(path.join(tmpdir(),'thanhloi-cms-'));
let checks=0;
function check(value:unknown,message:string){assert.ok(value,message);checks++;console.log(`PASS ${message}`);}
async function request(url:string,method='GET',body?:unknown,authenticated=true){const headers:Record<string,string>={Origin:origin};if(authenticated)headers.Cookie=cookie;if(body!==undefined)headers['Content-Type']='application/json';return fetch(origin+url,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});}
async function upload(bytes:Uint8Array,name:string,type:string){const form=new FormData();form.append('file',new Blob([new Uint8Array(bytes)],{type}),name);const response=await fetch(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,Cookie:cookie},body:form});const result=await response.json();assert.equal(response.status,201,JSON.stringify(result));mediaIds.push(result.id);return result;}
try{
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)',[userId,email,'Kiểm tra CMS',await hashPassword(password)]);
  for(const endpoint of ['posts','media','products','settings','inquiries'])check((await request(`/api/admin/${endpoint}`,'GET',undefined,false)).status===401,`unauthenticated ${endpoint} denied`);
  const login=await request('/api/auth/login','POST',{email,password},false);check(login.status===200,'administrator login');cookie=login.headers.get('set-cookie')!.split(';')[0];
  check((await fetch(origin+'/api/admin/settings',{method:'PUT',headers:{Cookie:cookie,Origin:'https://attacker.test','Content-Type':'application/json'},body:'{}'})).status===403,'cross-origin mutation denied');
  for(const page of ['/admin','/admin/bai-viet','/admin/bai-viet/moi','/admin/thu-vien','/admin/san-pham','/admin/yeu-cau','/admin/cai-dat'])check((await request(page)).status===200,`admin page ${page}`);
  const invalid=new FormData();invalid.append('file',new Blob(['<svg onload="alert(1)"></svg>'],{type:'image/png'}),'fake.png');check((await fetch(origin+'/api/admin/media',{method:'POST',headers:{Origin:origin,Cookie:cookie},body:invalid})).status===415,'fake image rejected by content');
  const image=await upload(await sharp({create:{width:100,height:80,channels:3,background:'#187447'}}).png().toBuffer(),'qa-image.png','image/png');
  check((await request(`/api/media/${image.id}`,'GET',undefined,false)).status===404,'unpublished media private');
  check((await request(`/api/admin/media/${image.id}`,'PATCH',{alt:'Ảnh kiểm thử',caption:'Tư liệu kiểm thử sẽ được xóa'})).status===200,'media description persisted');
  const videoPath=path.join(temporary,'sample.mp4');execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=green:s=160x120:d=1','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',videoPath]);
  const video=await upload(await readFile(videoPath),'qa-video.mp4','video/mp4');
  const doc={type:'doc',content:[{type:'heading',attrs:{level:2},content:[{type:'text',text:'Thông tin kiểm thử'}]},{type:'paragraph',content:[{type:'text',text:'Nội dung kiểm thử đủ dài để xác nhận quy trình xuất bản được lưu trong database.'}]},{type:'image',attrs:{src:`/api/media/${image.id}`,alt:'Ảnh kiểm thử'}},{type:'video',attrs:{src:`/api/media/${video.id}`,alt:'Video kiểm thử'}},{type:'table',content:[{type:'tableRow',content:[{type:'tableCell',content:[{type:'paragraph',content:[{type:'text',text:'Thông số'}]}]}]}]}]};
  const payload={title:'Bài kiểm tra CMS',slug:tag,excerpt:'Bài kiểm thử tự động, sẽ được xóa.',content:doc,kind:'article',status:'draft',cover_id:image.id,seo_title:'Tiêu đề SEO kiểm thử',seo_description:'Mô tả kiểm thử'};
  const saveResponse=await request('/api/admin/posts','POST',payload);let post=await saveResponse.json();check(saveResponse.status===200,`draft saved: ${saveResponse.status}`);postIds.push(post.id);
  check((await request(`/tin-tuc/${tag}`,'GET',undefined,false)).status===404,'draft hidden from public');
  check(!(await (await request('/sitemap.xml','GET',undefined,false)).text()).includes(tag),'draft absent from sitemap');
  check((await request('/api/admin/posts','POST',{...post,version:post.version+1})).status===409,'stale version rejected');
  const published=await request('/api/admin/posts','POST',{...post,status:'published'});post=await published.json();check(published.status===200,'publish saved');
  const publicPage=await request(`/tin-tuc/${tag}`,'GET',undefined,false);const html=await publicPage.text();check(publicPage.status===200&&html.includes('Tiêu đề SEO kiểm thử')&&html.includes('application/ld+json'),'published page and SEO rendered');
  const legacy=await request(`/kien-thuc/${tag}`,'GET',undefined,false);check(legacy.status===301&&legacy.headers.get('location')?.endsWith(`/tin-tuc/${tag}`),'legacy article redirects directly to news');
  check((await request(`/api/media/${image.id}`,'GET',undefined,false)).status===200,'published image public');
  const videoRange=await fetch(origin+`/api/media/${video.id}`,{headers:{Range:'bytes=0-63'}});check(videoRange.status===206&&(await videoRange.arrayBuffer()).byteLength===64,'video range streaming');
  check((await (await request('/sitemap.xml','GET',undefined,false)).text()).includes(tag),'published article in sitemap');
  const changed=await request('/api/admin/posts','POST',{...post,slug:`${tag}-updated`});post=await changed.json();check(changed.status===200,'slug update saved');
  const old=await request(`/tin-tuc/${tag}`,'GET',undefined,false);check(old.status===301&&old.headers.get('location')?.endsWith(`${tag}-updated`),'old URL redirects with 301');
  const legacyAlias=await request(`/kien-thuc/${tag}`,'GET',undefined,false);check(legacyAlias.status===301&&legacyAlias.headers.get('location')?.endsWith(`/tin-tuc/${tag}-updated`),'legacy alias resolves in one redirect');
  const reloaded=await (await request(`/api/admin/posts/${post.id}`)).json();check(reloaded.revisions.length>=2&&reloaded.content.content.some((n:{type:string})=>n.type==='video'),'revision history and video survive reload');
  const unsafe=await request('/api/admin/posts','POST',{...post,content:{type:'doc',content:[{type:'script',text:'alert(1)'}]}});check(unsafe.status===400,'unsafe rich text rejected');
  const hidden=await request('/api/admin/posts','POST',{...post,status:'draft'});check(hidden.status===200,'unpublish saved');
  check((await request(`/tin-tuc/${post.slug}`,'GET',undefined,false)).status===404,'unpublished article hidden');
  check((await request(`/api/media/${image.id}`,'GET',undefined,false)).status===404,'unpublished media revoked');
  const productResponse=await request('/api/admin/products','POST',{name:'Sản phẩm kiểm thử',slug:tag,category:'Kiểm thử',description:'Thông tin kiểm thử được xóa sau khi hoàn thành.',specifications:[{label:'Đường kính',value:'2,70 m'}],applications:['Kiểm thử'],cover_id:image.id,is_published:true,sort_order:999});const product=await productResponse.json();check(productResponse.status===200,'product saved');productIds.push(product.id);
  check((await request(`/san-pham/${tag}`,'GET',undefined,false)).status===200,'product available publicly');
  check((await request('/api/inquiries','POST',{name:'Test',phone:'---------',consent:'yes'},false)).status===400,'invalid phone rejected');
  check((await request('/api/auth/logout','POST')).status===200,'logout succeeds');
  check((await request('/api/admin/posts')).status===401,'session revoked after logout');
  console.log(`CMS integration: ${checks} checks passed.`);
}finally{
  await db.query('DELETE FROM posts WHERE id=ANY($1::uuid[])',[postIds]);
  await db.query('DELETE FROM products WHERE id=ANY($1::uuid[])',[productIds]);
  await db.query('DELETE FROM redirects WHERE source_path=ANY($1::text[])',[[`/tin-tuc/${tag}`,`/tin-tuc/${tag}-updated`,`/kien-thuc/${tag}`,`/kien-thuc/${tag}-updated`]]);
  for(const id of mediaIds){const row=(await db.query('DELETE FROM media_assets WHERE id=$1 RETURNING storage_key',[id])).rows[0];if(row)await unlink(path.join(uploadRoot(),row.storage_key)).catch(()=>{});}
  await db.query('DELETE FROM users WHERE id=$1',[userId]);
  await db.end();
  await rm(temporary,{recursive:true,force:true});
}
