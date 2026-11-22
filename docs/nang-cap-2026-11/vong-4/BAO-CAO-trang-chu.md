# Báo cáo trang chủ và khung chung, vòng bốn (22/11/2026)

Ảnh ở `docs/nang-cap-2026-11/vong-4/trang-chu/`: `home-<1366|390|600>-dau.png`, `home-<...>-toan-trang.png`, `khung-nhin-1366-00..13.png`, `thu-nho-toan-trang-1366.png`, `thu-nho-toan-trang-390.png`, `khong-js-1366.png`, `do-le.json`, `report.json`.

## Đã đổi gì theo từng khối
Nhịp nền: tối (banner) rồi sáng (giới thiệu, sản phẩm, dải ảnh) rồi tối (lý do, quy trình) rồi sáng (hỏi đáp, tin, báo giá) rồi tối (chân trang). Mối nối: cung (banner sang giới thiệu, báo giá sang chân trang), vòm (sản phẩm sang lý do), sóng (quy trình sang hỏi đáp), mờ dần (ảnh nền lý do tan xuống quy trình, ảnh nền báo giá hiện từ mép trên). Ảnh thu nhỏ toàn trang không còn dải chữ nhật nào có mép ngang thẳng. Ảnh nền thật: `ket-cau-be-mat` trải suốt cụm lý do và cụm bảng so sánh trong cùng một khối, ảnh giao hàng làm nền khối báo giá.

- **Layout công khai**: gắn `FlowBackdrop` và `ScrollFx` (trang phụ dùng được).
- **Banner**: ba cảnh ảnh thật giữ nguyên, bố cục lại: cột chữ lề đều bên trái, ảnh trong khung theo dáng sản phẩm bên phải (cảnh 1 cạnh vát, cảnh 2 vòm, cảnh 3 cạnh vát ngược), viền đồng lệch, hoa văn gợn nước phía sau, thẻ số liệu đè góc (cụm chồng ba lớp). Nền vải sợi cộng sóng nhựa. Đáy cong. Nút đổi cảnh và chấm cảnh nằm trong dòng chảy, không còn đè lên hàng nút. 600x360: chỉ giữ tiêu đề, nút "Nhận báo giá", "Xem ...", chấm cảnh và nút dừng.
- **Giới thiệu và số liệu**: ảnh xưởng trong khung vòm, trống đồng mờ phía sau (lần 1), số 2010 đè góc (cụm chồng 2). Năm số liệu không hộp, đường kẻ mảnh, số đếm một lần bằng `data-count` (chữ ban đầu đã là số cuối).
- **Lý do và so sánh**: nền ảnh thật, ảnh bể tròn trong khung tròn có vành, số 10 năm đè góc (cụm chồng 3), bốn lý do thành danh sách đường kẻ (bỏ lưới thẻ). Bảng so sánh bỏ khung hộp: đường kẻ ngang, cột Thành Lợi là một tấm bo cong liền mạch. Điện thoại: danh sách ưu điểm của Thành Lợi và nút mở so sánh đầy đủ.
- **Sản phẩm**: ba nhóm mũi nhọn là ba tiêu điểm so le: bể biogas trong khung vòm (ảnh thật), bể phốt và nước thải trong khung vành khuyên (hoa văn sóng nhựa và gợn nước, thông số "Từ 1 m³" nằm giữa lỗ vành, không gán ảnh), bể cá và thủy sản trong khung tròn. Bốn nhóm còn lại dùng cạnh vát và viên nang, so le nhẹ. Bồn hóa chất dùng hoa văn cộng hình vẽ nét cộng thông số, không gán ảnh. Mọi ảnh và tên sản phẩm có morph: `morphName('product-photo', slug)` và `morphName('product-title', slug)` (slug nhóm, trùng với đường dẫn thẻ trỏ tới). Điện thoại: ba nhóm mũi nhọn thành dải cuộn ngang có chấm chỉ vị trí.
- **Dải ảnh thật**: tràn hai mép, mỗi ảnh một dáng khung (cạnh vát, viên nang, vòm, cạnh vát ngược), mở hộp xem lớn như cũ.
- **Quy trình**: một đường lượn nối năm nút số, vẽ dần theo cuộn bằng `data-draw` (từng đoạn riêng ở điện thoại). Không còn thẻ.
- **Hỏi đáp**: danh sách đường kẻ, mở đóng có chuyển cảnh, tiêu điểm và bàn phím như cũ.
- **Tin tức**: thẻ `PostCard` dùng chung (agent bài viết lo morph `post-cover`, `post-title` trong tệp đó), bọc FlowSection.
- **Báo giá**: ảnh giao hàng qua ba ô vòm, thẻ chữ đè góc, nền ảnh thật mờ, biểu mẫu giữ nguyên luồng, sau lưng có hoa văn gợn nước ló ra.
- **Chân trang**: là một FlowSection tối nối bằng mép cung, nền vải sợi cộng sóng nhựa, trống đồng mờ (lần 2), bản đồ khung vòm. Trang chủ: chân trang kéo lên đè đáy khối báo giá. Trang khác: không kéo lên (`margin-top:0`), góc cung lộ nền chung.
- **Thanh trên và menu**: thanh menu nền giấy hơi trong suốt có làm mờ nhẹ, vạch trượt dưới mục đang chọn (chỉ `transform`, 460 ms, tắt khi giảm chuyển động), không trượt ở lần vẽ đầu.

