# Báo cáo kiểm độc lập lượt hai: website Thành Lợi Composite

Người kiểm: phiên độc lập, không tham gia dựng. Ngày kiểm 21/11/2026. Bản kiểm: http://127.0.0.1:3002 (bản dev). Không sửa mã nguồn, không bật hay tắt máy chủ, không build.

## Kết luận

**ĐẠT CÓ ĐIỀU KIỆN, gần mức 40 triệu nhưng chưa tới.** So với lượt một, bản này tốt lên rõ: banner không còn bị nút đè, màn đầu 600x360 thấy tiêu đề và hai nút kêu gọi, ảnh bìa dọc không còn đệm mờ, nút "Gọi hotline" chữ trắng trên nền xanh, trang chi tiết sản phẩm, bài viết và trình soạn bài trong admin trông chuyên nghiệp, hẹn giờ bằng tiếng Việt, thông tin liên hệ trong admin đã nạp đúng. Dữ kiện đúng nguồn, không lỗi console, không tràn ngang, ký tự cấm sạch, chuyển động mượt (95% khung hình dưới 10,1 ms). Không có P0. Nhưng một chủ doanh nghiệp khó tính vẫn thấy ngay 5 điều: (1) ảnh có em bé mặc đồ kem ốc đứng ở mép bể vẫn là ảnh đầu của dòng mũi nhọn số 3 ở ba nơi, (2) bể phốt, bể xử lý nước thải, bồn hóa chất vẫn chưa có ảnh thật, chỉ có ô nền xanh nét vẽ, (3) chữ vẫn rớt một từ lẻ ở câu cuối chân trang trên mọi trang và ở vài chỗ khác, (4) thư viện ảnh admin có 3 ô màu trơn "luong-..." ở đầu danh sách, (5) ô "Vật liệu chính phẩm" dùng ảnh thùng vàng phóng to, mảng vàng phẳng, không nói được gì. Sửa 5 điểm này (ba điểm đầu có thể phải chờ ảnh từ doanh nghiệp) thì mới nên giao. Về thẩm mỹ, nhiều trang phụ vẫn cùng một khuôn (dải xanh đầu trang, thẻ viền mảnh), điểm nhớ thật sự nằm ở banner, bento "Vì sao chọn", trang biogas và trình soạn bài.

Số lỗi: P0 = 0, P1 = 5, P2 = 13.

## Đã kiểm gì

