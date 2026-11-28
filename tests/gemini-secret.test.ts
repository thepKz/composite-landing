import assert from 'node:assert/strict';
import test from 'node:test';
import { sealGeminiKey, openGeminiKey } from '../src/lib/gemini-secret';

test('Gemini secrets encrypt with random IVs and reject tampering or a different key', () => {
  const secret = 'ab'.repeat(32);
  const sealed = sealGeminiKey('test-api-key', secret);
  assert.equal(openGeminiKey(sealed, secret), 'test-api-key');
  assert.ok(!sealed.includes('test-api-key'));
  assert.notEqual(sealed, sealGeminiKey('test-api-key', secret));
  assert.throws(() => openGeminiKey(sealed, 'cd'.repeat(32)));
  const parts = sealed.split('.');
  parts[2] = Buffer.from('tampered').toString('base64');
  assert.throws(() => openGeminiKey(parts.join('.'), secret));
  assert.throws(() => sealGeminiKey('key', 'short'));
});
