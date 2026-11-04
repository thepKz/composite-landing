import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query('SELECT pg_advisory_lock(872341)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const files = (await readdir(new URL('../db/migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const existing = await client.query('SELECT 1 FROM schema_migrations WHERE version=$1', [file]);
    if (existing.rowCount) continue;
    await client.query('BEGIN');
    try {
      await client.query(await readFile(new URL(`../db/migrations/${file}`, import.meta.url), 'utf8'));
      await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
} finally {
  await client.query('SELECT pg_advisory_unlock(872341)');
  client.release();
  await pool.end();
}
