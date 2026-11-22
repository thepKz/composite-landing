# Báo cáo kiểm độc lập vòng bốn (22/11/2026)

Kiểm viên không tham gia dựng, không sửa mã nguồn. Bản dev http://127.0.0.1:3002. Ảnh và số đo ở thư mục này (`anh/<cỡ>/<trang>/vNN.png` là từng khung nhìn khi cuộn, `anh/<cỡ>/<trang>-full.png` là toàn trang, `report*.json` là số đo). Các tệp `.mjs` và `.ts` ở đây là script kiểm của tôi.

## Phán quyết

**Đạt có điều kiện, chưa đạt ở lời 1, 2 và 3 trên các trang phụ.**

- Trang chủ: đạt phần lớn bảy lời. Nền nối bằng cung và sóng, có vòm, tròn, cạnh vát, cửa sổ ba ô, chồng lớp, hoa văn vừa phải, chữ đọc được, không thấy dải chữ nhật xếp chồng.
- Trang phụ: **chưa đạt lời 1 và 2.** Ngay dưới đầu trang của hầu hết trang phụ vẫn còn một mép ngang thẳng từ nền xanh đen sang nền giấy, kéo suốt bề ngang, và tiêu đề khối kế tiếp dính sát mép đó. Đây chính là thứ chủ dự án chê, và nằm ở màn đầu của các trang hay được mở nhất. Nguyên nhân chỉ ở một dòng CSS (P1-1), sửa là hết.
- Lời 3 (lề đều): lề ngoài của khung 63 và 63 px ở 1366, 20 và 20 ở 390 (đạt). Nhưng bề rộng chữ thật lệch ở trang chính sách bảo mật (trái 63, phải 211 ở 1366).
- Lời 4 (giọng): phần lớn văn viết, có vài chỗ khẩu ngữ và hai câu hỏi trong bộ chọn.
- Lời 5, 6, 7: đạt. Ít nhất năm dáng khung, có chồng lớp, hoa văn không quá tay. Morph chuyển trang thật (xem mục chuyển động). Có chỗ chữ bị huy hiệu đè (P1-2).
- Chức năng không hỏng: biểu mẫu, menu, hỏi đáp, bộ chọn quy mô, admin đều chạy. Không có lỗi chức năng.

Trang yếu nhất: **năm trang chi tiết sản phẩm** (mép thẳng ngay màn đầu, thanh tab biến mất sau khi bấm tab đầu, khối "Chưa có đủ thông tin" đọc như báo lỗi) và **/chinh-sach-bao-mat** (mép thẳng, lề chữ lệch).

Lưu ý với báo cáo dựng: `BAO-CAO-trang-phu.md` nói "không còn mép ngang thẳng giữa hai nền" và lề lệch 0 px. Mép thẳng vẫn còn (bằng chứng ở P1-1). Số lề 0 px của họ đo khung chứa chứ không đo chữ thật. Họ cũng ghi chưa chạy `ui_audit.py` và `wrap_check.py`.

## P0 (sai dữ kiện, hỏng chức năng)

Hỏng chức năng: không có. Biểu mẫu báo giá đi đủ bốn bước, báo lỗi đúng khi để trống, gửi một lần trả 201, hiện màn "Đã nhận yêu cầu". Menu điện thoại mở và đóng bằng Esc, tiêu điểm về nút "Mở menu". Hỏi đáp mở đóng đúng. Admin không vỡ.

