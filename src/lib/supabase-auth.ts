export function usesSupabaseAuth(env: Record<string, string | undefined> = process.env) {
  if (!env.AUTH_PROVIDER || env.AUTH_PROVIDER === 'local') return false;
  if (env.AUTH_PROVIDER !== 'supabase') throw new Error('Unsupported AUTH_PROVIDER.');
  return true;
}

export async function verifySupabasePassword(email: string, password: string, env: Record<string, string | undefined> = process.env) {
  const url = new URL(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '');
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || !key) {
    throw new Error('Supabase Auth configuration is incomplete.');
  }
  const response = await fetch(new URL('/auth/v1/token?grant_type=password', url), {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 400 || response.status === 401 || response.status === 422) return false;
  if (!response.ok) throw new Error('Supabase Auth is unavailable.');
  const data = await response.json();
  // ponytail: deny MFA accounts until the login UI supports challenge verification.
  return typeof data.user?.id === 'string'
    && typeof data.user?.email === 'string'
    && data.user.email.toLowerCase() === email
    && typeof data.user?.email_confirmed_at === 'string'
    && Number.isFinite(Date.parse(data.user.email_confirmed_at))
    && !data.user.factors?.some((factor: { status?: string }) => factor.status === 'verified');
}
