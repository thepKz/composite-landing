import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanDocument, documentText, documentMedia, documentWords, imagesMissingAlt } from '../src/lib/rich-text';

test('rejects active content and unsafe URLs',()=>{
  assert.throws(()=>cleanDocument({type:'doc',content:[{type:'script',text:'alert(1)'}]}));
  assert.throws(()=>cleanDocument({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Link',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}}]}]}]}));
  assert.throws(()=>cleanDocument({type:'doc',content:[{type:'image',attrs:{src:'https://attacker.test/a.svg'}}]}));
});
test('retains semantic content and strips arbitrary attributes',()=>{
  const document=cleanDocument({type:'doc',content:[{type:'heading',attrs:{level:2,onclick:'evil'},content:[{type:'text',text:'Bể composite'}]}]});
  assert.equal(documentText(document),'Bể composite');
  assert.deepEqual(document.content?.[0].attrs,{level:2});
});
test('media IDs come only from validated local references',()=>{
  const id='a49c798a-c97d-4f42-a143-943dd83b8a4b';
  const document=cleanDocument({type:'doc',content:[{type:'image',attrs:{src:`/api/media/${id}`,alt:'Bể xanh'}}]});
  assert.deepEqual(documentMedia(document),[id]);
});
test('rejects deeply nested documents before recursive rendering',()=>{
  let node:unknown={type:'text',text:'x'};
  for(let i=0;i<45;i++)node={type:'blockquote',content:[node]};
  assert.throws(()=>cleanDocument({type:'doc',content:[node]}));
});

const mediaId = 'a49c798a-c97d-4f42-a143-943dd83b8a4b';
const imageDoc = (attrs: Record<string, unknown>) => ({ type: 'doc', content: [{ type: 'image', attrs: { src: `/api/media/${mediaId}`, alt: 'Bể xanh', title: 'Chú thích', ...attrs } }] });

test('image alignment and width are kept only when they differ from the defaults', () => {
  const plain = cleanDocument(imageDoc({ align: 'center', width: 100 }));
  assert.deepEqual(plain.content?.[0].attrs, { src: `/api/media/${mediaId}`, alt: 'Bể xanh', title: 'Chú thích' });
  const styled = cleanDocument(imageDoc({ align: 'left', width: 60 }));
  assert.equal(styled.content?.[0].attrs?.align, 'left');
  assert.equal(styled.content?.[0].attrs?.width, 60);
  const wide = cleanDocument(imageDoc({ align: 'wide' }));
  assert.equal(wide.content?.[0].attrs?.align, 'wide');
  assert.equal(wide.content?.[0].attrs?.width, undefined);
  const leftFull = cleanDocument(imageDoc({ align: 'left', width: 100 }));
  assert.equal(leftFull.content?.[0].attrs?.width, 100);
  const legacy = cleanDocument({ type: 'doc', content: [{ type: 'image', attrs: { src: `/api/media/${mediaId}` } }] });
  assert.deepEqual(legacy.content?.[0].attrs, { src: `/api/media/${mediaId}`, alt: '', title: '' });
});

test('image attributes outside the contract are rejected or dropped', () => {
  assert.throws(() => cleanDocument(imageDoc({ align: 'right' })));
  assert.throws(() => cleanDocument(imageDoc({ align: '<script>' })));
  for (const width of [0, 10, 55, 101, 'big', -40]) assert.throws(() => cleanDocument(imageDoc({ width })), String(width));
  const stripped = cleanDocument(imageDoc({ onclick: 'evil', style: 'position:fixed', width: 80 }));
  assert.deepEqual(Object.keys(stripped.content?.[0].attrs ?? {}).sort(), ['alt', 'src', 'title', 'width']);
});

test('video nodes ignore image-only attributes', () => {
  const doc = cleanDocument({ type: 'doc', content: [{ type: 'video', attrs: { src: `/api/media/${mediaId}`, align: 'wide', width: 40 } }] });
  assert.deepEqual(doc.content?.[0].attrs, { src: `/api/media/${mediaId}`, alt: '', title: '' });
});

test('word count and missing alt text feed the pre-publish checklist', () => {
  const doc = cleanDocument({ type: 'doc', content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Bể biogas composite cho trại lợn' }] },
    { type: 'image', attrs: { src: `/api/media/${mediaId}`, alt: '' } },
    { type: 'image', attrs: { src: `/api/media/${mediaId}`, alt: 'Có mô tả' } },
  ] });
  assert.equal(documentWords(doc), 6);
  assert.equal(imagesMissingAlt(doc), 1);
});