- Chụp 28 màn (19 công khai gồm 404, 9 admin gồm đăng nhập) ở 1366x768, 390x844, 600x360 (84 ảnh toàn trang cộng ảnh màn đầu), cuộn chậm đúng cách rồi chụp, tự xem ảnh ghép của: trang chủ ba cỡ, giới thiệu, danh mục, biogas, nhóm bể phốt, thủy sản, bể phốt (390), dự án, tin tức, bài viết (1366, 390), liên hệ, bản đồ, bốn màn admin chính ở 1366 và 390, soạn bài ở cả ba cỡ. Ảnh ở `ecran/` (toàn trang, có `lat/` là ảnh cắt lát) và `tt/` (tự dùng). Không bật giảm chuyển động.
- Tự dùng bằng Playwright (`tuong-tac.ts`, log `tuong-tac.log`, số đo `tt/du-lieu-tuong-tac.json`): menu Sản phẩm và menu điện thoại (tiêu điểm vào trong, Esc đóng, về nút Mở menu), banner ba cảnh (tự chuyển khoảng 8 giây một cảnh, bấm tay), cuộn nhanh bằng bánh xe chuột (16 bước, 0,85 màn mỗi 90 ms), cuộn chậm đo khung hình, dải ảnh và hộp xem ảnh, rê chuột thẻ, trang biogas (chọn quy mô cho kết quả 6 m³ đúng), biểu mẫu báo giá đi đủ 4 bước có chặn gửi bằng `page.route` (có kiểm bỏ trống và sai số điện thoại), hỏi đáp (chiều cao 0, 88, 119, 146, 161, 167, 170, 171: mượt), tìm tin, bài dài có ảnh ngang, ảnh dọc, bảng sáu cột, danh sách, trích dẫn, mục lục, Tab qua đầu trang (viền tiêu điểm thấy rõ ở cả ba cỡ).
- Admin tạo tài khoản tạm: soạn bài ở ba cỡ (tiêu đề, menu gạch chéo mở được, ngăn thiết lập, hẹn giờ bằng ba ô chọn tiếng Việt, xem trước, lưu nháp có thông báo "Đã lưu bản nháp"), sửa bài, danh sách, thư viện, sản phẩm, yêu cầu có dữ liệu thử (bấm vào yêu cầu mở khung chi tiết có nút Gọi, Nhắn Zalo, đổi trạng thái), thông tin website, tổng quan khi có khách chờ gọi.
- Đo trên từng màn (`chup.ts`, `ecran/report.json`): tràn ngang (0 ở cả 84 lượt), lỗi console (chỉ có 404 của trang 404 là đúng thiết kế; cảnh báo preload CSS chỉ là của bản dev), ảnh vỡ (0), chữ rớt một từ lẻ (đo từng từ bằng vùng chữ thật), vùng bấm dưới 44px ở 390 và 36px ở máy bàn, ký tự cấm (dấu chấm giữa, gạch ngang dài, chấm phẩy, chấm than, khoảng trắng dính) trên mọi trạng thái đã mở (menu, hộp ảnh, biểu mẫu, bài, admin), cụm in hoa, từ kỹ thuật (0).
- Đối chiếu `final-docx.txt`: số điện thoại 0964.444.2626 và 0943.924.816, email info@thanhloicomposite.com, địa chỉ Khu Tiên Sơn, xã Tiên Lương, tỉnh Phú Thọ, mã số thuế 2600665401, giờ 7h30 – 17h30 thứ Hai đến thứ Bảy, số liệu 15+, 100+, 25+, 10, 30+, bảng biogas (5 mã), bảng bể phốt (5 phân khúc), bảng bể cá (4 nhóm), 5 câu hỏi đáp, quy trình 5 bước, Google Maps nhúng tải được. Đúng hết. Không thấy số liệu, khách hàng, chứng nhận, lời khen bịa thêm. Các cam kết "100%", "tuyệt đối" đã viết giảm.
- Dọn dữ liệu: đếm lại bằng truy vấn: 0 bài, 0 yêu cầu, 30 ảnh, 1 tài khoản, 0 tài khoản `@example.test`.

## Chưa kiểm gì

- Bản build thật (chỉ bản dev), nên khung hình, tốc độ tải ảnh và vài lần ô ảnh trống chưa phải số của bản chính thức. Có một khung 150 ms ở lần cuộn đầu tiên trang chủ 1366 (dev biên dịch).
- Tải ảnh lên, chỉnh ảnh, đặt lịch đăng thật, khôi phục bản cũ, xoá bài bằng tay (không đụng dữ liệu thật). Chưa bấm thử "Đặt lịch đăng" thật.
- Điền ô "Thông tin website" rồi xem trang công khai đổi theo không (sẽ ghi vào dữ liệu thật).
- Gửi biểu mẫu thật (cố ý chặn), chưa kiểm ảnh bước 4 và dòng tóm tắt của biểu mẫu kỹ như lượt một (đã thấy biểu mẫu chạy đủ bước và ra màn thành công).
- Điện thoại thật, trình duyệt khác Chrome, trình đọc màn hình, tắt JavaScript.
- Chưa chạy `ui_audit.py`, `contrast.py`, `wrap_check.py`: người kiểm tự đo bằng trình duyệt thật thay thế. Tương phản chữ trên nền ảnh chỉ đánh giá bằng mắt.
- Trang `/kien-thuc`, `/admin/xem-truoc` đứng riêng chưa mở.
- Cột tiêu đề trong danh sách bài admin có cắt cụt không (mục P2-15 cũ): danh sách rỗng khi kiểm, chưa thấy.

