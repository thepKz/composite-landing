# Báo cáo vòng hai: vùng trang-phu

Ngày 21/11/2026. Bản đo: http://127.0.0.1:3002 (bản dev). Không bật hay tắt máy chủ, không build, không cài gói, không đọc `.env`, không commit.

## Skill đã gọi và script đã chạy

- Đã gọi `anthropic-skills:impeccable`, `anthropic-skills:design-taste-frontend`, `anthropic-skills:thiet-ke-ux-ui` trước khi sửa. Luật đã áp: không viền một bên làm điểm nhấn, không thẻ lồng thẻ, không hai trang cùng một khuôn (bento, danh sách hàng, cột chia đường kẻ, dải ảnh trượt), không `text-wrap`, không NBSP, phân cấp bằng cỡ và đậm chứ không bằng chữ nhạt, chuyển động chỉ `transform` và `opacity` có bản giảm chuyển động.
- `contrast.py`: các cặp màu mới đều đạt (chanh trên rừng 9,85, trắng trên cam 5,21, xanh lá trên giấy 5,33, xanh lá trên trắng 5,99). Kết quả ở `vong-2/trang-phu/contrast.txt`.
- `ui_audit.py --code` trên `src/components/pages`, `san-pham`, `gioi-thieu`, `du-an`, `lien-he`: 0 chặn. Một mục CẦN SỬA (đổi `padding` khi rê chuột) đã sửa thành `transform`, chạy lại sạch. Còn một mục XEM LẠI là mã cũ nghe sự kiện cuộn thô trong `scale-picker.tsx` (không do vòng này thêm). Kết quả ở `ui-audit-code.txt`.
- `ui_audit.py --render --stress`: KHÔNG chạy được trên trang Next (công cụ nhận tệp HTML tĩnh, thiếu tệp kiểu). Thay bằng ba script Playwright của mình (xem mục Đã kiểm).
- `wrap_check.py`: không dùng, thay bằng `scripts/kiem-rot-chu-trang-phu.mjs` đo từng từ thật trên màn.

## Audit trước khi sửa (ảnh ở `vong-2/trang-phu/truoc`)

1. Chi tiết sản phẩm: ảnh dọc nằm giữa khung rộng, hai bên trống nền giấy. Bốn ô thông số cùng cỡ, giá trị không nổi. Phần cấu tạo là ba thẻ chữ giống hệt nhau trên nền xanh.
2. Danh mục: ba dòng mũi nhọn là ba thẻ cùng cỡ, ô bể phốt là khối xanh đặc lệch tông với hai thẻ ảnh. "Các dòng khác": thẻ cao thấp lệch, nút "Xem quy cách" lơ lửng ở các độ cao khác nhau.
3. Giới thiệu: nhiều lưới thẻ viền mảnh liên tiếp (bốn giá trị, bốn bước), không có khối ảnh lớn.
4. Dự án: khi ít mục thì thẻ nằm lẻ trái, dòng phụ lơ lửng lệch đường chữ; năm lĩnh vực xếp 3 + 2 lệch.
5. Liên hệ: sáu thẻ thông tin cùng một dạng, số hotline nhỏ; bản đồ là ô xanh trống khi chưa tải.
6. Hướng dẫn đặt hàng: năm bước là năm thẻ có gạch nối ngắn, không có cảm giác một quy trình.
7. Ảnh: mỗi ảnh một tông, một tỉ lệ; khung chọn quy mô và nút trong bảng cao 25 đến 26px.
8. Khung 600x360: trang chi tiết sản phẩm và 404 không thấy tiêu đề cùng nút kêu gọi ở màn đầu.
9. Đủ tiêu đề và nhãn rớt một từ lẻ (tên sản phẩm dài, nhãn dòng trong bảng, tiêu đề 404).
10. Liên kết đường dẫn (Trang chủ, Sản phẩm) cao 24px.

## Đã sửa

### Ảnh (mục 3 của đề)
- `scripts/xu-ly-anh-trang-phu.mjs` (sharp): từ 18 ảnh xưởng gốc tạo ra tệp mới trong `public/images/trang-phu/` (126 tệp, 20 MB): vuông 1:1 (khung ảnh chính), 4:3 (thẻ), 3:2, 16:9 và bản đủ khung không cắt cho hộp phóng to; cùng một bước kéo dải sáng, tăng nhẹ độ tươi, làm nét. Không ghi đè, không xoá ảnh gốc, không đụng `data/`.
- Ảnh dọc cắt thẳng vào khung vuông, không còn dải trống hai bên. Hộp phóng to mở bản đủ khung.
- `src/lib/trang-phu-media.ts`: đổi đường dẫn sang bản đã xử lý. Việc ảnh nào gán cho sản phẩm nào vẫn theo `customer-product-assets.ts`, không gán thêm cho bể phốt, xử lý nước thải, bồn hóa chất.
- Ô thay thế của ba nhóm chưa có ảnh (`product-tile.css`, nền chân dung của trang chi tiết): thêm lưới mảnh kiểu bản vẽ và dấu góc để cùng chất lượng với thẻ ảnh, vẫn là hình vẽ nét tự có, không phải ảnh giả.

