import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['file-type'],
  // file-type loads strtok3's Node entry dynamically; include it in standalone output.
  outputFileTracingIncludes: { '/api/admin/media': ['./node_modules/strtok3/**/*'] },
  turbopack: { root: process.cwd() },
  outputFileTracingExcludes: { '/*': ['./data/**/*','./backups/**/*','./.env*','./.impeccable/**/*'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default config;
