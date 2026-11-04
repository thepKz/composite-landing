import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword, slugify, safeLink, sessionHash } from '../src/lib/security';

test('password hashes are salted and verify only the original password', async () => {
  const first = await hashPassword('A-real-long-password-2026');
  const second = await hashPassword('A-real-long-password-2026');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('A-real-long-password-2026', first), true);
  assert.equal(await verifyPassword('incorrect', first), false);
  assert.equal(await verifyPassword('anything', 'malformed'), false);
});

test('Vietnamese titles produce stable readable slugs', () => {
  assert.equal(slugify('Bể Biogas đường kính 2,70 m'), 'be-biogas-duong-kinh-2-70-m');
  assert.equal(slugify('  Đặt bể theo yêu cầu!  '), 'dat-be-theo-yeu-cau');
});

test('links reject script and protocol-relative payloads', () => {
  for (const link of ['javascript:alert(1)', 'data:text/html,test', '//evil.test', '/\\evil.test', 'vbscript:msgbox(1)']) {
    assert.equal(safeLink(link), false, link);
  }
  assert.equal(safeLink('https://example.com/a'), true);
  assert.equal(safeLink('/san-pham/be-biogas'), true);
});

test('session tokens are never stored as plaintext', () => {
  const token = 'a'.repeat(64);
  assert.notEqual(sessionHash(token), token);
  assert.equal(sessionHash(token).length, 64);
});
