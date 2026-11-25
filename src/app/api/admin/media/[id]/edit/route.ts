import { randomUUID } from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { readJson, RequestError } from '@/lib/http';
import { applyImageEdit, parseImageEdit, processingRoot, readMediaFile, persistMediaFile, removeMediaFile } from '@/lib/upload';

export const runtime = 'nodejs';

/**
 * Chỉnh ảnh bằng sharp rồi lưu thành tệp MỚI. Ảnh gốc giữ nguyên vì có thể bài khác đang dùng.
 * Thân yêu cầu: { rotate: 0|90|180|270, flip_h, flip_v, crop: {x,y,width,height} theo phần trăm 0 đến 1, hoặc null }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let created = '';
  let persisted = '';
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await params).id);
    const edit = parseImageEdit(await readJson(request));
    const source = (await db.query('SELECT * FROM media_assets WHERE id=$1', [id])).rows[0];
    if (!source) throw new RequestError('Tệp không còn tồn tại.', 404);
    if (source.mime_type !== 'image/webp' || !/^[a-f0-9-]+\.webp$/.test(source.storage_key)) throw new RequestError('Chỉ chỉnh được ảnh trong thư viện.', 400);
    const newId = randomUUID();
    const key = `${newId}.webp`;
    await mkdir(processingRoot(), { recursive: true });
    created = path.join(processingRoot(), key);
    const bytes = await readMediaFile(source.storage_key);
    let result;
    try { result = await applyImageEdit(bytes, created, edit); }
    catch { throw new RequestError('Không chỉnh được ảnh này. Hãy thử lại với vùng cắt khác.', 400); }
    await persistMediaFile(key, created, 'image/webp');
    persisted = key;
    const base = String(source.original_name).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/ \(đã chỉnh\)$/, '').slice(0, 170);
    const inserted = await db.query(
      'INSERT INTO media_assets(id,storage_key,original_name,mime_type,size_bytes,alt,caption) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *, 0 AS used_count',
      [newId, key, `${base} (đã chỉnh).webp`, 'image/webp', result.size, source.alt, source.caption],
    );
    created = '';
    persisted = '';
    return Response.json({ ...inserted.rows[0], dimensions: { width: result.width, height: result.height } }, { status: 201 });
  } catch (error) {
    if (created) await unlink(created).catch(() => {});
    if (persisted) await removeMediaFile(persisted).catch(() => console.error('Edited media rollback cleanup failed'));
    return apiError(error);
  }
}
