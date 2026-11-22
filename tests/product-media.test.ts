import assert from 'node:assert/strict';
import test from 'node:test';
import { coverFromList, dedupeIds, mergePhotos, moveItem, photoCountText, productMediaIdsSchema, sortByPosition, MAX_PRODUCT_PHOTOS } from '../src/lib/product-media';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('danh sách ảnh nhận mã hợp lệ và giữ thứ tự gửi lên', () => {
  assert.deepEqual(productMediaIdsSchema.parse([id(3), id(1), id(2)]), [id(3), id(1), id(2)]);
  assert.deepEqual(productMediaIdsSchema.parse([]), []);
});

test('danh sách ảnh bỏ mã lặp và giữ lần xuất hiện đầu', () => {
  assert.deepEqual(productMediaIdsSchema.parse([id(1), id(2), id(1), id(3), id(2)]), [id(1), id(2), id(3)]);
  assert.deepEqual(dedupeIds(['a', 'b', 'a']), ['a', 'b']);
});

test('danh sách ảnh từ chối mã không hợp lệ và quá 20 ảnh', () => {
  assert.throws(() => productMediaIdsSchema.parse(['không-phải-mã']));
  assert.throws(() => productMediaIdsSchema.parse([id(1), 'abc']));
  assert.throws(() => productMediaIdsSchema.parse('x'));
  assert.throws(() => productMediaIdsSchema.parse([null]));
  const twenty = Array.from({ length: MAX_PRODUCT_PHOTOS }, (_, i) => id(i + 1));
  assert.equal(productMediaIdsSchema.parse(twenty).length, 20);
  assert.throws(() => productMediaIdsSchema.parse([...twenty, id(99)]));
  // 25 mã nhưng chỉ 20 mã khác nhau: bỏ trùng trước khi đếm
  assert.equal(productMediaIdsSchema.parse([...twenty, ...twenty.slice(0, 5)]).length, 20);
});

test('ảnh đại diện là ảnh đầu danh sách, danh sách rỗng thì không có', () => {
  assert.equal(coverFromList([id(2), id(1)]), id(2));
  assert.equal(coverFromList([]), null);
});

test('đưa ảnh lên trước hoặc xuống sau một bậc, ngoài biên thì giữ nguyên', () => {
  assert.deepEqual(moveItem(['a', 'b', 'c'], 1, -1), ['b', 'a', 'c']);
  assert.deepEqual(moveItem(['a', 'b', 'c'], 1, 1), ['a', 'c', 'b']);
  assert.deepEqual(moveItem(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c']);
  assert.deepEqual(moveItem(['a', 'b', 'c'], 2, 1), ['a', 'b', 'c']);
  assert.deepEqual(moveItem(['a'], 0, 1), ['a']);
  const original = ['a', 'b'];
  moveItem(original, 0, 1);
  assert.deepEqual(original, ['a', 'b']);
});

test('sắp theo vị trí lưu, vị trí bằng nhau giữ thứ tự đọc', () => {
  const rows = [{ k: 'c', position: 2 }, { k: 'a', position: 0 }, { k: 'b', position: 1 }, { k: 'a2', position: 0 }];
  assert.deepEqual(sortByPosition(rows).map(row => row.k), ['a', 'a2', 'b', 'c']);
});

test('ảnh admin đứng trước ảnh có sẵn và không lặp địa chỉ ảnh', () => {
  const admin = [{ src: '/api/media/1', alt: 'm1' }, { src: '/api/media/2', alt: 'm2' }, { src: '/api/media/1', alt: 'lặp' }];
  const fixed = [{ src: '/images/a.webp', alt: 'a' }, { src: '/api/media/2', alt: 'lặp tĩnh' }, { src: '/images/b.webp', alt: 'b' }];
  assert.deepEqual(mergePhotos(admin, fixed).map(photo => photo.src), ['/api/media/1', '/api/media/2', '/images/a.webp', '/images/b.webp']);
  assert.deepEqual(mergePhotos([], fixed).map(photo => photo.src), ['/images/a.webp', '/api/media/2', '/images/b.webp']);
});

test('dòng đếm ảnh nói bằng lời thường', () => {
  assert.equal(photoCountText(6), '6 ảnh, nên có khoảng 10');
  assert.equal(photoCountText(0), 'Chưa có ảnh, nên có khoảng 10');
  assert.equal(photoCountText(12), '12 ảnh, đã đủ nhiều');
});
