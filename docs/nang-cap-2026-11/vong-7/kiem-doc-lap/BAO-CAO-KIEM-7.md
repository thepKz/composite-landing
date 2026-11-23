# Báo cáo kiểm độc lập vòng 7: 7 mục P2 của "nhiều ảnh cho mỗi sản phẩm"

Người kiểm: độc lập, không sửa mã sản phẩm. Kịch bản: `scripts/_kd/kiem7.ts`. Số đo thô: `ket-qua-kiem7.json` cùng thư mục. Trình duyệt thật (Playwright, Chrome). Bản dev http://127.0.0.1:3002.

## Phán quyết

ĐẠT CÓ ĐIỀU KIỆN. Không có P0, không có P1. 5 trên 7 mục P2 hết hẳn. Mục 1 chỉ hết về chữ, nút "Thêm ảnh" nằm sát mép dưới màn 768 nên trên máy thật vẫn phải cuộn. Mục 3 hết lộ tên tệp khi di chuột nhưng tên tệp vẫn hiện thành chữ khi ảnh chưa có mô tả. Lớp cache ảnh không có lỗ hổng quyền xem trong mọi ca đã thử.

## A. Bảy mục P2

| Mục | Kết quả | Số đo |
|---|---|---|
| 1. Nút thêm ảnh lên cao | ĐẠT HẸP | 1366x768, cuộn 0: nút ở y=723 tới 763 (cao 40), lọt khung 768 với lề 4,5px. Khối "Ảnh sản phẩm" nay đứng thứ hai, sau "Nội dung sản phẩm". Cửa sổ trình duyệt thật cao khoảng 640 thì nút vẫn nằm dưới mép (xem P2-A). 390x844: nút ở y=859, dưới mép 15px. Ảnh d01 |
| 2. Ô tìm | ĐẠT | Nhãn "Tìm ảnh" trong hộp của sản phẩm. Thư viện vẫn "Tìm ảnh hoặc video" |
| 3. Tên tệp, câu kỹ thuật | ĐẠT MỘT PHẦN | Hết `title` tên tệp (nay là mô tả ảnh, tiếng Việt), hết câu "JPG, PNG, WebP, AVIF", nay "Mỗi ảnh nặng tối đa 10 MB". Còn P3-B |
| 4. Thanh dưới bị cắt ở 390 | ĐẠT | Câu "Bấm ảnh để chọn nhiều ảnh": scrollWidth 296 bằng clientWidth 296, cao 22 (một dòng). Đã chọn 5: 296 bằng 296. Ảnh m01, m02 nhìn rõ không cắt |
| 5. Lỗi API tiếng Anh | ĐẠT | Xem mục E |
| 6. Cache ảnh công khai | ĐẠT | Xem mục D |
| 7. Hai nút nền đậm | ĐẠT | Đếm nút nền đậm trong hộp: chưa chọn 1 (nút "Thêm ảnh" ở thanh dưới, đang mờ vì chưa chọn), đã chọn 4 hoặc 5: 1 ("Thêm 4 ảnh" hoặc "Thêm 5 ảnh"). "Chọn tệp" nay là nút viền ở cả 1366 và 390 |

## B. Hồi quy luồng chính: ĐẠT

Mở "Bồn chứa hóa chất composite", thêm 4 ảnh (đúng thứ tự chọn), đổi chỗ hai lần, bỏ 1, lưu. Cơ sở dữ liệu: 3 dòng `product_media` đúng thứ tự, ảnh đại diện là ảnh đầu. Tải lại: đúng thứ tự. Khách (ngữ cảnh không đăng nhập) mở `/san-pham/bon-chua-hoa-chat`: 3 ảnh nhỏ đúng thứ tự, ảnh chính là ảnh đầu, đếm "1 / 3", 0 ảnh vỡ (ảnh c01). Lưu danh sách rỗng: `media_ids` rỗng, `cover_id` null, 0 dòng `product_media`, trang khách 0 ảnh nhỏ, 0 ảnh vỡ.

## C. Bàn phím hộp chọn: ĐẠT

Tab từ ô mô tả tới nút "Thêm ảnh" đúng 1 lần. Enter mở, tiêu điểm vào nút "Đóng" trong hộp. Tab 40 lần: 40 lần đều trong hộp, Shift+Tab vẫn trong hộp. Esc đóng, tiêu điểm về đúng nút "Thêm ảnh" (nằm hàng tiêu đề mục). Sau khi thêm ảnh và sau khi bỏ một ảnh, tiêu điểm đều về "Thêm ảnh" (không rơi về body).

## D. Cache `/api/media/[id]`: ĐẠT, không tìm ra lỗ hổng quyền xem

