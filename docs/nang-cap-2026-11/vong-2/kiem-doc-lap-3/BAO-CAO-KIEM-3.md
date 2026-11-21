# Báo cáo kiểm độc lập lượt ba: website Thành Lợi Composite (bản production)

Người kiểm: phiên độc lập, không tham gia dựng. Ngày kiểm 21/11/2026. Bản kiểm: http://127.0.0.1:3003 (bản build chạy thật). Không sửa mã, không bật hay tắt máy chủ, không build. Đếm dữ liệu trước và sau: 0 bài, 0 yêu cầu, 26 ảnh, 1 tài khoản (khớp).

## Kết luận

**ĐẠT CÓ ĐIỀU KIỆN. Gần mức 40 triệu nhưng một chủ doanh nghiệp khó tính chưa nên trả đủ khi chưa sửa bốn điều dưới đây.** So với lượt hai, bản này tốt lên rõ: ảnh bể phốt nhóm có bảng và bộ chọn rõ, thư viện ảnh admin hết ô màu trơn, ô "Vật liệu chính phẩm" đã dùng ảnh bể xanh đọc được, ảnh bìa không còn hình em bé, banner đủ nút ở ba cỡ, chữ rớt lẻ ở câu chân trang hết, bản chạy thật rất nhanh (tải trang 33 đến 160 ms trên máy này, khung hình p95 10,1 ms, 0 tràn ngang, 0 ảnh vỡ, 0 lỗi console, 0 ký tự cấm, 0 từ kỹ thuật lộ ra, mọi điểm Tab đều có viền tiêu điểm). Công cụ soạn bài và xuất bản rất tốt (xuất bản xong có nút "Xem bài trên website" mở đúng bài). Không có P0. Điều làm chủ doanh nghiệp chê ngay: (1) bể phốt, xử lý nước thải, bồn hóa chất vẫn không có một ảnh thật, trang chi tiết dùng khối xanh có chữ; (2) trạng thái thật hiện nay là 0 bài, 0 dự án nên Tin tức hiện "Chưa có bài viết nào" kèm bộ lọc toàn số 0 và Dự án hiện "Hồ sơ dự án đang được cập nhật" ngay cạnh số lớn "100+ công trình"; (3) địa chỉ chân trang rớt "Thọ" một mình trên cả 19 trang công khai ở 1366; (4) bên dựng ẩn chữ quá tay ở trang Giới thiệu: dải xanh chanh to có sáu liên kết không đầu đề và nửa phải trống. Về thẩm mỹ: trang chủ, trang biogas, bài viết, soạn bài là điểm mạnh; các trang phụ vẫn cùng khuôn "dải xanh đầu trang, thẻ viền mảnh".

Số lỗi: P0 = 0, P1 = 4, P2 = 14.

## Đã kiểm gì

