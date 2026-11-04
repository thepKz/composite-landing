import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, stat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { sha256 } from './handoff-lib.mjs';

// Only the previously created disposable restore database receives fixtures.
const sourceURL = new URL(process.env.DATABASE_URL); sourceURL.pathname = '/thanhloi_restore_second';
const source = new pg.Client({ connectionString: sourceURL.toString() }); await source.connect();
const stamp = Date.now(); const videoId = randomUUID(); const postId = randomUUID();
const slug = `restoration-${stamp}`; const destination = `thanhloi_check_${stamp}`;
const mediaRoot = path.resolve('data/restore-second'); const restoredMedia = path.resolve(`data/restoration-${stamp}`);
const backup = path.resolve(`backups/restoration-${stamp}`);
const env = { ...process.env, DATABASE_URL: sourceURL.toString(), UPLOAD_DIR: mediaRoot };
let target;
try {
  const file = path.join(mediaRoot, `${videoId}.mp4`);
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=green:s=160x120:d=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file]);
  await source.query('INSERT INTO media_assets(id,storage_key,original_name,mime_type,size_bytes,alt) VALUES ($1,$2,$3,$4,$5,$6)', [videoId, `${videoId}.mp4`, 'restore-test.mp4', 'video/mp4', (await stat(file)).size, 'Video kiểm tra phục hồi']);
  const cover = (await source.query("SELECT id FROM media_assets WHERE mime_type='image/webp' LIMIT 1")).rows[0].id;
  const content = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nội dung kiểm tra khôi phục bài viết có ảnh và video từ gói bàn giao.' }] }, { type: 'image', attrs: { src: `/api/media/${cover}`, alt: 'Ảnh kiểm tra' } }, { type: 'video', attrs: { src: `/api/media/${videoId}`, alt: 'Video kiểm tra' } }] };
  await source.query("INSERT INTO posts(id,title,slug,content,status,cover_id,published_at) VALUES ($1,$2,$3,$4,'published',$5,now())", [postId, 'Kiểm tra phục hồi nội dung', slug, JSON.stringify(content), cover]);
  for (const media of [cover, videoId]) await source.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2)', [postId, media]);
  execFileSync(process.execPath, ['scripts/backup.mjs', backup], { env, stdio: 'inherit' });
  execFileSync(process.execPath, ['scripts/restore.mjs', backup, destination, restoredMedia], { env, stdio: 'inherit' });
  const targetURL = new URL(sourceURL); targetURL.pathname = '/' + destination;
  target = new pg.Client({ connectionString: targetURL.toString() }); await target.connect();
  for (const { tablename } of (await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows) {
    const query = `SELECT row_to_json(r)::text AS value FROM "${tablename}" r ORDER BY row_to_json(r)::text`;
    const expected = ['sessions', 'rate_limits'].includes(tablename) ? [] : (await source.query(query)).rows;
    assert.deepEqual((await target.query(query)).rows, expected, tablename);
  }
  const manifest = JSON.parse(await readFile(path.join(backup, 'manifest.json'), 'utf8'));
  for (const file of manifest.media) assert.equal(await sha256(path.join(restoredMedia, file.key)), file.sha256);
  const corrupt = path.resolve(`backups/corrupt-check-${stamp}`); await mkdir(corrupt);
  await writeFile(path.join(corrupt, 'manifest.json'), JSON.stringify(manifest)); await writeFile(path.join(corrupt, 'database.dump'), 'corrupt');
  assert.throws(() => execFileSync(process.execPath, ['scripts/restore.mjs', corrupt, `rejected_${stamp}`, `data/rejected-${stamp}`], { env, stdio: 'pipe' }));
  assert.equal((await source.query('SELECT 1 FROM pg_database WHERE datname=$1', [`rejected_${stamp}`])).rowCount, 0);
  console.log('PASS every restored table, all media hashes, corrupt package rejected before database creation');
  execFileSync(process.execPath, ['scripts/verify-docker.mjs'], { env: { ...env, VERIFY_DATABASE: destination, VERIFY_UPLOAD_DIR: restoredMedia, VERIFY_RESTORED_SLUG: slug, VERIFY_RESTORED_VIDEO: videoId }, stdio: 'inherit' });
} finally { if (target) await target.end(); await source.end(); }
