import assert from 'node:assert/strict';
import test from 'node:test';
import { usesSupabaseAuth, verifySupabasePassword } from '../src/lib/supabase-auth';

const env = { SUPABASE_URL: 'https://project.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'public-test-key' };
const identity = { id: 'auth-user-id', email: 'admin@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' };

test('Auth provider is explicit and unsupported configuration fails closed', () => {
  assert.equal(usesSupabaseAuth({}), false);
  assert.equal(usesSupabaseAuth({ AUTH_PROVIDER: 'local' }), false);
  assert.equal(usesSupabaseAuth({ AUTH_PROVIDER: 'supabase' }), true);
  assert.throws(() => usesSupabaseAuth({ AUTH_PROVIDER: 'supabse' }));
});

test('Supabase verifies confirmed email and never returns provider tokens', async t => {
  t.mock.method(globalThis, 'fetch', async (url: URL, options: RequestInit) => {
    assert.equal(String(url), 'https://project.supabase.co/auth/v1/token?grant_type=password');
    assert.equal(options.method, 'POST');
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(JSON.parse(String(options.body)), { email: 'admin@example.com', password: ' secret password ' });
    assert.equal((options.headers as Record<string, string>).apikey, 'public-test-key');
    return Response.json({ user: identity, access_token: 'never-returned', refresh_token: 'never-returned' });
  });
  assert.equal(await verifySupabasePassword('admin@example.com', ' secret password ', env), true);
});

test('Supabase rejects unconfirmed, missing and different identities', async t => {
  for (const user of [null, {}, { ...identity, email: 'other@example.com' }, { ...identity, email_confirmed_at: null }, { ...identity, email_confirmed_at: 'invalid' }, { ...identity, factors: [{ status: 'verified' }] }]) {
    const mocked = t.mock.method(globalThis, 'fetch', async () => Response.json({ user }));
    assert.equal(await verifySupabasePassword('admin@example.com', 'password', env), false);
    mocked.mock.restore();
  }
});

test('Supabase credential rejection differs from provider failures without exposing response details', async t => {
  for (const status of [400, 401, 422, 429, 500]) {
    const mocked = t.mock.method(globalThis, 'fetch', async () => new Response('sensitive provider error', { status }));
    if (status < 429) assert.equal(await verifySupabasePassword('admin@example.com', 'password', env), false);
    else await assert.rejects(verifySupabasePassword('admin@example.com', 'password', env), { message: 'Supabase Auth is unavailable.' });
    mocked.mock.restore();
  }
});

test('Supabase configuration requires a secure origin and a public API key', async () => {
  for (const url of ['http://project.supabase.co', 'https://user@project.supabase.co', 'https://project.supabase.co/path', 'https://project.supabase.co?x=1']) {
    await assert.rejects(verifySupabasePassword('admin@example.com', 'password', { ...env, SUPABASE_URL: url }));
  }
  await assert.rejects(verifySupabasePassword('admin@example.com', 'password', { SUPABASE_URL: env.SUPABASE_URL }));
});
