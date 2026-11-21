import test from 'node:test';
import assert from 'node:assert/strict';
import { inquirySchema, inquiryMessage } from '../src/lib/inquiry-details';
const base={name:'Khach thu',phone:'0901234567',consent:'yes'};
test('old inquiry submissions remain valid and consent remains required',()=>{assert.equal(inquirySchema.safeParse(base).success,true);assert.equal(inquirySchema.safeParse({...base,consent:undefined}).success,false);});
test('optional structured details are validated and reach the existing admin message',()=>{const value=inquirySchema.parse({...base,email:'demo@example.com',purpose:'quotation',dimensions:'2 x 1 m',location:'Phu Tho',message:'Tu van vat lieu'});const message=inquiryMessage(value);for(const detail of ['demo@example.com','2 x 1 m','Phu Tho','Tu van vat lieu','Yêu cầu báo giá'])assert.ok(message.includes(detail));assert.equal(inquirySchema.safeParse({...base,email:'invalid@'}).success,false);assert.equal(inquirySchema.safeParse({...base,dimensions:'x'.repeat(161)}).success,false);});
test('province and scale from the four-step form are added to the message',()=>{
  const value=inquirySchema.parse({...base,province:'Phú Thọ',scale:'15 – 30 con lợn',scaleHint:'Gợi ý bể 6 m³',product:'Bể biogas composite',purpose:'quotation'});
  assert.equal(value.province,'Phú Thọ');
  const message=inquiryMessage(value);
  assert.ok(message.includes('Tỉnh thành: Phú Thọ'));
  assert.ok(message.includes('Quy mô: 15 – 30 con lợn (gợi ý bể 6 m³)'));
});
test('old submissions without province or scale produce the same message as before',()=>{
  const message=inquiryMessage(inquirySchema.parse(base));
  assert.equal(message,'Nội dung liên hệ: Tư vấn sản phẩm');
  assert.ok(!message.includes('Tỉnh thành'));
  assert.ok(!message.includes('Quy mô'));
});
test('scale without a hint is kept as typed, and oversized new fields are refused',()=>{
  assert.ok(inquiryMessage(inquirySchema.parse({...base,scale:'Bồn chứa hóa chất'})).includes('Quy mô: Bồn chứa hóa chất'));
  assert.equal(inquirySchema.safeParse({...base,province:'x'.repeat(101)}).success,false);
  assert.equal(inquirySchema.safeParse({...base,scale:'x'.repeat(161)}).success,false);
});
test('the bot trap field must stay empty',()=>{assert.equal(inquirySchema.safeParse({...base,website:'http://spam.example'}).success,false);assert.equal(inquirySchema.safeParse({...base,website:''}).success,true);});