Khách không đăng nhập:
- Ảnh chưa công khai: 404 với 5 kiểu yêu cầu (không tiêu đề, `If-None-Match: *`, ETag đúng công thức đoán từ cơ sở dữ liệu, ETag giả, Range). Không rò ETag hay Cache-Control.
- Ảnh của sản phẩm ẩn: 404, kể cả với ETag đoán đúng và `*`. Bật công khai: 200 kèm ETag. Ẩn lại rồi gọi với ETag cũ: 404.
- Ảnh vừa gỡ khỏi sản phẩm bằng API: gọi ngay với ETag cũ: 404 (không phải 304). Không ETag: 404. Ảnh còn lại của sản phẩm vẫn 200.
- Ảnh công khai: 200, `Cache-Control: public, max-age=300, stale-while-revalidate=86400`, có ETag. Gọi lại với ETag, dạng `W/`, dạng danh sách, dạng `*`: đều 304 không thân. ETag sai: 200. Range `bytes=0-99`: 206 kèm `Content-Range: bytes 0-99/114588`. Range vượt cỡ: 416. Range kèm ETag đúng: 304 (hợp lệ).
- Admin: ảnh chưa công khai 200 với `private, no-store`, không ETag, kể cả gửi ETag đoán (vẫn 200 đủ thân). Ảnh sản phẩm ẩn: cũng `private, no-store`.

Lưu ý nhỏ P3-A bên dưới.

## E. Lỗi API: ĐẠT

12 ca (mã rác, 21 ảnh thật, 21 mã ngẫu nhiên, 61 mã, `null`, chuỗi, số, thiếu tên, tên rỗng, tên 201 ký tự, tên là số, đường dẫn sai): tất cả trả 400, không còn chữ tiếng Anh nào trong `error` hoặc `fields[].message` (quét bằng danh sách từ Anh và kiểm mọi câu có dấu tiếng Việt: 0 câu sót). Quá 20 ảnh: câu chính là "Mỗi sản phẩm tối đa 20 ảnh." Số dòng `product_media` trước và sau các ca lỗi bằng nhau (2 và 2). Lớp dịch chung: PUT `/api/admin/settings` với dữ liệu sai trả 400, câu chính "Vui lòng kiểm tra các trường thông tin.", từng trường tiếng Việt, cài đặt công ty không đổi (so trước sau khớp). POST `/api/admin/posts` với dữ liệu sai và rỗng: 400, tiếng Việt, 0 bài được tạo.

Nhận xét chất lượng chữ, không sai: thiếu `kind` hoặc `status` ở bài viết hiện "Thông tin này không hợp lệ.", và `email` thiếu ở cài đặt cũng vậy. Chỉ lộ khi gọi API trực tiếp.

## F. Hồi quy: ĐẠT, nhưng điều kiện của đề bài sai ở một điểm

Đề bài viết "hộp này không phải `imagesOnly`". Thực tế `post-editor.tsx` dòng 486 truyền `imagesOnly={mediaMode !== 'video'}`, nên hộp "Chọn ảnh bìa" CÓ là `imagesOnly`. Hệ quả của lượt sửa lên hộp ảnh bìa (đo trên trình duyệt):
- Hộp ảnh bìa không còn nhóm tab "Tất cả, Ảnh" (trước lượt sửa có hai tab này). Không còn bộ lọc loại tệp. Ảnh f01.
- Ô tìm là "Tìm ảnh" (không còn "ảnh hoặc video"). Tìm có chữ: 1 kết quả. Tìm chữ lạ: 0 kết quả kèm "Không thấy tệp phù hợp". Tìm đúng.
- "Chọn tệp" là nút viền. Chọn 1 ảnh: thanh hiện "Chọn làm ảnh bìa" nền đậm (1 nút đậm). Bấm: hộp đóng, ảnh bìa hiện. Không lưu bài: số bài vẫn 0.
- Chọn đơn vẫn chạy đúng, không có "Chọn nhiều".
Đây là thay đổi hành vi ngoài phạm vi 7 mục (P3-C). Hai tab trong hộp chỉ-ảnh thì thừa nên bỏ là hợp lý, nhưng người sửa phải ghi rõ.

Trang `/admin/thu-vien`: 26 ảnh, tab "Tất cả, Ảnh, Video" còn, bấm "Ảnh" còn 26, ô tìm "Tìm ảnh hoặc video", "Chọn tệp" nút đậm (class `button`), câu hướng dẫn cũ nguyên. Ảnh f03. Không tràn ngang.

## G. Luật chữ, vùng bấm, console: ĐẠT

- Quét chữ mục ảnh (trống và có ảnh), hộp chọn (1366 và 390), gồm văn bản, `aria-label`, `title`, `alt`, `placeholder`: 0 dấu chấm giữa, gạch ngang, chấm phẩy, chấm than, `&nbsp;`, in hoa cả cụm, từ kỹ thuật. (Lần chạy đầu của kịch bản báo nhầm một câu vì regex in hoa sai phạm vi chữ, đã sửa regex và chạy lại, 0 sót.)
- Vùng bấm: 1366 mọi nút trong mục ảnh và hộp cao 40 (từ 36 đạt). 390: "Thêm ảnh" 126x44, "Đóng" 44x44, "Chọn tệp" 292x44, "Bỏ chọn" và "Thêm 5 ảnh" 142x44, nút đổi chỗ và bỏ ảnh 44 (đạt từ 44).
- Tràn ngang: trang 1366 0, trang 390 0, hộp 390 0, thư viện 0.
- Console: 0 lỗi thật. 16 dòng "400 Bad Request" ở phiên admin là do chính các ca lỗi API cố ý của kịch bản. Phiên khách và phiên 390: 0.