Đếm: dáng khung trên trang chủ: vòm, tròn, vành khuyên, viên nang, cạnh vát, cạnh vát ngược, ba ô vòm (bảy dáng). Cụm chồng lớp: bốn (banner, giới thiệu, lý do, báo giá). Trống đồng: hai (giới thiệu, chân trang).

## Bảng chữ cũ, chữ mới, dòng nguồn (`final-docx.txt`)
| Chữ cũ | Chữ mới | Nguồn |
|---|---|---|
| Giải pháp composite bền vững cho môi trường và sản xuất | Thành Lợi chế tạo composite bền vững cho môi trường và các ngành sản xuất | Mục 2.1, Slide 1 |
| Bể biogas, bể phốt, ... Chống ăn mòn, không gỉ. | ... đều chống ăn mòn và không gỉ. | Mục 2.1, Slide 1 |
| Bể liền khối, kín khí, lắp đặt trong 1 đến 2 ngày | Bể biogas và bể phốt đúc liền khối, kín khí, lắp đặt trong một đến hai ngày | Mục 2.1 Slide 2, bảng 2.4 (1–2 ngày) |
| Xử lý chất thải cho nông hộ, trang trại, ... | Giải pháp xử lý chất thải cho nông hộ, trang trại, nhà ở, nhà trọ, khách sạn và khu công nghiệp. | Mục 2.1, Slide 2 |
| Thùng chở hải sản sống, bể nuôi thủy sản và hồ cá Koi | Bể nuôi thủy sản và thùng chở hải sản sống có bề mặt láng bóng, dễ vệ sinh | Mục 2.1, Slide 3 |
| Bề mặt gelcoat láng bóng, ... Lắp vừa xe bán tải đến xe tải. | Từ hồ cá Koi sân vườn đến trại nuôi RAS, thùng chở thu cặn tiện lợi và lắp vừa xe bán tải đến xe tải. | Mục 2.1 Slide 3, mục 2.5 dòng 5 |
| Về Thành Lợi Composite | Composite khắc phục điểm yếu của gạch và kim loại | Mục 3.1 (khắc phục nhược điểm nứt vỡ, thấm rò của bê tông xây gạch, gỉ sét của kim loại) |
| Chúng tôi thiết kế, sản xuất và cung cấp trọn gói ... | Từ năm 2010, nhà máy tại Phú Thọ thiết kế, sản xuất và cung cấp trọn gói sản phẩm nhựa cốt sợi thủy tinh cho chăn nuôi, ... công nghiệp hóa chất. Mỗi sản phẩm được kỹ sư tính kết cấu, chọn dòng nhựa nền phù hợp và kiểm định độ kín trước khi bàn giao. | Mục 2.3 |
| Vì sao chọn Thành Lợi | Bể đúc liền khối bền hơn bể xây và bồn kim loại | Bảng 2.4, FAQ 1 (bền hơn bể xây xi măng) |
| (ẩn) Sản phẩm chủ lực | Mỗi sản phẩm được tính kết cấu theo công trình | Mục 3.1 (khảo sát, tính độ dày kết cấu theo từng khách hàng) |
| Chưa cần bản vẽ, chỉ cần nói nhu cầu. | Kỹ sư chốt phương án từ nhu cầu sử dụng thực tế | Mục 2.6 bước 2 |
| Bước 2 "Kỹ sư dựa trên ... tiết kiệm." (giữ) và bước 3 "trong 1–24 giờ" | "trong một đến 24 giờ" (bỏ gạch nối khoảng số để khỏi ngắt dòng giữa số) | Mục 2.6 bước 3 |
| Câu hỏi thường gặp | Những điều quý khách thường hỏi trước khi đặt bể | Mục 4.10 |
| Chưa thấy câu bạn cần? Gọi hotline để hỏi kỹ sư. | Cần hỏi thêm, quý khách có thể gọi trực tiếp cho kỹ sư. | Mục 2.6 bước 1, hotline |
| Nhận báo giá nhanh | Gửi nhu cầu, kỹ sư báo giá trong 15 đến 60 phút | FAQ 5 (báo giá trong 15–60 phút) |
| Báo giá trong 15 đến 60 phút khi đủ thông tin (điểm thứ nhất) | bỏ vì đã nằm trong tiêu đề | FAQ 5 |
| Hỗ trợ vận chuyển và lắp đặt toàn quốc | Vận chuyển và lắp đặt tận nơi trên toàn quốc. Thẻ đè góc: Mẫu bể tiêu chuẩn giao trong khoảng 2 đến 3 ngày | FAQ 5, mục 2.4 |
| Ba nhóm: tên "Bể phốt, nước thải" và mô tả "... Chống thấm." | giữ tên, bỏ câu cụt "Chống thấm." | Mục 2.5 dòng 2 |
| Bể cá Koi và bể nuôi thủy sản | Bể cá Koi và thủy sản | Mục 1 (nhóm 3) |
| Gia công theo bản vẽ hoặc ý tưởng: bể bơi, ... | ... theo bản vẽ hoặc ý tưởng, gồm bể bơi, tháp xử lý khí, vỏ thiết bị và bọc phủ chống thấm. | Mục 2.5 dòng 7 |
| Thẻ số liệu banner (mới) | 15+ năm sản xuất composite FRP; 1 đến 2 ngày lắp đặt; 500 kg đến 15 tấn thùng lắp vừa xe | Mục 2.2, 2.4, 2.5 |
Số liệu, bốn lý do, bảng so sánh, tên bước quy trình, câu hỏi và trả lời giữ nguyên chữ từ `site-facts.ts` (không sửa tệp đó). Không có số, khách hàng, chứng nhận mới. Xưng "Thành Lợi" và "quý khách" xuyên suốt.

