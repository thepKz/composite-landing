import sharp from 'sharp';
import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { db, transaction } from '@/lib/db';
import { readJson, RequestError } from '@/lib/http';
import { readMediaFile, removeMediaFile } from '@/lib/upload';

export const runtime = 'nodejs';
const safeKey = /^[a-f0-9-]+\.(webp|mp4|webm)$/;

async function usage(id: string) {
  const posts = await db.query(
    'SELECT p.id,p.title,p.status FROM post_media pm JOIN posts p ON p.id=pm.post_id WHERE pm.media_id=$1 ORDER BY p.updated_at DESC',
    [id],
  );
  const products = await db.query(`SELECT p.id,p.name FROM products p WHERE p.cover_id=$1 OR jsonb_path_exists(p.section_images, '$[*].images[*] ? (@.media_id == $media)', jsonb_build_object('media',$1::text)) OR EXISTS(SELECT 1 FROM product_media pm WHERE pm.product_id=p.id AND pm.media_id=$1) ORDER BY p.name`, [id]);
  return { posts: posts.rows, products: products.rows };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await params).id);
    const media = (await db.query('SELECT * FROM media_assets WHERE id=$1', [id])).rows[0];
    if (!media) throw new RequestError('Tệp không còn tồn tại.', 404);
    let size: { width: number; height: number } | null = null;
    if (media.mime_type.startsWith('image/') && safeKey.test(media.storage_key)) {
      const meta = await readMediaFile(media.storage_key).then(bytes => sharp(bytes).metadata()).catch(() => null);
      if (meta?.width && meta.height) size = { width: meta.width, height: meta.height };
    }
    const used = await usage(id);
    return Response.json({ ...media, used_count: used.posts.length + used.products.length, used_in: used, dimensions: size });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await params).id);
    const data = z.object({ alt: z.string().max(500), caption: z.string().max(500) }).parse(await readJson(request));
    const result = await db.query('UPDATE media_assets SET alt=$2,caption=$3,updated_at=now() WHERE id=$1 RETURNING *', [id, data.alt, data.caption]);
    if (!result.rowCount) throw new RequestError('Tệp không còn tồn tại.', 404);
    return Response.json(result.rows[0]);
  } catch (error) { return apiError(error); }
}

/** Xoá tệp chỉ khi không bài viết hay sản phẩm nào đang dùng. Khoá dòng để không có bài kịp chèn giữa chừng. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await params).id);
    const removed = await transaction(async client => {
      const media = (await client.query('SELECT * FROM media_assets WHERE id=$1 FOR UPDATE', [id])).rows[0];
      if (!media) throw new RequestError('Tệp không còn tồn tại.', 404);
      const inPosts = (await client.query('SELECT p.title FROM post_media pm JOIN posts p ON p.id=pm.post_id WHERE pm.media_id=$1 LIMIT 3', [id])).rows;
      const inProducts = (await client.query(`SELECT p.name FROM products p WHERE p.cover_id=$1 OR jsonb_path_exists(p.section_images, '$[*].images[*] ? (@.media_id == $media)', jsonb_build_object('media',$1::text)) OR EXISTS(SELECT 1 FROM product_media pm WHERE pm.product_id=p.id AND pm.media_id=$1) LIMIT 3`, [id])).rows;
      if (inPosts.length || inProducts.length) {
        const names = [...inPosts.map(row => row.title), ...inProducts.map(row => row.name)].join(', ');
        throw new RequestError(`Tệp đang được dùng trong: ${names}. Hãy gỡ tệp khỏi nội dung đó trước khi xoá.`, 409);
      }
      await client.query('DELETE FROM media_assets WHERE id=$1', [id]);
      return media;
    });
    if (safeKey.test(removed.storage_key)) await removeMediaFile(removed.storage_key).catch(() => console.error('Deleted media object cleanup failed:', id));
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