### Trang chi tiết sản phẩm (trọng tâm 1)
- Khung ảnh vuông 1:1, phóng nhẹ khi rê chuột, thumb và mũi tên giữ nguyên.
- Thông số thành một bảng liền, mỗi dòng nhãn trái giá trị phải, số lớn đậm, không tách "1.000 con" khỏi đơn vị.
- Cấu tạo: bên trái tiêu đề cùng phụ kiện (dính khi cuộn), bên phải danh sách chia đường kẻ có biểu tượng, rê chuột dịch nhẹ bằng `transform`. Bỏ ba thẻ.
- Tên dài nhỏ hơn một cấp ở máy bàn, ở điện thoại giới hạn bề rộng để dòng cuối không rớt một từ lẻ. Tiêu đề khối báo giá tách thành "Nhận báo giá" và tên sản phẩm bên dưới.
- Mục 16: nút chọn trong bảng cao 36px ở máy bàn, 44px ở điện thoại, nút "Phóng to" 44px ở điện thoại. Cột đầu bảng rộng 232px và không xuống dòng ở máy bàn lớn.
- Khung thấp (ngang dưới 1000px, cao dưới 520px): ảnh trái, tên rồi nút báo giá ngay màn đầu.

### Danh mục (trọng tâm 2)
- Khối bento ba dòng mũi nhọn: thẻ lớn bên trái (ảnh vuông), hai thẻ nằm ngang bên phải, vào lần lượt so le. Lọc còn ít hơn ba thì quay về lưới thường.
- Mục 11: "Các dòng khác" cùng chiều cao, chip đẩy nút "Xem quy cách" xuống một mép chung.
- Thẻ dùng ảnh 4:3 đã xử lý có `srcSet`, `width` và `height` để không nhảy bố cục.

### Giới thiệu (trọng tâm 3)
- Thêm dải ảnh trượt ngang "Từ xưởng đến công trình": sáu ảnh không lặp ảnh đã dùng trong trang, bắt cuộn, hai nút lùi tới, phím mũi tên khi dải có tiêu điểm, bản giảm chuyển động cuộn tức thì. Chú thích lấy từ nhãn đã có.
- Bốn giá trị thành bốn cột chia đường kẻ, không dùng thẻ; vạch trên đổi sang cam khi rê chuột.

### Liên hệ (trọng tâm 4)
- Hotline thành khối rừng số lớn 28 đến 36px, hai số bấm gọi; năm dòng còn lại chia đường kẻ, không thẻ.
- Khung bản đồ có nền lưới và biểu tượng vị trí nên khi chưa tải trông có chủ đích.
- Mục 14: tìm ra phần tử là iframe bản đồ (không đo ra viền vì tiêu điểm nằm trong khung nhúng). Đặt `tabIndex={-1}` cho iframe, người dùng bàn phím vẫn có liên kết "Mở Google Maps" liền kề.

### Dự án, hướng dẫn, các trang còn lại
- Mục 6: lưới dự án đã đăng tự co theo số mục (1 mục thành thẻ ngang lớn, 2 mục hai cột, từ 3 mục ba cột). Chưa có dự án thật nên mới kiểm bằng mã, xem "Chưa kiểm".
- Mục 7: dòng phụ "Đây là nhóm lĩnh vực..." xếp dưới tiêu đề, đúng đường chữ.
- Đầu trang Dự án có số "100+ công trình" cỡ lớn (số đã có trong hồ sơ và `site-facts.ts`). Năm lĩnh vực thành danh sách hàng, cả hàng bấm được.
- Hướng dẫn đặt hàng: năm bước nối bằng một đường chạy ra khi khối hiện lên (có bản giảm chuyển động và không có JavaScript thì đường hiện sẵn). Rê chuột đổi số bước sang cam.
- Hỏi đáp (và mọi accordion của vùng): mở và đóng mượt bằng `::details-content`, đã đo chiều cao đổi qua 6 bước.
- 404: khung thấp xếp ngang, thấy lối về ngay màn đầu.
- Liên kết đường dẫn cao 36px (máy bàn), 44px (điện thoại).

## Đã kiểm (số do script đo)