- Chụp 84 lượt (19 trang công khai gồm 404, 9 màn admin gồm đăng nhập) ở 1366x768, 390x844, 600x360, KHÔNG giảm chuyển động, ảnh màn đầu và toàn trang sau khi cuộn chậm; đo bằng script (`chup.ts` ra `ecran/report.json`, tóm tắt bằng `phan-tich.mjs`): tràn ngang, console, mạng, ảnh vỡ, chữ rớt một từ lẻ ở dòng cuối (đo từng từ), vùng bấm dưới 44px (390) và 36px (máy bàn), ký tự cấm (chấm giữa, gạch dài, chấm phẩy, chấm than, khoảng trắng dính), cụm in hoa, từ kỹ thuật, thiếu mô tả ảnh, thời gian tải, dung lượng ảnh, khung hình khi cuộn. Tự xem ảnh ghép của trang chủ ba cỡ, giới thiệu, sản phẩm, biogas, nhóm bể phốt, thủy sản, bể phốt, bồn hóa chất, liên hệ, dự án, tin tức, bài viết (390), nhiều màn admin.
- Trạng thái THẬT hiện nay (không có bài mẫu): chụp lại trang chủ, Dự án, Tin tức ở ba cỡ (`trong/`). Các ảnh `ecran/` có hai bài mẫu do người kiểm chèn tạm nên không phản ánh trạng thái thật.
- Tự dùng (`tuong-tac.ts`, log `tuong-tac.log`, số đo `tt/du-lieu-tuong-tac.json`): menu Sản phẩm và menu điện thoại (tiêu điểm vào trong, Esc đóng, về nút mở), banner ba cảnh ba cỡ (tự chuyển 1, 2, 3 đúng, bấm tay), cuộn nhanh bằng bánh xe, cuộn chậm đo khung hình, dải ảnh, hộp xem ảnh, rê chuột thẻ sản phẩm (ảnh phóng 1,05, có phản hồi), chọn quy mô (15 đến 30 con lợn ra "Bể 6 m³" đúng bảng), biểu mẫu báo giá đi đủ bước có chặn gửi bằng `page.route` (bỏ trống, sai số điện thoại, ra màn thành công), accordion (chiều cao tăng mượt 0, 81, 112, 142, 158, 166, 170, 171), tìm tin, bài dài có ảnh ngang, ảnh dọc, bảng, danh sách, trích dẫn, Tab. Admin (tài khoản tạm): soạn bài ba cỡ (tiêu đề, menu gạch chéo, ngăn thiết lập ở 390, hẹn giờ ba ô chọn tiếng Việt, xem trước, lưu nháp), danh sách bài, thư viện, sản phẩm, yêu cầu có dữ liệu thử, thông tin website, tổng quan. Thêm `bo-sung.ts`: xuất bản thật một bài tạm rồi mở bài ngay (chạy tốt, ghi "Đã xuất bản. Bài đang hiện trên website."), đo ảnh tải trước khi cuộn, rê chuột thẻ.
- Đối chiếu dữ kiện với `final-docx.txt`: số điện thoại, email, địa chỉ, mã số thuế, giờ làm, số liệu 15+, 100+, 25+, 10, 30+, bảng biogas, bảng bể phốt, bảng thủy sản, thùng 60 đến 240 L, xe gom 400 đến 1000 L, thùng chở hải sản 3 lớp PU Foam 500 kg đến 15 tấn, báo giá 15 đến 60 phút, giao 2 đến 3 ngày và 10 đến 25 ngày, hỏi đáp, quy trình năm bước, "kỹ thuật sẽ kết bạn Zalo trong 15 đến 30 phút", tầm nhìn, sứ mệnh, giá trị cốt lõi. Đều có trong hồ sơ. Không thấy số liệu, khách hàng, chứng nhận, lời khen bịa. Cam kết tuyệt đối đã viết giảm ("kín khí", "chống thấm"; "Chống thấm" thay "tuyệt đối").

## Chưa kiểm gì

- Điện thoại thật, trình duyệt khác Chrome, trình đọc màn hình, tắt JavaScript, mạng chậm giả lập.
- Tải ảnh lên, chỉnh ảnh, đặt lịch đăng thật, khôi phục bản cũ, xoá bài bằng tay, đổi "Thông tin website" rồi xem trang công khai đổi theo.
- Hiệu ứng số đếm và đường quy trình chạy theo cuộn (đề vòng hai nêu): ảnh tĩnh không đo được, chỉ xác nhận thẻ phản hồi khi rê chuột và hiện dần.
- `ui_audit.py`, `contrast.py`, `wrap_check.py`: không chạy, thay bằng đo trực tiếp bằng trình duyệt. Tương phản chữ trên nền ảnh chỉ đánh giá bằng mắt.
- Trang bể phốt chi tiết ở 390 (đường dẫn hai dòng, P2-7 cũ) đã chụp (`ecran/lat/san-pham-phot-390-g*.jpg`) nhưng chưa xem lại.
- LCP: script đo của người kiểm không lấy được (API trình duyệt báo "Deprecated API", đó là cảnh báo của script người kiểm chứ không phải của website). Thời gian tải là sự kiện load trên localhost nên chỉ mang ý nghĩa tương đối.
- Dung lượng ảnh màn đầu: có số đo, xem mục P2-10.

## P0

Không có.

## P1 (chủ doanh nghiệp thấy ngay và chê)

