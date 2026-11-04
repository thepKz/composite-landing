import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derive = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 256) throw new Error('Mật khẩu cần từ 12 đến 256 ký tự.');
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (password.length > 256) return false;
  const [algorithm, salt, encoded, extra] = stored.split(':');
  if (algorithm !== 'scrypt' || extra || !/^[a-f0-9]{32}$/.test(salt ?? '') || !/^[a-f0-9]{128}$/.test(encoded ?? '')) return false;
  const key = await derive(password, salt, 64) as Buffer;
  return timingSafeEqual(key, Buffer.from(encoded, 'hex'));
}

export function sessionHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/, '');
}

export function safeLink(value: string) {
  if (/[\u0000-\u0020\\]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(value).protocol); }
  catch { return false; }
}
