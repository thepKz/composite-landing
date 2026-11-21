# Báo cáo kiểm độc lập: website Thành Lợi Composite sau nâng cấp

Người kiểm: phiên độc lập, không tham gia dựng. Ngày kiểm 20/11/2026. Bản kiểm: http://127.0.0.1:3002 (bản dev). Không sửa mã nguồn.

## Kết luận

**ĐẠT CÓ ĐIỀU KIỆN, chưa tới mức website 40 triệu.** Nền đã vững: dữ kiện đúng nguồn, luồng báo giá và soạn bài chạy được, chuyển động mượt (95% khung hình dưới 10,2 ms, không khung nào quá 50 ms), không lỗi console, không tràn ngang, không ảnh vỡ ở trang công khai, ký tự cấm sạch. Không thấy lỗi P0. Nhưng một chủ doanh nghiệp khó tính sẽ nhìn ra ngay 8 lỗi P1: nút "Gọi hotline" ở màn thành công chữ tối trên nền xanh, banner cảnh 2 và 3 dùng ảnh phóng quá cỡ bị mờ (cảnh 3 còn có hình trẻ em mặc đồ kem ốc trong bể), khung nhỏ 600x360 màn đầu gần như chỉ còn một nửa chiều cao dùng được, tiêu đề và nhãn rớt một từ lẻ ở 12 chỗ (1366) và 17 chỗ (390), 3 trong 7 nhóm sản phẩm chưa có ảnh, ảnh bìa dọc bị đệm mờ hai bên trông rẻ, và admin tự mâu thuẫn về thông tin liên hệ. Sửa 8 điểm này thì mới nên giao.

Số lỗi: P0 = 0, P1 = 8, P2 = 16.

## Đã kiểm gì

- Xem tận mắt ảnh sau nâng cấp của 22 màn ở cả 1366 và 390 (home, giới thiệu, sản phẩm, biogas, nhóm bể phốt, dự án, tin tức, bài viết, liên hệ, hướng dẫn đặt hàng, bảo hành, hỏi đáp, 404, 8 màn admin), thêm ảnh tự chụp ở 1366, 390, 600x360, 1920x1080 (119 tệp trong thư mục này).
- Tự dùng bằng Playwright, không bật giảm chuyển động: mở và đóng menu Sản phẩm (chuột, Esc, nhấn ra ngoài), ngăn menu điện thoại (tiêu điểm vào trong, Tab không thoát, đóng thì về nút Mở menu), đổi cảnh banner bằng tay và tự chuyển (cứ khoảng 7 giây một cảnh), cuộn hết trang chủ đo khung hình, bấm thẻ sản phẩm sang trang chi tiết, hộp xem ảnh (Tab giữ trong hộp, Esc đóng, tiêu điểm về nút mở), chọn quy mô (kết quả 6 m³ đúng bảng), đi hết biểu mẫu báo giá (chặn yêu cầu gửi bằng page.route, có kiểm lỗi bỏ trống và sai số điện thoại, ra màn thành công), accordion hỏi đáp (chiều cao chuyển mượt 0, 81, 119, 146, 158, 167, 170, 171), Tab qua header và biểu mẫu (viền tiêu điểm vàng thấy rõ, chỉ 1 điểm dừng ở 390 không đo ra viền, xem lỗi P2-14), mục lục bài viết 1366 (cuộn tới đúng mục), soạn bài trong admin (menu gạch chéo, tự lưu, xem trước, xuất bản nháp), 7 màn admin không tràn ngang ở 4 cỡ.
- Quét chữ hiện ra trên 20 đường dẫn công khai ở 4 cỡ (80 lượt): ký tự cấm (dấu chấm giữa, gạch ngang dài, chấm phẩy, chấm than), cụm in hoa, từ kỹ thuật (slug, database, SEO, Error, null), tràn ngang, console, mạng, ảnh vỡ, tiêu đề H1, dòng cuối lẻ một từ, cỡ chữ, vùng bấm, tương phản.
- Đối chiếu `final-docx.txt`: số điện thoại 0964.444.2626 và 0943.924.816, email info@thanhloicomposite.com, địa chỉ Khu Tiên Sơn, xã Tiên Lương, tỉnh Phú Thọ, mã số thuế 2600665401, giờ 7h30 – 17h30 thứ Hai đến thứ Bảy, bản đồ nhúng, bảng biogas 5 mã (TLC-BIO-1.5 đến 3.00, khớp từng ô), bảng bể phốt 5 phân khúc, bảng bể cá 4 nhóm, 5 câu hỏi đáp, quy trình 5 bước, 4 lý do, số liệu 15+ năm, 100+ dự án, 25+ tỉnh thành, 10 năm, 30+ năm. Tất cả đúng. Không thấy số liệu, khách hàng, chứng nhận, dự án nào bịa thêm. Cam kết tuyệt đối trong hồ sơ ("100%", "tuyệt đối", "vĩnh viễn") đã được viết giảm.
- Dọn dữ liệu: đếm lại bằng truy vấn sau khi kiểm xong: 0 bài, 0 yêu cầu, 26 ảnh, 0 tài khoản @example.test, còn 1 tài khoản thật như ban đầu.

