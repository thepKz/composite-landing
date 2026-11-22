# Báo cáo vòng 5: trang chủ và khung chung (22/11/2026)

Lời khách thắng tài liệu cũ: "lấy full hình", "đừng cắt góc", "thay hết vuông chữ nhật", "đẩy nhiều hình ảnh hơn". Vòng 4 yêu cầu khung dáng lạ, nay bỏ. Giữ nền liền mạch mép cong, chồng lớp, hoa văn, chữ văn viết, morph, chuyển động.

## Đã đổi
- `ShapeFrame` (dùng ở mọi trang): mọi `shape` hiện thành chữ nhật hoặc vuông bo 12px, không clip-path, không mặt nạ. Props cũ giữ nguyên, thêm `fit` ('contain' mặc định, 'cover') và `radius`. `porthole-trio` là một ảnh liền. Viền lệch `outline` giữ, vẽ theo hình chữ nhật. `parallax` chỉ chạy khi `fit='cover'`. `framePath` và `clipId` đã bỏ. README cập nhật.
- `Stack` thêm `clear`: thẻ số liệu nằm dưới ảnh, chỉ chạm mép dưới 20px, không che sản phẩm.
- Ảnh: `scripts/xu-ly-anh-trang-chu-v5.mjs` xuất 18 ảnh thật đủ khung vào `public/images/home/ph-*.webp` (4 cỡ), tỉ lệ đo từ ảnh gốc, ghi `src/components/home/photos-real.ts`. Ảnh gốc ở `products-2026` giữ nguyên.
- Banner ba cảnh dùng ảnh gốc đủ khung (trước là bản cắt 16:9), khung đúng tỉ lệ ảnh.
- Giới thiệu, lý do, báo giá: khung chữ nhật theo tỉ lệ ảnh. Khối lý do đổi sang ảnh bể chữ nhật trong xưởng để không trùng ảnh với thẻ cá Koi. Báo giá bỏ ba ô vòm.
- Ba nhóm mũi nhọn: ba khung vuông cùng cỡ, cùng chiều cao hàng, bỏ so le. Bốn nhóm còn lại: bốn khung 3:4 bằng nhau (ba ảnh dọc khớp đúng tỉ lệ). Vành khuyên "Từ 1 m³" thành ô chữ nhật có hoa văn gợn nước, hình bể phốt và thông số. Bồn hóa chất giữ ô hoa văn, không gán ảnh.
- Ảnh nhỏ thật dưới thẻ (chỉ nhóm có đủ ảnh nhận ra được): bể cá Koi và thủy sản 2 ảnh, thùng chở hải sản 2 ảnh, sản phẩm theo yêu cầu 3 ảnh. Bể biogas và thùng rác chỉ có một ảnh nhận ra được nên không thêm. Bể phốt, xử lý nước thải, bồn hóa chất không gán ảnh.
- Dải ảnh: 7 ảnh thành 18 ảnh thật khác nhau, mỗi ảnh đúng tỉ lệ gốc, cùng chiều cao hàng, không lặp. Hộp xem lớn có nút "Xem sản phẩm này" dẫn tới trang nhóm (ảnh nhận ra được nhóm) hoặc trang sản phẩm chung.
- Bản đồ chân trang: khung chữ nhật bo nhẹ, rộng cả hàng (cao tối thiểu 260px), nút "Chỉ đường" đầy màu, cao 48px.
- Thẻ bài (`post-card`, bìa bài chi tiết): khung 4:3, `fit` contain, bỏ phóng to ảnh khi rê chuột.