## P0

Không có.

## P1 (xấu thấy ngay, chủ doanh nghiệp sẽ chê)

**P1-1. Ảnh có em bé mặc đồ kem ốc đứng ở mép bể vẫn là ảnh đầu của dòng mũi nhọn số 3.**
Màn: trang chủ (thẻ "Bể cá Koi và bể nuôi thủy sản"), trang Sản phẩm (thẻ lớn), trang chi tiết bể cá (ảnh chính 1/3), mọi cỡ. Banner cảnh 3 đã đổi sang xe bán tải nên điểm lớn nhất đã hết, nhưng hình người nhỏ màu đỏ cam trên thành bể vẫn thấy rõ ở ảnh chính, nhìn như ảnh chụp đại, không đúng "ảnh thật tại công trình". Bằng chứng: `ecran/lat/san-pham-thuy-san-1366-h1.jpg`, `ecran/lat/san-pham-1366-h1.jpg`, `tt/lat/1366-home-cham-h2.jpg`. Gợi ý: cắt lệch ảnh để không thấy hình người, hoặc đặt ảnh thứ hai (công nhân lắp ghép) làm ảnh chính. Tệp nghi ngờ: `src/lib/catalog` hoặc `product-assets` (gán ảnh theo nhóm), `public/images/home/*`.

**P1-2. Ba nhóm chưa có ảnh thật: bể phốt, bể xử lý nước thải, bồn chứa hóa chất, đang thay bằng ô nền xanh nét vẽ.**
Màn: trang chủ (thẻ bể phốt và bồn hóa chất), Sản phẩm, trang nhóm bể phốt (hai thẻ lớn gần như trống, chỉ có nét vẽ và chữ), mọi cỡ. Đã thiết kế trung thực hơn lượt một (có nét vẽ riêng, chữ "Từ 1 m³ đến 100 m³ trở lên", "AAO, AO, MBBR, Jokaso") và không gán nhầm ảnh, nhưng bể phốt là mũi nhọn số 2 mà không có một tấm ảnh nào, trang nhóm bể phốt trông trống. Đây là thiếu tư liệu, cần doanh nghiệp chụp bổ sung. Bằng chứng: `ecran/lat/san-pham-nhom-phot-1366-h1.jpg`, `ecran/lat/san-pham-1366-h1.jpg`. Gợi ý: xin ảnh bể phốt và bồn hóa chất thật, hoặc ghi rõ cho chủ doanh nghiệp biết trước khi bàn giao. Tệp: `src/components/pages/product-tile.tsx`, `src/app/(public)/san-pham/be-phot-va-xu-ly-nuoc-thai/page.tsx`.

**P1-3. Chữ vẫn rớt một từ lẻ ở dòng cuối.**
Đo bằng vùng chữ thật. Lỗi lặp lại ở mọi trang: câu chân trang "Đúng yêu cầu, đúng tiến độ, bền vững theo thời / gian." (đo thấy "gian." đứng một mình ở 19 trang 1366). Trang chủ 1366: 12 chỗ ("từ năm / 2010", "vận hành ổn / định" và "trên toàn / quốc" trong dải số liệu, "bể tròn / composite" ở thẻ dự án, "tiết kiệm / nhất."). Trang bể phốt 1366: 8 chỗ trong ô bảng (ví dụ "và QCVN / 40", "trạm dừng / nghỉ"). 390: trang chủ 10 chỗ, bài viết 10 chỗ (tiêu đề mục "vùng đất / trũng"), dự án chi tiết 9 chỗ. 600: 1 đến 5 chỗ mỗi trang. Tiêu đề bài H1 1366 "nhiều nước / ngầm". Bằng chứng: `ecran/report.json` (trường `orphans`), `ecran/lat/gioi-thieu-1366-h2.jpg` (chân trang), `tt/lat/1366-home-cham-h1.jpg` (số liệu). Gợi ý: rút chữ ở dải số liệu và câu chân trang, nới khung hoặc đổi thành bảng có nhãn ngắn hơn. Lưu ý luật không cho dính từ nên chỉ rút chữ hoặc đổi bề rộng. Tệp: `src/lib/site-facts.ts` (chữ), `src/components/site-footer.tsx`, `src/components/home/metrics-strip.tsx`.

