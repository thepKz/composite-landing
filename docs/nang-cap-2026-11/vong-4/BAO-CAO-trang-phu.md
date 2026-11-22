# Báo cáo vòng bốn: vùng trang-phu (22/11/2026)

Bản đo: http://127.0.0.1:3002 (dev). Không bật tắt máy chủ, không build, không cài gói, không đọc `.env`, không commit. Ảnh ở `docs/nang-cap-2026-11/vong-4/trang-phu/` (`lan4` là lượt đủ 15 trang x 3 cỡ x màn đầu và toàn trang; `lan5` chụp lại khung 600x360 sau khi sửa).

## Skill đã gọi, luật đã áp
- `anthropic-skills:thiet-ke-ux-ui` (mục 0, text-fit, web): tiêu đề một dòng ở 1366, tối đa hai dòng ở 390, không NBSP, không `text-wrap`, không chữ xám để hạ cấp, viết rồi đo rồi sửa (ba vòng chụp, tự xem từng ảnh).
- `anthropic-skills:impeccable` (bolder, animate, polish): bỏ lưới thẻ đều nhau, mỗi trang một nhịp riêng, chuyển động chỉ `transform` và `opacity`, có bản giảm chuyển động.
- `anthropic-skills:design-taste-frontend`: đa dạng bố cục (không lặp một khuôn quá hai lần), không viền một bên, không số thứ tự làm nhãn trừ khi là quy trình thật, kiểm tương phản nút, nút một dòng.
- `anthropic-skills:high-end-visual-design`: chưa gọi.
- Script đã chạy: `contrast.py` (`trang-phu/contrast.txt`, mọi cặp màu mới từ 5,21 đến 14,73), `ui_audit.py --code` trên toàn vùng (`ui-audit-code.txt`: 0 chặn, 0 cần sửa, 1 xem lại là mã cũ nghe cuộn trong `scale-picker.tsx`). `ui_audit.py --render --stress`: KHÔNG chạy được, máy thiếu gói Python playwright (đề không cho cài). Thay bằng ba script Playwright của tôi bên dưới.

## Đã đổi gì, theo từng trang
Chung: mọi khối là `FlowSection` liền kề (mép `dome`, `arc`, `wave`, `fade`), không còn mép ngang thẳng giữa hai nền. Đầu trang mới `src/components/pages/flow-hero.tsx` (sóng nhựa `resin` + gợn nước, tiêu đề một dòng trải hết cột, cụm hình chồng lớp bên dưới kéo tràn qua mép dome), lời kêu gọi cuối `flow-cta.tsx` (cùng màu chân trang, ẩn dải kêu gọi chân trang). Toàn bộ kiểu mới ở `src/components/pages/pages-v4.css`. `page-hero.tsx`, `cta-band.tsx` giữ nguyên vì trang Dự án (vùng khác) còn dùng.