**P0-1. Cam kết bảo hành "ghi rõ trong hợp đồng" không có trong hồ sơ.**
- Trang `/chinh-sach-bao-hanh`: tiêu đề "Bảo hành đến 10 năm, ghi rõ trong hợp đồng", thẻ "Chi tiết theo hợp đồng" (thời hạn, phạm vi, điều kiện được xác nhận trong báo giá hoặc hợp đồng), thẻ "Khi cần hỗ trợ bảo hành" (quy trình chuẩn bị ảnh, thông tin đơn hàng).
- Trang `/huong-dan-dat-hang`: "Bảo hành đến 10 năm. Thời hạn tùy dòng sản phẩm, ghi trong hợp đồng" và "Chi phí và thời gian giao nhận được xác nhận trong báo giá hoặc hợp đồng".
- Hồ sơ (`final-docx.txt` dòng 325) chỉ nói độ dày, chủng loại nhựa, trọng lượng ghi trong hợp đồng. Hạn bảo hành chỉ là "đến 10 năm theo từng dòng sản phẩm". Phạm vi, điều kiện, chi phí giao nhận trong hợp đồng là cam kết mới, thuộc loại pháp lý, chủ doanh nghiệp chưa duyệt.
- Tệp: `src/app/(public)/chinh-sach-bao-hanh/page.tsx` dòng 15, 18, 26 (và mục "Khi cần hỗ trợ"); `src/app/(public)/huong-dan-dat-hang/page.tsx` dòng 88, 103.
- Sửa: chỉ giữ "Bảo hành đến 10 năm tùy dòng sản phẩm", "độ dày, loại nhựa, trọng lượng ghi trong hợp đồng". Bỏ các câu về phạm vi, điều kiện, quy trình hỗ trợ, chi phí giao nhận hoặc xin chủ doanh nghiệp xác nhận.

## P1 (thấy ngay, chủ dự án sẽ chê)

**P1-1. Mép ngang thẳng giữa đầu trang và khối kế tiếp, tiêu đề khối dính sát mép.** Lời 1 và 2 không đạt trên trang phụ.
- Trang và cỡ: `/gioi-thieu`, `/san-pham`, `/san-pham/be-phot-va-xu-ly-nuoc-thai`, năm trang `/san-pham/<nhóm>` (biogas, thủy sản, bể phốt composite, hóa chất, xe gom rác), `/hoi-dap`, `/lien-he`, `/huong-dan-dat-hang`, `/chinh-sach-bao-hanh`, `/chinh-sach-bao-mat`. Thấy ở 1366 (rõ nhất ở các trang chi tiết), 1920 (hầu hết các trang trên). Chưa thấy ở trang chủ, tin tức, dự án.
- Ảnh: `anh/1366/sp-biogas/v01.png` (mép ở y=399, chữ "Chọn dung tích theo đàn" sát mép), `anh/1366/crops-v.png` (tám chỗ cắt ra), `anh/1920/crops-v.png`, `anh/1366/chuc-nang/form-sau-gui.png` (hero trang liên hệ).
- Số đo: ở `/san-pham/be-biogas-composite`, khối `#bang-chon` có `margin-top -191px`, mặt nạ vòm cao 191px đặt đúng chỗ, nhưng khối đầu trang (`tp4-pd-hero`) có `z-index 3` còn khối sau `z-index 1`, nên nền đặc của đầu trang phủ kín vùng vòm, chỉ còn mép thẳng.
- Gốc: `src/components/pages/pages-v4.css` dòng 31: `.tp4-hero, .tp4-pd-hero { z-index: 3; }`. Mép `top="dome"` của các khối sau khai ở `src/app/(public)/san-pham/[slug]/page.tsx:142,145`, `chinh-sach-bao-hanh/page.tsx:33`, `chinh-sach-bao-mat/page.tsx:31`, `gioi-thieu/page.tsx:81`, `hoi-dap/page.tsx:34`, `huong-dan-dat-hang/page.tsx:53`, `lien-he/page.tsx:50`, `san-pham/page.tsx:45`, `san-pham/be-phot-va-xu-ly-nuoc-thai/page.tsx:37`.
- Sửa gợi ý: bỏ `z-index:3` của hero (nếu cần giữ thẻ nổi ra ngoài hero thì chỉ nâng riêng lớp thẻ), hoặc đặt `bottom` cho hero. Thêm đệm trên khối sau để tiêu đề không nằm trong vùng chuyển. Sau đó chạy lại phép quét `edgesv.mjs` ở thư mục này.
- Lưu ý đo: ảnh toàn trang (`*-full.png`) không thấy được lỗi nền cố định, vùng cream hiện trắng. Phải xem từng khung nhìn.

