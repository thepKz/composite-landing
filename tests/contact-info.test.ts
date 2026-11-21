import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContact, zaloNumber } from '../src/lib/contact-info';
import { facts } from '../src/lib/site-facts';

test('ô trống rơi về hồ sơ nội dung', () => {
  const info = resolveContact();
  assert.deepEqual(info.hotlines.map(line => line.tel), facts.hotlines.map(line => line.tel));
  assert.equal(info.hours, facts.hours);
  assert.equal(info.zalo, facts.zalo);
});

test('cài đặt admin thắng, số hiển thị giữ dạng nhập còn tel chỉ có chữ số', () => {
  const info = resolveContact({ phone: '0901 234 567', phone2: '0912.345.678', hours: '8h đến 16h', zalo: 'https://zalo.me/0987654321' });
  assert.deepEqual(info.hotlines, [{ display: '0901 234 567', tel: '0901234567' }, { display: '0912.345.678', tel: '0912345678' }]);
  assert.equal(info.hours, '8h đến 16h');
  assert.equal(info.zalo, '0987654321');
});

test('Zalo nhận cả chuỗi số lẫn liên kết, giá trị hỏng thì dùng hồ sơ', () => {
  assert.equal(zaloNumber('0987 654 321'), '0987654321');
  assert.equal(zaloNumber('https://zalo.me/0987654321'), '0987654321');
  assert.equal(zaloNumber('abc'), facts.zalo);
});

test('số thứ hai trống giữ số thứ hai trong hồ sơ, số trùng không lặp', () => {
  assert.equal(resolveContact({ phone: '0901234567' }).hotlines[1].tel, facts.hotlines[1].tel);
  assert.equal(resolveContact({ phone: facts.hotlines[0].display, phone2: facts.hotlines[0].display }).hotlines.length, 1);
});
