/** Tiêu đề lưu tạm cho ảnh phục vụ qua /api/media. Việc kiểm quyền xem phải xong trước khi dùng các hàm này. */
export const PUBLIC_CACHE = 'public, max-age=300, stale-while-revalidate=600';
export const PRIVATE_CACHE = 'private, no-store';

type Row = { id: string; size_bytes: number | string; updated_at: Date | string };

/** Ảnh công khai: lưu tạm được, kèm ETag theo mã, dung lượng và lúc cập nhật. Ảnh chưa công khai: không lưu, không ETag. */
export function mediaCacheHeaders(isPublic: boolean, row: Row): { cacheControl: string; etag: string | null } {
  if (!isPublic) return { cacheControl: PRIVATE_CACHE, etag: null };
  return { cacheControl: PUBLIC_CACHE, etag: `"${row.id}-${Number(row.size_bytes)}-${new Date(row.updated_at).getTime()}"` };
}

/** If-None-Match khớp ETag hiện tại: nhận cả dạng "*", danh sách nhiều giá trị và tiền tố W/. */
export function etagMatches(header: string | null, etag: string | null): boolean {
  if (!header || !etag) return false;
  if (header.trim() === '*') return true;
  return header.split(',').some(part => part.trim().replace(/^W\//, '') === etag);
}