**P1-2. Chữ bị đè.** Trang `/huong-dan-dat-hang` ở 1366: huy hiệu tròn xanh chanh có biểu tượng xe tải đè lên câu "Hỗ trợ xe tải ghép chuyến giao hàng và lắp đặt toàn quốc" (ảnh `anh/1366/huong-dan-dat-hang/v03.png`, bên phải). Vi phạm lời 7(g) và nguyên tắc "không để chữ đè lên lớp khác". Gốc nghi: khối vận chuyển `src/app/(public)/huong-dan-dat-hang/page.tsx` dòng 75 đến 95 (StackStat hoặc lớp trang trí đặt trên cột chữ). Sửa: dời huy hiệu sang góc ảnh hoặc ngoài cột chữ.

**P1-3. Thanh tab trang chi tiết sản phẩm biến mất sau khi bấm tab đầu.** Ở 1366, bấm "Chọn dung tích" cuộn tới y=799, đúng ngưỡng mà thanh tab ẩn. Thanh biến mất, ba tab còn lại (Cấu tạo, Đặt hàng, Hỏi đáp) không bấm tiếp được cho tới khi người dùng cuộn thêm. Màn hình sau khi nhảy còn một mảng xanh đen trống cao khoảng 200px phía trên tiêu đề (ảnh `anh/chuc-nang/tab-sau-bang-chon.png`). Gốc nghi: ngưỡng hiện thanh tab và `scroll-margin` của khối, tab khai ở `src/app/(public)/san-pham/[slug]/page.tsx:76`. Sửa: hạ ngưỡng hiện thanh hoặc cho thanh luôn hiện sau hero, bù `scroll-margin-top` đúng chiều cao thanh.

**P1-4. Gán sai tính năng cho sản phẩm.** Banner cảnh 3 trang chủ: "thùng chở thu cặn tiện lợi". Hồ sơ chỉ nói thu cặn tự động cho bể đáy phễu (dòng 24 và 212), không phải thùng chở. Tệp: `src/components/home/hero-slider.tsx:34`. Sửa: "Từ hồ cá Koi sân vườn đến trại nuôi RAS, bể đáy phễu thu cặn tự động. Thùng chở lắp vừa xe bán tải đến xe tải."

**P1-5. Cam kết thời gian "gọi lại trong 15 đến 60 phút giờ làm việc" sai nguồn và sai câu.** Hồ sơ nói báo giá trong 15 đến 60 phút (dòng 328 và 367), không nói gọi lại, và không có điều kiện "giờ làm việc". Câu "phút giờ làm việc" cũng sai ngữ pháp. Tệp: `src/components/inquiry-form.tsx:185`. Tương tự `src/app/(public)/hoi-dap/page.tsx:39` ("kỹ sư trả lời trong 15 – 60 phút"). Sửa: "Thành Lợi sẽ báo giá trong 15 đến 60 phút kể từ khi nhận đủ thông tin."

**P1-6. Giọng chữ còn khẩu ngữ hoặc câu lạ.**
- `src/app/(public)/gioi-thieu/page.tsx:88`: "thay bê tông xây gạch hay nứt thấm và kim loại hay gỉ sét" (chữ "hay" là khẩu ngữ, gây nhầm "hoặc").
- `src/app/(public)/san-pham/[slug]/page.tsx:176-177`: khối "Chưa có đủ thông tin. Mô tả cách sử dụng là đủ." đọc như báo lỗi, câu thứ hai khó hiểu. Chữ có "15 – 30 phút" là có nguồn (hồ sơ dòng 289), xem mục dữ kiện.
- `src/app/(public)/hoi-dap/page.tsx:38` "Chưa thấy câu trả lời"; `src/components/pages/catalogue-browser.tsx:38` "Nhờ kỹ sư chọn giúp".
- Hai câu hỏi trong bộ chọn quy mô: "Đàn của quý khách đang nuôi bao nhiêu?" và "Công trình của quý khách có bao nhiêu người dùng?" (câu hỏi tu từ trong luật vòng bốn). Sửa thành câu khẳng định, ví dụ "Chọn quy mô đàn".

