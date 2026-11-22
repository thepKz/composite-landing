import { z } from 'zod';

export const MAX_PRODUCT_PHOTOS = 20;
export const RECOMMENDED_PRODUCT_PHOTOS = 10;

/** Bỏ id lặp, giữ lần xuất hiện đầu tiên và thứ tự người dùng sắp. */
export function dedupeIds<T>(ids: readonly T[]): T[] {
  return [...new Set(ids)];
}

/** Danh sách mã ảnh gửi lên: mã hợp lệ, bỏ trùng, tối đa 20 ảnh. */
export const productMediaIdsSchema = z.array(z.uuid()).max(60).transform(dedupeIds).pipe(z.array(z.uuid()).max(MAX_PRODUCT_PHOTOS, `Mỗi sản phẩm chỉ có tối đa ${MAX_PRODUCT_PHOTOS} ảnh.`));

/** Ảnh đại diện theo danh sách: ảnh đầu danh sách, danh sách rỗng thì không có ảnh đại diện. */
export function coverFromList(ids: readonly string[]): string | null {
  return ids[0] ?? null;
}

/** Sắp ảnh đọc từ cơ sở dữ liệu theo vị trí lưu, vị trí bằng nhau thì giữ thứ tự đọc. */
export function sortByPosition<T extends { position: number }>(rows: readonly T[]): T[] {
  return rows.map((row, index) => ({ row, index })).sort((a, b) => a.row.position - b.row.position || a.index - b.index).map(item => item.row);
}

/** Ảnh admin thêm đứng trước, ảnh tĩnh có sẵn theo sau, bỏ trùng theo địa chỉ ảnh. */
export function mergePhotos<A extends { src: string }, B extends { src: string }>(admin: readonly A[], fixed: readonly B[]): (A | B)[] {
  const seen = new Set<string>();
  return ([...admin, ...fixed] as (A | B)[]).filter(photo => (seen.has(photo.src) ? false : (seen.add(photo.src), true)));
}

/** Dòng đếm cho người dùng. */
export function photoCountText(count: number): string {
  if (count === 0) return 'Chưa có ảnh, nên có khoảng 10';
  if (count >= RECOMMENDED_PRODUCT_PHOTOS) return `${count} ảnh, đã đủ nhiều`;
  return `${count} ảnh, nên có khoảng ${RECOMMENDED_PRODUCT_PHOTOS}`;
}

/** Đổi chỗ một ảnh lên hoặc xuống một bậc, ngoài biên thì giữ nguyên. */
export function moveItem<T>(list: readonly T[], index: number, step: -1 | 1): T[] {
  const target = index + step;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
