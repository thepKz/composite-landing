import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { receiveUpload, uploadRoot } from '@/lib/upload';

export const runtime = 'nodejs';

const listSql = `SELECT m.*,
  ((SELECT count(*) FROM post_media pm WHERE pm.media_id=m.id) + (SELECT count(DISTINCT p.id) FROM products p WHERE p.cover_id=m.id OR EXISTS(SELECT 1 FROM product_media pm WHERE pm.product_id=p.id AND pm.media_id=m.id)))::int AS used_count
  FROM media_assets m ORDER BY m.created_at DESC LIMIT 1000`;

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    return Response.json((await db.query(listSql)).rows);
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const media = await receiveUpload(request);
    try {
      const result = await db.query(
        'INSERT INTO media_assets(id,storage_key,original_name,mime_type,size_bytes) VALUES ($1,$2,$3,$4,$5) RETURNING *, 0 AS used_count',
        [media.id, media.storage_key, media.original_name, media.mime_type, media.size_bytes],
      );
      return Response.json(result.rows[0], { status: 201 });
    } catch (error) {
      await unlink(path.join(uploadRoot(), media.storage_key)).catch(() => {});
      throw error;
    }
  } catch (error) { return apiError(error); }
}
