import assert from 'node:assert/strict';
import test from 'node:test';
import { isDemoMode } from '../src/lib/demo-mode';
import { products, company, publishedPosts } from '../src/lib/content';
import { catalogue } from '../src/lib/catalogue';

test('missing database serves the supplied catalogue without querying PostgreSQL', async () => {
  const database = process.env.DATABASE_URL;
  const demo = process.env.DEMO_MODE;
  try {
    delete process.env.DATABASE_URL;
    delete process.env.DEMO_MODE;
    assert.equal(isDemoMode(), true);
    const items = await products();
    assert.deepEqual(items.map(item => item.slug), catalogue.map(item => item.slug));
    assert.equal((await company())?.name, 'Thành Lợi Composite');
    assert.deepEqual(await publishedPosts(), []);
    items[0].applications.push('temporary test');
    assert.equal((await products())[0].applications.includes('temporary test'), false);
    process.env.DATABASE_URL = 'postgresql://configured';
    assert.equal(isDemoMode(), false);
    process.env.DEMO_MODE = 'true';
    assert.equal(isDemoMode(), true);
  } finally {
    if (database === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = database;
    if (demo === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = demo;
  }
});