## Số đo lề (script `scripts/home-margins.mjs`, toạ độ thật của từng nút chữ, kết quả `do-le.json`)
| Bề rộng | Cột chữ đo | Lệch trái phải lớn nhất | Dòng chữ lòi ra ngoài cột | Lệch tâm khối căn giữa so với trục khung nhìn | Lệch tâm dòng so với tâm khối | Dòng cuối một từ | scrollWidth |
|---|---|---|---|---|---|---|---|
| 1366 | 11 | 0 px | 0 | 0 px | 0,51 px | 0 | 1366 |
| 768 | 11 | 0 px | 0 | 0 px | 0,01 px | 0 | 768 |
| 390 | 11 | 0 px | 0 | 0 px | 0,01 px | 0 | 390 |
Dải ảnh cuộn ngang và dải ba nhóm chủ lực ở điện thoại được loại khỏi phép đo "lòi ra ngoài cột" vì cố ý cuộn ngang. Lưu ý trung thực: số dòng cuối một từ chỉ đảm bảo ở các bề rộng đã đo (1366, 768, 390) và ở ba cảnh banner ở 1366, 768, 390 (`scripts/home-hero-check.mjs`). Để đạt vậy đã chỉnh `max-width` theo ký tự ở vài đoạn (mô tả banner ở điện thoại, lý do, bước quy trình, ưu điểm ở điện thoại). Bề rộng khác có thể rớt từ lẻ. Phép đo bỏ qua chữ của các bài mẫu tin tức do agent khác tạo.