**P1-1. Ba nhóm sản phẩm không có ảnh thật: bể phốt và bể xử lý nước thải, bồn chứa hóa chất.**
Màn: trang chủ (hai thẻ lưới sản phẩm), Sản phẩm, trang nhóm bể phốt, trang bể phốt chi tiết, trang bồn hóa chất, mọi cỡ. Ô nền xanh nét vẽ với chữ "Từ 1 m³", "Kháng ăn mòn", "Ba lớp"; trang chi tiết bể phốt và bồn hóa chất có khối xanh ghi "Thay bể xây gạch cho: Nhà ở, Nhà trọ..." ở chỗ đáng ra là ảnh chính. Trung thực, không gán nhầm ảnh, nhưng bể phốt là mũi nhọn số 2 mà trang không có một tấm ảnh. Lưu ý: chữ gọi tên trên thẻ không thống nhất ("Kháng ăn mòn" ở trang chủ, "Ba lớp" ở trang Sản phẩm cho cùng một sản phẩm). Bằng chứng: `ecran/lat/home-1366-2.jpg`, `ecran/lat/san-pham-1366-1.jpg`, `ecran/lat/san-pham-phot-1366-1.jpg`, `ecran/lat/san-pham-hoa-chat-1366-1.jpg`. Gợi ý: xin doanh nghiệp ảnh bể phốt, bồn hóa chất thật (thiếu tư liệu, không sửa bằng mã được); trước đó nên báo rõ cho chủ doanh nghiệp. Tệp: `src/components/pages/product-tile.tsx`, `src/app/(public)/san-pham/[slug]/page.tsx`.

**P1-2. Chân trang rớt "Thọ" một mình ở dòng cuối, có mặt ở cả 19 trang công khai tại 1366.**
Câu "Nhà máy: Khu Tiên Sơn, xã Tiên Lương, tỉnh Phú / Thọ". Ngoài ra còn rớt lẻ ở trang chủ 1366: ô bento "Hộ gia đình" (đình), "Dự án công nghiệp" (nghiệp, cả 600), ô bảng so sánh ("chất", "bằng", "thước"); tin tức và dự án có tiêu đề rớt "composite" (tiêu đề do dữ liệu mẫu nên chỉ để tham khảo); 390 trang chủ "dụng." ở đoạn giới thiệu. Bằng chứng: `ecran/report.json` (trường `orphans`), `ecran/lat/gioi-thieu-1366-3.jpg` (chân trang), `ecran/lat/home-1366-2.jpg` (bento). Gợi ý: bỏ tiền tố "Nhà máy:" hoặc cho cột liên hệ rộng hơn một chút; đổi chữ ở ô "Dự án công nghiệp" thành "Công nghiệp". Tệp: `src/components/site-footer.tsx`, `src/components/home/sections.tsx` (`ReasonsBento`), css footer.

**P1-3. Trạng thái thật hiện nay (0 bài, 0 dự án) làm hai trang trông như chưa xong.**
Tin tức: tiêu đề "Tin tức và kiến thức", bộ lọc "Tất cả 0, Kiến thức sản phẩm 0, Công trình thực tế 0", ba nhãn gợi ý, rồi hộp "Chưa có bài viết nào" kèm hai nút. Dự án: số lớn "100+ công trình", thẻ "Hồ sơ dự án đang được cập nhật" kèm ảnh, rồi dòng "Đây là nhóm lĩnh vực sản phẩm, chưa phải danh sách dự án đã bàn giao". Trung thực nhưng khách vào hai mục menu liền thấy trống, nhất là khi chủ doanh nghiệp xem lúc bàn giao. Trang chủ thì khối tin tự biến mất nên sạch. Bằng chứng: `trong/lat/tin-tuc-1366-1.jpg`, `trong/lat/du-an-1366-1.jpg`. Gợi ý: đăng ít nhất 3 bài thật từ hồ sơ (lắp bể vùng đất trũng, sửa bể nứt, chọn dung tích) trước khi bàn giao; hoặc ẩn mục Tin tức khỏi menu cho tới khi có bài; ẩn bộ lọc khi toàn số 0. Tệp: `src/app/(public)/tin-tuc/page.tsx`, `src/app/(public)/du-an/page.tsx`, nội dung trong admin.