| Trang | Dáng khung | Chồng lớp, hoa văn | Bố cục đổi |
|---|---|---|---|
| Giới thiệu | vòm (đầu trang), vát (câu chuyện), tròn và vành khuyên (nhà máy), cửa sổ luân phiên vòm, vát, tròn, vát ngược, viên nang (dải ảnh) | số 2010 nửa trong nửa ngoài vòm, ảnh tròn đè góc ảnh vát, trống đồng hai lần, gợn nước | dải số liệu không hộp có đường sóng vẽ dần, năm khu nhà máy là đường uốn lượn so le, bốn bước kiểm tra là bậc thang, lĩnh vực là viên thuốc |
| Chi tiết sản phẩm | vòm, tròn, vát, vát ngược, viên nang theo từng sản phẩm; ba ô vòm ở phần cấu tạo | thẻ "10 năm" đè góc, gợn nước sau khung, ảnh nhỏ tròn làm hình xem trước | bảng dung tích là hàng viên thuốc, chọn quy mô là viên thuốc, hàng đặt hàng nối bằng đường chấm, thẻ phụ vòm đỉnh, biểu mẫu bo bất đối xứng |
| Danh sách sản phẩm | viên nang (đầu trang), thẻ xoay vòm, vát, tròn, vát ngược, viên nang | số "7" đè góc | thẻ không hộp, bento giữ nhưng ảnh trong khung có viền đồng lệch |
| Nhóm bể phốt | viên nang chứa hình vẽ nét (không ảnh) | số "1 – 100+ m³" đè góc | dòng liên kết viên thuốc |
| Liên hệ | vát (đầu trang), viên nang và vòm (bản đồ, hai bản theo bề ngang) | số "15 – 60 phút" đè góc | hotline trong khối bo một góc lớn, biểu mẫu bo bất đối xứng |
| Hướng dẫn đặt hàng | vòm, vát | số "5 bước" đè góc | năm bước trên một đường sóng vẽ dần, ba mốc thời gian không hộp |
| Bảo hành | tròn | số "10 năm" đè góc | bốn điểm so le hai cột |
| Bảo mật | vòm chứa biểu tượng | gợn nước | mục lục viên thuốc dính, bốn mục chia đường kẻ |
| Hỏi đáp | tròn | gợn nước | khối phụ dạng vòm đỉnh |
| 404 | huy hiệu trống đồng sau số 404 (một lần) | gợn nước, sóng nhựa | lối về ngay màn đầu, ba sản phẩm gợi ý |

Ba nhóm chưa có ảnh (bể phốt, xử lý nước thải, bồn hóa chất) vẫn không gán ảnh: dùng khung chứa hình vẽ nét, số liệu lớn, hoa văn sóng nhựa.

Chuyển động: `data-parallax` (ảnh trong khung), `data-depth` (lớp nổi, đã đo có transform ở trang Giới thiệu), `data-draw` (đường sóng số liệu, đường nhà máy, đường năm bước), `data-count` (15, 100, 25, 10, 30, 2010, 10 năm, 5, 7). Dùng `ScrollFx` đã gắn ở layout công khai (đã thấy có mặt lúc kiểm).

