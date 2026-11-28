import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareTranslation, translateArticle } from '../src/lib/article-translation';

const image = '/api/media/a49c798a-c97d-4f42-a143-943dd83b8a4b';
const article = {
  title: 'Bể composite', excerpt: 'Sản phẩm Thành Lợi', seo_title: '', seo_description: '',
  content: { type: 'doc', content: [
    { type: 'paragraph', content: [
      { type: 'text', text: 'Bể ', marks: [{ type: 'bold' }] },
      { type: 'text', text: 'composite', marks: [{ type: 'link', attrs: { href: 'https://example.com/spec' } }] },
    ] },
    { type: 'image', attrs: { src: image, alt: 'Bể xanh', title: 'Ảnh sản phẩm', align: 'left', width: 60 } },
    { type: 'codeBlock', content: [{ type: 'text', text: 'KEEP_THIS_CODE' }] },
  ] },
};

test('translation changes text only, preserves media, marks, whitespace, layout and source', () => {
  const before = structuredClone(article);
  const prepared = prepareTranslation(article);
  assert.equal(prepared.segments.length, 6);
  assert.ok(!JSON.stringify(prepared.segments).includes(image));
  const result = prepared.apply(['Composite tanks', 'Thanh Loi products', 'Tank', 'composite', 'Blue tank', 'Product photo']);
  assert.equal(result.content.content![0].content![0].text, 'Tank ');
  assert.deepEqual(result.content.content![0].content![0].marks, [{ type: 'bold' }]);
  assert.equal(result.content.content![0].content![1].marks![0].attrs!.href, 'https://example.com/spec');
  assert.deepEqual(result.content.content![1].attrs, { src: image, alt: 'Blue tank', title: 'Product photo', align: 'left', width: 60 });
  assert.equal(result.content.content![2].content![0].text, 'KEEP_THIS_CODE');
  assert.deepEqual(article, before);
});

test('translation rejects missing, empty, oversized and structural model output', () => {
  const prepared = prepareTranslation(article);
  for (const value of [[], {}, ['one'], Array(6).fill(''), Array(6).fill({ text: 'bad' }), Array(6).fill('x'.repeat(601))]) {
    assert.throws(() => prepared.apply(value));
  }
  assert.throws(() => prepareTranslation({ ...article, content: { type: 'doc', content: [{ type: 'text', text: 'x'.repeat(45001) }] } }));
  assert.throws(() => prepareTranslation({ ...article, content: { type: 'doc', content: [{ type: 'image', attrs: { src: 'https://attacker.test/image' } }] } }));
});

test('Gemini request uses fixed origin, header key and structured response; truncated output fails', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (input, init) => {
    calls++;
    assert.equal(input, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    assert.equal(new Headers(init?.headers).get('X-goog-api-key'), 'test-key');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    assert.equal(body.generationConfig.responseSchema.type, 'ARRAY');
    assert.ok(!String(init?.body).includes(image));
    return Response.json({ candidates: [{ finishReason: calls === 1 ? 'STOP' : 'MAX_TOKENS', content: { parts: [{ text: JSON.stringify(['Composite tanks', 'Thanh Loi products', 'Tank', 'composite', 'Blue tank', 'Product photo']) }] } }] });
  };
  assert.equal((await translateArticle(article, { apiKey: 'test-key', model: 'gemini-2.5-flash' }, fetcher)).title, 'Composite tanks');
  await assert.rejects(translateArticle(article, { apiKey: 'test-key', model: 'gemini-2.5-flash' }, fetcher), /đầy đủ/);
  await assert.rejects(translateArticle(article, { apiKey: 'test-key', model: '../bad' }, fetcher), /model/);
  assert.equal(calls, 2);
});

test('provider errors never echo credentials or provider response', async () => {
  for (const status of [400, 403, 404, 429, 500]) {
    await assert.rejects(translateArticle(article, { apiKey: 'secret', model: 'gemini-2.5-flash' }, async () => new Response('secret provider detail', { status })), error => {
      assert.ok(error instanceof Error);
      assert.ok(!error.message.includes('secret'));
      return true;
    });
  }
  await assert.rejects(translateArticle(article, { apiKey: 'secret', model: 'gemini-2.5-flash' }, async () => { throw new Error('secret'); }), /chưa phản hồi/);
});

test('provider malformed or oversized JSON is rejected before rendering', async () => {
  for (const body of ['not-json', 'x'.repeat(300001), JSON.stringify({ candidates: [] })]) {
    await assert.rejects(translateArticle(article, { apiKey: 'test-key', model: 'gemini-2.5-flash' }, async () => new Response(body)), /đầy đủ/);
  }
});