**P1-4. Bỏ quá tay ở trang Giới thiệu: dải xanh chanh to chỉ có sáu liên kết, không đầu đề.**
Sáu liên kết "Chăn nuôi, Thủy sản, Xử lý nước thải, Hóa chất, Vệ sinh đô thị, Theo yêu cầu" nằm trong một dải xanh chanh cao hơn 400px ở 1366, chiếm một phần ba bề rộng, hai phần ba còn lại trống. Người lạ không biết đó là lĩnh vực phục vụ hay menu. Ngay trên đó là khối "Chất lượng qua bốn bước" nền xanh đậm rồi dải này, rồi chân trang "Cần báo giá nhanh", nên cuối trang chồng ba dải màu liền nhau. Bằng chứng: `ecran/lat/gioi-thieu-1366-3.jpg`, `ecran/lat/gioi-thieu-390-g2.jpg`. Gợi ý: trả đầu đề ngắn "Lĩnh vực phục vụ" và cho các liên kết thành thẻ có ảnh hoặc biểu tượng; hoặc bỏ dải. Tệp: `src/app/(public)/gioi-thieu/page.tsx`.

## P2 (nên sửa)

1. Bento trang chủ: ô "Kỹ thuật trọn gói" có khoảng trống lớn giữa tiêu đề và sáu nhãn (đoạn mô tả đã ẩn), ô "Đủ mọi quy mô" ép "Dự án công nghiệp" thành ba dòng trong cột hẹp. `ecran/lat/home-1366-2.jpg`.
2. Trang chi tiết sản phẩm: khối nền xanh đậm "Cấu tạo và ưu điểm" có cột trái trống trơn dưới tiêu đề ở bể phốt, bể thủy sản, bồn hóa chất (chỉ biogas có danh sách phụ kiện); khối hỏi đáp ở biogas cũng để trống nửa trái. `ecran/lat/san-pham-hoa-chat-1366-1.jpg`, `ecran/lat/san-pham-biogas-1366-2.jpg`.
3. Chuyển cảnh banner: khoảng 250 ms ở giữa chuyển cảnh, ảnh nền cảnh cũ mất, màn tối trơn và chữ mờ nửa dòng, nhìn như nhấp nháy. `tt/1366-hero-chuyen-giua.png`.
4. Cuộn nhanh trang chủ (bánh xe chuột): ở 1366 có lúc 7 trên 7 khối trong khung nhìn còn ẩn (vị trí 4571), 5 trên 5 (1959); ở 390 tối đa 3. Dừng 150 ms là hiện đủ, nhưng lúc cuộn thật người xem thấy ô trống thoáng qua. Khung hình lần cuộn đầu tiên ở trang chủ 1366 có một khung 150 ms (bản build thật vẫn còn), 2 khung trên 50 ms. `tt/du-lieu-tuong-tac.json`, `tt/1366-cuon-nhanh-*.png`.
5. Console bản production vẫn có cảnh báo "preload CSS không dùng tới" (ba tệp ở trang chủ, mỗi lần tải; có ở 390). Không phải lỗi nhưng chủ doanh nghiệp mở công cụ nhà phát triển sẽ thấy. `tt/du-lieu-tuong-tac.json` (`consoleErrors`).
6. 600x360: thanh trên cùng (số điện thoại, email) ẩn khỏi mắt nhưng vẫn nhận Tab, ba điểm dừng nằm ngoài khung nhìn. Log "Tab qua đầu trang" cỡ 600.
7. Bài viết: bảng sáu cột rộng 920 trong khung 718 (1366) và 808 trong 352 (390) phải cuộn ngang; chữ cột cuối bị cắt dở. `tt/1366-bai-full.png`.
8. Chú thích ảnh trong bài tự lấy từ mô tả ảnh nên dễ thành "Bể composite tại xưởng" (đúng loại chữ chủ dự án bảo bỏ). Nên để chú thích mặc định trống, chỉ hiện khi biên tập nhập riêng. `ecran/lat/bai-viet-390-g1.jpg`.
9. Thanh trên cùng ở 1366: liên kết số điện thoại cao 20px, email 26px, dưới 36px (đo 19 trang). Ô "Chú thích ảnh" trong trình soạn bài cao 32px.
10. Dung lượng ảnh tải trước khi cuộn trang chủ: 1366 là 1,7 MB, 15 ảnh (hero cảnh 1 và 2: 350 KB và 292 KB tải sớm); 390 là 984 KB; 600 là 1012 KB. Tổng dung lượng trang chủ sau cuộn hết: 3,0 MB (1366). Chấp nhận được, nhưng có thể hoãn tải ảnh cảnh 2 và 3. `bs/` (log chạy), `ecran/report.json`.
11. Nhãn nội bộ "Mũi nhọn" trên thẻ sản phẩm là cách nói của doanh nghiệp, khách ít hiểu; có thể đổi "Bán chạy" hoặc bỏ nếu không có số liệu (không có trong hồ sơ nên chọn bỏ). `ecran/lat/home-1366-2.jpg`.
12. Trang nhóm bể phốt: nút "Nhận báo giá" lẻ loi căn phải dưới bảng; trang Dự án: mô tả của năm hàng lĩnh vực lệch lề trái từng hàng (x 288 đến 296). `ecran/lat/san-pham-nhom-phot-1366-1.jpg`, `ecran/lat/du-an-1366-1.jpg`.
13. Trang biogas ở ảnh toàn trang: biểu mẫu báo giá đã đánh dấu xong bước 1 và 2 và đang ở bước 3 dù khách chưa nhập gì (nghi do trang tự điền sẵn sản phẩm, chưa đào sâu cách nhập liên hệ ở bước cuối). Cần xác nhận không gây hiểu nhầm. `ecran/lat/san-pham-biogas-1366-2.jpg`.
14. Nhãn cùng một ý nhưng khác chữ: "Nhắn Zalo" (trang Liên hệ), "Chat Zalo" (nút nổi), "Gọi ngay" (nút nổi, thanh dưới 390), "Gọi 0964..." (banner). Ghi nhận: chữ "THÀNH LỢI" và "COMPOSITE" in hoa ở logo là nhãn logo, chấp nhận.