- `npx tsc --noEmit`: sạch. `npm test`: 40 trên 40 đạt.
- `scripts/shots-vong2-trang-phu.mjs`: 15 trang x 3 cỡ (1366x768, 390x844, 600x360) = 45 lượt: 0 tràn ngang, 0 ảnh vỡ, 0 nút dưới ngưỡng (không tính liên kết trong câu), lỗi console chỉ là chính mã 404 của trang 404. Ảnh trước ở `vong-2/trang-phu/truoc`, sau ở `sau`; ảnh lát cắt ở `lat/`. Đã tự xem ảnh 1366 và 390 của các trang chi tiết, danh mục, giới thiệu, dự án, liên hệ, hướng dẫn, hỏi đáp, và 600 của mười trang.
- `scripts/kiem-tuong-tac-trang-phu.mjs` (không bật giảm chuyển động): 24 trên 24 đạt. Hộp phóng to mở bằng bản đủ khung, tiêu điểm vào nút đóng, Tab ở lại trong hộp, Esc đóng, tiêu điểm về nút "Phóng to"; mũi tên đổi ảnh; chọn quy mô sáng đúng một dòng; thanh dính hiện sau khi cuộn; dải ảnh cuộn bằng nút và phím; hỏi đáp đổi chiều cao 67, 112, 146, 163, 169, 171; giảm chuyển động không có khối kẹt ẩn ở bốn trang; tắt JavaScript trang Dự án vẫn thấy hết; không lỗi console.
- `scripts/kiem-tab-trang-phu.mjs`: trang Liên hệ ở 390, mọi điểm dừng Tab của vùng mình có viền vàng 3px.
- Quét chữ hiện ra trên 17 trang (cả tám sản phẩm): không có dấu chấm giữa, gạch dài, chấm phẩy, chấm than, ký tự dính từ, `<br>`. Cụm in hoa chỉ là FRP và RAS.
- `scripts/kiem-rot-chu-trang-phu.mjs`: mọi tiêu đề H1, H2, H3 của vùng không còn dòng cuối lẻ một từ ở 1366 và 390. Nhãn dòng trong bảng không rớt từ lẻ ở 1366.
- Dữ liệu: các script của tôi không đụng cơ sở dữ liệu, không tạo bài, yêu cầu hay tài khoản nên không có gì để dọn.

## Chưa kiểm hoặc còn tồn tại

- Còn đoạn văn dòng cuối chỉ một từ: 17 chỗ ở 1366 và 38 chỗ ở 390 (mô tả thẻ, nhãn số liệu, một số dòng danh sách). Không dùng `text-wrap` nên chưa xử lý hết; chỉ tiêu đề, nhãn và giá trị ngắn là đã sửa.
- Chưa kiểm trang Dự án khi có đúng 1, 2 hay 3 dự án đã đăng (đang 0 dự án, đề cấm tạo dữ liệu thử ngoài `shots.ts`). Lưới `is-1`, `is-2`, `is-3` mới kiểm bằng đọc mã và CSS.
- Chưa chạy `ui_audit.py --render --stress`, chưa kiểm bản build, tốc độ tải, trình đọc màn hình, điện thoại thật. Vuốt ngang chỉ mô phỏng.
- Bảng chọn dung tích vẫn dùng vạch trái 4px cho dòng đang chọn (mã cũ), lệch với luật không viền một bên; chưa đổi vì đang phục vụ nhận diện dòng chọn, cần quyết.
- Ba nhóm bể phốt, xử lý nước thải, bồn hóa chất vẫn chưa có ảnh xác nhận nên dùng ô bản vẽ. Ảnh thứ hai của bể biogas ("Thành phẩm tại xưởng", các bồn trắng nằm ngang) có thể là bể phốt, cần chủ doanh nghiệp xác nhận như báo cáo vòng trước.

## Đề nghị cho tệp ngoài vùng

1. Chân trang: iframe bản đồ chân trang (352x219 ở 390) là điểm dừng Tab không có viền tiêu điểm. Nên đặt `tabIndex={-1}` như đã làm ở trang Liên hệ.
2. Biểu mẫu báo giá: tiêu đề bước hai "Số người dùng hoặc loại công trình" rớt từ lẻ ở 390.
3. Chân trang đã có dải kêu gọi riêng, trang Danh mục, Dự án, Hỏi đáp vẫn còn dải `CtaBand` của vùng này (đề nghị từ vòng trước vẫn còn giá trị).
4. `/hoi-dap` chưa có trong menu đầu trang.

## Tệp đã sửa hoặc tạo

Sửa: `src/components/product-card.tsx`, `src/components/product-photo-gallery.tsx`, `src/components/product-assets.css`, `src/components/pages/catalogue-browser.tsx`, `src/components/pages/pages.css`, `src/components/pages/product-tile.css`, `src/app/(public)/secondary-pages.css`, `src/app/(public)/san-pham/[slug]/page.tsx`, `src/app/(public)/san-pham/[slug]/product-detail.css`, `src/app/(public)/gioi-thieu/page.tsx`, `src/app/(public)/du-an/page.tsx`, `src/app/(public)/lien-he/page.tsx`.

Tạo: `src/lib/trang-phu-media.ts`, `src/components/pages/photo-strip.tsx`, `public/images/trang-phu/*`, `scripts/xu-ly-anh-trang-phu.mjs`, `scripts/shots-vong2-trang-phu.mjs`, `scripts/kiem-tab-trang-phu.mjs`, `scripts/kiem-tuong-tac-trang-phu.mjs`, `scripts/kiem-rot-chu-trang-phu.mjs`, `scripts/_sheet600.mjs` (ghép ảnh 600 để xem), và thư mục `docs/nang-cap-2026-11/vong-2/trang-phu/` (ảnh, `report.json`, `contrast.txt`, `ui-audit-code.txt`).

---

# Vòng sửa (theo lời chủ dự án 21/11 và kiểm viên lượt hai)

Ảnh sau vòng sửa ở `vong-2/trang-phu/sau-vong-sua` (ba cỡ, kèm `report.json`).

