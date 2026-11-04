import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createHash } from 'node:crypto';
import pg from 'pg';

export async function docker(args, { input, output } = {}) {
  const child = spawn('docker', ['compose', 'exec', '-T', 'db', ...args], { stdio: ['pipe', 'pipe', 'pipe'] });
  let stderr = ''; let stdout = '';
  child.stderr.on('data', chunk => { stderr += chunk; });
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`Database tool failed (${code}): ${stderr}`)));
  });
  const streams = [done];
  if (input) streams.push(pipeline(createReadStream(input), child.stdin)); else child.stdin.end();
  if (output) streams.push(pipeline(child.stdout, createWriteStream(output, { flags: 'wx', mode: 0o600 })));
  else child.stdout.on('data', chunk => { stdout += chunk; });
  await Promise.all(streams);
  return stdout.trim();
}

export async function composeDatabase() {
  const url = new URL(process.env.DATABASE_URL);
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  try {
    const local = (await client.query('SELECT system_identifier::text FROM pg_control_system()')).rows[0].system_identifier;
    const container = await docker(['psql', '-U', 'thanhloi', '-d', 'thanhloi', '-Atc', 'SELECT system_identifier FROM pg_control_system()']);
    if (local !== container || !/^[a-z][a-z0-9_]{0,62}$/.test(decodeURIComponent(url.pathname.slice(1)))) throw new Error('DATABASE_URL must point to a database in this project Compose cluster with a simple lowercase name.');
    return client;
  } catch (error) { await client.end(); throw error; }
}

export async function sha256(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

export function mediaKey(key) {
  if (!/^[a-f0-9-]+\.(webp|mp4|webm)$/.test(key)) throw new Error('Invalid media storage key in backup.');
  return key;
}