## Danh sách chữ thừa còn sót (chỉ gọi tên thứ đã thấy, xoá không mất thông tin)

Trang chi tiết sản phẩm (tất cả):
- Ô thông số "Dung tích 1,5 – 13 m³", "Đường kính 1,50 – 3,00 m", "Kiểu bể", "Độ dày thành", "Bề mặt", "Lớp lót": nhãn đứng cạnh con số đã có đơn vị. Chính là ví dụ "nhãn Dung tích dưới con số có đơn vị" mà chủ dự án bảo bỏ. Giữ nhãn chỉ khi giá trị là chữ khó hiểu (bề mặt "Gelcoat láng bóng" tự nói). `ecran/lat/san-pham-biogas-1366-1.jpg`.
- Dòng "Bể composite FRP đúc liền khối để xử lý chất thải chăn nuôi..." lặp ý với hàng chip "Chăn nuôi, Mũi nhọn" và dòng phụ "Thay hầm xây gạch..." ở đầu trang biogas.
Trang chủ:
- Chân trang "Cần báo giá nhanh. Gửi nhu cầu, kỹ sư Thành Lợi phản hồi trong 15 đến 60 phút" lặp nguyên ý ngay phía dưới khối "Nhận báo giá nhanh" có ba dòng cam kết (cùng nội dung 15 đến 60 phút). Hai thanh kêu gọi liên tiếp.
- Mô tả bên dưới hàng chữ "Về Thành Lợi Composite": đoạn dài lặp số liệu đã nằm trong dải số bên trên (thành lập 2010, nhà máy Phú Thọ).
- Thẻ ngành trên Giới thiệu: dòng hero "Sản xuất composite FRP tại Phú Thọ từ năm 2010" lặp "15+ năm" của dải số ngay dưới.
Liên hệ và Dự án:
- Liên hệ: dòng phụ trong dải đầu "Cho biết quy mô chăn nuôi, số người dùng hoặc kích thước bể cá" lặp đúng điều biểu mẫu bên dưới hỏi từng bước.
- Dự án: dòng phụ dưới "Dự án và công trình" ("Bể biogas, bể phốt, bể thủy sản... trên toàn quốc") lặp năm hàng lĩnh vực bên dưới.
Tin tức rỗng: "Bạn có thể xem sản phẩm hoặc gửi nhu cầu để được tư vấn."
Bài viết: "1 phút đọc" và "Mục lục 4 mục" cho bài rất ngắn.
Đã làm đúng: dải ảnh trang chủ không có đầu đề hay chú thích; bản đồ không có đầu đề; biểu mẫu không có câu dẫn thừa; hộp xem ảnh chỉ có "1 trên 6".