## Chưa kiểm gì

- Chưa kiểm bản build thật (chỉ bản dev), nên số khung hình và tốc độ tải chưa phải số của bản chạy chính thức.
- Chưa tải ảnh lên, chỉnh ảnh, đặt lịch đăng, khôi phục bản cũ, xoá bài trong admin bằng tay (đã có ảnh luồng do bên dựng chụp ở `sau-admin/luong/`, tôi chỉ xem một phần và không tự chạy lại).
- Chưa đổi thông tin ở "Thông tin website" để xem trang công khai có đổi theo không (sẽ ghi vào dữ liệu thật).
- Chưa thử gửi biểu mẫu thật (cố ý chặn), nên chưa biết admin hiện yêu cầu thế nào.
- Chưa kiểm bằng điện thoại thật, trình duyệt khác Chrome, trình đọc màn hình, không có JavaScript.
- Mục lục bài viết ở 390 chỉ nhìn qua ảnh có sẵn (bài thử 3 mục thì hộp mục lục điện thoại không hiện, có vẻ quy tắc từ 4 mục, chưa xác nhận trong mã).
- Tương phản đo bằng màu tính toán, nên các khối nền gradient hoặc ảnh chỉ đánh giá bằng mắt.
- Tệp ảnh cắt lát `sau/lat` và `sau/ghep` do tôi tạo thêm để xem, có thể xoá.

## P0

Không có. Không thấy chức năng hỏng, không thấy sai dữ kiện nào.

## P1 (xấu thấy ngay, khách sẽ chê)

**P1-1. Nút "Gọi hotline" ở màn thành công chữ tối trên nền xanh, gần như không đọc được.**
Màn: biểu mẫu báo giá, trạng thái "Đã nhận yêu cầu", cả 1366 và 390. Chữ và biểu tượng điện thoại màu xanh đen đặt trên nút nền xanh lục (nút có chữ trắng được khai báo trong CSS nhưng thẻ liên kết đè màu). Bằng chứng: `kiem-doc-lap/1366-form-thanh-cong.png`, `kiem-doc-lap/390-form-thanh-cong.png`. Gợi ý: ép màu chữ trắng cho `a.tl-form-button.is-solid` trong khối thành công.

**P1-2. Khung nhỏ 600x360 (khung chủ dự án hay xem): màn đầu gần như không dùng được.**
Thanh số điện thoại 40px, header 68px và thanh liên hệ cố định dưới đáy 58px chiếm 166px trong 360px. Tiêu đề banner bị thanh dưới cắt ngang, không thấy một nút kêu gọi nào. Admin soạn bài ở khung này chỉ còn khoảng 120px vùng viết giữa thanh công cụ và thanh nút dưới. Bằng chứng: `kiem-doc-lap/600-home-fold.png`, `kiem-doc-lap/600-admin-soan.png`, `kiem-doc-lap/600-menu-mo.png` (menu phải cuộn mới thấy Tin tức). Gợi ý: khung thấp hơn 480px thì bỏ thanh trên cùng, thu thanh dưới thành một dòng hoặc ẩn khi chưa cuộn, và để thanh nút admin cuộn theo.