**P1-7. Tiêu đề quá số dòng và còn từ lẻ ở 390.**
- Tiêu đề hơn hai dòng ở 390: H1 banner trang chủ 4 dòng, hai tiêu đề cảnh banner 3 dòng, tiêu đề thẻ dự án và bài 3 dòng, "Sản phẩm composite theo yêu cầu" 3 dòng ở trang hóa chất và xe gom rác.
- Dòng cuối một từ ở 390: "Chọn kiểu bể theo mục đích nuôi" (nuôi), "Chọn dung tích theo số người dùng" (dùng), "Số người dùng hoặc loại công trình", "Nhà máy sản xuất đặt tại Phú Thọ" (Thọ). Ở 600x360: "Mỗi sản phẩm được tính kết cấu theo công trình" (trình). Số đo: `anh/390/report-rm.json` trường `orphans`, ngưỡng dòng cuối nhỏ hơn 25% bề rộng dòng dài nhất.
- Ở 1366 không còn tiêu đề rớt từ lẻ (số đo ở `anh/1366/report-rm.json`), các tiêu đề đều một dòng trừ ba tiêu đề banner (P2).
- Gốc: không có `text-wrap`, không có `&nbsp;` (đã quét). Sửa bằng rút chữ hoặc chỉnh cỡ chữ tiêu đề ở 390.

**P1-8. Lề chữ lệch ở trang chính sách bảo mật.** Ở 1366 chữ trái 63, phải 211 (1920: trái 340, phải 488); `/hoi-dap` phải 109, `/lien-he` 92, `/huong-dan-dat-hang` 74, `/tin-tuc` 144 (cột chữ nằm lệch trái, trống bên phải). Lề ngoài của khung vẫn đều (63 và 63), nên đây là chữ dồn trái trong khung chứ không phải khung lệch. Số đo: `anh/<cỡ>/report-rm.json` trường `insets`, script `rm.mjs`. Gốc nghi: `src/app/(public)/chinh-sach-bao-mat/page.tsx` bố cục hai cột có cột phụ trống. Sửa: căn cột chữ giữa trục trang hoặc lấp cột phụ.

## Dữ kiện

Soát toàn bộ chữ của 17 trang công khai (`tat-ca-chu.txt`). Mọi con số (kể cả khoảng) đều có mặt trong `final-docx.txt` hoặc `site-facts.ts`, trừ ngày đăng của bài mẫu. Không có tên khách hàng, chứng nhận, thương hiệu lạ. Không có "100%", "tuyệt đối", "vĩnh viễn", "24/7" trên trang công khai.

- "15 – 30 phút" ở khối Zalo trang chi tiết sản phẩm: **có nguồn**, `final-docx.txt` dòng 289 ("kết bạn Zalo gửi bảng giá, ảnh thật và bản vẽ ngay trong 15–30 phút"). Nó không có trong `site-facts.ts`. Cần chú ý trang cùng lúc nói "báo giá 15 – 60 phút", người đọc dễ thấy hai con số khác nhau.
- Không tìm thấy nguồn: P0-1 (hạn, phạm vi, điều kiện bảo hành "trong hợp đồng", chi phí giao nhận trong hợp đồng, quy trình hỗ trợ bảo hành), P1-5 (gọi lại, giờ làm việc), P1-4.
- Ba nhóm chưa có ảnh thật (bể phốt và xử lý nước thải, bồn hóa chất, bể phốt composite): không gán ảnh. Trang chính của ba nhóm chỉ có hoa văn và thông số. Ảnh bể cá, thùng, thuyền ở khối "Sản phẩm liên quan" thuộc nhóm khác, đúng.
- Quét ký tự trên 19 trang ở 1366, 1920, 390, 600: không có dấu chấm giữa, gạch ngang dài, chấm phẩy, chấm than, `&nbsp;`, `text-wrap: balance` hoặc `pretty`, `<br>` giữa câu, `text-transform: uppercase`. Chữ in hoa cả cụm duy nhất là "THÀNH LỢI COMPOSITE" ở logo chữ (P2).