## 1. Chữ thừa: bỏ gì, giữ gì

Nguyên tắc: xoá đi người xem có mất thông tin không. Tiêu đề và nhãn mà trình đọc màn hình cần thì giữ trong mã, ẩn khỏi mắt (lớp `tp-sr`). Alt ảnh giữ nguyên.

| Trang | Bỏ (hoặc ẩn khỏi mắt) | Vì sao bỏ | Giữ | Vì sao giữ |
|---|---|---|---|---|
| Danh mục | Dòng "Bảy nhóm sản phẩm, ba dòng mũi nhọn đứng đầu" | Số 7 ở đầu trang và huy hiệu "Mũi nhọn" đã nói | Số "7 nhóm sản phẩm" | Là điểm nhấn của đầu trang |
| Danh mục | Tiêu đề "Ba dòng mũi nhọn", "Các dòng khác" (ẩn) | Huy hiệu và bố cục bento đã phân biệt | Huy hiệu "Mũi nhọn", nhãn nhóm trên thẻ | Thông tin phân loại |
| Danh mục, nhóm bể phốt, 404, sản phẩm liên quan | Chữ "Xem quy cách" ở mọi thẻ (chỉ còn mũi tên, chữ ẩn cho trình đọc) | Cả thẻ là liên kết, mũi tên đã báo | Tên, chip ứng dụng | Thông tin |
| Ô thay thế ba nhóm chưa ảnh | Nhãn "Dung tích", "Cấu tạo" dưới số lớn | Số đã có đơn vị | Số lớn, rút "Từ 1 m³ đến 100 m³ trở lên" thành "1 – 100+ m³" | Gọn, giữ đủ khoảng |
| Chi tiết sản phẩm | Chú thích dưới ảnh ("Bể composite dạng cầu") và chú thích hộp phóng to | Tên đã ở tiêu đề trang | Số thứ tự "1 / 2" đặt trên ảnh | Cần khi có nhiều ảnh |
| Chi tiết sản phẩm | Tiêu đề "Chọn dung tích theo đàn", "Hỏi đáp liên quan", "Sản phẩm liên quan" (ẩn) | Bảng, danh sách hỏi đáp, lưới thẻ nhìn là hiểu | Câu hỏi "Đàn của bạn đang nuôi bao nhiêu?" | Lời mời hành động |
| Chi tiết sản phẩm | Dòng dẫn dưới bảng ("Đối chiếu số vật nuôi thực tế...") | Lặp ý của bảng và nút chọn | Nút "Xem trong bảng" | Hành động |
| Chi tiết sản phẩm | Ô gợi ý rỗng "Bấm một quy mô để xem gợi ý" (chỉ hiện sau khi chọn) và nhãn "Gợi ý cho bạn" | Nút nhìn là bấm được | Câu gợi ý dung tích sau khi chọn | Thông tin mới |
| Chi tiết sản phẩm | Chữ "Bảo hành đến 10 năm" lặp ở từng dòng bảng biogas | Đã có ô thông số "Bảo hành" | Cột đổi tên "Công dụng của khí" | Thông tin riêng từng dòng |
| Chi tiết sản phẩm | Tiêu đề khối báo giá gộp tên ("Nhận báo giá bể ...") | Tách thành "Nhận báo giá" và tên sản phẩm | Ba ý dưới (15 – 60 phút, vận chuyển, bảo hành) | Điều kiện |
| Chi tiết sản phẩm | Không bỏ nhãn ở ô thông số (Dung tích, Đường kính, Quy mô đàn, Bảo hành) | Không bỏ | Nhãn thông số | Giá trị như "Đến 10 năm" hay "1,50 – 3,00 m" không tự nói nghĩa nếu thiếu nhãn |
| Giới thiệu | Chú thích ảnh ("Từ xưởng đến nơi lắp đặt", "Nhiều quy cách sản xuất"), chú thích dải ảnh, tiêu đề dải ảnh (ẩn) | Ảnh tự nói | Alt ảnh | Trình đọc màn hình |
| Giới thiệu | Mốc 2010, 15+ năm, 25+ tỉnh dưới câu chuyện | Lặp đúng dải số liệu ngay trên | Dải số liệu, câu chuyện | Một nơi nói một lần |
| Giới thiệu | Câu "Xưởng tại ... có năm khu chức năng" | Năm khu hiện ngay bên dưới | Tiêu đề "Nhà máy phân khu rõ ràng", nhóm nguyên vật liệu | Thông tin |
| Giới thiệu | Tiêu đề "Lĩnh vực ứng dụng" (ẩn) | Danh sách liên kết có tên từng lĩnh vực | Danh sách liên kết | Điều hướng |
| Dự án | "Hơn 100 công trình" trong lời dẫn | Lặp số "100+ công trình" ngay cạnh | Số 100+, lời dẫn rút gọn | Thông tin |
| Dự án | "Chưa có dự án nào được đăng" | Tiêu đề "Hồ sơ dự án đang được cập nhật" đã nói | Câu mời gửi mặt bằng | Việc cần làm |
| Dự án | Không bỏ dòng "Đây là nhóm lĩnh vực của sản phẩm, chưa phải danh sách dự án đã bàn giao" | Không bỏ | Giữ | Là lời nói thật, tránh hiểu nhầm là dự án đã bàn giao |
| Liên hệ | Tiêu đề "Thông tin liên hệ", "Vị trí nhà máy" (ẩn); nhãn "Email", "Nhà máy và trụ sở", "Giờ làm việc", "Đơn vị" (ẩn); chú thích địa chỉ dưới bản đồ | Biểu tượng và nội dung tự nói, địa chỉ đã ở danh sách | "Mã số thuế" (gộp một dòng), "Hotline và Zalo tư vấn", liên kết "Mở Google Maps" | Con số cần nhãn, Zalo là thông tin mới, nút mở bản đồ lớn |
| Hướng dẫn đặt hàng | Lời dẫn "Năm bước từ chọn quy mô đến bảo hành", tiêu đề "Quy trình năm bước" (ẩn), dòng "Chọn dòng sản phẩm để xem bạn cần chuẩn bị gì" | Hình năm bước và nhãn tab tự nói | Tiêu đề "Thông tin cần có", khối thời gian, dòng "báo giá chi tiết 1 – 24 giờ" | Thông tin |
| Bảo hành | Lời dẫn "Bảo hành dài hạn... tùy từng dòng", tiêu đề "Điều bạn cần biết" (ẩn) | Số 10 năm và bốn điểm bên dưới đã nói | Số 10 năm | Điểm nhấn |
| Hỏi đáp | Lời dẫn "Năm câu khách hàng hỏi nhiều nhất" | Danh sách tự nói | Khối "Chưa thấy câu trả lời" | Việc cần làm |
| Bảo mật | Lời dẫn, nhãn "Nội dung" của mục lục | Tiêu đề trang và danh sách liên kết đã nói | Bốn mục chính sách | Nội dung pháp lý |
| 404 | Tiêu đề "Có thể bạn đang tìm" (ẩn) và liên kết "Tất cả sản phẩm" | Nút "Xem sản phẩm" ở trên đã có | Câu giải thích, ba lối ra | Thông tin |
| Nhóm bể phốt | Lời dẫn "Hai dòng bể composite liền khối...", khối "Chưa rõ nên chọn loại nào" cùng hai thẻ giải thích, tiêu đề hỏi đáp (ẩn) | Hai dòng sản phẩm và bảng đã trả lời | Hai hàng liên kết sản phẩm | Thông tin |

