# Báo cáo vòng năm: vùng trang phụ và trang sản phẩm (22/11/2026)

Bản đo: http://127.0.0.1:3002 (dev). Không bật tắt máy chủ, không build, không cài gói, không đọc `.env`, không commit, không sửa `data/`. Ảnh kiểm ở `docs/nang-cap-2026-11/vong-5/trang-phu/` (`lan5` là lượt cuối, 18 trang x 3 khung x màn đầu và toàn trang; `truoc` là ảnh trước khi sửa; `bo-xem-anh` là bộ xem ảnh và hộp phóng to).

## 1. Kiểm kê ảnh thật

Chỉ có **26 ảnh thật khác nhau** trong cả dự án. `products-2026` có 22 tệp nhưng 4 là bản khác cỡ của cùng ảnh (xe bán tải, bể tròn lắp ghép hai bản, bể cầu trắng). `customer` có 9 tệp nhưng `customer-04-detail` là một mảnh cắt của `customer-04`. `home` và `trang-phu` toàn bản cắt hoặc đổi cỡ của các ảnh này. 26 ảnh trong thư viện admin `data/uploads` khớp từng ảnh một với 26 ảnh trên (so dấu vân ảnh 16x16, khác biệt 0 điểm): thư viện không có ảnh nào mới. Ảnh gốc khách gửi (`assets/customer-originals`) chỉ có 8 ảnh, đều đã nằm trong 26.

| Sản phẩm hoặc nhóm | Ảnh thật khác nhau, đang dùng | Còn thiếu so với 10 | Ghi chú |
|---|---|---|---|
| Bể biogas composite | 1 | 9 | Bể cầu trắng có chữ Thành Lợi. Ảnh bốn bể trắng nằm ngang (`white-tanks-yard`) trước đây gán cho biogas, nay gỡ vì dáng trụ nằm ngang giống bể phốt hơn, chờ khách xác nhận mới gán |
| Bể phốt composite | 0 | 10 | Chưa xác nhận, không gán. Ứng viên cần khách xác nhận: bốn bể trắng nằm ngang, dãy bể trắng và xanh lá bên đường (`customer-04`), bồn dài màu xanh |
| Bể xử lý nước thải | 0 | 10 | Chưa xác nhận, không gán |
| Bể cá Koi và bể nuôi thủy sản | 11 | 0 | Đủ. Bể tròn lắp ghép và bể tròn ngoài trời chắc chắn. Bảy ảnh bể chữ nhật và ảnh bốc bể lên xe nên nhờ khách xác nhận đúng nhóm thủy sản |
| Bồn chứa hóa chất | 0 | 10 | Chưa xác nhận, không gán |
| Thùng chở thủy hải sản sống | 6 | 4 | Thùng sục khí, thùng trên xe bán tải, thùng dạng hộp, thùng xanh trắng, thùng trắng hai nắp, thùng vàng (thùng vàng nên xác nhận) |
| Thùng rác và xe gom rác | 1 | 9 | Thùng rác xanh lá có nắp, bánh xe. Chưa có ảnh xe gom rác đẩy tay. Ảnh đống cấu kiện xanh lá nhìn là nắp vòm, không phải thùng rác nên không gán |
| Sản phẩm theo yêu cầu | 3 | 7 | Thuyền composite, chi tiết tạo hình trong xưởng, cấu kiện xanh lá (ảnh cuối nên xác nhận) |
| Cộng | 22 gán, 4 chưa gán | | 4 ảnh chưa gán: bốn bể trắng nằm ngang, khu xưởng góc thứ hai (gần trùng ảnh khu bể trong xưởng), dãy bể nằm ngang `customer-04`, bồn dài xanh. Chỉ dùng làm ảnh xưởng ở trang Giới thiệu |

Để mỗi sản phẩm có khoảng 10 ảnh, cần khách chụp thêm: biogas 9, bể phốt 10, xử lý nước thải 10, bồn hóa chất 10, thùng rác và xe gom rác 9, theo yêu cầu 7, thùng chở 4. Gợi ý góc chụp: toàn cảnh, hai bên, nắp và cửa thăm, cận mối nối và bề mặt, đang lắp đặt, đang chở, cạnh người để thấy cỡ.

