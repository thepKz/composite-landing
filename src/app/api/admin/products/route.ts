import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAdmin,apiError } from '@/lib/admin-api';
import { db,transaction } from '@/lib/db';
import { readJson,RequestError } from '@/lib/http';
const schema=z.object({id:z.uuid().optional(),name:z.string().trim().min(3).max(200),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),category:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(3000),specifications:z.array(z.object({label:z.string().trim().min(1).max(100),value:z.string().trim().min(1).max(500)})).max(30),applications:z.array(z.string().trim().min(1).max(100)).max(20),cover_id:z.uuid().nullable(),is_published:z.boolean(),sort_order:z.number().int().min(0).max(10000),updated_at:z.string().optional()});
export async function GET(request:Request){try{await requireAdmin(request);return Response.json((await db.query('SELECT * FROM products ORDER BY sort_order,name')).rows);}catch(error){return apiError(error);}}
export async function POST(request:Request){try{await requireAdmin(request);const p=schema.parse(await readJson(request,30000));const result=await transaction(async client=>{
  const old=p.id?(await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE',[p.id])).rows[0]:null;
  if(p.id&&!old)throw new RequestError('Không tìm thấy sản phẩm.',404);
  if(old&&new Date(old.updated_at).toISOString()!==p.updated_at)throw new RequestError('Sản phẩm đã được sửa ở nơi khác. Hãy tải lại trước khi lưu.',409);
  if((await client.query('SELECT 1 FROM redirects WHERE source_path=$1',[`/san-pham/${p.slug}`])).rowCount)throw new RequestError('Đường dẫn này từng được sử dụng. Vui lòng chọn đường dẫn khác.',409);
  if(p.cover_id&&!(await client.query("SELECT 1 FROM media_assets WHERE id=$1 AND mime_type LIKE 'image/%' FOR SHARE",[p.cover_id])).rowCount)throw new RequestError('Vui lòng chọn ảnh đại diện từ thư viện.',400);
  if(old&&old.slug!==p.slug){await client.query('UPDATE redirects SET target_path=$1 WHERE target_path=$2',[`/san-pham/${p.slug}`,`/san-pham/${old.slug}`]);await client.query('INSERT INTO redirects(source_path,target_path) VALUES ($1,$2)',[`/san-pham/${old.slug}`,`/san-pham/${p.slug}`]);}
  return (await client.query(`INSERT INTO products(id,name,slug,category,description,specifications,applications,cover_id,is_published,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,slug=EXCLUDED.slug,category=EXCLUDED.category,description=EXCLUDED.description,specifications=EXCLUDED.specifications,applications=EXCLUDED.applications,cover_id=EXCLUDED.cover_id,is_published=EXCLUDED.is_published,sort_order=EXCLUDED.sort_order,updated_at=now() RETURNING *`,[p.id??randomUUID(),p.name,p.slug,p.category,p.description,JSON.stringify(p.specifications),JSON.stringify(p.applications),p.cover_id,p.is_published,p.sort_order])).rows[0];
});return Response.json(result);}catch(error){return apiError(error);}}