## Chuyển động (đo bằng Chrome, 1366x768)

- Morph: **có thật** trên cả ba đường. Thẻ sản phẩm sang chi tiết (`/san-pham` và trang chủ) và thẻ bài sang đầu bài: `document.startViewTransition` được gọi một lần, 16 đến 20 hoạt họa `::view-transition` đang chạy giữa chừng, ảnh bể trắng co dãn thành ảnh đầu trang chi tiết, tên "Bể biogas composite" trượt về vị trí tiêu đề (`anh/motion/morph-sp.png`, `morph-bai.png`). Một khung ở khoảng 110 ms gần như trắng trơn (P2). Không kiểm trình duyệt không hỗ trợ.
- Cuộn hết trang chủ (2400 px/s, 407 khung): nhảy bố cục tổng 0,0011 (rất thấp, nguồn là số đếm `tl-metric-num` đổi bề rộng), khung rớt trên 33 ms: 2 (lớn nhất 140 ms, một lần), trung vị 10 ms, không có tác vụ dài. Đạt.
- `prefers-reduced-motion` và tắt JavaScript: bốn trang kiểm (trang chủ, giới thiệu, chi tiết biogas, hướng dẫn đặt hàng). Số đếm hiện đủ (2010, 15, 100, 25, 10, 30), không có khối kẹt ẩn ngoài mục menu xổ (ẩn theo thiết kế). Ảnh tải lười chỉ thiếu trên ảnh toàn trang, đo opacity bằng cách cuộn thì đủ.
- Bàn phím: Tab 40 lần qua topbar, thanh menu, nút báo giá, banner (ba cảnh, trước, dừng, sau), thẻ ảnh; mọi phần tử đều có viền hoặc bóng tiêu điểm. Chưa kiểm biểu mẫu bằng bàn phím trọn bộ.

## Chức năng

- Biểu mẫu `/lien-he` (1366): để trống báo ba lỗi lời thường, nhập tên "Kiểm thử vòng bốn" rồi qua đủ bốn bước, gửi một lần (`POST /api/inquiries` 201). Đã xóa đúng dòng id `17a0bc22-...` trong `inquiries`.
- Menu điện thoại (390), hỏi đáp mở đóng, bộ chọn quy mô trang chi tiết: đạt. Bấm "30 – 50 con lợn" không đổi gì nhìn thấy ở khối bên cạnh (không có lỗi, chỉ không có phản hồi rõ; chưa xác nhận biểu mẫu cuối trang có nhận quy mô, chỉ thấy bước 3 của biểu mẫu chọn đúng khi tự chọn).
- Admin: đăng nhập tài khoản tạm, tám màn (tổng quan, bài viết, bài mới, sửa bài, sản phẩm, thư viện, yêu cầu, cài đặt) ở 1366 và 390: không tràn ngang, chữ nhỏ nhất 14px, không lỗi console, không ký tự cấm. Mục "Thư thông báo": "Đang bật. Mỗi yêu cầu báo giá mới sẽ gửi thư tới Jin***@gmail.com." đạt luật chữ. Không bấm "Gửi thư thử". Ảnh trong `anh/admin/`.
- Trang sản phẩm thấy "Yêu cầu tư vấn 1" ở admin, đúng với yêu cầu thử, đã xóa.

