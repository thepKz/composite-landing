# Báo cáo sửa 7 mục trau chuốt (P2) của nhiều ảnh cho mỗi sản phẩm

Đo bằng `scripts/kiem-p2-vong7.ts` (Playwright channel chrome, bản dev 127.0.0.1:3002). Ảnh chụp ở `docs/nang-cap-2026-11/vong-7/p2/`, mỗi khung 3 ảnh: sửa sản phẩm ngay sau khi mở, hộp chọn chưa chọn, hộp chọn đã chọn 3 ảnh.

## Từng mục

1. P2-1. `src/components/admin/product-manager.tsx` (dòng 22): khối "Ảnh sản phẩm" chuyển lên ngay sau "Nội dung sản phẩm", trước "Thông số & ứng dụng". Đo vị trí (cộng cuộn trang, khung nhìn 768 và 844):
   - 1366x768: tiêu đề 1220 xuống 723, nút "Thêm ảnh" (đỉnh) 1394 xuống 897.
   - 390x844: tiêu đề 1384 xuống 859, nút 1642 xuống 1117.
   Tiêu đề thấy ngay ở 1366 (chỉ nhô ra mép dưới ảnh chụp), nút nằm trong màn thứ hai, cuộn chưa tới một màn. Không đặt ảnh lên trước nội dung vì như vậy đẩy ô tên sản phẩm xuống, tệ hơn. Thứ tự Tab theo thứ tự trên trang.
2. P2-2. `src/components/admin/media-library.tsx`: nhãn ô tìm `imagesOnly` là "Tìm ảnh". Đã rà: các chữ khác nhắc video đều đã có điều kiện `imagesOnly` (tab lọc ẩn "Video", nhận tệp chỉ ảnh), không cần sửa thêm.
3. P2-3. Cùng tệp. `title` của tên dưới ảnh dùng mô tả ảnh, không có mô tả thì bỏ `title` (cả thanh chọn đơn). Khi `imagesOnly`: nút ảnh có `aria-label` là mô tả hoặc "Ảnh số N" kèm dung lượng, `alt` của ảnh là mô tả hoặc "Ảnh số N". Dòng hướng dẫn thành "Mỗi ảnh nặng tối đa 10 MB." (10 MB là giới hạn thật). Trang thư viện ảnh riêng không dùng dòng này nên không đổi.
4. P2-4. `src/app/admin/admin.css` (cuối tệp) và câu ở `media-library.tsx`: câu thành "Bấm ảnh để chọn nhiều ảnh". Riêng thanh chọn nhiều bỏ cắt dấu ba chấm, cho xuống dòng. Đo ở 390: chưa chọn `scrollWidth` 296 so `clientWidth` 296, đã chọn 3 ảnh 296 so 296, cả hai một dòng cao 22px. Ở 1366: 769 so 769 và 757 so 757.
5. P2-5. `src/lib/product-media.ts`: lời Việt cho mã ảnh sai, danh sách sai kiểu, quá 20 ảnh (luật đánh dấu `headline`). `src/lib/admin-api.ts`: thêm `issueMessage` (dịch chung lời mặc định tiếng Anh theo loại lỗi, chỉ chạm câu không có dấu tiếng Việt) và `validationHeadline` (câu chính lấy từ luật đánh dấu, không có thì giữ câu cũ). Thân trả lời thật (đều 400):
   - mã rác: `error` "Vui lòng kiểm tra các trường thông tin.", `fields` "Có ảnh không đúng. Vui lòng chọn lại ảnh."
   - 21 ảnh và 61 ảnh: `error` "Mỗi sản phẩm tối đa 20 ảnh.", `fields` cùng câu đó.
   - `media_ids` null và chuỗi: `error` câu chung, `fields` "Danh sách ảnh không đúng. Vui lòng tải lại trang."
6. P2-6. `src/app/api/media/[id]/route.ts` và tệp mới `src/lib/media-cache.ts` (hàm thuần `mediaCacheHeaders`, `etagMatches`). Việc kiểm quyền giữ nguyên chỗ cũ, chạy trước 304. ETag = mã, dung lượng, lúc cập nhật. Kết quả đo:

   | Ca | Mã | Cache-Control | ETag |
   |---|---|---|---|
   | khách, ảnh công khai | 200 | public, max-age=300, stale-while-revalidate=86400 | có |
   | khách, ảnh công khai, If-None-Match khớp | 304 | như trên | có |
   | khách, ảnh công khai, If-None-Match sai | 200 | như trên | có |
   | khách, ảnh chưa công khai | 404 | không | không |
   | khách, ảnh chưa công khai, If-None-Match tuỳ ý | 404 | không | không |
   | admin, ảnh chưa công khai | 200 | private, no-store | không |
   | admin, ảnh chưa công khai, If-None-Match | 200 | private, no-store | không |
   | admin, ảnh công khai | 200 | public (như khách) | có |

   "Ảnh công khai" thử bằng cách thêm tạm một dòng `product_media` cho sản phẩm đang hiện, xoá ngay trong `finally`.
7. P2-7. Cùng `media-library.tsx`: nút "Chọn tệp" dùng `button-outline` khi `imagesOnly`. Đo trong hộp chọn sản phẩm: chỉ còn một nút nền đậm, "Thêm ảnh" chưa chọn, "Thêm 3 ảnh" khi đã chọn. Trang thư viện ảnh riêng giữ nút đậm.

## Kiểm

- `npx tsc --noEmit` sạch. `npm test`: 62 bài đạt, 0 lỗi (thêm `tests/media-cache.test.ts` gồm 5 bài: header và ETag, 304, lời Việt của danh sách ảnh, câu chính quá 20 ảnh, lớp dịch chung).
- Không tràn ngang ở 1366 và 390 (hộp chọn `overflowX` 0).
- Số đếm sau lượt (truy vấn): 0 bài, 0 yêu cầu, 26 ảnh, 1 tài khoản, `product_media` 0 dòng, 0 sản phẩm có `cover_id`. Tài khoản tạm xoá trong `finally`.

## Chưa kiểm

- Chưa chạy lại luồng lưu sản phẩm và chọn ảnh bìa bài viết bằng Playwright (không lưu gì trong lượt này). Chỉ đổi thêm `title` và nhãn ở thanh chọn đơn, hộp bài viết không đổi cách chọn. Tab và đóng hộp không đụng tới.
- Chưa kiểm bằng trình đọc màn hình thật, chưa thử Safari và Firefox.
- Chưa đo tải ảnh lặp lại trên mạng chậm, chỉ kiểm header và mã trả về.

## Chỗ làm khác lời giao

- Mục 1: không đặt ảnh lên trước nội dung. Đặt ngay sau "Nội dung sản phẩm" như cách đầu, đạt mức nút nằm trong màn thứ hai.
- Mục 6: hàm quyết định header đặt ở `src/lib/media-cache.ts` thay vì trong tệp route, vì tệp route của Next chỉ được export tên cố định nên test không import được. Phần còn lại gói trong route.
- Mục 5: dùng cả hai cách, lời riêng cho `media_ids` và lớp dịch chung ở `admin-api.ts` cho mọi API (chỉ đổi câu `fields` còn là lời mặc định tiếng Anh, câu chính và mã trạng thái các API khác giữ nguyên). Giao diện không đọc `fields`.
- `stale-while-revalidate=86400` do lời giao: ảnh vừa chuyển sang không công khai có thể còn hiện ở bộ nhớ tạm của trình duyệt tới 5 phút, và tới 1 ngày nếu trình duyệt đang dùng bản cũ trong lúc tải lại.