**P1-3. Banner cảnh 2 và cảnh 3: ảnh phóng quá cỡ, mờ, và cảnh 3 sai tông.**
Cảnh 2 phóng một góc bể trắng đến mức chỉ thấy mảng xám mờ, không còn nhận ra là bể. Cảnh 3 phóng ảnh nhỏ có hình trẻ em mặc đồ kem ốc đứng trong bể, vỡ hạt rõ, trong khi tiêu đề nói "bể nuôi thủy sản, hồ cá Koi và thùng chở hải sản sống" (ảnh không có thùng chở). Cảnh 1 ổn. Bằng chứng: `kiem-doc-lap/1366-hero-canh-2.png`, `kiem-doc-lap/1366-hero-canh-3.png`, `kiem-doc-lap/1920-home-fold.png` (cảnh 1 ở 1920 vẫn nét). Gợi ý: dùng ảnh gốc lớn hơn cho cảnh 2 và 3 (thư viện có ảnh bể chữ nhật, thùng trên xe bán tải), không phóng quá 1,3 lần.

**P1-4. Tiêu đề và nhãn rớt một từ lẻ.**
Đo bằng vùng chữ thật: 12 chỗ ở 1366, 17 chỗ ở 390, 10 chỗ ở 1920 (600x360 không có). Ví dụ 1366: "Hình học, độ cứng, độ / kín", "Nghiệm thu tại công / trình" (giới thiệu), "Thông tin cần cung / cấp" (hướng dẫn đặt hàng), "Thùng chở thủy hải sản / sống" (danh mục), và 7 chip chọn quy mô như "Công cộng và đô / thị", "Kinh doanh dịch / vụ" (trang bể phốt, bể xử lý, xe gom rác). Ví dụ 390: "Bể cá Koi và bể nuôi thủy / sản", "Sản phẩm composite theo yêu / cầu", "Không tìm thấy trang / này". Bằng chứng: `sau/lat/gioi-thieu-1366-2.jpg`, `sau/lat/huong-dan-dat-hang-1366-1.jpg`, `sau/lat/san-pham-1366-1.jpg`, danh sách đầy đủ ở `kiem-doc-lap/phan-tich-noidung.txt` (dòng MOCOI). Gợi ý: rút chữ hoặc nới bề rộng khung cho 6 tiêu đề, chip quy mô cho rộng hơn một dòng.

**P1-5. 3 trong 7 nhóm sản phẩm chưa có ảnh, thẻ bị thay bằng khối chữ số liệu nền xanh.**
Bể phốt, bể xử lý nước thải, bồn chứa hóa chất. Ở trang chủ thẻ bể phốt là biểu tượng giọt nước và chữ "Từ 1 m³", thẻ bồn hóa chất là biểu tượng bình thí nghiệm, trong khi hai hàng thẻ còn lại là ảnh thật; ở danh mục thì ba thẻ là khối nền xanh đặc, lệch hẳn với bốn thẻ ảnh. Admin ghi "Chưa có ảnh". Thư viện có 26 ảnh nhưng chưa gắn cho ba nhóm này (hồ sơ nội dung chưa có ảnh bể phốt và bồn hóa chất, nên là thiếu tư liệu hơn là lỗi dựng). Bằng chứng: `sau/lat/home-1366-3.jpg`, `sau/lat/san-pham-1366-1.jpg`, `sau/admin-san-pham-1366.png`. Gợi ý: gắn tạm ảnh gần nhất (bể trắng nằm ngang ngoài sân cho bể phốt) hoặc báo chủ doanh nghiệp chụp bổ sung, trước khi bàn giao.

**P1-6. Ảnh dọc được đệm mờ hai bên, nhìn rẻ ở nơi to nhất.**
Ảnh bìa bài viết, thẻ tin, thẻ danh mục dùng nền ảnh nhòe hai bên để lấp chỗ trống: ở đầu bài viết, ảnh dọc giữa kẹp hai dải mờ rộng khoảng 40% bề ngang, rất dễ nhận ra là thủ thuật. Bằng chứng: `sau/lat/bai-viet-1366-1.jpg`, `sau/lat/tin-tuc-1366-1.jpg`, `sau/lat/san-pham-1366-1.jpg`. Gợi ý: ảnh bìa cắt đúng tỉ lệ (admin đã có nút "Cắt đúng tỉ lệ bìa") và ép bắt buộc chọn ảnh ngang khi xuất bản, ở thẻ danh mục dùng ảnh cắt cover.