## Bảng chữ (cũ, mới, dòng nguồn trong `final-docx.txt`)
| Trang | Chữ cũ | Chữ mới | Nguồn |
|---|---|---|---|
| Giới thiệu | Về Thành Lợi | Không nứt như bê tông, không gỉ như kim loại | dòng 106, 74 và bảng 2.4 (nứt ngầm của bê tông, rỉ sét của kim loại) |
| Giới thiệu | Đi tìm vật liệu không nứt, không thấm, không gỉ | Mỗi bể đều qua khảo sát thực tế trước khi sản xuất | dòng 108 |
| Giới thiệu | (không có) | Từ năm 2010, Thành Lợi chế tạo bể và bồn composite FRP tại Phú Thọ, mỗi sản phẩm qua khảo sát thực tế và kiểm định độ kín | dòng 42, 108, 120 |
| Giới thiệu | (chú thích ẩn) Ảnh xưởng và công trình | Thành phẩm từ xưởng Phú Thọ đến chân công trình | dòng 120 (nghiệm thu tại chân công trình) |
| Giới thiệu | Tầm nhìn, Sứ mệnh (hai tiêu đề mục) | Mỗi thiết bị hướng tới độ bền trên 30 năm | dòng 111 |
| Giới thiệu | Nhà máy phân khu rõ ràng | Năm khu chức năng, từ khuôn mẫu đến kiểm định | dòng 118 |
| Giới thiệu | Chất lượng qua bốn bước | Bốn bước kiểm tra chất lượng | dòng 120 |
| Giới thiệu | Lĩnh vực phục vụ | Một vật liệu cho chăn nuôi, thủy sản và môi trường | dòng 42 |
| Sản phẩm | Sản phẩm composite | Bảy nhóm sản phẩm làm từ composite FRP | dòng 8 (bảy nhóm), 42 |
| Sản phẩm | (không có) | Bể biogas, bể phốt và xử lý nước thải, bể nuôi trồng thủy sản là ba dòng mũi nhọn của Thành Lợi | dòng 8 đến 12 |
| Nhóm bể phốt | Bể phốt và bể xử lý nước thải | Chọn bể phốt và bể xử lý theo số người dùng | dòng 85 và bảng quy mô mục 4.9 |
| Nhóm bể phốt | (không có) | Dung tích bắt đầu từ 1 m³ cho gia đình ba đến sáu người và mở rộng theo quy mô công trình | dòng 85 |
| Chi tiết | Thông tin cần cung cấp khi đặt hàng | Kỹ sư lập phương án dựa trên những thông tin sau | dòng 99, 165 |
| Chi tiết | Đàn của bạn đang nuôi bao nhiêu? (và hai câu "bạn" khác) | Đàn của quý khách đang nuôi bao nhiêu? | đổi xưng hô một cách cho cả trang |
| Liên hệ | Liên hệ và báo giá | Kỹ sư Thành Lợi báo giá trong 15 – 60 phút | dòng 328 |
| Liên hệ | (không có) | Gửi quy mô sử dụng hoặc kích thước bể, kỹ sư tư vấn dung tích kèm báo giá | dòng 367 |
| Liên hệ | (ẩn) Vị trí nhà máy | Nhà máy sản xuất đặt tại Phú Thọ | dòng 106, 118 |
| Hướng dẫn | Hướng dẫn đặt hàng | Từ nhu cầu sử dụng đến bảo hành qua năm bước | dòng 98 đến 102 |
| Hướng dẫn | (không có) | Quý khách chọn quy mô, kỹ sư tư vấn dung tích, hai bên thống nhất báo giá, rồi nhà máy sản xuất và lắp đặt | dòng 98 đến 102 |
| Hướng dẫn | Thông tin cần có | Mỗi dòng sản phẩm cần một bộ thông tin riêng | dòng 165 và các mục 4.2 đến 4.8 |
| Hướng dẫn | Vận chuyển và lắp đặt | Giao hàng và lắp đặt toàn quốc, kể cả vùng đất trũng | dòng 327, 328 |
| Hướng dẫn | Bước 2 (câu dài) | Kỹ sư chốt phương án theo số vật nuôi, số người dùng hoặc mặt bằng | dòng 99 |
| Bảo hành | Chính sách bảo hành | Bảo hành đến 10 năm, ghi rõ trong hợp đồng | dòng 36, 76 |
| Bảo hành | (không có) | Độ dày thành bồn, loại nhựa và trọng lượng tiêu chuẩn đều có trong hợp đồng và kiểm tra được khi nghiệm thu | dòng 326 (FAQ 2) |
| Bảo mật | Chính sách bảo mật | Biểu mẫu chỉ dùng thông tin để liên hệ tư vấn | chính sách đang chạy (hồ sơ không có mục bảo mật), giữ nghĩa cũ |
| Hỏi đáp | Hỏi đáp thường gặp | Những câu khách hàng hỏi trước khi chọn bể | dòng 323 đến 328 |
| Hỏi đáp | (không có) | Năm câu hỏi về độ bền, độ dày, sửa chữa, lắp đặt và giao hàng | dòng 324 đến 328 |
| Lời kêu gọi cuối trang | Cần chọn đúng dung tích? | Kỹ sư chốt dung tích từ quy mô sử dụng thực tế | dòng 99 |
| Lời kêu gọi cuối trang | Gửi quy mô sử dụng, kỹ sư báo giá trong 15 – 60 phút. | Gửi quy mô sử dụng, Thành Lợi báo giá trong 15 – 60 phút kể từ khi nhận đủ thông tin | dòng 328 |
| Cấu tạo (chi tiết) | Cấu tạo và ưu điểm | giữ nguyên | là tên mục dùng chung cho bảy sản phẩm, một nhận định chung sẽ sai với vài dòng |
| Bảng dung tích | tiêu đề lấy từ dữ liệu từng sản phẩm | giữ nguyên, nay hiện ra thay vì ẩn | `product-guidance.ts` |