## 2. Bộ xem ảnh trang chi tiết (`src/components/product-photo-gallery.tsx`)
- Ảnh chính nằm trong khung chữ nhật bo nhẹ, `object-fit: contain` trên nền trung tính (không cắt, không clip-path). Chứa số ảnh tùy ý, đã thử với 1, 3, 6 và 11 ảnh. Chỉ một ảnh thì khung theo đúng tỉ lệ ảnh (kẹp từ 0,8 tới 1,5, không cao quá 70% chiều cao màn).
- Dải ảnh nhỏ cuộn ngang, ảnh đang chọn tự cuộn vào giữa, viền sáng nổi bật. Mũi tên trước sau 44px, vòng quanh. Đếm "3 / 11" trên ảnh. Phím mũi tên trái phải khi tiêu điểm ở khung ảnh, dải ảnh nhỏ hoặc hộp phóng to. Vuốt ngang trên điện thoại (chỉ tính khi lệch ngang rõ hơn lệch dọc, nên cuộn trang không bị nhầm).
- Phóng to toàn màn bằng hộp thoại gốc: tiêu điểm vào nút đóng, Tab quay vòng trong hộp (tôi thêm bẫy Tab vì trình duyệt để Tab thoát ra thanh địa chỉ), Esc đóng, đóng xong tiêu điểm về nút phóng to, có chữ chú thích dưới ảnh.
- Tải ảnh: ảnh đầu `loading=eager` và `fetchpriority=high`, các ảnh sau lười, ảnh nhỏ từ thứ 5 trở đi lười, ảnh kế bên được tải trước khi bấm.
- Ảnh do `scripts/xu-ly-anh-san-pham-v5.mjs` tạo từ 26 ảnh thật, giữ nguyên tỉ lệ, ba cỡ (cạnh dài 1200, 240, 2000) trong `public/images/san-pham/` (78 tệp, 11 MB). Danh sách ảnh và nhóm gán nằm ở `src/lib/product-photos.ts`, chú thích và alt chỉ tả điều nhìn thấy.

## 3. Đã đổi ở các trang
- Chi tiết sản phẩm: bố cục mới (tên và nhóm, ảnh, rồi nút báo giá và gọi, thông số, chọn quy mô). Bỏ thẻ "10 năm" đè góc ảnh. Hoa văn gợn nước sau ảnh nhạt đi (0,55 xuống 0,35). Bỏ ảnh lặp trong mục cấu tạo. Sản phẩm chưa có ảnh dùng khung chữ nhật chứa hình vẽ nét.
- Thẻ sản phẩm (`product-card.tsx`): khung chữ nhật 4:3 viền rõ, ảnh hiện trọn, bỏ dáng vòm, tròn, vát, viên nang.
- Danh sách sản phẩm: ảnh đầu trang là ảnh thật hiện trọn, thêm dải ảnh thật ngang cuối trang (8 ảnh, mỗi ảnh đúng tỉ lệ gốc).
- Giới thiệu: ảnh đầu trang, câu chuyện, nhà máy là khung chữ nhật, dải ảnh có 9 ảnh (trước 6), mỗi ảnh một lần trên trang.
- Dự án, Hướng dẫn đặt hàng, Liên hệ, Hỏi đáp, Bảo hành, Bảo mật, nhóm Bể phốt và xử lý nước thải, 404: mọi khung ảnh về chữ nhật bo nhẹ. Bản đồ liên hệ cũng là chữ nhật. Dự án thêm lưới 8 ảnh thật, bỏ ảnh nổi đè lên ảnh. Ảnh nền đầu trang Dự án vẫn phủ kín vì là ảnh trang trí.
- Vùng này dùng khung riêng `src/components/pages/photo-frame.tsx` và `pages-v5.css`, không phụ thuộc `ShapeFrame` của vùng khác, nên không bị ảnh hưởng khi `ShapeFrame` đổi.

## 4. Admin Sản phẩm: thêm nhiều ảnh được không
**Chưa được.** Trang admin (`src/components/admin/product-manager.tsx`), API (`src/app/api/admin/products/route.ts`) và bảng `products` chỉ có một trường `cover_id` (một ảnh đại diện từ thư viện). Đường `/api/media/[id]` cũng chỉ cho khách xem công khai ảnh được bài đăng hoặc `cover_id` của sản phẩm đang xuất bản dùng. Vì vậy chủ doanh nghiệp chỉ thay được ảnh đầu bộ xem ảnh (trang chi tiết đặt ảnh đó đứng đầu, rồi các ảnh mặc định theo sau). Cần làm: thêm cột hoặc bảng nhiều ảnh cho sản phẩm (danh sách mã ảnh có thứ tự), giao diện chọn nhiều ảnh và đổi thứ tự trong admin, mở rộng điều kiện công khai của `/api/media/[id]`, và để trang chi tiết đọc danh sách đó. Tôi không sửa admin theo yêu cầu.

