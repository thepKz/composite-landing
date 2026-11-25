import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createStorageUpload, verifyUploadTicket, readStorageObject, deleteStorageFile, uploadStorageFile, cleanupPendingUploads } from '../src/lib/supabase-storage';
import { processUploadFile } from '../src/lib/upload';

test('private storage upload, range, deletion and signed staging enforce boundaries', async () => {
  const names = ['SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_STORAGE_BUCKET','SUPABASE_UPLOAD_MAX_BYTES','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'] as const;
  const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
  const fetchBefore = globalThis.fetch;
  const folder = await mkdtemp(path.join(tmpdir(), 'storage-check-'));
  try {
    Object.assign(process.env, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'server-secret', SUPABASE_STORAGE_BUCKET: 'media', SUPABASE_UPLOAD_MAX_BYTES: '52428800', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-key' });
    const calls: { url: string; init: RequestInit }[] = [];
    globalThis.fetch = async (input, init = {}) => {
      const url = String(input);
      calls.push({ url, init });
      assert.equal(new Headers(init.headers).get('apikey'), 'server-secret');
      assert.equal(init.redirect, 'error');
      if (url.includes('/upload/sign/')) return Response.json({ url: url.replace('https://example.supabase.co/storage/v1', '') + '?token=temporary' });
      if (init.method === 'POST' && init.body) await new Response(init.body).arrayBuffer();
      if (new Headers(init.headers).has('range')) return new Response('abc', { status: 206, headers: { 'Content-Range': 'bytes 0-2/6' } });
      return Response.json({ ok: true });
    };
    const issued = await createStorageUpload('admin-one', 'photo.png', 100);
    const ticket = verifyUploadTicket(issued.ticket, 'admin-one');
    assert.equal(ticket.name, 'photo.png');
    assert.match(ticket.key, /^pending\/[a-f0-9-]+$/);
    assert.equal(issued.publicKey, 'public-key');
    assert.ok(!JSON.stringify(issued).includes('server-secret'));
    assert.throws(() => verifyUploadTicket(issued.ticket, 'admin-two'));
    assert.throws(() => verifyUploadTicket(issued.ticket + 'a', 'admin-one'));
    const now = Date.now;
    Date.now = () => ticket.expires + 1;
    try { assert.throws(() => verifyUploadTicket(issued.ticket, 'admin-one')); } finally { Date.now = now; }
    await assert.rejects(() => createStorageUpload('admin-one', 'large.mp4', 51 * 1048576));
    const beforeUnsafe = calls.length;
    await assert.rejects(() => readStorageObject('../outside.webp'));
    assert.equal(calls.length, beforeUnsafe);
    const partial = await readStorageObject('abc.webp', 'bytes=0-2');
    assert.equal(partial.status, 206);
    assert.equal(await partial.text(), 'abc');
    await deleteStorageFile(ticket.key);
    assert.equal(calls.at(-1)?.url, 'https://example.supabase.co/storage/v1/object/media');
    assert.deepEqual(JSON.parse(calls.at(-1)?.init.body as string), { prefixes: [ticket.key] });
    const originalFetch = globalThis.fetch;
    const old = new Date(Date.now() - 4 * 3600000).toISOString();
    const fresh = new Date().toISOString();
    const staleName = '11111111-1111-4111-8111-111111111111';
    globalThis.fetch = async (input, init = {}) => {
      if (String(input).endsWith('/object/list/media')) {
        assert.deepEqual(JSON.parse(init.body as string), { prefix: 'pending', limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'asc' } });
        return Response.json([
          { id: 'stale', name: staleName, created_at: old, updated_at: old },
          { id: 'new', name: '22222222-2222-4222-8222-222222222222', created_at: fresh },
          { id: 'updated', name: '33333333-3333-4333-8333-333333333333', created_at: old, updated_at: fresh },
          { id: 'outside', name: '../outside.webp', created_at: old },
          { id: 'bad-date', name: '44444444-4444-4444-8444-444444444444', created_at: 'unknown' },
          { id: null, name: '55555555-5555-4555-8555-555555555555', created_at: old },
        ]);
      }
      assert.equal(init.method, 'DELETE');
      assert.deepEqual(JSON.parse(init.body as string), { prefixes: [`pending/${staleName}`] });
      return Response.json([]);
    };
    assert.equal(await cleanupPendingUploads(), 1);
    globalThis.fetch = originalFetch;
    const source = path.join(folder, 'image.part');
    await sharp({ create: { width: 40, height: 30, channels: 3, background: 'red' } }).png().toFile(source);
    const media = await processUploadFile(source, 'photo.png');
    assert.equal(media.mime_type, 'image/webp');
    assert.ok(media.size_bytes > 0);
    await assert.rejects(() => access(source));
    const uploaded = calls.at(-1)!;
    assert.equal(new Headers(uploaded.init.headers).get('x-upsert'), 'false');
    const bad = path.join(folder, 'bad.part');
    await writeFile(bad, '<script>malicious</script>');
    await assert.rejects(() => processUploadFile(bad, 'fake.png'));
    await assert.rejects(() => access(bad));
    const keep = path.join(folder, 'keep.webp');
    await writeFile(keep, 'keep original');
    globalThis.fetch = async () => { throw new Error('internal credential details'); };
    await assert.rejects(() => uploadStorageFile('abc.webp', keep, 'image/webp'), error => error instanceof Error && !error.message.includes('credential'));
    assert.equal(await readFile(keep, 'utf8'), 'keep original');
  } finally {
    globalThis.fetch = fetchBefore;
    for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; }
    await rm(folder, { recursive: true, force: true });
  }
});
