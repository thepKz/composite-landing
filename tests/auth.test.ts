import assert from 'node:assert/strict';
import test from 'node:test';
import { loginSchema, requestOriginMatches } from '../src/lib/auth-policy';
import { hashPassword, verifyPassword } from '../src/lib/security';

test('login normalizes pasted email before validation but preserves password bytes', () => {
  const parsed = loginSchema.parse({ email: '  ADMIN@Example.com  ', password: ' secret password ' });
  assert.equal(parsed.email, 'admin@example.com');
  assert.equal(parsed.password, ' secret password ');
  for (const email of ['', 'not-an-email', 'x'.repeat(255) + '@example.com']) {
    assert.equal(loginSchema.safeParse({ email, password: 'password' }).success, false);
  }
  for (const password of ['', 'x'.repeat(257), null, 123]) {
    assert.equal(loginSchema.safeParse({ email: 'admin@example.com', password }).success, false);
  }
});

test('mutation origins require the configured http(s) origin and fail closed', () => {
  const site = 'https://admin.example.com';
  assert.equal(requestOriginMatches(site, site), true);
  assert.equal(requestOriginMatches('https://admin.example.com:443', site), true);
  assert.equal(requestOriginMatches('http://localhost:3002', 'http://localhost:3002'), true);
  for (const origin of [null, 'null', '', 'https://evil.example.com', 'http://admin.example.com', 'https://admin.example.com:444', 'https://admin.example.com.evil.test', 'https://admin.example.com/path', 'https://user@admin.example.com', 'https://admin.example.com?x=1', 'https://admin.example.com#hash']) {
    assert.equal(requestOriginMatches(origin, site), false, String(origin));
  }
  assert.equal(requestOriginMatches(site, undefined), false);
  assert.equal(requestOriginMatches(site, 'invalid'), false);
  assert.equal(requestOriginMatches('file:///a', 'file:///b'), false);
});

test('password verification rejects oversized and malformed hashes without throwing', async () => {
  const password = ' auth-test-password ';
  const hash = await hashPassword(password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword(password.trim(), hash), false);
  assert.equal(await verifyPassword('x'.repeat(257), hash), false);
  for (const invalid of ['', 'scrypt:bad:bad', hash + ':extra', hash.replace('scrypt:', 'sha256:')]) {
    assert.equal(await verifyPassword(password, invalid), false);
  }
});