**P1-4. Thư viện ảnh admin có 3 ô màu trơn "luong-34379b7b-desktop-..." ở đầu danh sách.**
Màn: Ảnh và video, mọi cỡ. Hai ô xanh dương và một ô xanh lục, 1 KB, không mô tả, là ảnh thử của bên dựng để lại. Khi giao cho chủ doanh nghiệp, vào thư viện là thấy rác ở dòng đầu. Bằng chứng: `ecran/lat/admin-thu-vien-1366-h1.jpg`. Gợi ý: xoá 3 ảnh này trong admin (không do người kiểm xoá vì giữ nguyên số đếm 30). Dữ liệu: `media_assets` (tên bắt đầu bằng `luong-`).

**P1-5. Ô "Vật liệu chính phẩm" trong bento "Vì sao chọn Thành Lợi" dùng ảnh thùng vàng phóng to.**
Màn: trang chủ, mọi cỡ. Ảnh là mảng vàng phẳng chiếm gần cả ô, chỉ lộ góc xưởng, chữ trắng đè lên nền vàng ngả olive, tương phản yếu ở phần đầu ảnh. Không nói được "vật liệu" hay "bề mặt", khách nhìn không hiểu đó là gì, lại là ô to nhất khối bento đầu tiên. Bằng chứng: `tt/lat/1366-home-cham-h1.jpg`, `tt/lat/390-home-cham-g1.jpg`. Gợi ý: dùng ảnh bề mặt composite có chi tiết (vòi xả, mối nối) cắt chặt vào chi tiết, hoặc ảnh lòng bể xanh, và đậm nền dưới chữ. Tệp: `src/components/home/images.ts` (`photos.surface`), `src/components/home/sections.tsx` (`ReasonsBento`).

## P2 (nên sửa)

