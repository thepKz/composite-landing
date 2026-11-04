import { readFile, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { composeDatabase, docker, mediaKey, sha256 } from './handoff-lib.mjs';

const [sourceArg, database, uploadsArg] = process.argv.slice(2);
if (!sourceArg || !uploadsArg || !/^[a-z][a-z0-9_]{0,62}$/.test(database || '')) {
  throw new Error('Usage: npm run backup:restore -- BACKUP_FOLDER NEW_DATABASE NEW_MEDIA_FOLDER');
}
const source = path.resolve(sourceArg); const uploads = path.resolve(uploadsArg);
const manifest = JSON.parse(await readFile(path.join(source, 'manifest.json'), 'utf8'));
if (manifest.version !== 1 || manifest.postgresMajor !== 17 || !Array.isArray(manifest.media)) throw new Error('Unsupported backup format.');
if (await sha256(path.join(source, 'database.dump')) !== manifest.databaseSha256) throw new Error('Database checksum mismatch.');
const keys = new Set();
for (const file of manifest.media) {
  const key = mediaKey(file.key); if (keys.has(key)) throw new Error('Duplicate media key.'); keys.add(key);
  const sourceFile = path.join(source, 'media', key);
  if ((await stat(sourceFile)).size !== file.size || await sha256(sourceFile) !== file.sha256) throw new Error(`Media checksum mismatch: ${key}`);
}
const client = await composeDatabase();
try {
  if ((await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [database])).rowCount) throw new Error('Target database already exists; restore refuses to overwrite it.');
  await mkdir(uploads); // Requires a new directory and an existing parent.
  for (const file of manifest.media) await copyFile(path.join(source, 'media', file.key), path.join(uploads, file.key));
  await client.query(`CREATE DATABASE "${database}" OWNER thanhloi`);
  await docker(['pg_restore', '-U', 'thanhloi', '-d', database, '--no-owner', '--no-acl', '--single-transaction', '--exit-on-error'], { input: path.join(source, 'database.dump') });
  console.log(`Restored to NEW database ${database} and media folder ${uploads}. Original database unchanged. Update DATABASE_URL and UPLOAD_DIR together only after verification.`);
} finally { await client.end(); }