Đoạn thân (mô tả thẻ, tầm nhìn, sứ mệnh, giá trị, bảng, hỏi đáp) giữ chữ vòng trước, chỉ đổi "bạn" thành "quý khách" ở trang Chi tiết và Bảo mật. Một cách xưng hô cho cả vùng: Thành Lợi và quý khách. Mốc "15 – 30 phút" ở khối Zalo của trang Chi tiết là chữ có từ vòng trước, không tìm thấy trong hồ sơ, đề nghị chủ doanh nghiệp xác nhận.

## Lề chữ (script `scripts/do-le-trang-phu-v4.mjs`, toạ độ thật)
16 trang (cả 404, nhóm bể phốt, tám trang sản phẩm) x ba cỡ, mỗi cỡ 76 khối đo. Lề trái trừ lề phải của cột chữ ở từng khối: lệch tối đa 0 px ở 1366, 768 và 390 (giới hạn đề: 1 px). Chữ nằm trong cột, không tràn ngang, không có phần tử thấy được nằm ngoài cột (không tính dải lọc và dải tab cuộn ngang ở 390, đó là đường cuộn chủ đích). Kết quả: `trang-phu/do-le.json`.

## Morph (script `scripts/kiem-chuyen-dong-trang-phu-v4.mjs`)
- `/san-pham` bấm thẻ bể biogas sang `/san-pham/be-biogas-composite`: `startViewTransition` chạy, có đủ `view-transition-group`, `old` và `new` cho `tl-product-photo-be-biogas-composite` và `tl-product-title-be-biogas-composite`: ảnh thẻ biến thành ảnh khung vòm, tên thẻ thành tiêu đề.
- Từ trang chi tiết bấm đường dẫn "Sản phẩm" về danh sách: cặp ảnh có. Cặp tên chỉ dựng khi thẻ nằm trong màn nhìn (React chỉ chạy cặp cho phần tử thấy được), nên bấm về lúc tên thẻ nằm dưới màn đầu thì chỉ ảnh bay.
- Nút Quay lại của trình duyệt: không có chuyển cảnh (0 lượt), trang đổi thường, không lỗi. Đây là cách Next xử lý popstate, tôi không sửa.
- Chưa thử trên Safari và Firefox.

## Đã kiểm (số do script đo)
- `npx tsc --noEmit` sạch. `npm test` 48 trên 48 đạt.
- `scripts/shots-vong4-trang-phu.mjs`: 15 trang x 3 cỡ (1366x768, 390x844, 600x360), 0 tràn ngang, 0 ảnh vỡ, 0 nút dưới ngưỡng (trừ liên kết thanh trên cùng 26px của vùng khác), lỗi console duy nhất là mã 404 của chính trang 404.
- `kiem-chuyen-dong-trang-phu-v4.mjs`: 19 trên 19 đạt (số đếm về đúng giá trị cuối, đường vẽ có nét, ảnh trượt có transform, không khối kẹt ẩn, giảm chuyển động không trượt và không ẩn ở bốn trang, tắt JavaScript vẫn thấy đủ ở bốn trang, morph như trên).
- `kiem-tuong-tac-trang-phu.mjs` (của vòng hai) 24 trên 24 đạt: hộp phóng to, tiêu điểm, Tab, Esc, mũi tên, chọn quy mô, thanh dính, dải ảnh, hỏi đáp. `kiem-tab-trang-phu.mjs` vẫn viền vàng 3px.
- Tự xem ảnh `lan4` ở ba cỡ: giới thiệu, sản phẩm, chi tiết biogas và thủy sản, phốt, hóa chất, rác, liên hệ, hướng dẫn, bảo hành, bảo mật, hỏi đáp, 404. Đã sửa qua ba vòng: hình đầu trang quá cao và trống bên trái, thẻ số đè đường dẫn, bảng một dòng thông số bị bẻ năm dòng ở 390, tiêu đề ba dòng ở 390, tiêu đề đầu trang xuống dòng ở 600x360, trang chi tiết không thấy nút báo giá ở 600x360 (đã xếp ảnh trái, tên và nút phải).

