import test from 'node:test';
import assert from 'node:assert/strict';
import { readJson, RequestError } from '../src/lib/http';

test('JSON size limit applies without a content-length header', async()=>{
  const request=new Request('http://localhost',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({extra:'x'.repeat(13000)})});
  assert.equal(request.headers.has('content-length'),false);
  await assert.rejects(()=>readJson(request),error=>error instanceof RequestError && error.status===413);
});
test('malformed JSON is a client error',async()=>{
  await assert.rejects(()=>readJson(new Request('http://localhost',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})),error=>error instanceof RequestError && error.status===400);
});
test('valid JSON is read accurately',async()=>{
  assert.deepEqual(await readJson(new Request('http://localhost',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":"Thành Lợi"}'})),{name:'Thành Lợi'});
});
