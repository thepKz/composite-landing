import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { etagMatches, mediaCacheHeaders, PRIVATE_CACHE, PUBLIC_CACHE } from '../src/lib/media-cache';
import { issueMessage, validationHeadline } from '../src/lib/admin-api';
import { productMediaIdsSchema } from '../src/lib/product-media';

const row = { id: '00000000-0000-4000-8000-000000000001', size_bytes: '2048', updated_at: new Date('2026-11-01T00:00:00Z') };

test('ảnh công khai lưu tạm 5 phút kèm ETag, ảnh chưa công khai không lưu', () => {
  const open = mediaCacheHeaders(true, row);
  assert.equal(open.cacheControl, 'public, max-age=300, stale-while-revalidate=600');
  assert.equal(open.cacheControl, PUBLIC_CACHE);
  assert.match(open.etag ?? '', /^"[0-9a-f-]+-2048-\d+"$/);
  const closed = mediaCacheHeaders(false, row);
  assert.equal(closed.cacheControl, PRIVATE_CACHE);
  assert.equal(closed.etag, null);
});

test('ETag đổi khi dung lượng hoặc lúc cập nhật đổi', () => {
  const a = mediaCacheHeaders(true, row).etag;
  assert.notEqual(a, mediaCacheHeaders(true, { ...row, size_bytes: 4096 }).etag);
  assert.notEqual(a, mediaCacheHeaders(true, { ...row, updated_at: new Date('2026-11-02T00:00:00Z') }).etag);
  assert.equal(a, mediaCacheHeaders(true, { ...row }).etag);
});

test('If-None-Match khớp khi đúng ETag, danh sách, dấu sao hoặc tiền tố W', () => {
  const tag = mediaCacheHeaders(true, row).etag!;
  assert.equal(etagMatches(tag, tag), true);
  assert.equal(etagMatches(`"x", ${tag}`, tag), true);
  assert.equal(etagMatches(`W/${tag}`, tag), true);
  assert.equal(etagMatches('*', tag), true);
  assert.equal(etagMatches('"khac"', tag), false);
  assert.equal(etagMatches(null, tag), false);
  assert.equal(etagMatches(tag, null), false);
});

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const failure = (input: unknown) => { const r = productMediaIdsSchema.safeParse(input); assert.equal(r.success, false); return r.error!; };
const messages = (input: unknown) => failure(input).issues.map(issueMessage);
const english = /Invalid|Too |expected|received|UUID/i;

test('lỗi danh sách ảnh bằng tiếng Việt lời thường', () => {
  for (const input of [['rác'], null, 'x', [null], Array.from({ length: 21 }, (_, i) => id(i + 1)), Array.from({ length: 61 }, (_, i) => id(i + 1))]) {
    const list = messages(input);
    assert.ok(list.length > 0);
    for (const message of list) assert.doesNotMatch(message, english, message);
  }
});

test('quá 20 ảnh thì câu chính nói rõ tối đa 20 ảnh', () => {
  assert.equal(validationHeadline(failure(Array.from({ length: 21 }, (_, i) => id(i + 1)))), 'Mỗi sản phẩm tối đa 20 ảnh.');
  assert.equal(validationHeadline(failure(Array.from({ length: 61 }, (_, i) => id(i + 1)))), 'Mỗi sản phẩm tối đa 20 ảnh.');
  assert.equal(validationHeadline(failure(['rác'])), 'Vui lòng kiểm tra các trường thông tin.');
});

test('lớp dịch chung đổi lời mặc định tiếng Anh sang tiếng Việt', () => {
  const schema = z.object({ name: z.string().min(3).max(5), n: z.number().max(1), list: z.array(z.string()).min(1), u: z.uuid() });
  const r = schema.safeParse({ name: 'a', n: 5, list: [], u: 'x' });
  assert.equal(r.success, false);
  for (const issue of r.error!.issues) assert.doesNotMatch(issueMessage(issue), english);
  const missing = schema.safeParse({});
  for (const issue of missing.error!.issues) assert.equal(issueMessage(issue), 'Thiếu thông tin này.');
});