## P2 (trau chuốt, 13 mục)

1. Logo chữ "THÀNH LỢI COMPOSITE" in hoa cả cụm (biểu trưng, giữ theo thương hiệu, ghi để chủ dự án quyết).
2. Ba tiêu đề banner trang chủ ba dòng ở 1366 (luật là một dòng): `src/components/home/hero-slider.tsx`.
3. Số đếm của năm "2010" chạy qua 1918, 1943, 1981 trước khi dừng, nhìn như số sai; đổi bề rộng chữ làm CLS 0,001. Bỏ đếm với số năm.
4. Morph có một khung gần trắng trơn ở khoảng 110 ms (`anh/motion/sp-the-1-giua.png`).
5. "Giao hàng và lắp đặt toàn quốc, kể cả vùng đất trũng" (`huong-dan-dat-hang/page.tsx:80`) nói quá hồ sơ (hồ sơ chỉ hướng dẫn lắp ở vùng đất trũng).
6. Chính sách bảo mật có câu cam kết không có trong hồ sơ ("quý khách có thể yêu cầu điều chỉnh hoặc xóa", "không tích hợp công cụ quảng cáo hoặc theo dõi") trong khi trang có nhúng Google Maps. Nên duyệt với chủ doanh nghiệp (`chinh-sach-bao-mat/page.tsx:17`).
7. Xưng hô lệch: biểu mẫu báo lỗi "anh/chị" (`inquiry-form.tsx:37`, `:255`) trong khi cả trang dùng "quý khách".
8. Khối xanh chanh cỡ lớn (vòng tròn ở trang chi tiết và hướng dẫn đặt hàng) nổi hơn hoa văn đồng, gần lấn tiêu điểm.
9. Trang bài viết và dự án chỉ có một bài liên quan hiện ra như một thẻ lẻ cạnh vùng trống rộng (với kho 0 bài thật thì chưa chắc xảy ra).
10. Ở 600x360 thanh nút dưới cộng thanh trên chiếm khoảng 25% chiều cao, còn khoảng 270px nội dung.
11. Console có cảnh báo "preloaded but not used" cho hai tệp CSS ở hầu hết trang.
12. Ảnh khung phụ ở bài viết (ảnh đứng) cắt nhỏ trong khung vòm đầu bài, nhìn mất ngữ cảnh (kiểm bằng ảnh mẫu thử, chưa kiểm ảnh thật).
13. Builder chưa chạy `ui_audit.py --render --stress` và `wrap_check.py` như đề bài; nên bổ sung sau khi sửa P1-1.

## Dữ liệu cuối lượt

Bài 0, yêu cầu 0, ảnh 26, tài khoản 1 (số thật từ `count.ts`). Đầu lượt có hai bài mẫu và một tài khoản thử của phiên khác (dấu thời gian 15:38), cuối lượt không còn. Tài khoản và bài mẫu của tôi đã xóa, dòng yêu cầu thử đã xóa đúng id.

## Chưa kiểm được

- Safari, Firefox, điện thoại cảm ứng thật, trình đọc màn hình.
- Chưa đo độ tương phản chữ trên ảnh bằng script (chỉ xem bằng mắt các khung nhìn); chưa chạy `contrast.py`.
- Chưa đo khung hình và CLS ở 390 và 600; chưa kiểm GSAP nền đổi theo cuộn bằng đo, chỉ qua khung hình.
- Morph quay về danh sách, nút Quay lại của trình duyệt, trình duyệt không hỗ trợ view transition.
- Chưa kiểm ảnh trong khung có cắt mất sản phẩm ở mọi khung, chỉ lấy mẫu.
- Chưa kiểm bàn phím trọn bộ cho biểu mẫu và hộp ảnh phóng to.
- Chưa bấm "Gửi thư thử" (theo yêu cầu).
- Chỉ kiểm bản dev (chưa kiểm bản dựng sản xuất).