Sau khi bỏ, chỉnh khoảng cách: tiêu đề chỉ còn chữ ẩn thì khối đầu không chừa lề, bảng, hỏi đáp và sản phẩm liên quan giảm khoảng đệm, hỏi đáp một cột, nhóm bể phốt giảm khoảng trống trước hỏi đáp.

## 2. Ảnh có em bé ở mép bể

- Nguồn là tệp mã, không nằm trong cơ sở dữ liệu nên không có giá trị dữ liệu cần ghi lại. Giá trị cũ để hoàn lại:
  - `src/lib/customer-product-assets.ts`, mục `be-nuoi-trong-thuy-san`: trước đây `src` là `/images/products-2026/round-blue-tanks-site.webp`, alt "Các bể composite tròn màu xanh được bố trí ngoài trời", label "Bể tròn composite", 964x1280. Nay là `round-tanks-installation.webp` (công nhân lắp ghép), 2000x1500. Đây là một dòng ngoài vùng, đã sửa theo lời điều phối.
  - `san-pham/[slug]/page.tsx`, `supportingPhotos['be-nuoi-trong-thuy-san']`: trước đây `[editorialAssets.hero, editorialAssets.fit]`, nay `[editorialAssets.fit, ảnh round-blue-tanks-site]`. Ảnh có em bé xuống cuối, không xoá.
- Kết quả: ảnh chính trang chi tiết bể cá và thẻ ở trang Sản phẩm là ảnh công nhân lắp bể. Đã xem ảnh (`sau-vong-sua/lat/sp-thuy-san-1366-1.jpg`, `san-pham-1366-1.jpg`).
- **Thẻ trang chủ KHÔNG đổi theo.** Trang chủ dùng ảnh riêng `photos.fishTank` trong `src/components/home/images.ts` (tệp `be-nuoi-thuy-san-*.webp`, alt "Bể composite tròn màu xanh đặt trong hố đất"), đó chính là ảnh có em bé. Đề nghị cho vùng trang chủ: đổi `fishTank` sang ảnh khác của đúng nhóm, ví dụ `hero-lap-dat` (công nhân lắp bể tròn).

## 3. Nhóm bể phốt bớt trống

Trang nhóm không còn ô xanh lớn. Bố cục: nút chọn quy mô (có gợi ý khi bấm) và hai hàng liên kết (bể phốt "1 – 100+ m³", bể xử lý "AAO, AO, MBBR, Jokaso") ở hàng trên, bảng năm phân khúc đầy đủ ở giữa, nút "Nhận báo giá", hỏi đáp. Chưa gán ảnh cho nhóm nào chưa xác nhận.