## Chưa kiểm hoặc còn tồn tại
- `ui_audit.py --render --stress` và `wrap_check.py` chưa chạy (thiếu playwright Python). Chưa kiểm trình đọc màn hình, Safari, Firefox, điện thoại thật, tốc độ cuộn (khung hình) của `ScrollFx`.
- Dòng cuối lẻ một từ vẫn còn: `kiem-rot-chu-trang-phu.mjs` báo 29 chỗ ở 1366 (phần lớn ô bảng dung tích, dữ liệu nguồn) và 30 chỗ ở 390 (đoạn thân, nhãn "năm" cạnh số là báo nhầm do khác dòng cơ sở). Tiêu đề h1, h2 của vùng đã hết lẻ ở 1366; ở 390 còn tên sản phẩm "Bồn chứa hóa chất composite" (từ dài một mình, không tách được).
- Phần cấu tạo từng sản phẩm, đoạn thân và bảng dùng chữ từ `product-guidance.ts` (đã sửa "bạn" thành "quý khách", chưa viết lại văn).
- Trang Dự án (vùng khác) vẫn dùng đầu trang, lời kêu gọi và CSS cũ; `PhotoStrip` nay vẽ dải ảnh bằng khung không vuông nên trang Dự án nhận dáng khung mới nhưng bề rộng ô vẫn theo CSS cũ.
- Bảng dung tích ở 390 đổi thành thẻ từng dòng như vòng trước, chỉ đổi góc bo, chưa thiết kế lại.
- Trang chi tiết bể phốt, xử lý nước thải, bồn hóa chất: hình là hình vẽ nét, chưa có ảnh thật (chờ chủ doanh nghiệp xác nhận).

## Đề nghị cho bộ `decor/` (không sửa tệp ở đó)
1. `StackStat` nhận chuỗi dài ("1 – 100+ m³", "15 – 60 phút"): nên có `size="sm"` hoặc tự không xuống dòng; tôi phải ghi đè `white-space` và cỡ chữ qua CSS.
2. `FlowSection`: mép cuối của khối cuối cùng cạnh chân trang. Chân trang có nền trắng lộ ra giữa khối tối cuối trang và chân trang (một hình nêm trắng dưới lời kêu gọi), nên cho chân trang nhận `top="arc"` hoặc để khối cuối kéo nền xuống.
3. `ShapeFrame`: cho `children` là `iframe` và `div` được phủ kín như `img` (hiện phải tự viết `position:absolute`), và cho phép đổi `ratio` theo bề rộng để bản đồ viên nang ở 390 không phải dựng hai bản.
4. Thêm hoa văn: đường đồng mức mảnh và vân lưới sợi nét sắc (SVG) cho khối sáng, vì gợn nước đồng trên giấy ngà khá nhạt khi in nhỏ.
5. `Stack`: lớp nổi cạnh trên đè lên đường dẫn trang khi khối đầu trang thấp; nên có `offset` hoặc tự đẩy xuống.

## Tệp đã sửa hoặc tạo
Sửa: `src/components/pages/{catalogue-browser,order-tabs,photo-strip,not-found-view}.tsx`, `src/components/{product-card,product-photo-gallery}.tsx`, `src/lib/product-guidance.ts`, `src/app/(public)/{gioi-thieu,san-pham,hoi-dap,lien-he,huong-dan-dat-hang,chinh-sach-bao-hanh,chinh-sach-bao-mat}/page.tsx`, `src/app/(public)/san-pham/[slug]/page.tsx`, `src/app/(public)/san-pham/be-phot-va-xu-ly-nuoc-thai/page.tsx`.
Tạo: `src/components/pages/{flow-hero.tsx,flow-cta.tsx,pages-v4.css}`, `scripts/{shots-vong4-trang-phu.mjs,do-le-trang-phu-v4.mjs,kiem-chuyen-dong-trang-phu-v4.mjs}`, thư mục ảnh và số đo `docs/nang-cap-2026-11/vong-4/trang-phu/`.
Không đụng: `src/components/decor/`, trang chủ, thanh trên, chân trang, `chrome.css`, `home.css`, tin tức, dự án, bài viết, admin, API, `site-facts.ts`. Dữ liệu: các script chỉ đọc, không tạo bài, yêu cầu hay tài khoản nên không có gì để dọn.

