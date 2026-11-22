import { ViewTransition, type ReactElement } from 'react';

/**
 * Morph khi chuyển trang bằng View Transitions (React 19.3 `<ViewTransition>`, Next 16.4 không cần cấu hình).
 * Đặt cùng một tên cho hai phần tử ở hai trang (thẻ ở danh sách, đầu trang chi tiết), trình duyệt sẽ biến cái này thành cái kia.
 * Trình duyệt không hỗ trợ thì chuyển trang thường, không lỗi.
 */

/** Loại cặp phần tử đã quy ước, để hai trang gọi cùng một tên. */
export type MorphKind = 'product-photo' | 'product-title' | 'post-cover' | 'post-title' | 'project-photo' | 'nav-pill';

/** Tên hợp lệ cho view-transition-name: chữ thường, số, gạch nối. Bỏ dấu tiếng Việt. */
export function morphName(kind: MorphKind | (string & {}), id: string | number = ''): string {
  const slug = String(id)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `tl-${kind}${slug ? `-${slug}` : ''}`;
}

/**
 * Bọc đúng một phần tử DOM. Hai nơi dùng cùng `name` thì tạo thành một cặp morph.
 * `default="none"` để phần tử không tự mờ dần trong các chuyển trang không liên quan.
 * Lưu ý: cặp chỉ hình thành khi trang đích dựng xong cùng lượt với lúc chuyển (trang đã nạp trước), nếu trang đích phải chờ dữ liệu thì phần tử chỉ hiện dần.
 */
export default function Morph({ name, children }: { name: string; children: ReactElement }) {
  return (
    <ViewTransition name={name} share="tl-morph" default="none">
      {children}
    </ViewTransition>
  );
}