## Danh sách chỗ bỏ quá tay (bên dựng ẩn chữ, người lạ khó hiểu)

Nên trả chữ:
1. Giới thiệu: dải xanh chanh sáu liên kết không đầu đề (P1-4). Trả "Lĩnh vực phục vụ" hoặc bỏ dải.
2. Trang chủ, khối hỏi đáp: đầu đề đang là "Chưa thấy câu bạn cần? Gọi hotline để hỏi kỹ sư." nên khách chưa thấy câu hỏi nào đã bị hỏi "chưa thấy câu bạn cần". Trả "Câu hỏi thường gặp" làm đầu đề hiện, dòng hotline làm dòng phụ. `ecran/lat/home-1366-3.jpg`.
3. Trang chủ, bento "Đủ mọi quy mô" và "Kỹ thuật trọn gói": đã ẩn câu mô tả nên ô to mà rỗng (P2-1); trả một câu ngắn có thông tin ("Từ hộ gia đình đến dự án công nghiệp lớn" và "Lắp đặt tận nơi, bảo hành toàn quốc") hoặc thu nhỏ ô.
Có thể giữ ẩn (đã ổn): "Sản phẩm chủ lực" (lưới thẻ có tên và ảnh, tự nói), "Hình ảnh thật" (dải ảnh), "Tin tức" (thẻ có ngày và nhãn), "Quy trình năm bước" (có số và câu lớn "Chưa cần bản vẽ, chỉ cần nói nhu cầu"), bảng so sánh (tiêu đề cột đủ hiểu), cột liên kết chân trang (hai cột liên kết sản phẩm và hỗ trợ đọc vẫn hiểu).
Hẫng nhẹ, không cần trả chữ: trên trang chủ từ bảng so sánh sang lưới sản phẩm chỉ cách nhau một dải nền, người xem mất mốc "tới phần sản phẩm"; nên giảm khoảng cách hoặc đổi nền.

## Bảng lỗi lượt hai đã hết hay còn

| Mã | Nội dung | Kết quả |
|---|---|---|
| P1-1 | Ảnh em bé mép bể làm ảnh đầu mũi nhọn 3 | Hết. Ảnh chính nhóm thủy sản là công nhân lắp bể. |
| P1-2 | Ba nhóm chưa có ảnh thật | Còn (P1-1 mới). |
| P1-3 | Chữ rớt từ lẻ | Đỡ nhiều, còn. Câu châm ngôn hết; địa chỉ chân trang mới rớt "Thọ" ở 19 trang (P1-2 mới); trang chủ còn vài ô. |
| P1-4 | Ba ô màu trơn trong thư viện ảnh | Hết. Thư viện 26 ảnh, không còn ô trơn. |
| P1-5 | Ô "Vật liệu chính phẩm" dùng ảnh thùng vàng | Hết. Nay là ảnh bể xanh có lưới, chữ trắng đọc rõ. |
| P2-1 | Nhãn đánh số 1 đến 6 cạnh quy trình năm bước | Hết. Sáu nhãn không số. |
| P2-2 | Banner 390 nút đổi cảnh nằm sau thanh liên hệ | Hết. Cụm nút nằm trên thanh dưới ở màn đầu. |
| P2-3 | 600x360 cụm nút bị cắt, thanh trên ẩn vẫn nhận Tab | Nửa hết: cụm nút nay đủ; Tab vẫn dừng ba điểm ngoài khung (P2-6 mới). |
| P2-4 | Chuyển cảnh banner nhấp nháy | Còn (P2-3 mới). |
| P2-5 | Dải ảnh ô đầu trống | Hết trong ảnh toàn trang lẫn khi cuộn; ảnh đủ. |
| P2-6 | Bảng bài viết rộng hơn khung | Còn (P2-7 mới), có cuộn ngang. |
| P2-7 | Đường dẫn trang bể phốt 390 hai dòng | Chưa xem lại (xem mục chưa kiểm). |
| P2-8 | Liên kết email thanh trên cao 26px | Còn (P2-9 mới). |
| P2-9 | "THÀNH LỢI COMPOSITE" in hoa | Còn, là logo, chấp nhận. |
| P2-10 | Tiêu đề biểu mẫu Liên hệ sát nhãn | Hết. Bước có khoảng thoáng. |
| P2-11 | Chuyển động có nghĩa (số đếm, đường quy trình) | Chưa xác nhận được. Rê chuột thẻ có phản hồi (ảnh phóng 1,05). |
| P2-12 | Hộp bản đồ chân trang trống | Còn nhẹ: hộp xanh chờ có ghim, bản đồ thật hiện khi tới nơi. |
| P2-13 | Nhiều nhãn cho một ý định | Còn (P2-14 mới). |