---

# Vòng sửa theo kiểm viên độc lập lượt bốn

Ảnh từng khung nhìn khi cuộn (không phải toàn trang): `trang-phu/vong-sua/khung-nhin/1366/<trang>/vNN.png` và `.../390/`. Ảnh chụp lại ba cỡ: `trang-phu/lan6/`. Số đo: `vong-sua/mep-tieu-de.json`.

## Đã sửa
- **P0 bảo hành và hướng dẫn đặt hàng:** bỏ mọi cam kết hồ sơ không có (thời hạn, phạm vi, điều kiện "trong báo giá hoặc hợp đồng", chi phí giao nhận, quy trình chuẩn bị ảnh khi cần hỗ trợ). Trang bảo hành chỉ còn: bảo hành đến 10 năm tùy dòng sản phẩm (dòng 36, 76), độ dày thành bồn, chủng loại nhựa, trọng lượng tiêu chuẩn ghi trong hợp đồng và kiểm tra được khi nghiệm thu (FAQ 2), sửa chữa tại chỗ bằng sợi thủy tinh và nhựa nền (FAQ 3), tuổi thọ thiết kế trên 30 năm (dòng 76). Lời kêu gọi cuối trang đổi thành "Cần biết thời hạn bảo hành từng dòng sản phẩm". Trang hướng dẫn: bỏ "ghi trong hợp đồng" ở khối bảo hành, bỏ câu "chi phí và thời gian giao nhận được xác nhận trong báo giá hoặc hợp đồng" và câu "cung cấp địa chỉ, đường tiếp cận, điều kiện nâng hạ" (hồ sơ không có), tiêu đề bỏ "kể cả vùng đất trũng" (P2-5).
- **P1-1 mép cong:** gốc đúng như kiểm viên chỉ ra, `z-index:3` của đầu trang. Đã bỏ, bỏ luôn việc kéo ảnh tràn xuống mép. Thêm đệm: chữ đầu của khối sau cách điểm thấp nhất của mép cong 64px (1366) và 40px (390), đáy khối trước cách điểm cao nhất của mép sau thêm 38px hoặc 24px. Script `kiem-mep-tieu-de-trang-phu-v4.mjs` đo trên 16 trang x 3 cỡ: mọi mép dome, arc, wave có chênh màu thật ở nhiều vị trí ngang (mép cong), khoảng cách chữ đầu tới mép đều từ 64px (1366) hoặc 40px (390 và 600). Đã tự xem khung nhìn của sáu trang đại diện ở 1366 và đo 16 trang. Lưu ý: lần đo đầu của tôi đọc nhầm biến CSS nên bài đo cũ ở báo cáo trên không chứng minh được điều này, bản đo mới dùng phần tử dò để đọc chiều cao mép thật.
- **P1-2:** bỏ huy hiệu xe tải ở khối vận chuyển (thừa, không mang chữ).
- **P1-3 thanh tab:** gốc là thanh quan sát nhầm cả khối đầu trang (còn dính vòm nên không bao giờ "cuộn qua"). Nay quan sát đúng khung nội dung đầu trang, thêm `scroll-margin-top` âm theo chiều cao mép để tiêu đề khối nằm dưới thanh. Đo: bấm lần lượt Chọn dung tích, Cấu tạo, Đặt hàng, Hỏi đáp, thanh vẫn hiện, tiêu đề cách đáy thanh 140px.
- **P1-6 giọng chữ:** "Chưa có đủ thông tin. Mô tả cách sử dụng là đủ." thành "Trao đổi qua Zalo. Quý khách chỉ cần mô tả nhu cầu sử dụng. Kỹ thuật kết bạn Zalo, gửi bảng giá, ảnh thật và bản vẽ.", nền đổi từ xanh nõn chuối sang xanh đậm viền đồng. "hay nứt thấm... hay gỉ sét" thành "tìm vật liệu thay cho bê tông xây gạch, vốn dễ nứt thấm, và kim loại, vốn dễ gỉ sét". "Chưa thấy câu trả lời" thành "Cần tư vấn thêm". "Nhờ kỹ sư chọn giúp" thành "Tư vấn dung tích". Bốn câu hỏi của bộ chọn thành nhãn: Chọn quy mô đàn, Chọn số người dùng, Chọn mục đích nuôi, Chọn loại cần mua.
- **Hai mốc thời gian:** mỗi trang chỉ còn một mốc. Bỏ "15 – 30 phút" khỏi khối Zalo (hồ sơ dòng 289 nói về lúc kỹ thuật gửi bảng giá sau khi khách điền biểu mẫu, người đọc dễ nhầm với mốc báo giá). Mốc duy nhất là báo giá trong 15 – 60 phút kể từ khi nhận đủ thông tin (dòng 328). Trang hỏi đáp sửa thành "Thành Lợi báo giá trong 15 – 60 phút kể từ khi nhận đủ thông tin", không còn "trả lời".
- **P1-7 tiêu đề ở 390:** đã đo 16 trang ở 1366, 390 và 600: không còn h1 hay h2 quá hai dòng, không rớt từ lẻ. Rút chữ: "Dung tích theo số người dùng", "Kiểu bể theo mục đích nuôi", "Nhà máy đặt tại Phú Thọ", "Giao hàng, lắp đặt toàn quốc", tiêu đề thẻ liên quan bỏ giới hạn 8em cũ. Tiêu đề ở bước 2 biểu mẫu ("Số người dùng hoặc loại công trình") và banner trang chủ thuộc vùng khác.
- **P1-8 bảo mật:** cột mục lục và cột chữ nay có bề rộng cố định (260 và 640px) và nằm giữa trục trang, chữ bỏ giới hạn `ch` riêng nên đoạn lấp đủ cột.