## Skill và script đã chạy
- Skill đã gọi: `anthropic-skills:thiet-ke-ux-ui` (đọc `web.md`, `motion.md`, `text-fit.md` ở mức mở đầu: một dòng, chuyển động có nghĩa, cấm NBSP, balance, pretty), `anthropic-skills:impeccable` (không chạy `context.mjs` vì dự án có sẵn PRODUCT.md, DESIGN.md và đề bài đã chốt hướng), `anthropic-skills:design-taste-frontend` (chống lưới thẻ giống nhau, không số thứ tự, không tia sáng, nhịp tối sáng có chủ đích). Không gọi được `high-end-visual-design`.
- `ui_audit.py` chạy với địa chỉ trang: ra "ĐẠT" ở phần kiểm tĩnh nhưng phần `--render --stress` KHÔNG kiểm được vì máy thiếu Python playwright (không cài thêm theo luật). Thay bằng Playwright Node (channel chrome): `scripts/home-shots.mjs`, `home-margins.mjs`, `home-hero-check.mjs`, `home-flow-check.mjs`.
- `contrast.py`: chữ trắng, chữ nhạt xanh, chữ lime trên nền xanh đen 082B3E (11,7 đến 14,7), trên nền ảnh phủ trường hợp xấu 15496A (7,76 đến 9,58), trên cột Thành Lợi 24484D (8,1 đến 10), chữ 113D4C và xanh lục trên nền giấy (10,8 và 5,33), chữ trắng trên nút cam (5,21). Đều đạt 4,5:1. Màu nền ảnh là ước lượng trường hợp xấu, chưa lấy mẫu từng điểm ảnh thật.
- `wrap_check.py`: không chạy (cần tệp font), thay bằng đo dòng cuối trên trình duyệt thật như bảng trên.

## Đã kiểm
- `npx tsc --noEmit` sạch. `npm test`: 48 đạt, 0 lỗi.
- Playwright Chrome: 1366x768, 390x844, 600x360, cả màn đầu và toàn trang, thêm 14 khung nhìn cuộn ở 1366. Đã tự mở và xem ảnh, ba vòng sửa: (1) tiêu đề banner rớt từ "xuất" và đè kích thước vì `.public-site h1` thắng `.tl-hero-title`, sửa bằng độ ưu tiên; (2) ảnh vòm sản phẩm biến mất do trùng id clipPath với khung trong cảnh banner đang ẩn (xem phần decor); (3) ảnh nền lý do 404 (tệp 1280 không tồn tại), chấm chỉ vị trí dải cuộn không hiện, thẻ chữ báo giá đè tiêu đề ở điện thoại, chữ căn trái trong khối căn giữa, bảng so sánh rớt chữ.
- Không lỗi console, không ảnh vỡ, không tràn ngang ở cả ba cỡ (`report.json`).
- Banner: ba cảnh ở 1366, 768, 390, 600x360: tiêu đề và nút "Nhận báo giá" nằm trọn trong khung nhìn (nút cao 57 px, 47 px ở 600x360).
- Bấm thẻ bể biogas sang `/san-pham/be-biogas-composite` rồi lùi: không lỗi, trang chủ dựng lại đủ. Không đo morph thật.
- Giảm chuyển động: 0 khối kẹt mờ, số đếm hiện đúng số cuối. Tắt JavaScript: tiêu đề banner hiện, 0 khối kẹt, số đúng (`khong-js-1366.png`).
- Tiêu điểm bàn phím thấy rõ (viền 3 px) ở 14 điểm Tab đầu. Vùng bấm: 1366 và 390 không phần tử dưới 36 và 44 px sau khi sửa liên kết liên hệ và danh sách ở chân trang (chạy lại ở 600 rộng chỉ còn ở lần đo trước khi sửa, chưa đo lại).
- Các trang phụ `/gioi-thieu`, `/lien-he` vẫn dựng được với layout mới, console sạch (chỉ xem phần chân trang).

## Chưa kiểm
- Morph chuyển trang thật giữa thẻ và đầu trang chi tiết (tên `view-transition-name` do React gắn lúc chuyển nên không thấy tĩnh), cần agent trang phụ gắn cùng tên rồi thử bằng mắt.
- Độ mượt cuộn, số khung hình, nhảy bố cục khi cuộn hết trang ở 1366 (chưa đo bằng Layout Shift). Chưa thử Safari và Firefox. Chưa thử cuộn bằng thiết bị cảm ứng thật.
- `ui_audit.py --render --stress` và `wrap_check.py` (xem trên). Tương phản trên nền ảnh chỉ đo bằng màu ước lượng.
- Tắt mở menu và ngăn kéo sau khi đổi giao diện thanh trên chỉ xem bằng ảnh, chưa chạy lại luồng bàn phím của ngăn kéo.
- Dữ liệu thử: không tạo bài hay tài khoản nào trong lượt này (script chụp dùng trang thật, không ghi dữ liệu).
- Bài tin tức trên trang chủ chỉ có bài mẫu của agent khác trong lúc chụp, thẻ tin tức chưa chỉnh dáng khung (PostCard của agent bài viết).