## Điểm đang tốt (giữ lại)

- Banner: ba cảnh ở ba cỡ không đè nhau, cảnh 1 ảnh bể toàn khung nét, cảnh 2 ảnh bể trong thẻ viền, cảnh 3 xe bán tải; tự chuyển 1 đến 3 đúng; màn đầu 600x360 thấy tiêu đề, hai nút, cụm đổi cảnh. `ecran/home-600-fold.png`, `tt/1366-hero-canh-2.png`.
- Dải số 15+, 100+, 25+, 10, 30+ gối lên banner rất đẹp, số lớn dễ đọc.
- Trang biogas: bảng 5 mã, bốn ô thông số, chọn quy mô ra ngay gợi ý, hộp báo giá cuối trang. Trang bể phốt nhóm có bộ chọn theo số người và bảng năm phân khúc rõ.
- Bài viết: ảnh ngang dọc đúng khung, trích dẫn dạng thẻ, mục lục, chia sẻ ba nút một hàng ở 390.
- Admin: bố cục sạch, soạn bài ở ba cỡ, menu gạch chéo có mô tả từng khối, ngăn thiết lập có hẹn giờ "Sáng mai 8 giờ" và "Chiều mai 14 giờ", thông báo "Đã xuất bản. Bài đang hiện trên website." rồi có nút "Xem bài trên website". Tổng quan có checklist trước khi đưa lên mạng.
- Hộp xem ảnh chuẩn: tiêu điểm vào nút đóng, Esc đóng, về đúng ảnh; menu điện thoại giữ tiêu điểm đúng.
- Kỹ thuật: 0 tràn ngang, 0 ảnh vỡ, 0 lỗi console, 0 từ kỹ thuật, 0 ký tự cấm, vùng bấm ở 390 không có chỗ nào dưới 44px, khung hình p95 10,1 ms ở mọi trang, tải trang nhanh, mọi ảnh đều có mô tả.
- Dữ kiện đúng nguồn, không bịa.

## Tệp chứng cứ và script (trong thư mục này)

- Ảnh: `ecran/*.png` và `ecran/lat/*.jpg` (toàn trang, `-fold` là màn đầu, `report.json` là số đo), `trong/*` (trạng thái thật 0 bài), `tt/*.png` (tự dùng, `du-lieu-tuong-tac.json`), `bs/*` (xuất bản thử, hover).
- Script: `chup.ts` (chụp và đo), `phan-tich.mjs` (tóm tắt), `tuong-tac.ts` (tự dùng), `bo-sung.ts` (xuất bản thử, ảnh tải trước, hover), `trong.mjs` (trạng thái thật), `ghep.mjs` (cắt lát), `dem.ts` (đếm dữ liệu). Log: `chup.log`, `tuong-tac.log`.
- Ghi chú đo: báo "đè" của `tuong-tac.ts` và `bo-sung.ts` ở banner là báo nhầm do ba cảnh xếp chồng (đã xem ảnh từng cảnh, không thấy đè); báo "Tab thoát khỏi hộp xem ảnh" cũng nhầm như lượt hai. Cảnh báo "Deprecated API" của `report.json` là của script đo.