1. Nhãn "Kỹ thuật trọn gói": sáu nhãn đánh số 1 đến 6 (Tư vấn, Thiết kế, Sản xuất, Vận chuyển, Lắp đặt, Bảo hành) ngay trên bảng so sánh, rồi bên dưới là "Quy trình năm bước". Sáu nhãn đúng nguồn (hồ sơ nêu sáu việc), không bịa, nhưng đánh số cạnh quy trình năm bước làm khách tưởng hai quy trình mâu thuẫn. Gợi ý: bỏ số trong sáu nhãn hoặc dùng dấu mũi tên. `tt/lat/1366-home-cham-h1.jpg`. Tệp: `src/components/home/sections.tsx`.
2. Banner 390: ở màn đầu, nút lùi, dừng, tới và ba chấm chỉ cảnh nằm sau thanh liên hệ cố định ở đáy (đo `elementFromPoint`: bị thanh phủ), chỉ bấm được sau khi cuộn. `bs/390-fold.png`.
3. 600x360: cụm nút đổi cảnh bị cắt nửa ở mép dưới màn đầu; thanh trên cùng (số điện thoại, email) ẩn bằng chiều cao 0 nhưng vẫn nhận phím Tab (3 điểm dừng nằm ngoài khung nhìn). `bs/600-fold.png`, log "Tab qua đầu trang" cỡ 600.
4. Chuyển cảnh banner: trong khoảng 150 đến 400 ms ảnh nền cảnh cũ mất gần hết, màn gần như tối trơn, tiêu đề cảnh mới hiện từng nửa dòng. Có chủ đích nhưng nhìn như nhấp nháy. `bs/chuyen-canh-ghep.jpg`.
5. Dải "Hình ảnh thật": ô ảnh đầu trống (nền xanh nhạt) trong ảnh toàn trang ở 1366 và 390, dù khi cuộn tới đúng chỗ ảnh tải đủ (`bs/` đo ảnh `complete`). Nghi tải lười, cần xác nhận trên bản build. `tt/lat/1366-home-cham-h2.jpg`.
6. Bài viết: bảng rộng hơn khung (920 trong 718 ở 1366, 808 trong 352 ở 390) cuộn ngang, chữ cột cuối bị cắt dở không có gợi ý rõ ở 1366. `tt/lat/1366-bai-full-h1.jpg`.
7. Trang chi tiết bể phốt 390: hai dòng đường dẫn xếp chồng, dòng sau bắt đầu bằng dấu gạch chéo lẻ. `ecran/lat/san-pham-phot-390-g1.jpg`.
8. Liên kết email ở thanh trên cùng 231x26 px, dưới 36px của máy bàn.
9. "THÀNH LỢI" in hoa cả cụm và "COMPOSITE" in hoa 13px ở logo chữ (nhãn logo, chấp nhận được, ghi lại vì luật chữ).
10. Biểu mẫu ở trang Liên hệ: tiêu đề "Thông tin liên hệ" còn sát nhãn "Họ và tên" (trang chủ đã thoáng hơn). `ecran/lat/lien-he-1366-h1.jpg`.
11. Trang chủ chưa có chuyển động có nghĩa như đề vòng hai nêu: số liệu 15+, 100+ đứng yên, đường quy trình không chạy theo cuộn (chỉ có hiện dần). Điểm nhớ vẫn là banner và bento, các khối còn lại cùng nhịp.
12. Chân trang: ô địa chỉ có bản đồ nhưng chỉ tải khi cuộn tới, trước đó là hộp xanh trống có ghim. Không phải lỗi nhưng ảnh chụp dễ thấy khung trống. Dải Liên hệ thì tải bản đồ thật tốt (`bs/lien-he-ban-do.png`).
13. Nhiều nhãn cho cùng ý định vẫn còn nhưng đã gọn hơn: "Nhận báo giá", "Xem sản phẩm", "Gọi", "Nhắn Zalo", "Chat Zalo", "Gọi ngay" (thanh dưới 390). Nên thống nhất "Chat Zalo" và "Nhắn Zalo".

Ghi chú không tính lỗi: nút tròn "N" ở góc dưới trái là của chế độ dev Next.js, sẽ không có ở bản chạy thật. Cảnh báo console "preload CSS không dùng" cũng chỉ của bản dev.

## Bảng 8 P1 cũ (lượt một)

| Mã | Nội dung | Kết quả |
|---|---|---|
| P1-1 | Nút "Gọi hotline" màn thành công chữ tối trên nền xanh | Hết. Đo: chữ trắng rgb(255,255,255) trên nền rgb(24,116,71). `tt/1366-form-thanh-cong.png` |
| P1-2 | 600x360 màn đầu không dùng được | Hết phần chính: thấy tiêu đề và hai nút kêu gọi. Còn nhỏ: cụm đổi cảnh cắt nửa (P2-3) |
| P1-3 | Banner cảnh 2, 3 mờ, cảnh 3 có hình em bé | Hết ở banner (cảnh 2 là ảnh bể trong khung, cảnh 3 là xe bán tải nét). Ảnh em bé còn ở nơi khác (P1-1 mới) |
| P1-4 | Chữ rớt từ lẻ | Còn, giảm số chỗ nhưng lỗi chân trang lặp ở mọi trang (P1-3 mới) |
| P1-5 | 3 nhóm chưa ảnh | Còn, đổi sang ô nét vẽ trung thực (P1-2 mới) |
| P1-6 | Ảnh dọc đệm mờ hai bên | Hết. Ảnh bìa dọc 3:4 nằm đúng khung, bìa ngang 2:1 |
| P1-7 | Admin mâu thuẫn thông tin liên hệ | Hết. Ô điện thoại, email, địa chỉ, giờ, Zalo đã nạp đúng. `ecran/lat/admin-cai-dat-1366-h1.jpg` (chưa thử đổi để xem trang công khai đổi theo) |
| P1-8 | Chữ phụ nhạt để hạ cấp | Hết phần lớn. Chữ thân 16px cùng màu tiêu đề rgb(17,61,76); còn 1 cụm 13px ở trang tin tức |

