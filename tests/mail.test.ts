import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInquiryMail, buildTestMail, mailConfigured, maskEmail, oneLine, sendInquiryNotice, vietnamTime } from '../src/lib/mail';

const full = { SMTP_HOST: 'smtp.example.test', SMTP_USER: 'a@example.test', SMTP_PASS: 'x', MAIL_TO: 'owner@example.test' };

test('mailConfigured needs all four values', () => {
  assert.equal(mailConfigured(full), true);
  for (const key of Object.keys(full)) assert.equal(mailConfigured({ ...full, [key]: '' }), false);
  assert.equal(mailConfigured({}), false);
});

test('missing configuration is skipped quietly without network', async () => {
  const result = await sendInquiryNotice({ name: 'An', phone: '0900000000' }, {});
  assert.deepEqual(result, { ok: false, skipped: true, reason: 'Chưa cấu hình thư.' });
});

test('subject drops line breaks so customers cannot inject headers', () => {
  const mail = buildInquiryMail({ name: 'An\r\nBcc: x@y.z', phone: '0900000000', product: 'Bể\ncomposite' });
  assert.ok(!/[\r\n]/.test(mail.subject));
  assert.match(mail.subject, /^Yêu cầu báo giá mới: An Bcc: x@y\.z, Bể composite$/);
  assert.equal(oneLine('a\n\n b\t c'), 'a b c');
});

test('html escapes every customer value', () => {
  const evil = '<script>alert(1)</script>"\'&';
  const mail = buildInquiryMail({ name: evil, phone: '0900<b>', product: evil, message: evil });
  assert.ok(!mail.html.includes('<script>'));
  assert.ok(!mail.html.includes('<b>'));
  assert.ok(mail.html.includes('&lt;script&gt;'));
  assert.match(mail.html, /href="tel:0900"/);
});

test('mail has text, html, tel link and admin link', () => {
  const mail = buildInquiryMail({ name: 'Lan', phone: '0912 345 678', product: 'Bể phốt', message: 'Cần báo giá', createdAt: new Date('2026-11-22T03:05:00Z') });
  assert.match(mail.text, /Họ tên: Lan/);
  assert.match(mail.text, /Thời điểm: 10:05, 22\/11\/2026/);
  assert.match(mail.text, /\/admin\/yeu-cau/);
  assert.match(mail.html, /href="tel:0912345678"/);
  assert.ok(!/https?:\/\/[^"]*\.(png|jpg|svg)/.test(mail.html));
  assert.equal(mail.replyTo, undefined);
});

test('reply-to only for a valid email', () => {
  assert.equal(buildInquiryMail({ name: 'A', phone: '0900000000', email: 'kh@example.com' }).replyTo, 'kh@example.com');
  assert.equal(buildInquiryMail({ name: 'A', phone: '0900000000', email: 'kh@example.com\nBcc: z@z.z' }).replyTo, undefined);
  assert.equal(buildInquiryMail({ name: 'A', phone: '0900000000', email: 'khong-hop-le' }).replyTo, undefined);
});

test('maskEmail hides most of the address', () => {
  assert.equal(maskEmail('jinhandsome@gmail.com'), 'jin***@gmail.com');
  assert.equal(maskEmail('ab@gmail.com'), 'a***@gmail.com');
  assert.equal(maskEmail('khong'), '');
});

test('Vietnam time and test mail', () => {
  assert.equal(vietnamTime(new Date('2026-11-22T17:30:00Z')), '00:30, 23/11/2026');
  assert.match(buildTestMail().subject, /Thư thử/);
});
