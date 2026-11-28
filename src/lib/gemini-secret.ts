import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function encryptionKey(value: string) {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('Invalid Gemini encryption key');
  return Buffer.from(value, 'hex');
}

export function sealGeminiKey(value: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(part => part.toString('base64')).join('.');
}

export function openGeminiKey(value: string, secret: string): string {
  const parts = value.split('.');
  if (parts.length !== 3) throw new Error('Invalid encrypted Gemini key');
  const [iv, tag, encrypted] = parts.map(part => Buffer.from(part, 'base64'));
  const cipher = createDecipheriv('aes-256-gcm', encryptionKey(secret), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(encrypted), cipher.final()]).toString('utf8');
}