## Thay đổi trong `decor/` (tương thích ngược)
- `shape-frame.css`: `.tl-sf__defs{visibility:visible}`. Hai khung cùng dáng và tỉ lệ dùng chung `id` clipPath. Nếu khung đầu nằm trong khối `visibility:hidden` (cảnh banner chưa hiện) thì cả trang cắt hết ảnh của các khung còn lại. Không đổi prop. Đã ghi vào `README.md` của decor, kèm lưu ý dùng `FlowSection as="footer"` và `.tl-wrap`.
- Không sửa `flow-section`, `stack`, `scroll-fx`, `flow-backdrop`, `pattern`.

## Tệp đã sửa hoặc tạo
`src/app/(public)/page.tsx`, `layout.tsx`, `home.css`, `chrome.css`; `src/components/home/sections.tsx`, `hero-slider.tsx`, `metrics-strip.tsx`, `photo-strip.tsx`, `images.ts` (bỏ cỡ 1280 không có tệp của ảnh kết cấu bề mặt); `src/components/site-header.tsx`, `site-header.css`, `site-footer.tsx`; `src/components/decor/shape-frame.css`, `README.md`. Script: `scripts/home-shots.mjs`, `home-margins.mjs`, `home-hero-check.mjs`, `home-flow-check.mjs`. Không sửa `site-facts.ts`, `footer-map.tsx`, `contact-shortcuts.tsx`, `inquiry-form.css` (không cần).

## Đề nghị cho người điều phối
- Hoa văn mới: không cần thêm. Nếu muốn khối lý do và khối quy trình khác nhau hơn, có thể sinh thêm một ảnh nền xưởng thật đồng tông (ảnh nền lý do hiện là ảnh bề mặt bể, ít thấy hơn khi phủ).
- Agent trang phụ cần gắn đúng `morphName('product-photo', slug)` và `morphName('product-title', slug)` với slug nhóm trùng đường dẫn thẻ (`be-biogas-composite`, `be-phot-va-xu-ly-nuoc-thai`, `be-nuoi-trong-thuy-san`, `bon-chua-hoa-chat`, `thung-cho-tom-ca`, `xe-gom-rac`, `composite-theo-yeu-cau`).

## Vòng sửa theo kiểm viên độc lập (22/11/2026)
Phạm vi: trang chủ, thanh trên, chân trang, biểu mẫu báo giá (chỉ chữ), `decor/`, `motion.css`. Các mục thuộc trang phụ (P0-1, P1-1 đến P1-3, P1-6, P1-8, P2 trang phụ) không đụng.