## Chưa sửa và vì sao
- Lề chữ đo bằng chữ thật ở trang hỏi đáp, liên hệ, hướng dẫn: đoạn ngắn hơn cột thì mép phải chữ tất nhiên nhỏ hơn mép phải cột. Tôi vẫn đo khung chứa (0px) chứ chưa viết bài đo theo mép chữ dài nhất; đã đưa bảo mật vào giữa vì đây là trang kiểm viên đo lệch 148px.
- Banner trang chủ, nội dung trang chủ, trang Dự án, form báo giá (`inquiry-form.tsx`, xưng "anh/chị"): ngoài vùng.
- P2 khác: logo in hoa là biểu trưng, giữ; số 2010 đếm qua các năm (do `ScrollFx` của bộ nền, `data-count-group="false"` đã tắt dấu nhóm nhưng vẫn đếm), đề nghị agent nền thêm cờ không đếm số năm. Câu bảo mật "quý khách có thể yêu cầu điều chỉnh hoặc xóa" là chính sách có từ trước, cần chủ doanh nghiệp duyệt. Cảnh báo preload CSS là của Next dev.
- Chưa chạy `ui_audit.py --render` (thiếu playwright Python).

## Kiểm lại sau sửa
`npx tsc --noEmit` sạch, `npm test` 48 trên 48, `do-le-trang-phu-v4.mjs` đạt (khung 0px, chữ trong cột), `kiem-chuyen-dong-trang-phu-v4.mjs` 24 trên 24 (thêm bài thanh tab), `kiem-tuong-tac-trang-phu.mjs` 24 trên 24, `kiem-mep-tieu-de-trang-phu-v4.mjs` đạt.
