import { mkdir, copyFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { composeDatabase, docker, mediaKey, sha256 } from './handoff-lib.mjs';

const destination = path.resolve(process.argv[2] || `backups/${new Date().toISOString().replaceAll(':', '-')}`);
const uploads = path.resolve(process.env.UPLOAD_DIR || './data/uploads');
const database = decodeURIComponent(new URL(process.env.DATABASE_URL).pathname.slice(1));
const client = await composeDatabase();
try {
  await mkdir(path.dirname(destination), { recursive: true });
  await mkdir(destination); // Never overwrite an existing backup, including an incomplete one.
  await mkdir(path.join(destination, 'media'));
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout='10s'");
  const tables = (await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows;
  if (!tables.length) throw new Error('No application tables found.');
  // Hold writes while the dump and immutable media are copied, yielding one consistent package.
  await client.query(`LOCK TABLE ${tables.map(({ tablename }) => `public."${tablename.replaceAll('"', '""')}"`).join(',')} IN SHARE MODE`);
  const media = (await client.query('SELECT storage_key,size_bytes FROM media_assets ORDER BY storage_key')).rows;
  const dump = path.join(destination, 'database.dump');
  await docker(['pg_dump', '-U', 'thanhloi', '-d', database, '-Fc', '--no-owner', '--no-acl', '--exclude-table-data=public.sessions', '--exclude-table-data=public.rate_limits'], { output: dump });
  const files = [];
  for (const item of media) {
    const key = mediaKey(item.storage_key);
    const target = path.join(destination, 'media', key);
    await copyFile(path.join(uploads, key), target);
    const size = (await stat(target)).size;
    if (size !== Number(item.size_bytes)) throw new Error(`Media size mismatch: ${key}`);
    files.push({ key, size, sha256: await sha256(target) });
  }
  await client.query('COMMIT');
  await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({ version: 1, createdAt: new Date().toISOString(), postgresMajor: 17, databaseSha256: await sha256(dump), media: files }, null, 2), { flag: 'wx', mode: 0o600 });
  console.log(`Backup complete: ${destination} (${files.length} media files). Keep the entire folder private.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Backup incomplete; a package without manifest.json must not be restored.');
  throw error;
} finally { await client.end(); }
