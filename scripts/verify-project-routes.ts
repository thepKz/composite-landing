import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
import { savePost } from '../src/lib/posts';

const origin = process.env.SITE_URL!;
assert.ok(origin, 'SITE_URL is required');
const tag = `qa-project-${randomUUID()}`;
const ids: string[] = [];
const slugs = [tag, `${tag}-renamed`, `${tag}-final`, `${tag}-future`, `${tag}-future-renamed`, `${tag}-article`];
let checks = 0;
function check(value: unknown, message: string) {
  assert.ok(value, message); checks++; console.log(`PASS ${message}`);
}
async function request(path: string) {
  return fetch(new URL(path, origin), { redirect: 'manual' });
}
async function redirect(path: string, target: string) {
  const response = await request(path);
  const location = response.headers.get('location');
  const actual = location ? new URL(location, origin) : null;
  check(response.status === 301 && actual?.pathname + (actual?.search ?? '') === target, `${path}: direct 301 to ${target} (status ${response.status}, location ${location})`);
}
const payload = {
  title: 'Temporary project route verification', excerpt: 'Temporary verification fixture.',
  content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Temporary integration verification content, removed after this test completes.' }] }] },
  kind: 'project', status: 'published', publication_action: 'publish',
};
try {
  let project = await savePost({ ...payload, slug: tag }); ids.push(project.id);
  const page = await request(`/du-an/${tag}`);
  const html = await page.text();
  check(page.status === 200, 'published project page returns 200');
  check(html.includes(`rel="canonical" href="${origin}/du-an/${tag}"`), 'project canonical uses /du-an');
  await redirect(`/tin-tuc/${tag}`, `/du-an/${tag}`);
  await redirect(`/kien-thuc/${tag}`, `/du-an/${tag}`);
  project = await savePost({ ...project, slug: slugs[1], publication_action: 'save' });
  project = await savePost({ ...project, slug: slugs[2], publication_action: 'save' });
  for (const slug of slugs.slice(0, 2)) {
    for (const prefix of ['du-an', 'tin-tuc', 'kien-thuc']) {
      await redirect(`/${prefix}/${slug}?source=qa`, `/du-an/${slugs[2]}?source=qa`);
    }
  }
  check((await request(`/du-an/${slugs[2]}`)).status === 200, 'renamed project remains available');
  let future = await savePost({ ...payload, slug: slugs[3], publication_action: 'schedule', scheduled_at: new Date(Date.now() + 86400000).toISOString() }); ids.push(future.id);
  future = await savePost({ ...future, slug: slugs[4], publication_action: 'save' });
  for (const slug of slugs.slice(3, 5)) {
    for (const prefix of ['du-an', 'tin-tuc', 'kien-thuc']) {
      check((await request(`/${prefix}/${slug}`)).status === 404, `scheduled project and alias hidden: /${prefix}/${slug}`);
    }
  }
  for (const path of ['/du-an', `/tin-tuc?q=${encodeURIComponent(slugs[4])}`, '/sitemap.xml']) {
    const response = await request(path);
    check(response.status === 200 && !(await response.text()).includes(`/du-an/${slugs[4]}`), `scheduled project absent from ${path}`);
  }
  const article = await savePost({ ...payload, slug: slugs[5], kind: 'article' }); ids.push(article.id);
  await redirect(`/kien-thuc/${slugs[5]}`, `/tin-tuc/${slugs[5]}`);
  check((await request(`/tin-tuc/${slugs[5]}`)).status === 200, 'article remains available under /tin-tuc');
  check((await request(`/du-an/${slugs[5]}`)).status === 404, 'article is not served as a project');
  console.log(`Project route integration: ${checks} checks passed.`);
} finally {
  await db.query('DELETE FROM posts WHERE id=ANY($1::uuid[])', [ids]);
  const paths = slugs.flatMap(slug => ['du-an', 'tin-tuc', 'kien-thuc'].map(prefix => `/${prefix}/${slug}`));
  await db.query('DELETE FROM redirects WHERE source_path=ANY($1::text[])', [paths]);
  const remaining = await db.query('SELECT id FROM posts WHERE id=ANY($1::uuid[]) UNION ALL SELECT NULL::uuid FROM redirects WHERE source_path=ANY($2::text[])', [ids, paths]);
  assert.equal(remaining.rowCount, 0, 'temporary fixtures cleaned');
  console.log('PASS temporary posts and aliases cleaned');
  await db.end();
}
