import { productLayoutSchema,sectionImageIds } from '@/lib/product-layout';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { requireAdmin,apiError } from '@/lib/admin-api';
import { db,transaction } from '@/lib/db';
import { readJson,RequestError } from '@/lib/http';
import { productMediaIdsSchema,coverFromList } from '@/lib/product-media';
// media_ids: danh sách ảnh có thứ tự (tối đa 20). Không gửi thì giữ nguyên danh sách cũ. Có gửi thì ảnh đầu danh sách thành cover_id.
const schema=z.object({id:z.uuid().optional(),name:z.string().trim().min(3).max(200),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),category:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(3000),specifications:z.array(z.object({label:z.string().trim().min(1).max(100),value:z.string().trim().min(1).max(500)})).max(30),applications:z.array(z.string().trim().min(1).max(100)).max(20),cover_id:z.uuid().nullable(),media_ids:productMediaIdsSchema.optional(),section_images:productLayoutSchema.optional(),is_published:z.boolean(),sort_order:z.number().int().min(0).max(10000),updated_at:z.string().optional()});
const withMedia='SELECT p.*,COALESCE((SELECT array_agg(pm.media_id::text ORDER BY pm.position) FROM product_media pm WHERE pm.product_id=p.id),ARRAY[]::text[]) AS media_ids FROM products p';
export async function GET(request:Request){try{await requireAdmin(request);return Response.json((await db.query(`${withMedia} ORDER BY p.sort_order,p.name`)).rows);}catch(error){return apiError(error);}}
export async function POST(request:Request){try{await requireAdmin(request);const input=schema.parse(await readJson(request,80000));const p={...input,cover_id:input.media_ids?coverFromList(input.media_ids):input.cover_id};const result=await transaction(async client=>{
  const old=p.id?(await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE',[p.id])).rows[0]:null;
  if(p.id&&!old)throw new RequestError('Không tìm thấy sản phẩm.',404);
  if(old&&new Date(old.updated_at).toISOString()!==p.updated_at)throw new RequestError('Sản phẩm đã được sửa ở nơi khác. Hãy tải lại trước khi lưu.',409);
  if((await client.query('SELECT 1 FROM redirects WHERE source_path=$1',[`/san-pham/${p.slug}`])).rowCount)throw new RequestError('Đường dẫn này từng được sử dụng. Vui lòng chọn đường dẫn khác.',409);
  if(input.media_ids?.length){const found=await client.query("SELECT id FROM media_assets WHERE id=ANY($1::uuid[]) AND mime_type LIKE 'image/%' FOR SHARE",[input.media_ids]);if(found.rowCount!==input.media_ids.length)throw new RequestError('Có ảnh không còn trong thư viện hoặc không phải ảnh. Vui lòng chọn lại ảnh.',400);}
  if(input.section_images){const ids=sectionImageIds(input.section_images);if(ids.length){const found=await client.query("SELECT id FROM media_assets WHERE id=ANY($1::uuid[]) AND mime_type LIKE 'image/%' FOR SHARE",[ids]);if(found.rowCount!==ids.length)throw new RequestError('Có ảnh trong bố cục không còn tồn tại hoặc không phải ảnh. Hãy chọn lại.',400);}}
  if(p.cover_id&&!(await client.query("SELECT 1 FROM media_assets WHERE id=$1 AND mime_type LIKE 'image/%' FOR SHARE",[p.cover_id])).rowCount)throw new RequestError('Vui lòng chọn ảnh đại diện từ thư viện.',400);
  if(old&&old.slug!==p.slug){await client.query('UPDATE redirects SET target_path=$1 WHERE target_path=$2',[`/san-pham/${p.slug}`,`/san-pham/${old.slug}`]);await client.query('INSERT INTO redirects(source_path,target_path) VALUES ($1,$2)',[`/san-pham/${old.slug}`,`/san-pham/${p.slug}`]);}
  const saved=(await client.query(`INSERT INTO products(id,name,slug,category,description,specifications,applications,cover_id,is_published,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,slug=EXCLUDED.slug,category=EXCLUDED.category,description=EXCLUDED.description,specifications=EXCLUDED.specifications,applications=EXCLUDED.applications,cover_id=EXCLUDED.cover_id,is_published=EXCLUDED.is_published,sort_order=EXCLUDED.sort_order,updated_at=now() RETURNING id`,[p.id??randomUUID(),p.name,p.slug,p.category,p.description,JSON.stringify(p.specifications),JSON.stringify(p.applications),p.cover_id,p.is_published,p.sort_order])).rows[0];
  if(input.section_images)await client.query('UPDATE products SET section_images=$2::jsonb WHERE id=$1',[saved.id,JSON.stringify(input.section_images)]);
  if(input.media_ids){await client.query('DELETE FROM product_media WHERE product_id=$1',[saved.id]);if(input.media_ids.length)await client.query('INSERT INTO product_media(product_id,media_id,position) SELECT $1,m.id,m.ord-1 FROM unnest($2::uuid[]) WITH ORDINALITY AS m(id,ord)',[saved.id,input.media_ids]);}
  return (await client.query(`${withMedia} WHERE p.id=$1`,[saved.id])).rows[0];
});return Response.json(result);}catch(error){return apiError(error);}}