| Mục | Kết quả |
|---|---|
| 1. Banner gán sai tính năng | Đã sửa, soát từng câu so với `final-docx.txt` mục 2.1, 2.2, 2.4, 2.5. Cảnh 3 giờ: tiêu đề "Bể nuôi thủy sản đáy phễu, hồ cá Koi và thùng chở hải sản sống" (đúng tên Slide 3), mô tả "Bể đáy phễu thu cặn tự động, bề mặt láng bóng dễ vệ sinh, quy mô từ sân vườn gia đình đến trại nuôi RAS. Thùng chở lắp vừa xe bán tải đến xe tải." Cảnh 1 tiêu đề đổi thành "Composite bền vững cho môi trường và sản xuất, chế tạo tại Phú Thọ" (nhà máy Phú Thọ, mục 2.3). Cảnh 2 bỏ chữ "đúc". Ba thẻ số liệu (15+ năm, 1 đến 2 ngày, 500 kg đến 15 tấn) có nguồn 2.2, 2.4, 2.5. |
| 2. Câu gọi lại sai nguồn | Đã sửa `inquiry-form.tsx`: "Thành Lợi sẽ báo giá trong 15 đến 60 phút kể từ khi nhận đủ thông tin." Đổi luôn ba chỗ "anh/chị" thành "quý khách" (P2-7). Không đổi luồng. |
| 3. Dòng tiêu đề và từ lẻ ở 390 và 600x360 | 390: tiêu đề banner 3 dòng (cả ba cảnh), 6 tiêu đề khối đều 2 dòng, 0 dòng cuối một từ. 600x360: tiêu đề khối 2 dòng, 0 tiêu đề rớt từ lẻ (thêm `max-width:26ch` ở 481 đến 900 px), tiêu đề banner 3 dòng. Banner 600x360 hiện lại ảnh: khung nhỏ bên phải (cao khoảng 44% chiều cao khung nhìn), tiêu đề và nút "Nhận báo giá" vẫn trong màn đầu (`home-600-dau.png`). Còn 5 đoạn văn thường (không phải tiêu đề) rớt từ lẻ ở bề rộng 600 (mô tả giới thiệu, hai nhãn số liệu, mô tả thùng rác, câu mời gọi hỏi đáp): chưa sửa, vì luật yêu cầu chỉ với tiêu đề. |
| 4. Khung morph gần trắng | Gốc: trang cũ mờ về 0 trong 150 ms khi trang mới còn trong suốt đến 90 ms, và cả hai lớp trộn `plus-lighter` nên lộ nền giấy của lớp nền cố định. Đã sửa `motion.css`: trang cũ giữ đục tới khi trang mới phủ (410 ms), trộn `normal`, nền `::view-transition` xanh đen. Đo bằng CDP screencast (`scripts/home-vt-frames.mjs`, trang chủ sang chi tiết, 136 khung): 0 khung trắng trơn (ngưỡng hơn 92% điểm gần trắng), khung sáng nhất là trang cũ (54% điểm sáng, đúng nền giấy của trang chủ). Giới hạn: screencast không chụp được hoạt họa morph từng nhịp, chưa so được "trước và sau" bằng cùng một phép đo. |
| 5. Khung rớt khi cuộn | Chưa tái hiện đủ để khẳng định đã sửa. Số đo mới (`scripts/home-scroll-perf.mjs`, 1366x768, 2400 px/s): ảnh đã nguội, 3 lần: 0 khung rớt trên 33 ms, lớn nhất 30 ms, trung vị 10 ms. Nguội hoàn toàn (không đợi), 4 lần: 0 đến 3 khung rớt, lớn nhất 240 ms, đều ở 130 đến 820 px đầu trang trong lúc tải (bản dev nạp chunk GSAP). Giảm CPU 4 lần: 6 đến 13 khung rớt, lớn nhất 300 đến 350 ms, rải ở 2000 đến 3700 px (khối sản phẩm và lý do). Đã thử loại trừ riêng từng thứ: trộn màu, mặt nạ nền, `will-change`, ảnh nền, dải ảnh, chân trang, parallax, nền cố định, hoa văn, làm mờ thanh menu, nút ghim, `clip-path` khung, giải mã ảnh trước (mỗi lần số rớt không giảm đáng kể). Chưa tìm ra gốc, nghi chi phí của bản dev; cần đo lại trên bản dựng sản xuất. Không sửa mã vì chưa có thủ phạm. |
| 6a. Chân trang nối với khối đứng trước | Đã sửa `chrome.css`: góc cung của chân trang tô màu của FlowSection cuối `main` qua `--fs-join` (tối `#082b3e`, ảnh `#0a2a3a`, sáng nền giấy), không còn nêm trắng và không cần số cứng 140px. Kiểm: `/gioi-thieu`, `/lien-he`, `/hoi-dap`, `/san-pham`, `/chinh-sach-bao-mat` nhận màu tối, `/tin-tuc` nhận màu giấy; xem ảnh `/san-pham` không còn nêm trắng. Khối `.art::after` ở `article/list.css` giờ thừa (agent bài viết tự bỏ). |
| 6b. Thuộc tính chung ẩn lời kêu gọi | Đã thêm `[data-has-cta]` vào bộ chọn ẩn dải kêu gọi chân trang, giữ nguyên bốn lớp cũ. Ghi vào `decor/README.md`. |
| P2-3 số năm 2010 chạy qua 1918, 1943 | Đã sửa: năm là chữ tĩnh, không đếm. |
| P2-2 tiêu đề banner ba dòng ở 1366 | Giữ ba dòng (luật vòng này cho tối đa ba), không rớt từ lẻ ở ba cảnh. |
| P2-10 thanh nút dưới ở 600x360 | Không đổi (thanh ghim có sẵn, thuộc khung chung đã duyệt). |

Đã chạy lại: `npx tsc --noEmit` sạch, `npm test` 48 đạt, chụp lại 1366, 390, 600x360 (không ảnh vỡ, không lỗi console, `scrollWidth` bằng bề rộng khung), lề chữ trái phải lệch 0 px ở 1366, 768, 390, 600. Script mới: `scripts/home-scroll-perf.mjs`, `scripts/home-vt-frames.mjs`.
