# Báo cáo: chủ doanh nghiệp tự thêm nhiều ảnh cho sản phẩm

## Đã làm
- Cơ sở dữ liệu: tệp mới `db/migrations/002_product_media.sql`, bảng `product_media(product_id, media_id, position)`, khoá chính (product_id, media_id), cả hai khoá ngoại xoá theo, `position >= 0`. Đã chạy `npm run db:migrate` trên máy này, không sửa tệp cũ, không xoá dữ liệu.
- API admin sản phẩm (`src/app/api/admin/products/route.ts`): GET trả thêm `media_ids` (có thứ tự). POST nhận `media_ids` (tuỳ chọn): kiểm bằng zod (mã hợp lệ, bỏ trùng giữ lần đầu, tối đa 20), kiểm từng mã có thật trong thư viện và là ảnh, ghi trong cùng giao dịch với việc lưu sản phẩm, đăng nhập, nguồn gốc và khoá phiên bản (409) giữ nguyên. Không gửi `media_ids` thì danh sách cũ giữ nguyên.
- Phần dùng chung `src/lib/product-media.ts` (zod, bỏ trùng, đổi chỗ, gộp ảnh, dòng đếm).
- Admin: mục "Ảnh sản phẩm" (`src/components/admin/product-photos.tsx`): lưới ảnh theo thứ tự, ảnh đầu ghi "Ảnh đại diện", nút đưa lên trước, đưa xuống sau, bỏ, nút "Thêm ảnh", dòng đếm "3 ảnh, nên có khoảng 10", dòng trạng thái (đang lưu, có thay đổi chưa lưu, đã lưu, lỗi), thông báo cho trình đọc màn hình khi đổi chỗ, tiêu điểm về nút Thêm ảnh khi bỏ ảnh. Hộp chọn dùng lại `MediaLibrary` trong hộp thoại (tiêu điểm vào trong, Tab giữ bên trong, Esc đóng, tiêu điểm về nút đã mở), thêm chế độ chọn nhiều ảnh, ảnh đã thêm hiện "Đã thêm" và không chọn lại, tải ảnh mới lên ngay trong hộp thì ảnh đó được chọn sẵn. Kéo thả chưa làm (không bắt buộc).
- Công khai: `/api/media/[id]` cho xem ảnh nằm trong `product_media` của sản phẩm đang hiển thị. Trang chi tiết sản phẩm: ảnh admin thêm đứng đầu theo thứ tự, rồi ảnh tĩnh có sẵn, bỏ trùng theo địa chỉ ảnh, `alt` lấy từ mô tả ảnh trong thư viện, không có thì "Tên sản phẩm, ảnh N". Thư viện admin: số "đang dùng", chi tiết "đang dùng ở" và chặn xoá ảnh đã tính cả `product_media`.
- README: thêm một dòng nhắc chạy migration mới trên máy chủ thật.

## Quyết định về cover_id
Ảnh đại diện vẫn là `cover_id`. Khi lưu với danh sách ảnh, máy chủ tự đặt `cover_id` bằng ảnh đầu danh sách, danh sách rỗng thì `cover_id` rỗng (người dùng không phải chọn ảnh đại diện riêng nên không có hai nơi mâu thuẫn). Mục "Ảnh đại diện" riêng ở cột bên đã bỏ, gộp vào mục Ảnh sản phẩm. Sản phẩm cũ chỉ có `cover_id` thì màn sửa coi ảnh đó là ảnh đầu danh sách. Thẻ sản phẩm ở danh sách không đổi mã, tự hiện ảnh đầu vì dùng `cover_id`. Trang công khai khi chưa có danh sách vẫn dùng `cover_id` như cũ.

## Ba nhóm chưa có ảnh
Trang chi tiết `/san-pham/[slug]` của bể phốt, bể xử lý nước thải, bồn hóa chất đã dùng điều kiện "có ảnh thì hiện bộ xem ảnh, không thì hình vẽ", nên khi admin thêm ảnh thì bộ xem ảnh thay hình vẽ. Đã kiểm thật với bể phốt: bộ xem ảnh đúng 3 ảnh, không còn khối hình vẽ. Hai trang nhóm (`/san-pham/be-phot-va-xu-ly-nuoc-thai` và các trang nhóm khác) là trang riêng vẫn dùng hình vẽ, không sửa vì ngoài phạm vi (chỉ nối dữ liệu ở trang chi tiết). Bồn hóa chất chưa chạy thử riêng, cùng mã với bể phốt.

## Kết quả script luồng thật (`scripts/kiem-anh-san-pham.ts`)
Chạy `SITE_URL=http://127.0.0.1:3002 node --env-file=.env --import tsx scripts/kiem-anh-san-pham.ts`: đạt cả hai.
- 1366x768 trên bể biogas (đã có 1 ảnh tĩnh): tải thử ảnh trong hộp (chọn sẵn, Esc đóng không thêm), thêm 3 ảnh a b c, đổi thành c a b bằng nút, lưu, DB đúng thứ tự và position 0,1,2, `cover_id` = c, khách không đăng nhập xem được 3 ảnh, trang công khai có 4 ảnh (3 ảnh admin đúng thứ tự trước, ảnh tĩnh sau, không lặp), ảnh chính là ảnh đầu, có alt, 0 lỗi console.
- 390x844 trên bể phốt (chưa có ảnh): cùng các bước, bộ xem ảnh đúng 3 ảnh, không còn hình vẽ, nút trong mục ảnh đều từ 44px, không tràn ngang, 0 lỗi console.
- Quét ký tự cấm (· — ; !) và chữ kỹ thuật (slug, media, id) trong mục ảnh và hộp chọn: không có.
- Dọn trong `finally`: gỡ ảnh khỏi sản phẩm bằng chính API, trả `cover_id`, xoá ảnh thử tải lên, xoá tài khoản tạm.

## Số đếm
| | Trước | Sau |
|---|---|---|
| bài | 0 | 0 |
| yêu cầu | 0 | 0 |
| ảnh thư viện | 26 | 26 |
| tài khoản | 1 | 1 |
| `product_media` | 0 dòng | 0 dòng |
| `cover_id` 8 sản phẩm | tất cả rỗng | tất cả rỗng |

## Đã kiểm
`npx tsc --noEmit` sạch. `npm test` 56 bài đạt (8 bài mới trong `tests/product-media.test.ts`: dữ liệu vào, bỏ trùng, quá 20, thứ tự, đổi chỗ, gộp ảnh, dòng đếm). Ảnh chụp ở `docs/nang-cap-2026-11/vong-6/admin-anh/` (`desktop-` và `mobile-` với 1-khong-anh, 2-co-anh, 3-hop-chon-mo, 4-trang-cong-khai), đã tự mở xem.

## Chưa kiểm
- Kéo thả đổi thứ tự (chưa làm).
- Đúng 20 ảnh và thông báo "đã đủ" trên giao diện, chỉ kiểm giới hạn ở zod trong bài test.
- Trường hợp hai người sửa cùng lúc (409) với danh sách ảnh, giữ cơ chế cũ nhưng chưa thử riêng.
- Bồn hóa chất và bể xử lý nước thải chưa chạy thử riêng. Chưa chạy trên máy chủ thật và chưa chạy `npm run build`. Chưa quét ký tự cấm trên toàn bộ các màn admin khác.
- Ảnh vừa đổi trên trang công khai: đường ảnh dùng `Cache-Control: private, no-store` như cũ, chưa đo bộ nhớ đệm của trang ở bản chạy thật.
