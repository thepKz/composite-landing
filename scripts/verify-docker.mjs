import { execFileSync } from 'node:child_process';
import path from 'node:path';

const name = `thanhloi-handoff-test-${Date.now()}`;
const hostDatabase = new URL(process.env.DATABASE_URL);
hostDatabase.pathname = '/' + (process.env.VERIFY_DATABASE || 'thanhloi_restore_verify');
const mediaFolder = path.resolve(process.env.VERIFY_UPLOAD_DIR || 'data/restore-verified');
const containerDatabase = new URL(hostDatabase);
containerDatabase.hostname = 'db'; containerDatabase.port = '5432';
const network = execFileSync('docker', ['inspect', 'landing_mrdung_ics-db-1', '--format', '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}'], { encoding: 'utf8' }).trim();
const env = { ...process.env, DATABASE_URL: containerDatabase.toString(), SITE_URL: 'http://127.0.0.1:3012', UPLOAD_DIR: '/app/data/uploads' };
let started = false;
try {
  execFileSync('docker', ['run', '-d', '--name', name, '--network', network, '-p', '127.0.0.1:3012:3000', '-e', 'DATABASE_URL', '-e', 'SITE_URL', '-e', 'UPLOAD_DIR', '--mount', `type=bind,source=${mediaFolder},target=/app/data/uploads`, 'thanhloi-composite:handoff'], { env, stdio: 'pipe' });
  started = true;
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { if ((await fetch(env.SITE_URL + '/admin/login')).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!ready) throw new Error('Packaged server did not become ready.');
  const html = await (await fetch(env.SITE_URL)).text();
  if (!html.includes('customer-07.webp')) throw new Error('Homepage photo missing from packaged app.');
  if (process.env.VERIFY_RESTORED_SLUG) {
    const response = await fetch(env.SITE_URL + '/tin-tuc/' + process.env.VERIFY_RESTORED_SLUG);
    if (!response.ok || !(await response.text()).includes('<video')) throw new Error('Restored article/video did not render.');
    const video = await fetch(env.SITE_URL + '/api/media/' + process.env.VERIFY_RESTORED_VIDEO, { headers: { Range: 'bytes=0-99' } });
    if (video.status !== 206 || (await video.arrayBuffer()).byteLength !== 100) throw new Error('Restored video stream failed.');
    console.log('PASS restored published article and video range bytes');
  }
  execFileSync(process.execPath, ['--import', 'tsx', 'scripts/verify-cms.ts'], { env: { ...env, DATABASE_URL: hostDatabase.toString(), UPLOAD_DIR: mediaFolder }, stdio: 'inherit' });
  console.log('PASS standalone Docker runtime against restored database and media.');
} finally {
  if (started) execFileSync('docker', ['rm', '-f', name], { stdio: 'pipe' });
}
