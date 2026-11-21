// Ảnh xưởng đã xử lý bằng sharp (scripts/xu-ly-anh-trang-phu.mjs): cắt đúng tỉ lệ khung, cùng một tông, nhiều cỡ.
// Chỉ đổi đường dẫn tệp. Ảnh nào gán cho sản phẩm nào vẫn theo customer-product-assets.ts, không gán thêm cho nhóm chưa xác nhận.
const base = (src: string) => src.split('/').pop()!.replace(/\.webp$/, '');
const dir = '/images/trang-phu';

export type Variants = {
  /** 1:1, khung ảnh chính trang chi tiết */ sq: string; sqSmall: string;
  /** 4:3, thẻ sản phẩm */ r43: string; r43Small: string;
  /** 3:2, dải ảnh rộng */ r32: string;
  /** 16:9, ảnh tràn đầu trang */ r169: string;
  /** Đủ khung, không cắt, cho hộp phóng to */ full: string;
};

/** Trả về các bản đã xử lý của một ảnh gốc trong /images/products-2026/. Ảnh ngoài thư mục đó trả về nguyên bản. */
export function variants(src: string): Variants {
  if (!src.startsWith('/images/products-2026/')) return { sq: src, sqSmall: src, r43: src, r43Small: src, r32: src, r169: src, full: src };
  const n = base(src);
  return {
    sq: `${dir}/${n}-sq-1000.webp`, sqSmall: `${dir}/${n}-sq-560.webp`,
    r43: `${dir}/${n}-r43-960.webp`, r43Small: `${dir}/${n}-r43-520.webp`,
    r32: `${dir}/${n}-r32-1400.webp`, r169: `${dir}/${n}-r169-1600.webp`,
    full: `${dir}/${n}-full.webp`,
  };
}