## 10 điểm UX yếu đã sửa
1. Ảnh sản phẩm bị cắt cạnh vát và vòm: nay thấy trọn ảnh, khung theo tỉ lệ gốc.
2. Hàng thẻ so le, khung khác tỉ lệ nên lệch hàng: cùng khung, cùng chiều cao, mũi tên "xem" thẳng hàng đáy thẻ.
3. Thẻ số liệu đè lên góc ảnh sản phẩm: chuyển xuống dưới ảnh (`clear`).
4. Thẻ "2010" lặp lại số liệu ngay bên dưới: bỏ khỏi khối giới thiệu.
5. Banner điện thoại có khoảng trống lớn do khung ảnh dọc cao: giới hạn chiều cao ảnh, ẩn thẻ số liệu ở dưới 760px.
6. Tin tức nằm chen giữa hỏi đáp và báo giá, làm xa nút báo giá: chuyển xuống sau báo giá (thứ tự: bán gì, sản phẩm, vì sao tin, cách đặt, hỏi đáp, báo giá, tin tức).
7. Ảnh trong khung cuộn trượt và phóng khi rê chuột, vừa làm ảnh trôi vừa cắt: bỏ cả hai, thay bằng nâng nhẹ cả khung.
8. Bản đồ nhỏ trong cột liên hệ, nút chỉ đường là chữ lẻ: bản đồ rộng cả hàng, nút đầy.
9. Tên bước của biểu mẫu báo giá cỡ 14px: lên 16px.
10. Ảnh trong dải bấm chỉ phóng to, không dẫn tới sản phẩm: hộp xem lớn có nút dẫn tới trang sản phẩm.
11. Nền ảnh khối báo giá có mép dưới thẳng: tan dần hai đầu.

Đã có sẵn và giữ: thanh gọi, Zalo, báo giá ghim dưới cùng ở điện thoại và cụm nút nổi ở máy bàn (từ bất kỳ đâu trên trang tới báo giá hoặc gọi điện trong một chạm), nút "Nhận báo giá" ở thanh trên.

## Số đo (script `scripts/kiem-khung-anh-v5.mjs`, kết quả ở `trang-chu/kiem-khung-anh.json`)
Trang chủ ở 1366x768, 390x844, 600x360, kèm `/tin-tuc` và `/thu-khung`:
- 38 ảnh trong khung trên trang chủ (mọi khung), 0 ảnh dùng cover, 38 contain. Clip-path hoặc mask khác none trên ảnh và tổ tiên tới khối trang: 0.
- Cover lệch tỉ lệ quá 3%: 0 (không có cover). Ảnh vỡ: 0. Tràn ngang: 0. Lỗi console: 0.
- Dải ảnh: 18 ô, 18 ảnh khác nhau.
- Vùng bấm thấp hơn 44px (điện thoại) hoặc 36px (máy bàn): 0. Chữ thân dưới 15px: 0 sau khi sửa tên bước biểu mẫu.
- `npx tsc --noEmit` sạch, `npm test` 48 đạt.

## Chụp
`docs/nang-cap-2026-11/vong-5/trang-chu/`: `home-{1366,390,600}-dau.png`, `home-*-toan-trang.png`, `khung-nhin-1366-00..14.png`, `khung-nhin-390-00..15.png`, thư mục con `tin-tuc/` và `thu-khung/`.

## Chưa kiểm hoặc còn lưu ý
- Chưa chụp lại toàn bộ sau lần sửa cuối (nền khối báo giá tan dần hai đầu, tỉ lệ 4:3 của thẻ bài). Bộ quét chạy lại sau sửa, kết quả ở `kiem-khung-anh.log`.
- Hai thẻ tin tức không có bài trong dữ liệu hiện tại (khối tin ẩn), nên thẻ bài chỉ kiểm ở `/tin-tuc` (2 ảnh), chưa kiểm trên trang chủ có bài.
- Ảnh gán cho nhóm chỉ theo nội dung nhìn thấy trong ảnh. Cần khách xác nhận trước khi thêm ảnh cho bể biogas và thùng rác. Ảnh bồn trắng nằm ngang không gán nhóm nào (có thể là bể phốt).
- Ảnh thu nhỏ dưới thẻ chỉ để nhìn, không có chú thích. Chưa thử với người dùng thật.
- Trang sản phẩm, `product-card`, `product-photo-gallery` thuộc agent khác, chưa đụng, chúng kế thừa `ShapeFrame` mới (mặc định contain).
- Hộp bản đồ Google và dock chưa đo lại thời gian tải.
