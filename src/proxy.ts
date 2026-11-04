import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { isDemoMode } from '@/lib/demo-mode';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/') || pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (isDemoMode()) {
      if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Bản xem thử chưa kết nối dữ liệu. Chức năng này chưa được bật.' }, { status: 503 });
      if (pathname !== '/admin/login') return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }
  if (pathname === '/kien-thuc') {
    const target = request.nextUrl.clone(); target.pathname = '/tin-tuc';
    return NextResponse.redirect(target, 301);
  }
  if (isDemoMode()) return NextResponse.next();
  if (/^\/(kien-thuc|tin-tuc|du-an)\/[a-z0-9-]+$/.test(pathname)) {
    const canonical = pathname.replace(/^\/(kien-thuc|du-an)\//, '/tin-tuc/');
    // Normalize both namespaces while resolving aliases, without rewriting stored history.
    const result = await db.query(`WITH RECURSIVE edges AS (
      SELECT DISTINCT regexp_replace(source_path,'^/(kien-thuc|du-an)/','/tin-tuc/') AS source,
        regexp_replace(target_path,'^/(kien-thuc|du-an)/','/tin-tuc/') AS target
      FROM redirects WHERE source_path LIKE '/kien-thuc/%' OR source_path LIKE '/tin-tuc/%' OR source_path LIKE '/du-an/%'
    ), paths(path,visited,depth) AS (
      SELECT $1::text,ARRAY[$1::text],0
      UNION ALL SELECT e.target,p.visited||e.target,p.depth+1 FROM paths p JOIN edges e ON e.source=p.path
      WHERE p.depth<20 AND NOT e.target=ANY(p.visited)
    ) SELECT CASE WHEN p.kind='project' THEN '/du-an/' ELSE '/tin-tuc/' END||p.slug AS target FROM paths r JOIN posts p ON r.path='/tin-tuc/'||p.slug
      WHERE p.status='published' AND p.published_at<=now() AND ($2=false OR p.kind='project') ORDER BY r.depth DESC LIMIT 1`, [canonical, pathname.startsWith('/du-an/')]);
    const target = result.rows[0]?.target;
    if (target && target !== pathname && /^\/(tin-tuc|du-an)\/[a-z0-9-]+$/.test(target)) {
      const url = request.nextUrl.clone(); url.pathname = target;
      return NextResponse.redirect(url, 301);
    }
    return NextResponse.next();
  }
  const result = await db.query(`SELECT target_path FROM redirects r WHERE source_path=$1 AND
    EXISTS(SELECT 1 FROM products p WHERE '/san-pham/'||p.slug=r.target_path AND p.is_published=true)`, [pathname]);
  const target = result.rows[0]?.target_path;
  if (target && /^\/san-pham\/[a-z0-9-]+$/.test(target)) return NextResponse.redirect(new URL(target, request.url), 301);
  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*', '/admin/:path*', '/kien-thuc', '/kien-thuc/:slug', '/tin-tuc/:slug', '/du-an/:slug', '/san-pham/:slug'] };