## Bảng 16 P2 cũ

| # | Nội dung | Kết quả |
|---|---|---|
| 1 | Dải số liệu cắt nửa chữ số ở mép màn đầu | Đỡ: thẻ số liệu gối lên banner, thấy "15+" đủ, chữ mô tả cắt ở 768 (chấp nhận) |
| 2 | Tiêu đề sát nhãn trong biểu mẫu | Còn nhẹ ở trang Liên hệ (P2-10) |
| 3 | Bước 4 tóm tắt sát tiêu đề | Chưa xác nhận (không xem kỹ ảnh bước 4) |
| 4 | Câu màn thành công căn trái, rớt từ lẻ | Chưa xác nhận |
| 5 | Nhiều nhãn cho một ý định | Đỡ, còn (P2-13) |
| 6 | Dự án một thẻ lẻ, tin tức hai bài lẻ | Hết: dự án là thẻ ngang tràn, tin tức có thẻ đầu lớn. `ecran/lat/du-an-1366-h1.jpg`, `tt/lat/1366-tin-tuc-day-h1.jpg` |
| 7 | Dòng phụ lơ lửng ở trang Dự án | Hết (đặt dưới tiêu đề "Năm lĩnh vực chúng tôi làm") |
| 8 | Vùng trắng giữa trang | Hết: khi cuộn chậm không thấy; chỉ xuất hiện khi cuộn nhảy bằng lệnh `scrollTo` có hiệu ứng mượt (lỗi cách đo, không phải của trang). Cuộn thật bằng bánh xe: khối ẩn tối đa 6 trên 8 trong 150 ms rồi hiện đủ |
| 9 | Nhãn nổi đè tiêu đề | Hết: thay bằng hai nút tròn gọi và chat, chỉ chạm nhẹ nút "Ảnh sau" của dải ảnh ở 1366 |
| 10 | Bản đồ chân trang nhỏ, bản đồ liên hệ trống | Hết: liên hệ tải đủ bản đồ thật 1268x420 (`bs/lien-he-ban-do.png`); chân trang còn hộp chờ (P2-12) |
| 11 | "Các dòng khác" thẻ cao thấp lệch | Hết: bốn thẻ đều nhau |
| 12 | "COMPOSITE" in hoa 13px | Còn (P2-9, là logo) |
| 13 | Admin 390 đường dẫn cắt, menu gạch chéo bị thanh dưới che | Hết: 390 dùng nút menu, menu gạch chéo hiện đủ 6 mục trên thanh nút. `tt/lat/390-admin-gop.jpg` |
| 14 | Một điểm Tab 390 không viền | Hết: 20 điểm dừng ở mỗi cỡ đều có viền (log `tuong-tac.log`) |
| 15 | Hẹn giờ tiếng Anh, cột tiêu đề cắt cụt | Hẹn giờ hết (ba ô chọn Ngày, Giờ, Phút tiếng Việt, "tính theo giờ Việt Nam"). Cột tiêu đề: chưa kiểm được |
| 16 | 390 chia sẻ lẻ, nút chọn quy mô 26px | Hết: ba nút chia sẻ một hàng; ở 390 đo 0 vùng bấm dưới 44px (trừ nút ẩn 2x2 của hộp ảnh bài viết, chỉ cho trình đọc màn hình) |