## 4. Chữ rớt một từ lẻ

Đo bằng `scripts/kiem-rot-chu-trang-phu.mjs` (từng từ thật, gồm cả ô bảng, bỏ chữ ẩn và hỏi đáp đang đóng). Cách sửa: rút chữ, đổi bề rộng cột, giới hạn bề rộng. Không ký tự dính từ, không `text-wrap`, không `<br>`.

| Cỡ | Trước vòng sửa | Sau vòng sửa |
|---|---|---|
| 1366 | 17 (đoạn văn) | 0 ở đoạn văn và tiêu đề, 5 ô bảng |
| 390 | 38 | 0 ở đoạn văn và tiêu đề, 6 ô bảng |
| 600 | chưa đo | 12 (đoạn văn trong danh sách đặt hàng, ô thông số, vài ô bảng) |

Bảng bể phốt: từ 8 chỗ xuống 1 ô ("35 – 100 m³ trở lên hoặc ghép nhiều module") ở 1366. Cách làm: cột đầu bảng co theo nhãn, giảm lề ô, rút chữ ("người thường dùng", "m³/ngày đêm"), bỏ "Bảo hành đến 10 năm" lặp. Các câu rút ngắn không đổi nghĩa.

## 5. Nhãn kêu gọi

"Trao đổi dự án" (Dự án) và "Gửi yêu cầu" (Bảo hành) đã đổi thành "Nhận báo giá", cùng dẫn tới biểu mẫu.

## 6. Mục P2 của kiểm viên lượt hai thuộc vùng này

- P2-7 (đường dẫn trang chi tiết bể phốt ở 390, dòng sau bắt đầu bằng dấu gạch chéo lẻ): dấu gạch chéo chuyển ra cuối mục trước, không còn đứng đầu dòng.
- P2-6 (bảng trong bài viết), P2-10 (khoảng cách tiêu đề biểu mẫu), P2-13 (Chat Zalo và Nhắn Zalo): thuộc bài viết và biểu mẫu, không sửa.
- P1-3 phần thuộc vùng này (đoạn văn và bảng bể phốt): xem mục 4. Câu chân trang "Đúng yêu cầu... thời gian" thuộc chân trang.

## Đã kiểm sau vòng sửa

- `npx tsc --noEmit` sạch, `npm test` 40 trên 40 đạt.
- 45 lượt chụp (15 trang, 3 cỡ): 0 tràn ngang, 0 ảnh vỡ, 0 vùng bấm dưới ngưỡng, lỗi console chỉ là 404 của trang 404.
- `kiem-tuong-tac-trang-phu.mjs`: 24 trên 24 đạt.
- Đã tự xem ảnh 1366 của nhóm bể phốt, danh mục, chi tiết bể cá, giới thiệu; ảnh 600 của tám trang; 390 qua đo.

## Còn lại

- Ô bảng còn rớt từ lẻ: 5 ở 1366, 6 ở 390. Đoạn văn ở 600x360: 12 chỗ.
- Trang Dự án khi có 1, 2, 3 dự án thật chưa kiểm bằng dữ liệu thật (lúc kiểm có một "Dự án mẫu kiểm thử" do bên khác tạo tạm).
- Thẻ bể cá ở trang chủ vẫn là ảnh có em bé (mục 2).
- Không chạy `ui_audit.py --render`, chưa kiểm bản build.

---

# Vòng ba

Ảnh ở `vong-2/trang-phu/sau-vong-ba` (ba cỡ, `report.json`) và `du-an-that` (trang Dự án với dữ liệu thật).

## 1. Chữ rớt từ lẻ còn lại

Đo bằng `scripts/kiem-rot-chu-trang-phu.mjs` (từng từ thật, gồm ô bảng, bỏ chữ ẩn và hỏi đáp đang đóng).

| Cỡ | Đầu vòng ba | Cuối vòng ba |
|---|---|---|
| 1366 | 5 ô bảng | 0 |
| 390 (bảng đã là thẻ xếp dọc) | 6 ô bảng | 0 |
| 600x360 | 12 | 2 (bước 3 trong quy trình đặt hàng, câu lấy từ `site-facts.ts` nên chưa rút) |

Cách làm: không dùng ký tự dính từ, `text-wrap` hay `<br>`. Thử đổi bề rộng cột và giới hạn bề rộng ô thì sinh thêm chỗ rớt (17 chỗ ở 1366, 22 chỗ ở 390) nên đã gỡ ra. Cuối cùng là rút hoặc đảo chữ ở từng ô, không đổi nghĩa. Ô nào dài hơn một dòng thì đặt cụm số liệu cuối câu để dòng cuối luôn có từ ghép. Ví dụ: "Đun nấu, nấu cám, 4 – 6 người", "15 – 50 người, 10 – 25 phòng trọ", "Cá Koi, cá vàng, cá rồng, sen súng", "35 – 100 m³ trở lên hoặc ghép module", "2 × 60, 3 × 60, 2 × 80 lít". Đổi vài cụm trong mô tả tính năng (ví dụ "Thi công nhanh hơn bể xây gạch", "đào lên di dời được khi đổi chuồng").

