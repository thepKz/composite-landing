import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanDocument, documentText, documentMedia } from '../src/lib/rich-text';

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