## Điểm đang tốt (giữ lại)

- Banner ba cảnh không còn nút đè nhau ở cả ba cỡ (đo `elementFromPoint` cảnh đang hiện), cảnh 1 và 3 ảnh toàn khung nét, cảnh 2 ảnh bể trong thẻ có viền; tự chuyển đúng khoảng 8 giây.
- Trang chi tiết biogas: ảnh lớn có thanh ảnh nhỏ, bốn ô thông số, hỏi "Đàn của bạn đang nuôi bao nhiêu" bấm ra gợi ý 6 m³ đúng bảng, bảng bảng rõ, phần cấu tạo nền xanh sâu có biểu tượng, danh sách thông tin cần cung cấp, hỏi đáp liên quan. Đây là trang đáng tiền nhất.
- Bài viết: tiêu đề, ảnh bìa ngang 2:1, mục lục bên phải đánh dấu mục đang đọc, nút chia sẻ bên trái, trích dẫn dạng thẻ, ảnh dọc đặt giữa không đệm, bài sau và bài liên quan. Tin tức có thẻ đầu lớn, tìm kiếm chạy (`/tin-tuc?q=biogas`), lọc theo chuyên mục có số đếm.
- Trình soạn bài admin ở cả ba cỡ: thanh trên dính, trạng thái "Đã lưu lúc", menu gạch chéo có mô tả từng khối, ngăn thiết lập có hẹn giờ "Sáng mai 8 giờ" và "Chiều mai 14 giờ", xem trước máy bàn và điện thoại, thông báo sau lưu. Tổng quan khi có khách chờ có khối cam "Gọi 0912..." một bước; chi tiết yêu cầu có Gọi, Nhắn Zalo, đổi trạng thái.
- Hộp xem ảnh dùng thẻ dialog gốc: tiêu điểm vào nút Đóng, Tab quanh trong hộp, Esc đóng, tiêu điểm về đúng ảnh đã mở. Menu điện thoại giữ tiêu điểm đúng.
- Biểu mẫu báo giá bốn bước, lỗi nói rõ cách sửa ("Nhập số điện thoại có ít nhất 9 chữ số, ví dụ 0912345678."), ra màn thành công có tóm tắt.
- Dữ kiện đúng tuyệt đối, ký tự cấm sạch, không từ kỹ thuật lộ ra, không bịa số liệu.
- Hiệu năng: khung hình p95 10,1 ms ở mọi trang đã đo, không khung nào trên 50 ms trừ một khung 150 ms ở lần cuộn đầu (dev).
- Chữ thân 16px trở lên, màu cùng gam tiêu đề, thẻ thấy rõ ở khung nhỏ.

## Tệp chứng cứ và script (trong thư mục này)

- Ảnh: `ecran/*.png` và `ecran/lat/*.jpg` (toàn trang, `-fold` là màn đầu), `tt/*.png` (tự dùng), `bs/*` (đo bổ sung), `report.json` ở `ecran/`.
- Script: `chup.ts` (chụp và đo), `tuong-tac.ts` (tự dùng), `bo-sung.mjs` (banner, chuyển cảnh, hộp ảnh, bản đồ), `ghep.mjs` và `ghep2.mjs` (cắt lát). Log: `chup.log`, `tuong-tac.log`.
- Lưu ý đo: báo "banner bị đè" của `tuong-tac.ts` là báo nhầm do ba cảnh xếp chồng nhau (đã đo lại đúng cảnh đang hiện bằng `bo-sung.mjs`, 0 chỗ đè); báo "Tab thoát khỏi hộp xem ảnh" cũng nhầm (Tab ra thanh trình duyệt rồi quay lại là cách hộp dialog gốc hoạt động).