## 2. Trang Dự án với dữ liệu thật

Script `scripts/du-an-mau-trang-phu.ts` tạo dự án mẫu tạm (kind `project`, có ảnh bìa gắn `post_media`) với 1, 2, 3, 5 mục, chụp ba cỡ, rồi xoá hết. Lần chạy đầu thấy ảnh vỡ vì thiếu liên kết ảnh với bài, sửa trong script.

Điều thấy và đã sửa:
- 1 mục: thẻ ngang lớn, ảnh dọc bị kéo cao 614px. Sửa: ảnh phủ khung cao tối thiểu 400px, không kéo theo tỉ lệ ảnh gốc.
- 5 mục: lưới ba cột bỏ trống một ô. Sửa: chia hàng cho đủ, dư 2 mục thì thẻ đầu rộng gấp đôi, dư 1 mục (4, 7) thì hai thẻ đầu rộng, nên không còn ô trống ở 1, 2, 3, 4, 5, 7, 8 mục. Dưới 1000px còn hai cột, thẻ lẻ cuối kéo tràn hàng.
- Tiêu đề "Dự án đã đăng" thừa (thẻ ảnh nhìn là hiểu), ẩn khỏi mắt.
- Kết quả đo ở 1, 2, 3, 5 mục x ba cỡ: 0 tràn ngang, 0 ảnh vỡ. Đã xem ảnh 1366 của 1, 2, 5 mục.
- Dọn: không còn dự án mẫu nào (truy vấn `title LIKE 'Dự án mẫu kiểm thử%'` trả 0). Đếm lại lúc cuối: 26 ảnh, 0 yêu cầu. Còn 1 bài nháp "Bài kiểm thử luồng luong-..." và 1 tài khoản `@example.test` không phải của tôi (tạo bởi lượt kiểm khác, đang chạy), tôi không xoá.

## 3. Đi bảy trang chi tiết và trang nhóm như khách sắp gọi

Xem màn đầu ba cỡ của biogas, thủy sản, bể phốt, bồn hóa chất, thùng rác và trang nhóm bể phốt (trang thùng chở tôm cá và theo yêu cầu dùng cùng khuôn, chưa xem riêng).
- Thấy: tên, ảnh và thông số đều có ở màn đầu 1366 và 600. Nút "Nhận báo giá" nằm dưới bảng thông số nên ở 1366 ra ngoài màn đầu ở bốn trang.
- Sửa: nút báo giá và số gọi lên ngay dưới mô tả, trên bảng thông số. Ở 1366 và 600 đều thấy nút trong màn đầu. Ở điện thoại ảnh chính đổi từ vuông sang 5:4 để tên và tagline lên cao hơn.
- Trang yếu nhất: hai trang chưa có ảnh xác nhận (bể phốt, bồn hóa chất): khung xanh to chỉ có tiêu đề và danh sách. Đã bỏ tagline lặp (ở trên khung và dưới tên), bỏ nhãn "Phù hợp cho". Chưa thể nâng thêm nếu chưa có ảnh thật.

## 4. Chữ thừa lượt hai

| Bỏ | Vì sao | Giữ | Vì sao |
|---|---|---|---|
| Số "7 nhóm sản phẩm" ở đầu trang Sản phẩm | Bộ lọc đã có "Tất cả 7", tiêu đề đủ nghĩa | "Nhờ kỹ sư chọn giúp", số trên mỗi nút lọc | Việc cần làm, thông tin |
| Nhãn nhóm trên thẻ ("Chăn nuôi", "Thủy sản") khi đã chọn bộ lọc | Lặp đúng nhãn bộ lọc | Nhãn khi xem "Tất cả" | Phân loại |
| Tagline dưới tên sản phẩm khi khung xanh đã in chính câu đó | Hai lần cùng một câu | Tagline ở sản phẩm có ảnh | Thông tin |
| Nhãn "Phù hợp cho" trên khung xanh | Danh sách tự nói là ứng dụng | Danh sách ứng dụng | Thông tin |
| Dòng dưới "Cần chọn đúng dung tích?" | Không bỏ | Giữ | Có thông tin mới (báo giá 15 – 60 phút) |
| Không bỏ nút gọi ở đầu trang Liên hệ | Không bỏ | Giữ | Là hành động chính ở 600x360, dù số lặp với khối hotline bên dưới ở máy bàn |
| "100+ công trình" ở trang Dự án | Không bỏ | Giữ | Là con số duy nhất của trang, lời dẫn đã bỏ ý trùng |

## Đã kiểm

- `npx tsc --noEmit` sạch, `npm test` 40 trên 40 đạt.
- 45 lượt chụp ba cỡ: 0 tràn ngang, 0 ảnh vỡ, 0 vùng bấm dưới ngưỡng, lỗi console chỉ có mã 404 của trang 404.
- `kiem-tuong-tac-trang-phu.mjs`: 24 trên 24 đạt.
- Đã xem ảnh: màn đầu 1366, 600, 390 của sáu trang sản phẩm và trang nhóm, trang Sản phẩm 1366 toàn trang, trang Dự án 1, 2, 5 mục.