## 5. UX: 12 điểm yếu nhất và cách sửa
Đã gọi `anthropic-skills:thiet-ke-ux-ui` và `anthropic-skills:impeccable`, áp các luật chính trong thân skill (cấm viền một bên, ô bằng nhau, chữ thân 16px, che nội dung). Chưa đọc từng tệp tham chiếu `ux.md`, `web.md`, `mobile.md` đầy đủ. Đã đi thử như chủ trại bằng điện thoại 390: danh sách, bể biogas, xem ảnh, bảng dung tích, báo giá.
1. Điện thoại: tên sản phẩm nằm dưới ảnh, nút báo giá và gọi ở cuối màn thứ hai. Sửa: tên, ảnh, rồi nút ngay dưới ảnh (ở 600x360 nút nằm cạnh tên).
2. Thẻ "10 năm" đè góc ảnh che sản phẩm. Sửa: bỏ (bảo hành vẫn nằm trong thông số).
3. Khung dáng lạ cắt cạnh và đỉnh ảnh, ảnh dọc mất phần dưới. Sửa: ảnh hiện trọn.
4. Dải ảnh nhỏ vài ô, không cuộn, không biết còn bao nhiêu ảnh. Sửa: đếm "x / n", dải cuộn, mũi tên 44px.
5. Phóng to là hộp nhỏ. Sửa: toàn màn, Esc, Tab giữ trong hộp.
6. Hoa văn gợn nước đậm đè sau ảnh. Sửa: nhạt đi.
7. Chọn quy mô: mỗi nút một dòng ở điện thoại, đẩy bảng dung tích xa. Sửa: nút xếp hàng, cao 44px.
8. Đường dẫn rớt dòng, dấu "/" lẻ đầu dòng ở 390. Sửa: một dòng, cuộn ngang.
9. Chữ 14 và 15px ở nhãn chip, nhãn số liệu, mô tả bước. Sửa: 16px.
10. Máy bàn: khoảng trống 64px giữa tên và mô tả do lưới giãn hàng. Sửa: gom hàng.
11. Thẻ danh sách "không hộp" nên ảnh không có ranh giới. Sửa: khung chữ nhật viền rõ.
12. Dự án: ảnh nổi đè lên ảnh khác. Sửa: bỏ ảnh nổi.

Chưa sửa: bảng dung tích ở điện thoại vốn đã thành thẻ từng dòng, đọc được, giữ nguyên. Mốc "15 – 30 phút" ở khối Zalo (từ vòng trước, không có trong hồ sơ) vẫn chờ chủ doanh nghiệp xác nhận. Thanh dưới cùng "Gọi ngay, Nhắn Zalo, Nhận báo giá" thuộc vùng khác, che khoảng 60px đáy màn.

## 6. Đã kiểm (số do script đo)
- `scripts/kiem-trang-phu-v5.mjs`: 18 trang (cả 404, nhóm bể phốt, tám trang sản phẩm) x 1366x768, 390x844, 600x360 = 54 lượt, ảnh màn đầu và toàn trang. Kết quả: 0 ảnh vỡ, 0 `clip-path` hoặc `mask` trên ảnh nội dung (loại ảnh nền trang trí), 0 ảnh `cover` lệch tỉ lệ quá 3%, 0 tràn ngang, 0 nút dưới 44px ở 390 và dưới 36px ở máy bàn, lỗi console duy nhất là mã 404 của chính trang 404. Chữ thân dưới 15,5px: lượt cuối còn 21 mục là chip ở 404 và trang bể phốt, sau đó sửa tiếp và đo lại bằng thăm dò riêng ở 6 trang thì còn 0, chưa chạy lại toàn bộ 54 lượt sau lần sửa đó.
- `scripts/kiem-bo-xem-anh-v5.mjs` (Playwright): 5 sản phẩm có ảnh x 2 khung (1366 và 390), 174 điểm kiểm, 174 đạt: bấm ảnh nhỏ, mũi tên, phím trái phải, vòng quanh, vuốt ở 390 (bằng sự kiện con trỏ cảm ứng giả lập), phóng to, tiêu điểm vào nút đóng, Tab giữ trong hộp, Esc, tiêu điểm về nút mở, ảnh đầu tải ngay, ảnh nhỏ xa tải lười, không lặp ảnh, ảnh phóng to nằm trong màn, vùng bấm từ 44px.
- `npx tsc --noEmit` sạch. `npm test` 48 trên 48 đạt.
- Cuối lượt: bài 0, yêu cầu 0, ảnh thư viện 26, tài khoản 1 (`scripts/kiem-dem.ts`).
- Tự mở xem ảnh chụp qua nhiều vòng sửa. Lỗi lớn nhất tìm thấy khi xem: thẻ danh sách vỡ vì CSS vòng bốn dựng khung theo hình nên ảnh co thành chấm; hàng đầu trang chi tiết bị giãn 64px; ảnh nổi đè ảnh ở trang Dự án.

## 7. Chưa kiểm
- Vuốt trên thiết bị thật (chỉ giả lập sự kiện con trỏ), Safari và Firefox, trình đọc màn hình.
- Chuyển cảnh morph từ thẻ danh sách sang ảnh chi tiết sau khi đổi cấu trúc (tên morph vẫn gắn lên khung ảnh thẻ và khung ảnh chính nhưng chưa chạy lại script morph).
- Tốc độ tải trên mạng chậm (chưa đo kích thước truyền).
- `ui_audit.py` (máy thiếu gói Python playwright).
- `workshop-story.tsx` không còn nơi nào dùng nên chưa sửa. `customer-product-assets.ts` giữ nguyên vì admin còn dùng làm ảnh mặc định, khớp ảnh đầu của từng sản phẩm.
- Trang chủ, thanh trên, chân trang, thẻ bài viết và `ShapeFrame` thuộc vùng khác, không kiểm.
