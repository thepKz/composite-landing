# Báo cáo: nối cài đặt admin vào trang công khai

## 1. Cài đặt admin vào trang công khai
- Thêm `src/lib/contact-info.ts` (hàm thuần `resolveContact`, `zaloNumber`). Cài đặt admin thắng, ô trống rơi về `site-facts.ts`. Số hiển thị giữ dạng nhập, `tel:` chỉ chữ số. Zalo nhận số hoặc liên kết zalo.me. Số trùng không lặp.
- `company()` trả thêm `phone2`, `hours`. Thêm `contact()` trong `src/lib/content.ts`.
- Đã nối: thanh trên và ngăn kéo trong `site-header.tsx`, `site-footer.tsx`, `contact-shortcuts.tsx`, `lien-he/page.tsx`, `inquiry-form.tsx` (giờ làm việc và nút gọi), trang chủ (`hero-slider`, `AboutSection`, `FaqSection`), `cta-band.tsx`, `not-found-view.tsx`, `hoi-dap`, `san-pham/[slug]`. Bố cục công khai truyền `contact` xuống header và nút nổi, không thêm truy vấn.
- Chế độ demo: `company()` trả dữ kiện từ `site-facts.ts` như cũ (chưa chạy thật ở chế độ demo, chỉ có bài kiểm đơn vị cho nhánh rơi về).
- Kiểm thật `scripts/verify-contact-settings.ts`: đổi tạm `phone2`, `hours`, `zalo`, tải `/` và `/lien-he`, 14 điều kiện đạt (thanh trên, footer, biểu mẫu, nút nổi). Trước và sau trả lại giống hệt: `phone2` "0943.924.816", `hours` "7h30 – 17h30, thứ Hai đến thứ Bảy", `zalo` "https://zalo.me/09644442626", kết quả "Đã trả lại đúng giá trị cũ: true".
- Bài kiểm đơn vị mới `tests/contact-info.test.ts` (4 bài).
- Chưa nối: câu "Xưởng tại ..." ở `gioi-thieu/page.tsx` vẫn lấy `facts.address` (là địa chỉ nhà máy trong hồ sơ, không phải liên hệ).

## 2. Khung xem trước admin khớp trang bài
- Tách `src/components/article/article-view.tsx` (đầu bài, ảnh bìa, lưới đọc, mục lục, chia sẻ, kêu gọi báo giá, nhận dữ liệu qua props, chế độ `preview` làm liên kết chết và bỏ móc phóng ảnh, hiện dần). `post-detail.tsx` còn lại truy vấn, JSON-LD, bài trước sau, bài liên quan; `admin/article-preview.tsx` chỉ còn bọc `ArticleView`.
- `cover-orient.tsx` đổi sang tìm theo vị trí của chính nó (trước đó dùng `document` của trang cha nên không chạy trong khung xem trước nằm trong iframe).
- `scripts/verify-article-render.ts` thêm so `orient` và `opener`, không nới lỏng: đạt, đầu bài, ảnh bìa, thân bài, mục lục, lề chia sẻ, đường dẫn khớp ở 1366 (tab xem trước), chữ và cỡ chữ khớp ở 390.
- `scripts/verify-editor-flow.ts`: PASS desktop, PASS mobile, dọn sạch. Đã mở ảnh `sau-admin/luong/desktop-10` và `desktop-13`: cùng khung, cùng chữ. Khung xem trước trong trình soạn rộng khoảng 790px nên theo luật dưới 900px (ảnh dọc ở giữa một cột), trang công khai ở 1366 là hai cột. Khác nhau do độ rộng, không do mã.

## 3. Tiêu đề h1 thấy được
- `scripts/shots-bai-viet.ts` thêm bài ảnh bìa dọc và ngang (chọn theo kích thước thật), đo h1 hiển thị (cả chuỗi tổ tiên, độ đục, nằm trong khung), ghi `orient`.
- Kết quả (`docs/nang-cap-2026-11/sau-bai-viet-kiem/report.json`): 22 mục, 0 mục có vấn đề; h1 nhìn thấy ở cả 6 trang bài, cả 1366 và 390. Đã mở ảnh: ảnh dọc 1366 hai cột, ảnh ngang một cột, không ảnh bìa, ảnh dọc 390.

## Kiểm cuối
- `npx tsc --noEmit` sạch. `npm test` 40 bài đạt.
- Cơ sở dữ liệu: 0 bài, 0 yêu cầu, 26 ảnh, 0 tài khoản `@example.test`.

## Chưa kiểm
- Không chạy bản build (cấm). Chưa kiểm chế độ demo thật trên trình duyệt. Chưa kiểm sửa cài đặt qua màn admin thật (chỉ đổi trực tiếp trong cơ sở dữ liệu rồi trả lại). Ngăn kéo menu điện thoại dùng cùng dữ liệu thanh trên nhưng chưa mở ra xem.
- Ảnh trong `sau-bai-viet-kiem/` có thêm các tệp `top-*.jpg` do tôi cắt để xem, xoá được.

## Tệp đã sửa hoặc thêm
src/lib/contact-info.ts, src/lib/content.ts, src/components/{site-header,site-footer,contact-shortcuts,inquiry-form,post-detail}.tsx, src/components/home/{hero-slider,sections}.tsx, src/components/pages/{cta-band,not-found-view}.tsx, src/components/article/{article-view,cover-orient}.tsx, src/components/admin/article-preview.tsx, src/app/(public)/{layout,page}.tsx, lien-he, hoi-dap, san-pham/[slug] (page.tsx), scripts/{verify-contact-settings,verify-article-render,shots-bai-viet}.ts, tests/contact-info.test.ts.
