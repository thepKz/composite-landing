import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { currentUser, consumeLimit } from '@/lib/auth';
import { db } from '@/lib/db';
import { readJson, RequestError } from '@/lib/http';
import { processingRoot, processUploadFile, removeMediaFile } from '@/lib/upload';
import { usesSupabaseStorage, createStorageUpload, verifyUploadTicket, readStorageObject, deleteStorageFile, cleanupPendingUploads } from '@/lib/supabase-storage';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    if (!usesSupabaseStorage()) return Response.json({ mode: 'local' });
    const user = await currentUser();
    if (!user) throw new RequestError('Vui lòng đăng nhập lại.', 401);
    const data = z.object({ name: z.string().min(1).max(200), size: z.number().int().positive().max(100 * 1024 * 1024), type: z.enum(['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']) }).parse(await readJson(request));
    if (data.type.startsWith('image/') && data.size > 10 * 1024 * 1024) throw new RequestError('Ảnh tối đa 10 MB.', 413);
    if (!await consumeLimit(`upload:${user.id}`, 60, 900)) throw new RequestError('Bạn đã tải nhiều tệp. Vui lòng thử lại sau.', 429);
    try {
      if (await consumeLimit('storage-cleanup', 1, 3600)) await cleanupPendingUploads();
    } catch { console.error('Pending storage maintenance deferred'); }
    return Response.json({ mode: 'supabase', ...await createStorageUpload(user.id, path.basename(data.name.replaceAll('\\','/')), data.size) });
  } catch (error) { return apiError(error); }
}

export async function PUT(request: Request) {
  let temporary = '';
  let pending = '';
  let persisted = '';
  try {
    await requireAdmin(request);
    if (!usesSupabaseStorage()) throw new RequestError('Kho lưu trữ chưa được bật.', 409);
    const user = await currentUser();
    if (!user) throw new RequestError('Vui lòng đăng nhập lại.', 401);
    const data = z.object({ ticket: z.string().max(2000) }).parse(await readJson(request));
    const ticket = verifyUploadTicket(data.ticket, user.id);
    if (!await consumeLimit(`upload-finalize:${ticket.key}`, 1, 3600)) throw new RequestError('Lượt tải này đã được xử lý. Hãy tải lại tệp nếu cần.', 409);
    pending = ticket.key;
    const response = await readStorageObject(pending);
    if (!response.body) throw new RequestError('Tệp tải lên không có dữ liệu.', 400);
    await mkdir(processingRoot(), { recursive: true });
    temporary = path.join(processingRoot(), `${randomUUID()}.part`);
    let size = 0;
    const limiter = new Transform({ transform(chunk, _encoding, callback) { size += chunk.length; callback(size > ticket.size ? new RequestError('Dung lượng tệp không khớp lượt tải.', 413) : null, chunk); } });
    await pipeline(Readable.fromWeb(response.body as never), limiter, createWriteStream(temporary, { flags: 'wx' }));
    if (size !== ticket.size) throw new RequestError('Tệp tải lên chưa đầy đủ. Vui lòng tải lại.', 400);
    const media = await processUploadFile(temporary, ticket.name);
    persisted = media.storage_key;
    const inserted = await db.query('INSERT INTO media_assets(id,storage_key,original_name,mime_type,size_bytes) VALUES ($1,$2,$3,$4,$5) RETURNING *, 0 AS used_count', [media.id,media.storage_key,media.original_name,media.mime_type,media.size_bytes]);
    persisted = '';
    return Response.json(inserted.rows[0], { status: 201 });
  } catch (error) {
    if (persisted) await removeMediaFile(persisted).catch(() => console.error('Finalized media rollback cleanup failed'));
    return apiError(error);
  } finally {
    if (temporary) await unlink(temporary).catch(() => {});
    if (pending) await deleteStorageFile(pending).catch(() => console.error('Pending media cleanup failed'));
  }
}
