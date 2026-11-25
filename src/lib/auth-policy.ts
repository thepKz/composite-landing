import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(1).max(256),
});

export function requestOriginMatches(origin: string | null, site: string | undefined, additionalSites: string[] = []): boolean {
  if (additionalSites.length) return [site, ...additionalSites].some(expected => requestOriginMatches(origin, expected));
  if (!origin || !site) return false;
  try {
    const incoming = new URL(origin);
    const expected = new URL(site);
    return ['http:', 'https:'].includes(incoming.protocol)
      && ['http:', 'https:'].includes(expected.protocol)
      && !incoming.username && !incoming.password
      && incoming.pathname === '/' && !incoming.search && !incoming.hash
      && incoming.origin === expected.origin;
  } catch { return false; }
}