**P1-7. Admin tự mâu thuẫn về thông tin liên hệ.**
Tổng quan ghi "Điện thoại, email và địa chỉ hiển thị đã đúng", nhưng "Thông tin website" để trống số điện thoại, email, Zalo, và địa chỉ chỉ là "Phú Thọ" (đã kiểm trong cơ sở dữ liệu: các trường rỗng, trang công khai đang lấy số thật từ hằng số trong mã). Người dùng admin sẽ điền vào ô, không biết có đổi được trang công khai không. Bằng chứng: `sau/admin-tong-quan-1366.png`, `sau/admin-cai-dat-1366.png`. Gợi ý: hoặc nạp sẵn giá trị đúng vào ô, hoặc bỏ dòng "đã đúng" và ghi rõ ô nào đang được dùng. Chưa kiểm được việc điền ô có đổi trang công khai (xem mục chưa kiểm).

**P1-8. Chữ phụ trong khối mô tả toàn site tô màu xanh xám nhạt hơn tiêu đề để hạ cấp.**
Đây đúng là điều chủ doanh nghiệp đã chê. Đo trên 20 trang: mô tả thẻ và dòng phụ dùng rgb(49,90,105) (tương phản 6,9 với nền sáng) và rgb(43,74,83) (8,5), tiêu đề dùng rgb(17,61,76), ngoài ra có hàng trăm dòng 14 và 15px. Không phải xám thuần, đọc được, nhưng vẫn phân cấp bằng độ nhạt, và cỡ 14px còn gặp ở 523 cụm trên 1366. Bằng chứng: `sau/lat/home-1366-3.jpg` (thẻ "Vật liệu chính phẩm", "Kiểu dáng và kết cấu"), số đo ở `kiem-doc-lap/du-lieu-noidung.json`. Gợi ý: cho mô tả thẻ dùng cùng màu tiêu đề, phân cấp bằng cỡ và độ đậm, nâng thân thẻ lên 16px.

## P2 (nên sửa), 16 mục

1. Trang chủ ở 1366x768: dải số liệu nằm ngay mép dưới màn đầu, bị cắt nửa chữ số (15+, 100+). `sau/home-1366-fold.png`.
2. Khối "Thông tin liên hệ" trong biểu mẫu báo giá: tiêu đề dính sát nhãn "Họ và tên", không có khoảng thở. `kiem-doc-lap/1366-tab-8.png`.
3. Bước 4 biểu mẫu: dòng thẻ tóm tắt (Bể biogas composite, Dưới 15 con lợn, Phú Thọ) dính sát tiêu đề "Ghi chú và gửi". `kiem-doc-lap/1366-form-b4.png`.
4. Màn thành công: câu "Kỹ sư Thành Lợi sẽ gọi lại..." căn trái trong khối căn giữa, ở 1366 rớt từ lẻ "việc.". `kiem-doc-lap/1366-form-thanh-cong.png`.
5. Hai đến bốn nhãn cho cùng một ý định: "Nhận báo giá", "Tư vấn miễn phí", "Báo giá", "Gửi yêu cầu", "Trao đổi dự án", "Chọn quy mô" cùng hiện trong một màn đầu (header, hero, nút nổi). Nên thống nhất một nhãn.
6. Trang Dự án: khi có 1 dự án thì thẻ nằm lẻ trái trong lưới 3 cột, bên phải trống (`sau/lat/du-an-1366-1.jpg`); tương tự Tin tức với 2 bài. Lúc này 0 bài nên thấy màn rỗng, màn rỗng thiết kế tốt (`kiem-doc-lap/1366-tin-tuc-rong.png`).
7. Trang Dự án: dòng phụ "Đây là nhóm lĩnh vực của sản phẩm..." nằm lơ lửng cạnh tiêu đề H2, lệch đường chữ. `sau/lat/du-an-1366-1.jpg`.
8. Ảnh chụp toàn trang `kiem-doc-lap/1366-du-an-rong.png` có một vùng trắng rất lớn giữa trang (khối "Năm lĩnh vực" và dải kêu gọi không hiện). Không tái hiện được trong lượt cuộn chậm (đã kiểm 36 phần tử hiện đủ), nên có thể là cách chụp, nhưng cuộn rất nhanh để lại 4 khối ẩn thêm 0,8 giây (bài đo khung hình). Cần bản build để xác nhận.
9. Nhãn nổi "Gọi ngay, Chat Zalo, Báo giá" nền xám xanh chữ trắng (không đo tương phản) và đè lên chữ tiêu đề "cập nhật" ở trang Dự án 1366. `kiem-doc-lap/1366-du-an-rong.png`.
10. Bản đồ chân trang chỉ 260x162px, nhãn bị cắt, và là khối sáng duy nhất trong chân trang tối; ở màn Liên hệ khung bản đồ lớn nhưng tải lười, ảnh chụp đầu hiện khung xanh nhạt trống đến khi cuộn tới. Đã xác nhận bản đồ tải được (Google trả 200). `kiem-doc-lap/1366-home-day-trang.png`, `sau/lat/lien-he-1366-1.jpg`.
11. Lưới "Các dòng khác" trang Sản phẩm: chiều cao thẻ lệch nhau, thẻ ngắn để trống phía dưới. `sau/lat/san-pham-1366-1.jpg`.
12. Dòng thương hiệu "COMPOSITE" in hoa 13px cách chữ rộng dưới tên "THÀNH LỢI" (nhãn logo, chấp nhận được nhưng đúng là chữ in hoa cả cụm và dưới 14px).
13. Admin 390: dòng đường dẫn "Tổng quan > Bài viết >" bị cắt cụt còn dấu ">" treo. Menu gạch chéo bị thanh nút dưới che mất mục cuối. `sau/ghep/admin-bai-viet-sua-390-1.jpg`, `kiem-doc-lap/390-admin-slash.png`.
14. Ở 390, một điểm dừng Tab (trên trang Liên hệ) không đo ra viền hay bóng tiêu điểm; kết quả `kiem-doc-lap/du-lieu-tuong-tac.json`, bước "Tab qua header và biểu mẫu". Chưa xác định phần tử nào (cần kiểm lại bằng tay).
15. Admin: ô "Hẹn giờ đăng" hiện mẫu tiếng Anh `mm/dd/yyyy --:-- --` theo ngôn ngữ trình duyệt. `kiem-doc-lap/1366-admin-slash.png`. Cột tiêu đề trong danh sách bài viết bị cắt cụt không có dấu ba chấm. `sau/admin-bai-viet-1366.png`.
16. Ở 390, nút chia sẻ bài viết xuống hàng để lẻ nút Zalo; một số nút chọn quy mô trong bảng biogas và bể phốt đo cao 26px (dưới 44px), chưa xác minh phần tử nào đang hiển thị ra người dùng. `sau/ghep/bai-viet-390-1.jpg`.

