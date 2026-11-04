import test from 'node:test';
import assert from 'node:assert/strict';
import { inquirySchema, inquiryMessage } from '../src/lib/inquiry-details';
const base={name:'Khach thu',phone:'0901234567',consent:'yes'};
test('old inquiry submissions remain valid and consent remains required',()=>{assert.equal(inquirySchema.safeParse(base).success,true);assert.equal(inquirySchema.safeParse({...base,consent:undefined}).success,false);});
test('optional structured details are validated and reach the existing admin message',()=>{const value=inquirySchema.parse({...base,email:'demo@example.com',purpose:'quotation',dimensions:'2 x 1 m',location:'Phu Tho',message:'Tu van vat lieu'});const message=inquiryMessage(value);for(const detail of ['demo@example.com','2 x 1 m','Phu Tho','Tu van vat lieu','Yêu cầu báo giá'])assert.ok(message.includes(detail));assert.equal(inquirySchema.safeParse({...base,email:'invalid@'}).success,false);assert.equal(inquirySchema.safeParse({...base,dimensions:'x'.repeat(161)}).success,false);});