## Còn lại

- 2 chỗ rớt từ lẻ ở 600x360 (bước 3 quy trình đặt hàng, lấy từ `site-facts.ts` chưa được sửa).
- Dự án 4 và 7 mục chưa chụp (chỉ suy từ quy tắc chia hàng), chỉ đã chụp 1, 2, 3, 5.
- Hai trang chưa có ảnh xác nhận vẫn là khung xanh, cần ảnh thật.
- Chưa kiểm bản build, tốc độ, điện thoại thật; không chạy `ui_audit.py --render`.

---

# Vòng sửa cuối (theo kiểm viên lượt ba)

Ảnh ở `vong-2/trang-phu/sau-vong-cuoi` (ba cỡ, `report.json`).

1. **Giới thiệu, dải sáu liên kết (P1-4, bỏ quá tay):** trả đầu đề "Lĩnh vực phục vụ" và dàn sáu mục thành ba cột hai hàng cho kín bề rộng; dải giảm từ trên 400px xuống khoảng 170px. Đã xem ảnh 1366.
2. **Dự án khi chưa có dự án (P1-3):** bỏ thẻ "Hồ sơ dự án đang được cập nhật" và nút. Thay bằng dải ảnh công trình và xưởng thật đã có (không chú thích), rồi danh sách năm lĩnh vực; giữ số "100+ công trình". Bỏ lời dẫn đầu trang và câu "Đây là nhóm lĩnh vực sản phẩm, chưa phải danh sách dự án đã bàn giao". Khi có dự án đăng thật thì dùng lưới thẻ đã chỉnh ở vòng ba. Các hàng lĩnh vực nay thẳng cột (cột chữ cố định 280px, cột liên kết 200px), sửa lệch lề P2-12. Đã xem ảnh 1366 của trạng thái rỗng thật (0 dự án lúc chụp).
3. **Hai trang chưa có ảnh xác nhận (bể phốt, bồn hóa chất, P1-1):** không gán ảnh. Bỏ khối xanh chữ ở chỗ ảnh chính. Bố cục mới: cột trái là tên, tagline, mô tả, chip ứng dụng, nút báo giá và chọn quy mô; cột phải là thẻ trắng có hình vẽ nét nhỏ và thông số cỡ lớn (28px cho dòng đầu). Ở 600x360 và điện thoại thẻ xếp dưới, tên và nút vẫn ở màn đầu. Phần "Cấu tạo" không có phụ kiện chuyển sang một cột để không còn cột trái trống (P2-2).
4. **Chữ thừa còn sót:**
   - Nhãn "Dung tích", "Đường kính" cạnh số có đơn vị bỏ ở mọi trang chi tiết (còn trong mã cho trình đọc màn hình). Hai dòng liền nhau gộp thành một: "1,5 – 13 m³, đường kính 1,50 – 3,00 m". Nhãn của giá trị chữ (Quy mô đàn, Bảo hành, Kiểu bể, Bề mặt, Lớp lót, Độ dày thành, Cấu tạo) giữ vì giá trị không tự nói nghĩa.
   - Dòng phụ đầu trang Liên hệ, dòng phụ đầu trang Dự án, dòng phụ đầu trang Giới thiệu (lặp "15+ năm" và hàng ứng dụng) đã bỏ.
   - Nhãn "Mũi nhọn" trên thẻ sản phẩm và trang chi tiết bỏ (cách gọi nội bộ của hồ sơ, khách ít hiểu; bento vẫn cho thấy thứ tự).
   - Nút "Nhận báo giá" lẻ dưới bảng trang nhóm bể phốt bỏ vì dải cuối trang đã có.
5. **Đường dẫn trang bể phốt ở 390:** đã tự kiểm. Hai dòng, dấu `/` nằm cuối dòng trên ("Trang chủ / Sản phẩm /" rồi "Bể phốt và xử lý nước thải / Bể phốt composite"), không còn dấu lẻ đầu dòng.

## Đã kiểm
- `npx tsc --noEmit` sạch, `npm test` 40 trên 40 đạt.
- 45 lượt chụp ba cỡ: 0 tràn ngang, 0 ảnh vỡ, 0 vùng bấm dưới ngưỡng, console chỉ có 404 của trang 404. Kiểm tương tác 24 trên 24 đạt.
- Chữ rớt từ lẻ (đo từng từ): 0 ở 1366, 0 ở 390, 2 ở 600x360 (bước 3 quy trình đặt hàng, câu từ `site-facts.ts`).
- Đã xem ảnh: Giới thiệu cuối trang (1366), Dự án rỗng (1366, 390), bể phốt, bồn hóa chất, biogas (1366, 390, 600), Liên hệ đầu trang.

## Chưa kiểm hoặc còn lại
- Trang Dự án ở trạng thái rỗng dùng ảnh trùng một phần với dải ảnh trang Giới thiệu (cùng nguồn ảnh xưởng).
- Hai trang chưa ảnh vẫn không có ảnh thật (cần doanh nghiệp chụp), chỉ thay bố cục.
- Chưa kiểm bản build, tốc độ, điện thoại thật.
