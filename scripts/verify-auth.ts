import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
import { hashPassword, sessionHash } from '../src/lib/security';

const origin = process.env.SITE_URL;
if (!origin) throw new Error('SITE_URL is required. Run with --env-file=.env.');
const id = randomUUID();
const email = `qa-auth-${id}@example.test`;
const missingEmail = `qa-auth-missing-${id}@example.test`;
const password = randomBytes(24).toString('hex');
const accountKey = `login:${sessionHash(email)}`;
let checks = 0;
function check(value: unknown, name: string) { assert.ok(value, name); checks++; console.log(`PASS ${name}`); }
function request(path: string, options: { cookie?: string; body?: unknown; method?: string; origin?: string | null } = {}) {
  const headers: Record<string, string> = {};
  const source = options.origin === undefined ? origin! : options.origin;
  if (source) headers.Origin = source;
  if (options.cookie) headers.Cookie = options.cookie;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(origin + path, { method: options.method || 'GET', headers, body: options.body === undefined ? undefined : JSON.stringify(options.body), redirect: 'manual' });
}
function login(candidate = password, cookie?: string, account = email) {
  return request('/api/auth/login', { method: 'POST', body: { email: account, password: candidate }, cookie });
}
function cookieOf(response: Response) { const value = response.headers.get('set-cookie'); assert.ok(value, 'session cookie present'); return value.split(';')[0]; }

try {
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [id, email, 'Auth verification fixture', await hashPassword(password)]);
  check((await request('/api/admin/settings')).status === 401, 'anonymous administration denied');
  for (const source of [null, 'https://attacker.example']) {
    const response = await request('/api/auth/login', { method: 'POST', body: { email, password }, origin: source });
    check(response.status === 403 && response.headers.get('cache-control') === 'no-store', 'login rejects absent or foreign origin without caching');
  }
  const absent = await login(password, undefined, missingEmail);
  const wrong = await login('wrong-password');
  check(absent.status === 401 && wrong.status === 401 && (await absent.json()).error === (await wrong.json()).error, 'unknown account and wrong password return the same error');
  const first = await login(password, undefined, `  ${email.toUpperCase()}  `);
  check(first.status === 200 && first.headers.get('cache-control') === 'no-store', 'pasted mixed-case email logs in without caching');
  const flags = first.headers.get('set-cookie')!;
  check(/httponly/i.test(flags) && /samesite=lax/i.test(flags) && /max-age=43200/i.test(flags) && /path=\//i.test(flags), 'session cookie is HttpOnly, SameSite Lax, root-scoped and lasts twelve hours');
  const firstCookie = cookieOf(first);
  const page = await request('/admin/login', { cookie: firstCookie });
  check(page.status === 307 && page.headers.get('location') === '/admin', 'signed-in login page redirects to administration');
  const rotated = await login(password, firstCookie);
  check(rotated.status === 200, 'repeat login succeeds');
  let cookie = cookieOf(rotated);
  check(cookie !== firstCookie && (await request('/api/admin/settings', { cookie: firstCookie })).status === 401, 'rotation revokes the previous browser token');
  check((await request('/api/admin/settings', { cookie })).status === 200, 'rotated token remains authorized');
  for (let attempt = 0; attempt < 7; attempt++) assert.equal((await login('wrong-password')).status, 401);
  const recovered = await login(password, cookie);
  check(recovered.status === 200, 'valid login succeeds before the failed-attempt threshold');
  cookie = cookieOf(recovered);
  check((await db.query('SELECT key FROM rate_limits WHERE key=$1', [accountKey])).rowCount === 0, 'successful authentication resets only its account attempt counter');
  for (const source of [null, 'https://attacker.example']) {
    check((await request('/api/auth/logout', { method: 'POST', cookie, origin: source })).status === 403, 'logout rejects absent or foreign origin');
  }
  check((await request('/api/admin/settings', { cookie })).status === 200, 'rejected logout preserves the active session');
  const logout = await request('/api/auth/logout', { method: 'POST', cookie });
  check(logout.status === 200 && logout.headers.get('cache-control') === 'no-store' && /expires=Thu, 01 Jan 1970/i.test(logout.headers.get('set-cookie') || ''), 'logout clears the cookie with an uncached JSON response');
  check((await request('/api/admin/settings', { cookie })).status === 401, 'logout revokes the token on the server');
  check((await request('/api/auth/logout', { method: 'POST' })).status === 200, 'logout without a session is idempotent');
  const expiring = await login();
  assert.equal(expiring.status, 200);
  cookie = cookieOf(expiring);
  await db.query("UPDATE sessions SET expires_at=now()-interval '1 second' WHERE user_id=$1", [id]);
  check((await request('/api/admin/settings', { cookie })).status === 401, 'server expiry denies a cookie that the client still retains');
  check((await request('/api/auth/logout', { method: 'POST', cookie })).status === 200, 'expired session can be cleared');
  for (let attempt = 0; attempt < 8; attempt++) assert.equal((await login('wrong-password')).status, 401);
  const limited = await login();
  check(limited.status === 429 && limited.headers.get('retry-after') === '900' && limited.headers.get('cache-control') === 'no-store', 'account throttling denies the ninth attempt with Retry-After');
  console.log(`Auth verification: ${checks} checks passed.`);
} finally {
  await db.query('DELETE FROM users WHERE id=$1', [id]);
  await db.query('DELETE FROM rate_limits WHERE key=ANY($1)', [[accountKey, `login:${sessionHash(missingEmail)}`]]);
  await db.end();
}
