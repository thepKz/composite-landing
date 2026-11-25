import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import pg from 'pg';

const tables = ['users', 'media_assets', 'posts', 'post_revisions', 'post_media', 'products', 'product_media', 'inquiries', 'site_settings', 'redirects'];
const source = new pg.Client({ connectionString: process.env.LOCAL_DATABASE_URL, connectionTimeoutMillis:10000 });
const destination = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis:10000,
  ssl: { ca: process.env.DATABASE_SSL_CA?.replace(/\\n/g, '\n'), rejectUnauthorized: true } });
const base = process.env.SUPABASE_URL;
const bucket = process.env.SUPABASE_STORAGE_BUCKET;
const headers = { apikey: process.env.SUPABASE_SECRET_KEY };
if (!process.env.LOCAL_DATABASE_URL || !base || !bucket || !headers.apikey || !process.env.DATABASE_SSL_CA) throw new Error('Missing import configuration.');
if (process.env.LOCAL_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Source and destination must differ.');
if (!/^[a-z0-9-]+$/.test(bucket)) throw new Error('Invalid bucket name.');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function storage(url, options = {}) {
  const response = await fetch(`${base}/storage/v1/${url}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Storage request failed: HTTP ${response.status}`);
  return response;
}

try {
  await source.connect(); await destination.connect();
  await source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const snapshot = {};
  for (const table of tables) {
    snapshot[table] = (await source.query(`SELECT * FROM public.${table}`)).rows;
    if (Number((await destination.query(`SELECT count(*) AS n FROM public.${table}`)).rows[0].n)) throw new Error(`Destination ${table} is not empty; refusing to overwrite data.`);
  }
  await source.query('COMMIT');
  await mkdir('backups', { recursive: true });
  await writeFile(`backups/pre-supabase-${Date.now()}.json`, JSON.stringify(snapshot), { flag: 'wx', mode: 0o600 });
  const buckets = await (await storage('bucket')).json();
  const existing = buckets.find(item => item.id === bucket);
  if (existing?.public) throw new Error('Destination bucket must be private.');
  if (!existing) await storage('bucket', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:bucket, name:bucket, public:false, file_size_limit:52428800 }) });
  for (const media of snapshot.media_assets) {
    if (!/^[a-f0-9-]+\.(webp|mp4|webm)$/.test(media.storage_key)) throw new Error('Invalid media key.');
    const bytes = await readFile(path.join(process.env.UPLOAD_DIR || './data/uploads', media.storage_key));
    if (bytes.length !== Number(media.size_bytes)) throw new Error('Local media size mismatch.');
    const objectPath = `object/${bucket}/${media.storage_key}`;
    const previous = await fetch(`${base}/storage/v1/object/authenticated/${bucket}/${media.storage_key}`, { headers, signal:AbortSignal.timeout(60000) });
    if (!previous.ok) {
      // Supabase reports absent objects as either 400 or 404.
      const error = await previous.json().catch(() => ({}));
      if (![400,404].includes(previous.status) || !['404','not_found'].includes(String(error.statusCode ?? error.error))) throw new Error('Cannot verify destination object.');
      await storage(objectPath, { method:'POST', headers:{'Content-Type':media.mime_type,'x-upsert':'false'}, body:bytes });
    }
    const remote = new Uint8Array(await (await storage(`object/authenticated/${bucket}/${media.storage_key}`)).arrayBuffer());
    if (digest(bytes) !== digest(remote)) throw new Error('Storage checksum mismatch.');
  }
  await destination.query('BEGIN');
  try {
    // Refuse concurrent edits between the initial inspection and data import.
    await destination.query(`LOCK TABLE ${tables.map(t=>`public.${t}`).join(',')} IN EXCLUSIVE MODE`);
    for (const table of tables) {
      if (Number((await destination.query(`SELECT count(*) AS n FROM public.${table}`)).rows[0].n)) throw new Error('Destination changed during import.');
      const columns = (await destination.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",[table])).rows;
      for (const row of snapshot[table]) {
        const values = columns.map(column => ['json','jsonb'].includes(column.data_type) ? JSON.stringify(row[column.column_name]) : row[column.column_name]);
        await destination.query(`INSERT INTO public.${table} (${columns.map(c=>`"${c.column_name}"`).join(',')}) VALUES (${values.map((_,i)=>`$${i+1}`).join(',')})`, values);
      }
      console.log(`${table}: ${snapshot[table].length} rows imported`);
    }
    await destination.query('COMMIT');
  } catch (error) { await destination.query('ROLLBACK'); throw error; }
  console.log('Import complete. Media checksums verified; source data untouched.');
} catch (error) {
  console.error('Import stopped:', error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g,'[REDACTED]') : 'unknown error');
  process.exitCode = 1;
} finally { await source.end(); await destination.end(); }
