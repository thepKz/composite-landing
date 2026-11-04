import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';
import { sessionHash } from './security';
import { requestOriginMatches } from './auth-policy';

const COOKIE = 'thanhloi_session';
const DURATION = 60 * 60 * 12;

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const result = await db.query('SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now()', [sessionHash(token)]);
  return result.rows[0] as { id: string; email: string; name: string } | undefined ?? null;
}

export async function createSession(userId: string) {
  const jar = await cookies();
  const previous = jar.get(COOKIE)?.value;
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + DURATION * 1000);
  // Rotate only this browser's old token; a failed insert rolls the deletion back.
  await db.query(`WITH previous AS (DELETE FROM sessions WHERE token_hash=$4)
    INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)`,
  [sessionHash(token), userId, expires, previous && /^[a-f0-9]{64}$/.test(previous) ? sessionHash(previous) : null]);
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: DURATION, expires });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) await db.query('DELETE FROM sessions WHERE token_hash=$1', [sessionHash(token)]);
  jar.delete(COOKIE);
}

export function validOrigin(request: Request) {
  return requestOriginMatches(request.headers.get('origin'), process.env.SITE_URL);
}

export async function consumeLimit(key: string, maximum: number, seconds: number) {
  const result = await db.query(`INSERT INTO rate_limits(key,hits,resets_at) VALUES ($1,1,now()+$2*interval '1 second')
    ON CONFLICT (key) DO UPDATE SET hits=CASE WHEN rate_limits.resets_at <= now() THEN 1 ELSE rate_limits.hits+1 END,
    resets_at=CASE WHEN rate_limits.resets_at <= now() THEN now()+$2*interval '1 second' ELSE rate_limits.resets_at END RETURNING hits`, [key, seconds]);
  return result.rows[0].hits <= maximum;
}

export async function consumePublicLimit(request: Request, scope: 'inquiry' | 'login') {
  // Trust this header only behind a reverse proxy that replaces client-supplied values.
  const source = process.env.TRUST_PROXY === 'true' ? request.headers.get('x-real-ip') : null;
  if (source && !await consumeLimit(`${scope}:source:${sessionHash(source)}`, scope === 'login' ? 30 : 12, 900)) return false;
  return consumeLimit(`${scope}:global`, scope === 'login' ? 200 : 100, 900);
}
