import { mkdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const origin = process.env.DEMO_ORIGIN || 'http://127.0.0.1:3002';
const output = path.resolve(process.argv[2] || 'deliverables/netlify-site-demo');
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 16);
const publicPath = /^\/(?:$|gioi-thieu\/?$|lien-he\/?$|du-an(?:\/[^?#]*)?$|san-pham(?:\/[^?#]*)?$|tin-tuc(?:\/[^?#]*)?$|chinh-sach-[a-z-]+\/?$|huong-dan-dat-hang\/?$)/;
const queue = ['/'];
const visited = new Set();
const resources = new Map();
const styles = new Map();
const exported = [];
const searchIndex = [];
await mkdir(path.join(output, 'assets'), { recursive: true });
function localPage(url) {
  const clean = url.pathname.replace(/\/$/, '') || '/';
  return url.search ? `${clean === '/' ? '' : clean}/_query/${hash(url.search)}/` : `${clean === '/' ? '' : clean}/`;
}
async function resource(url) {
  const absolute = new URL(url, origin).href;
  if (resources.has(absolute)) return resources.get(absolute);
  const response = await fetch(absolute);
  if (!response.ok) throw new Error(`Resource failed (${response.status}): ${new URL(absolute).pathname}`);
  const type = response.headers.get('content-type') || '';
  const extension = path.extname(new URL(absolute).pathname) || ({'image/webp':'.webp','image/png':'.png','image/jpeg':'.jpg','image/svg+xml':'.svg'}[type.split(';')[0]] || '.bin');
  const name = `${hash(absolute)}${extension}`;
  await writeFile(path.join(output, 'assets', name), Buffer.from(await response.arrayBuffer()));
  resources.set(absolute, `/assets/${name}`);
  return `/assets/${name}`;
}
async function stylesheet(href) {
  const absolute = new URL(href, origin).href;
  if (styles.has(absolute)) return styles.get(absolute);
  const response = await fetch(absolute);
  if (!response.ok) throw new Error(`Stylesheet failed: ${response.status}`);
  let css = await response.text();
  for (const match of [...css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)]) {
    if (/^(?:data:|#|\/images\/)/.test(match[1])) continue;
    css = css.replaceAll(match[0], `url("${await resource(new URL(match[1], absolute).href)}")`);
  }
  css = css.replace(/\/\*# sourceMappingURL=.*?\*\//g, '');
  const target = `/assets/style-${hash(absolute)}.css`;
  await writeFile(path.join(output, target), css);
  styles.set(absolute, target);
  return target;
}
while (queue.length) {
  const route = queue.shift();
  if (visited.has(route)) continue;
  if (visited.size >= 250) throw new Error('Export exceeded 250 public routes; inspect pagination before increasing the limit.');
  visited.add(route);
  const url = new URL(route, origin);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Page ${route} returned ${response.status}`);
  const source = await response.text();
  if (/^\/(?:tin-tuc|du-an)\/[^/]+\/?$/.test(url.pathname)) {
    const decode = text => text.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    searchIndex.push({ title: decode(source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || ''), excerpt: decode(source.match(/<p class="article-excerpt">([\s\S]*?)<\/p>/)?.[1] || ''), kind: url.pathname.startsWith('/du-an/') ? 'project' : 'article', href: localPage(url) });
  }
  let html = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<link\b[^>]*>/gi, tag => /rel="stylesheet"/i.test(tag) ? tag : '')
    .replace(/<meta\b[^>]*(?:property="og:url"|name="robots")[^>]*>/gi, '')
    .replace(/<a\b[^>]*href="\/admin[^\"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  for (const [tag, href] of [...html.matchAll(/<link\b[^>]*href="([^"]+)"[^>]*>/gi)]) {
    html = html.replace(tag, `<link rel="stylesheet" href="${await stylesheet(href.replaceAll('&amp;', '&'))}">`);
  }
  for (const [attribute, src] of [...html.matchAll(/src="(\/api\/media\/[^"?]+)[^"]*"/g)]) html = html.replace(attribute, `src="${await resource(src)}"`);
  html = html.replace(/href="(\/[^"#]*)(#[^"]*)?"/g, (attribute, href, fragment = '') => {
    const next = new URL(href.replaceAll('&amp;', '&'), origin);
    if (!publicPath.test(next.pathname)) return attribute;
    const nextRoute = next.pathname + next.search;
    if (!visited.has(nextRoute)) queue.push(nextRoute);
    return `href="${localPage(next)}${fragment}"`;
  });
  html = html.replace(/(<form\b[^>]*class="inquiry-form"[^>]*>)([\s\S]*?)(<\/form>)/g, (_, open, body, close) => open + '<p class="demo-notice">Bản demo giao diện — biểu mẫu không gửi hoặc lưu thông tin. Vui lòng dùng dữ liệu thử.</p>' + body.replace(/<button\b/, '<button disabled') + close);
  html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/assets/demo.css"></head>');
  html = html.replace('</body>', '<script src="/assets/gsap.min.js" defer></script><script src="/assets/ScrollTrigger.min.js" defer></script><script src="/assets/demo.js" defer></script></body>');
  if (/(?:localhost:|127\.0\.0\.1:|(?:src|href)="\/_next\/)/.test(html)) throw new Error(`Local/Next references remain on ${route}`);
  const folder = path.join(output, localPage(url));
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), html);
  exported.push({ source: route, path: localPage(url) });
}
await cp('public/images', path.join(output, 'images'), { recursive: true });
for (const name of ['gsap.min.js', 'ScrollTrigger.min.js']) await copyFile(`node_modules/gsap/dist/${name}`, path.join(output, 'assets', name));
await copyFile('scripts/demo/demo.css', path.join(output, 'assets/demo.css'));
const choreography = (await readFile('src/lib/public-choreography.js', 'utf8')).replace('export function', 'function');
await writeFile(path.join(output, 'assets/demo.js'), choreography + '\n' + await readFile('scripts/demo/demo.js', 'utf8'));
await writeFile(path.join(output, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Robots-Tag: noindex, nofollow\n');
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
await writeFile(path.join(output, 'export-manifest.json'), JSON.stringify({ exportedAt: new Date().toISOString(), pages: exported }, null, 2));
await writeFile(path.join(output, 'assets/news-search.json'), JSON.stringify(searchIndex));
await writeFile(path.join(output, 'README.txt'), 'THANH LOI - MULTIPAGE NETLIFY DEMO\n\nUpload this folder to Netlify Drop. index.html is at the root.\nPublic navigation opens separate HTML pages. Assets and GSAP are local.\nThis is a snapshot of currently public content. Form submissions are disabled.\nAdmin login, scheduling and database run in the full Next.js application, not in this static package. Re-export to update published content.\n');
console.log(`Exported ${exported.length} public pages to ${output}`);