## Điểm đang tốt (để bên dựng giữ)

- Dữ kiện đúng tuyệt đối với hồ sơ, giọng chữ sạch, không ký tự cấm trên 20 đường dẫn, 4 cỡ.
- Menu, hộp xem ảnh, hộp menu điện thoại giữ tiêu điểm đúng, Esc đóng, tiêu điểm về nút mở. Viền tiêu điểm vàng nổi rõ.
- Biểu mẫu báo giá bốn bước, lỗi nói rõ cách sửa, giữ dữ liệu, ra màn thành công có tóm tắt.
- Màn rỗng của Tin tức và Dự án trung thực ("Hồ sơ dự án đang được cập nhật"), không bịa dự án.
- Trình soạn bài admin có menu gạch chéo, tự lưu, xem trước hai khổ.

## Tệp chứng cứ và script

- Ảnh: `kiem-doc-lap/*.png` (tiền tố 1366, 390, 600, 1920).
- Số đo: `du-lieu-noidung.json`, `du-lieu-tuong-tac.json`, `du-lieu-tiep.json`, `phan-tich-noidung.txt`, `tuong-tac.log`.
- Script kiểm tạm: `scripts/kiem-noidung.ts`, `kiem-tuong-tac.ts`, `kiem-tiep.ts`, `kiem-bai.ts`, `kiem-muc-luc.ts`, `kiem-media.ts`, `kiem-dem.ts`, và ba script phân tích `kiem-phan-tich.mjs`, `kiem-mau.mjs`, `kiem-ghep.mjs` (đuôi `.mjs` thay vì `.ts`, ngoài quy ước tên một chút). Lưu ý `kiem-tieu-de.ts` có sẵn từ trước, không phải của lượt này.
- Ghi chú về chính tôi: vài kết luận ban đầu của script là báo nhầm và đã loại: menu không đóng bằng Esc (thực ra chỉ khi chuột còn rê trên nút), banner không tự chuyển (do bài đo ngắt), ảnh bìa bài thử 404 (do bài thử không có liên kết ảnh, theo thiết kế chỉ phục vụ công khai khi ảnh gắn với bài đã đăng), thẻ sản phẩm không bấm được (bắt nhầm liên kết ẩn trong menu).
