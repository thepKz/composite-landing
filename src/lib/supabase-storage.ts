import { createReadStream } from 'node:fs';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { RequestError } from './http';

export const validStorageKey = (key: string) => /^[a-f0-9-]+\.(webp|mp4|webm)$/.test(key);
export const usesSupabaseStorage = () => Boolean(process.env.SUPABASE_STORAGE_BUCKET?.trim());
// ponytail: Free project limit is 50 MB; raise this with the bucket limit after a plan upgrade.
export const storageUploadLimit = () => Math.min(100 * 1024 * 1024, Number(process.env.SUPABASE_UPLOAD_MAX_BYTES) || 50 * 1024 * 1024);
const validPendingKey = (key: string) => /^pending\/[a-f0-9-]+$/.test(key);

function storageConfig() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY;
  let url: URL;
  try { url = new URL(process.env.SUPABASE_URL || ''); }
  catch { throw new RequestError('Kho lưu trữ chưa được cấu hình đầy đủ.', 503); }
  if (!bucket || !/^[a-zA-Z0-9_-]+$/.test(bucket) || !secret || url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new RequestError('Kho lưu trữ chưa được cấu hình đầy đủ.', 503);
  }
  return { bucket, secret, origin: url.origin };
}

async function storageRequest(key: string, init: RequestInit & { duplex?: 'half' } = {}, operation: 'object' | 'object/upload/sign' | 'object/list' = 'object') {
  if (operation !== 'object/list' && !validStorageKey(key) && !validPendingKey(key)) throw new RequestError('Tên tệp lưu trữ không hợp lệ.', 400);
  const { bucket, secret, origin } = storageConfig();
  try {
    const suffix = init.method === 'DELETE' || operation === 'object/list' ? '' : `/${key.split('/').map(encodeURIComponent).join('/')}`;
    return await fetch(`${origin}/storage/v1/${operation}/${encodeURIComponent(bucket)}${suffix}`, {
      ...init,
      headers: { ...Object.fromEntries(new Headers(init.headers)), apikey: secret },
      cache: 'no-store', redirect: 'error', signal: init.signal || AbortSignal.timeout(120000),
    });
  } catch {
    throw new RequestError('Không kết nối được kho lưu trữ. Vui lòng thử lại.', 503);
  }
}

export async function uploadStorageFile(key: string, file: string, mime: string) {
  const stream = createReadStream(file);
  try {
    const response = await storageRequest(key, {
      method: 'POST', headers: { 'Content-Type': mime, 'x-upsert': 'false' },
      body: stream as unknown as BodyInit, duplex: 'half',
    });
    await response.body?.cancel();
    if (!response.ok) throw new RequestError('Chưa lưu được tệp lên kho lưu trữ. Vui lòng thử lại.', 503);
  } finally { stream.destroy(); }
}

export async function readStorageObject(key: string, range?: string) {
  const response = await storageRequest(key, { headers: range ? { Range: range } : undefined });
  if (!response.ok) {
    await response.body?.cancel();
    throw new RequestError(response.status === 404 ? 'Tệp không còn tồn tại.' : 'Không đọc được tệp từ kho lưu trữ.', response.status === 404 ? 404 : 503);
  }
  return response;
}

export async function deleteStorageFile(key: string) {
  const response = await storageRequest(key, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [key] }) });
  await response.body?.cancel();
  if (!response.ok && response.status !== 404) throw new RequestError('Chưa xoá được tệp khỏi kho lưu trữ.', 503);
}

export async function cleanupPendingUploads() {
  const response = await storageRequest('pending', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: 'pending', limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'asc' } }),
    signal: AbortSignal.timeout(10000),
  }, 'object/list');
  if (!response.ok) { await response.body?.cancel(); throw new RequestError('Chưa dọn được tệp tải dở.', 503); }
  const objects: unknown = await response.json();
  if (!Array.isArray(objects)) throw new RequestError('Danh sách tệp tải dở chưa hợp lệ.', 503);
  // Signed upload URLs last two hours; retain a further hour before removing abandoned originals.
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  const keys = objects.slice(0, 100).flatMap(object => {
    if (!object || typeof object !== 'object' || !object.id || typeof object.name !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(object.name)) return [];
    const created = Date.parse(object.created_at);
    const updated = Date.parse(object.updated_at || object.created_at);
    return Number.isFinite(created) && Number.isFinite(updated) && Math.max(created, updated) < cutoff ? [`pending/${object.name}`] : [];
  });
  if (!keys.length) return 0;
  const removed = await storageRequest(keys[0], { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: keys }), signal: AbortSignal.timeout(10000) });
  await removed.body?.cancel();
  if (!removed.ok) throw new RequestError('Chưa dọn được tệp tải dở.', 503);
  return keys.length;
}

type UploadTicket = { key: string; user: string; name: string; size: number; expires: number };

export async function createStorageUpload(user: string, name: string, size: number) {
  if (!Number.isSafeInteger(size) || size <= 0 || size > storageUploadLimit()) throw new RequestError(`Tệp tối đa ${Math.floor(storageUploadLimit() / 1048576)} MB với kho lưu trữ hiện tại.`, 413);
  const ticket: UploadTicket = { key: `pending/${randomUUID()}`, user, name, size, expires: Date.now() + 30 * 60 * 1000 };
  const { secret, origin, bucket } = storageConfig();
  const response = await storageRequest(ticket.key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 'object/upload/sign');
  if (!response.ok) { await response.body?.cancel(); throw new RequestError('Chưa tạo được lượt tải tệp. Vui lòng thử lại.', 503); }
  const result = await response.json();
  const url = new URL(`${origin}/storage/v1${result.url}`);
  if (url.origin !== origin || !url.pathname.startsWith(`/storage/v1/object/upload/sign/${bucket}/pending/`)) throw new RequestError('Đường dẫn tải tệp chưa hợp lệ.', 503);
  const payload = Buffer.from(JSON.stringify(ticket)).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  return { url: url.toString(), ticket: `${payload}.${signature}`, publicKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '' };
}

export function verifyUploadTicket(token: string, user: string): UploadTicket {
  const invalid = () => new RequestError('Lượt tải tệp đã hết hạn hoặc không hợp lệ. Hãy tải lại tệp.', 400);
  const [payload, signature, extra] = token.split('.');
  if (!payload || !/^[a-f0-9]{64}$/.test(signature || '') || extra) throw invalid();
  const expected = createHmac('sha256', storageConfig().secret).update(payload).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) throw invalid();
  let ticket: UploadTicket;
  try { ticket = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { throw invalid(); }
  if (!ticket || ticket.user !== user || !Number.isFinite(ticket.expires) || ticket.expires < Date.now() || !validPendingKey(ticket.key) || !Number.isSafeInteger(ticket.size) || ticket.size <= 0 || ticket.size > storageUploadLimit() || typeof ticket.name !== 'string') throw invalid();
  return ticket;
}