## H. Byte điều khiển, BOM: ĐẠT, kèm P3-D

9 tệp (7 đổi, `src/lib/media-cache.ts`, `tests/media-cache.test.ts`): 0 byte dưới 9 hoặc 127, 0 BOM, UTF-8 hợp lệ, 0 `U+FFFD`, 0 NBSP, 0 gạch ngang dài. Riêng `product-manager.tsx` có 16 ký tự CR rải rác (đầu tệp và cuối tệp CRLF, giữa là LF) trong khi bản gốc 0 CR.

## Lỗi theo mức

P0: không có. P1: không có.

P2
- P2-A. Mục 1 chưa thật sự đạt trên máy thật. `src/components/admin/product-photos.tsx` dòng 28 (nút nay ở hàng tiêu đề) nhưng khối "Ảnh sản phẩm" vẫn nằm dưới khối nội dung có ô mô tả 4 dòng, nút ở y=723 trong khung 768, tức chỉ lọt 4,5px. Cửa sổ Chrome 1366x768 thật cao khoảng 640 nên nút nằm dưới mép, cần cuộn. Cách xử lý gợi ý: đưa khối ảnh lên đầu cột, hoặc thêm nút "Thêm ảnh" ở thanh trên cùng với "Lưu sản phẩm", hoặc thu ô mô tả. Ở 390 nút ở y=859, dưới mép 844.

P3
- P3-A. `src/app/api/media/[id]/route.ts` (và hằng ở `src/lib/media-cache.ts` dòng 2): `stale-while-revalidate=86400` cho phép bộ nhớ đệm dùng chung (mạng phân phối nếu có) hoặc trình duyệt tiếp tục phát ảnh đã công khai tới một ngày sau khi ảnh bị gỡ hoặc sản phẩm bị ẩn. Máy chủ không rò (đo ở D), nhưng ảnh sản phẩm vừa ẩn có thể còn hiện với người từng tải. Chưa kiểm được qua một lớp CDN thật. Cân nhắc rút còn vài phút.
- P3-B. `src/components/admin/media-library.tsx` dòng 164: tên hiển thị trên thẻ vẫn là `item.alt || item.original_name`, nên ảnh mới tải lên chưa có mô tả sẽ hiện tên tệp kiểu `IMG_2031.jpg` thành chữ thấy được (cả 26 ảnh hiện có đều có mô tả nên chưa tái hiện, vì không được tải ảnh mới). Ghi là chưa kiểm.
- P3-C. Hộp "Chọn ảnh bìa" và hộp chèn ảnh trong bài mất hai tab lọc, thay đổi ngoài 7 mục, không nằm trong báo cáo sửa.
- P3-D. `src/components/admin/product-manager.tsx` lẫn kết thúc dòng CRLF và LF (16 CR). Không lỗi chạy, nhưng làm nhiễu `git diff`.
- P3-E. `src/lib/product-media.ts` dòng 38: "Chưa có ảnh, nên có khoảng 10" thiếu đơn vị ở cuối, đọc như bị cụt (có sẵn từ trước, hiện ở mục ảnh).
- P3-F. Nút "Thêm ảnh" trong thanh dưới hộp cùng tên với nút "Thêm ảnh" mở hộp ở trang phía sau. Người dùng đọc màn hình nghe trùng tên. Không chặn.

## Số đếm cuối (đo bằng truy vấn sau khi dọn)

0 bài, 0 yêu cầu, 26 ảnh (26 ảnh dạng ảnh), 1 tài khoản, `product_media` 0 dòng, `cover_id` rỗng ở cả 8 sản phẩm (0 sản phẩm có ảnh đại diện), 8 sản phẩm. `updated_at` của sản phẩm và cài đặt công ty khớp trước và sau.

## Điều chưa kiểm được

- Ảnh mới tải lên không có mô tả (cấm tải ảnh): chưa xem tên tệp lộ ở thẻ.
- Cache qua mạng phân phối hay proxy thật: chỉ đo tiêu đề và máy chủ gốc, không đo lớp đệm dùng chung.
- Chế độ chèn video trong soạn bài (hộp không `imagesOnly`) chưa mở, nên chưa thấy tab Tất cả, Ảnh, Video của nó sau lượt sửa. Chỉ thư viện `/admin` còn tab đủ ba mục.
- Khung cao thực của Chrome ở 1366x768 chỉ suy ra từ y của nút, chưa chụp ở viewport 1366x640.
- Chưa chạy `tests/media-cache.test.ts` (không được chạy build và cài đặt, chưa thử bộ test riêng).
