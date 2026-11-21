# Báo cáo vòng hai: khung chung và trang chủ

Ảnh trước: `vong-2/khung-trang-chu/truoc/`. Ảnh sau: `vong-2/khung-trang-chu/sau/` (tên `hero-canh-N-<cỡ>`, `khoi-NN-<tên>-<cỡ>`, `chan-trang-<cỡ>`, `hop-xem-anh-<cỡ>`, `hero-giua-chuyen-<cỡ>`). Số đo: `sau/report.json`, `sau/tuong-tac.json`, `contrast.txt`, `ui-audit.txt`. Ba cỡ: 1366x768, 390x844, 600x360.

## Skill đã gọi và script đã chạy
- Đã gọi bằng công cụ Skill: `impeccable`, `design-taste-frontend`, `thiet-ke-ux-ui`.
- `contrast.py`: nút cam 5,21:1, chữ xanh lục trên trắng 5,79:1, chữ vàng chanh trên xanh đen 11,96:1, trắng trên xanh lục 5,79:1. Đều đạt.
- `ui_audit.py --render --stress` trên bản lưu trang chủ (`trang-chu-snapshot.html`, dựng bằng `scripts/snapshot-html.ts`). Chạy bằng Python 3.13, Chromium 1254 trỏ qua đường nối tạm trong thư mục Temp (không tải gì). Kết quả thô: 10 chặn, 104 cần sửa. Đã xác minh từng nhóm:
  - 7 chặn "chữ bị cắt" là chữ chỉ dành cho trình đọc màn hình (`tl-sr`), báo nhầm.
  - 3 chặn tương phản "2010" và "Khởi đầu tại Phú Thọ" (1,18:1) là báo nhầm: script coi nền là trắng vì ảnh nằm dưới chữ. Tôi đo lại pixel sau chữ trong ảnh chụp: nền sáng nhất (phân vị 90) có độ sáng 80, tương phản với chữ trắng khoảng 8:1.
  - Các mục "tách từ ghép" và "dòng cuối một từ" phần lớn nằm ở chữ lấy từ `site-facts.ts` và thẻ bài viết (ngoài vùng của tôi). Không sửa được bằng cách ngắt dòng vì luật cấm khoảng trắng dính. Đã sửa phần thuộc vùng mình (xem dưới).
  - 2 mục "hoạt họa thuộc tính bố cục" nằm ở `.catalogue-row` và `details::details-content` của CSS dùng chung của trang khác, không phải của tôi. Hỏi đáp trang chủ dùng `block-size` của `::details-content` để mở đóng mượt, tôi giữ vì đây là cách duy nhất cho phần tử `details`.
  - `wrap_check.py` không chạy riêng (cần tệp font và khung cụ thể). Thay bằng bộ đo ngắt dòng thật trên trình duyệt trong `scripts/vong2-khung.ts` (hàm `orphans`).

## Điểm yếu thấy khi audit (ảnh `truoc/`)
1. Banner 1366: nút lùi, dừng, tới và thanh chỉ cảnh đè lên hàng nút Nhận báo giá, Xem sản phẩm, Gọi (đo ra 7 cặp đè ở cảnh 1).
2. Bốn khối liền nhau cùng một khuôn tiêu đề trái cộng lưới thẻ. Không có điểm nhớ.
3. Khối "Hình ảnh thật": ba ảnh xoay xếp chồng ghim cuộn, để lại khoảng trống rất lớn bên dưới, chú thích chung chung.
4. Bốn lý do là bốn thẻ bằng nhau.
5. Khối báo giá dùng ảnh thùng vàng không ăn nhập.
6. Ảnh mỗi tấm một tông, độ sáng trung bình từ 99 đến 125.
7. Bản đồ chân trang nhỏ (260x162), nhãn cắt, trống tới khi cuộn tới.
8. Nút ghim máy bàn có ba nút, nút báo giá trùng với nút ở thanh trên, đè chữ khi cuộn.
9. Chuyển cảnh banner dùng clip-path 1,15 giây.
10. Quy trình năm bước đường nối đứng yên, số liệu không có phản hồi khi rê chuột.

## Đã sửa
- **Banner** (`hero-slider.tsx`, `home.css`): chừa đủ chỗ cho cụm điều khiển (đệm dưới 168px), tiêu đề tối đa hai dòng ở 1366, cảnh biogas có khung ảnh không chạm dải số liệu, bỏ câu thừa ở cảnh 1 và 3. Chuyển cảnh bằng mờ dần 0,55 giây thay clip-path. Ba cảnh ở ba cỡ: 0 đè nhau, tiêu đề và nút báo giá nằm trong màn đầu (600x360: nút kết thúc ở y=293 trên 360).
- **Giới thiệu**: ảnh lớn tràn mép trái, năm 2010 cỡ 96px trên ảnh, một đoạn chữ, câu khẩu hiệu thành dòng nhấn có đường kẻ trên. Bỏ đoạn thứ hai.
- **Bốn lý do thành bento** (`ReasonsBento`): ô ảnh bề mặt thật, ô số "10 năm" cỡ lớn, ô nhóm quy mô, ô chuỗi sáu việc trọn gói. Hai ô có ảnh hoặc nền màu, hai ô sáng tối khác nhau. Bảng so sánh giữ nguyên, thêm tiêu đề nhỏ.
- **Dải ảnh thật** (`photo-strip.tsx`, mới): sáu ảnh cùng chiều cao, ảnh dọc hẹp hơn ảnh ngang, cuộn ngang, nút mũi tên, thanh tiến độ, phím mũi tên, hộp xem lớn (tiêu điểm vào trong, Tab giữ trong hộp, Esc đóng, tiêu điểm về ảnh đã bấm). Chú thích chỉ nói điều nhìn thấy trong ảnh. Không còn khoảng trống do ghim cuộn.
- **Quy trình**: đường nối chạy theo cuộn và vòng sáng quanh từng số sáng lên lần lượt, bằng `animation-timeline: view()` (chỉ transform và opacity). Trình duyệt chưa hỗ trợ thì đường hiện đầy sẵn. Chỉ bật từ 1101px, chỉ khi không giảm chuyển động.
- **Số liệu**: đếm lên một lần khi vào màn (đo: 4, 7, 10, 12, 13, 14, 15, quay lại không đếm lại). Ô đổi nền nhẹ khi rê chuột. Đơn vị không rớt dòng.
- **Ảnh** (`scripts/xu-ly-anh-trang-chu.mjs`, sharp): 12 ảnh mới trong `public/images/home/`, cắt đúng tỉ lệ khung, cân sáng về cùng mức (độ sáng sau xử lý 116 đến 118, trước 99 đến 125), webp 2 đến 3 cỡ. Ảnh gốc không đụng. Báo giá: bỏ thùng vàng, dùng ảnh bốc xếp bể lên xe (khớp dòng hỗ trợ vận chuyển). Không gán ảnh cho bể phốt, nước thải, bồn hóa chất.
- **Thẻ tin tức**: `eager-images.tsx` tải ảnh bìa ngay khi trình duyệt nhàn thay vì đợi cuộn tới.
- **Bản đồ chân trang** (P2-10, `footer-map.tsx`, mới): cột liên hệ rộng hơn, bản đồ 349x262 (trước 260x162), khung giữ chỗ có địa chỉ hiện ngay, bản đồ thật tải sớm khi còn cách khung nhìn 1600px rồi hiện dần, thêm liên kết Chỉ đường. Đo: lúc vào trang chưa có iframe nhưng có địa chỉ, sau khi cuộn xuống iframe tải xong.
- **Nút ghim máy bàn** (P2-9): còn hai nút Gọi và Chat Zalo (nút báo giá đã ở thanh trên), cỡ 48px, sát mép hơn, ẩn ở đầu trang và hiện sau khi cuộn. Điện thoại giữ ba nút.
- **Nhãn kêu gọi** (P2-5): nút gửi cuối biểu mẫu đổi từ "Gửi yêu cầu" thành "Nhận báo giá". Header, banner, nút ghim, chân trang, biểu mẫu cùng một nhãn.
- Dải số liệu không còn bị cắt nửa chữ số ở mép màn đầu 1366 (P2-1): chữ số hiện đủ.

## Đã kiểm (số do script đo)
- `npx tsc --noEmit` sạch. `npm test`: 40 đạt, 0 lỗi.
- Cuộn hết trang, ba cỡ: không tràn ngang, 0 chữ dưới 14px, 0 vùng bấm thấp hơn ngưỡng, 0 ký tự cấm, 0 khối kẹt ẩn. Khung hình khi cuộn: p95 10,1 ms, khung tệ nhất 10 đến 11 ms, 0 khung trên 50 ms (kênh Chrome không đầu, máy này).
- Tương tác (`sau/tuong-tac.json`): hộp xem ảnh mở được, tiêu điểm vào trong, Tab 12 lần vẫn ở trong, mũi tên phải đổi ảnh, Esc đóng, tiêu điểm về nút. Giảm chuyển động: 0 khối ẩn, đường quy trình đầy sẵn, chữ tiêu đề không còn dịch.
- Banner chuyển bằng mũi tên qua ba cảnh ở cả ba cỡ: 0 đè, nút kêu gọi trong màn đầu.
- Đã tự mở và xem: banner ba cảnh ở 1366, banner 390 và 600x360, giới thiệu, bento, dải ảnh, quy trình, tin tức, báo giá, chân trang ở 1366, và ghép các khối ở 390.

## Chưa kiểm hoặc còn lại
- Chưa chạy `npm run build` (cấm), chưa kiểm hiệu năng bản build.
- Còn dòng cuối lẻ một từ ở chữ lấy từ `site-facts.ts` (nhãn số liệu "từ năm 2010", "ổn định", "toàn quốc", bước hai quy trình) và ở tin bài. Cần đổi chữ ở nguồn dùng chung hoặc chấp nhận.
- Một thẻ tin tức mẫu trỏ ảnh bìa đã bị xoá (`/api/media/...` trả 404), làm báo 1 ảnh vỡ và 2 lỗi console ở lượt cuối. Dữ liệu thử của agent khác, thẻ bài viết nằm ngoài vùng của tôi.
- Chưa thử Safari và Firefox: `animation-timeline: view()` chỉ có trên Chromium mới (nơi khác đường quy trình hiện đầy sẵn), `::details-content` tương tự.
- Bốn ảnh nhỏ trong bento sản phẩm vẫn là ảnh cũ chưa xử lý (không thuộc danh sách ảnh trang chủ đã xử lý). Chưa đo khung hình trên điện thoại thật.
- Số lượng dữ liệu cuối lượt: tôi không tạo bài, yêu cầu hay ảnh nào; không kiểm đếm lại cơ sở dữ liệu.

## Đề nghị cho tệp dùng chung
- `site-facts.ts`: rút nhãn số liệu để không rớt từ lẻ (ví dụ "Sản xuất composite FRP từ năm 2010").
- Trang Dự án (`du-an/page.tsx`) và trang Chính sách bảo hành (`chinh-sach-bao-hanh/page.tsx`) còn nhãn "Trao đổi dự án" và "Gửi yêu cầu": nên đổi thành "Nhận báo giá".
- Các script cũ `scripts/dung-thu.ts`, `scripts/kiem-tuong-tac.ts` còn tìm nút "Gửi yêu cầu": cần đổi thành "Nhận báo giá" (đã sửa `scripts/shots-khung.ts`).
- Thẻ bài viết (`article/post-card.tsx`): ẩn ảnh khi tệp bìa 404 và dùng nền giữ chỗ có biểu tượng.
- `workshop-story.tsx|css` không còn dùng ở trang chủ (giữ nguyên, chưa xoá).

## Tệp
Sửa: `src/app/(public)/page.tsx`, `home.css`, `chrome.css`, `src/components/home/hero-slider.tsx`, `sections.tsx`, `src/components/site-footer.tsx`, `src/components/inquiry-form.tsx`, `scripts/shots-khung.ts`.
Mới: `src/components/home/images.ts`, `photo-strip.tsx`, `eager-images.tsx`, `src/components/footer-map.tsx`, `scripts/xu-ly-anh-trang-chu.mjs`, `scripts/vong2-khung.ts`, `scripts/vong2-khung-tuong-tac.ts`, `public/images/home/*.webp` và `manifest.json`.

---

# Vòng sửa (theo lời chủ dự án 21/11 và kiểm viên lượt hai)

Ảnh: `vong-2/khung-trang-chu/sau/` (chụp lại ở 1366x768, 390x844, 600x360, thêm `toan-trang-chua-cuon-*` và `toan-trang-da-cuon-*`). Số đo: `sau/report.json`, `sau/tuong-tac.json`.

## Bảng chữ bỏ và chữ giữ
| Chữ | Quyết định | Lý do |
|---|---|---|
| Tiêu đề "Hình ảnh thật", dòng "Chụp tại xưởng Phú Thọ và trên đường giao hàng", liên kết "Xem dự án" cạnh tiêu đề | Bỏ. Giữ một h2 ẩn cho trình đọc màn hình | Dải ảnh nhìn là hiểu, Dự án đã có trên menu |
| Sáu chú thích dưới ảnh trong dải ảnh, chú thích trong hộp xem lớn | Bỏ. Còn lại "2 trên 6". Mô tả nằm trong alt | Chú thích chỉ lặp điều nhìn thấy |
| Dòng "Bảy nhóm sản phẩm, ba nhóm mũi nhọn đứng đầu" | Bỏ | Huy hiệu "Mũi nhọn" trên ba thẻ đã nói |
| Chữ "Xem chi tiết" ở mỗi thẻ sản phẩm | Bỏ, giữ mũi tên | Cả thẻ là liên kết, tên sản phẩm đã rõ |
| Nhãn "Thành Lợi Composite" phía trên tiêu đề banner (cảnh 1 và 3) | Bỏ. Cảnh 2 giữ "Bể biogas và bể phốt" | Logo đã nói tên công ty. Cảnh 2 nhãn nêu nhóm sản phẩm, tiêu đề không nêu |
| "Khởi đầu tại Phú Thọ" dưới số 2010 | Đổi thành "Thành lập" | Đoạn bên cạnh đã nói Phú Thọ, chỉ cần nói số 2010 là gì |
| Đoạn "Đủ mọi quy mô" và "Kỹ thuật trọn gói" trong bento | Bỏ khỏi mắt (giữ ẩn cho trình đọc), giữ nhóm nhãn | Nhóm nhãn chính là câu đó, đã hiện bằng hình |
| Số 1 đến 6 trong "Kỹ thuật trọn gói" | Bỏ | Không lẫn với quy trình năm bước |
| Tiêu đề phụ "So với bể xây và bồn kim loại" trên bảng | Bỏ (ẩn cho trình đọc) | Tiêu đề cột đã nói |
| Dòng "Bốn bước ngắn, khoảng 15 giây" ở khối báo giá | Bỏ | Thanh bước có bốn chấm đã hiện |
| Tiêu đề bước 1 "Thông tin liên hệ" và bước 4 "Ghi chú và gửi" của biểu mẫu | Bỏ khỏi mắt (giữ ẩn, tiêu điểm vẫn chuyển vào) | Nhãn ô đã rõ |
| Tiêu đề bước 2 "Anh/chị quan tâm sản phẩm nào" | Rút còn "Chọn sản phẩm" | Cần câu dẫn cho bốn nút, ngắn để không rớt từ |
| "Tin tức và chia sẻ" | Rút còn "Tin tức" | "chia sẻ" không thêm thông tin |
| Câu khẩu hiệu "Đúng yêu cầu, đúng tiến độ..." ở chân trang | Bỏ (còn ở khối giới thiệu trang chủ) | Lặp ở mọi trang và là câu rớt từ "gian." |
| Tiêu đề cột chân trang "Liên kết nhanh" và "Liên hệ" (giữ ẩn), liên kết "Nhận báo giá" trong cột Hỗ trợ | Bỏ | Danh sách và biểu tượng đã tự nói. Nút báo giá đã có ở thanh trên |
| Tiêu đề khối "Vì sao chọn Thành Lợi", "Sản phẩm chủ lực", "Quy trình năm bước", "Câu hỏi thường gặp", "Nhận báo giá nhanh" | Giữ | Là câu hỏi hoặc việc cần làm, không chỉ gọi tên khối |
| "Chưa cần bản vẽ, chỉ cần nói nhu cầu" (quy trình), "Gọi hotline để kỹ sư trả lời trực tiếp" (hỏi đáp), ba dòng lợi ích cạnh biểu mẫu | Giữ (quy trình rút còn một dòng) | Có thông tin mới hoặc việc cần làm |
| Nhãn số liệu ("Sản xuất composite FRP từ năm 2010", "Đã bàn giao", "Khách hàng, đại lý", "Bảo hành tối đa") | Rút gọn, giữ | Đơn vị bên cạnh số đã nói một nửa. Rút bớt để không rớt từ lẻ |

Khoảng cách sau khi bỏ chữ: khối ảnh thật có đệm riêng, bảng so sánh cách bento 48px, ô bento không còn khoảng hẫng.

## Đã sửa
- **Ô trống đầu dải ảnh**: nguyên nhân là ảnh giải mã chưa xong lúc chụp toàn trang (ảnh tải lười và giải mã bất đồng bộ, nền ô là màu phẳng nhạt). Sửa: tất cả ảnh dải ảnh tải sớm, ba ảnh đầu giải mã đồng bộ, và mỗi ô có sẵn ảnh thu nhỏ làm mờ nhúng làm nền (`lqip` trong `images.ts`, sinh bằng sharp), nên chưa tải xong vẫn có màu và hình. Đo: cả sáu ảnh `naturalWidth > 0` sau khi cuộn tới, 0 ảnh vỡ ở ba cỡ.
- **Ô "Vật liệu chính phẩm"**: bỏ thùng vàng. Dùng ảnh thật cắt cận thành bể có gân gia cường và bề mặt bóng (cắt từ ảnh bể chữ nhật trong xưởng, sharp, nền sẫm dưới chữ). Ô "Kỹ thuật trọn gói" bỏ số.
- **Ảnh em bé ở thẻ "Bể cá Koi và bể nuôi thủy sản" trên trang chủ**: thay bằng ảnh đã cắt lại từ cùng ảnh gốc, không còn hình người. Trang Sản phẩm và trang chi tiết bể cá vẫn dùng ảnh cũ (ngoài vùng của tôi, xem đề nghị).
- **Tin tức**: một bài thì thành thẻ ngang lớn, hai bài thì lưới hai cột, ba bài giữ ba cột. Nền giữ chỗ của ảnh bìa là màu đặc.
- **Chữ rớt từ lẻ**: câu chân trang bỏ. Trang chủ 1366: 0 chỗ (trước 12). 600x360: 0 chỗ. 390: còn 2, cả hai là đoạn trả lời hỏi đáp lấy từ `site-facts.ts` ("thu.", "quốc."), chưa đổi vì thuộc tệp dùng chung. Sửa bằng rút nhãn số liệu, đổi hai câu mô tả thẻ sản phẩm, câu quy trình bước hai, câu dưới "Nhận báo giá", không dùng ký tự dính từ, không `text-wrap`, không `<br>`.
- **Bản đồ chân trang**: iframe `tabIndex=-1`, không còn là điểm dừng Tab không viền. Liên kết "Chỉ đường" vẫn bấm được và có viền tiêu điểm.
- **Biểu mẫu**: tiêu đề bước hai hết rớt từ ở 390, thêm khoảng thở giữa thanh bước và ô đầu.
- **P2 của kiểm viên lượt hai**: 1 (số trong bento, bỏ), 2 (banner 390: nút đổi cảnh nay nằm trên thanh liên hệ cố định, đo y=720 đến 768, thanh bắt đầu ở 784; thu nhỏ khung ảnh cảnh biogas và đệm), 3 (600x360: nâng cụm điều khiển lên khỏi thẻ số liệu, Tab 11 điểm đầu đều trong khung, thanh trên cùng ẩn hẳn), 5 (dải ảnh), 10 (khoảng thở biểu mẫu), 11 (số đếm lên: đo 15+, 3+, 7+, 9+, 11+, 13+, 14+ rồi 15+, quay lại không đếm lại; đã sửa lỗi số âm do mốc thời gian khung hình; đường quy trình đã chạy theo cuộn), 12 (bản đồ chân trang có khung giữ chỗ và tải sớm). Mục 4 (chuyển cảnh banner): ảnh cảnh cũ giữ nguyên dưới ảnh cảnh mới nên màn không tối, xem `sau/hero-giua-chuyen-*.png`. Mục 13 ("Nhắn Zalo" và "Chat Zalo") thuộc trang khác.
- **Script cũ**: `scripts/dung-thu.ts` và `scripts/kiem-tuong-tac.ts` đổi tìm nút "Gửi yêu cầu" thành "Nhận báo giá" (khớp chính xác để không nhầm với nút ở thanh trên).

## Đã kiểm lại
- `npx tsc --noEmit` sạch. `npm test`: 40 đạt, 0 lỗi.
- Ba cỡ: 0 đè nhau ở ba cảnh banner, tiêu đề và nút báo giá trong màn đầu, 0 tràn ngang, 0 chữ dưới 14px, 0 vùng bấm thấp hơn ngưỡng, 0 ký tự cấm, 0 khối kẹt ẩn, 0 ảnh vỡ, 0 lỗi console (lượt cuối). Khung hình khi cuộn p95 10,1 ms, 0 khung trên 50 ms.
- Hộp xem ảnh: mở, tiêu điểm vào trong, Tab giữ trong hộp, Esc đóng, tiêu điểm về ảnh. Giảm chuyển động: 0 khối ẩn.
- Đã tự mở và xem ảnh: toàn trang đã cuộn 1366, các khối bento, sản phẩm, dải ảnh, quy trình, hỏi đáp, chân trang, banner ba cảnh ở 390 và 600x360, ghép các khối ở 390.

## Còn lại
- Hai đoạn hỏi đáp lấy từ `site-facts.ts` còn dòng cuối lẻ một từ ở 390.
- Trang Sản phẩm, trang chi tiết bể cá còn ảnh có em bé (ngoài vùng).
- Chưa kiểm bản build, Safari, Firefox. Chưa đếm lại cơ sở dữ liệu: tôi không tạo dữ liệu.

## Bổ sung: thẻ "Bể cá Koi và bể nuôi thủy sản" ở trang chủ
Điều phối báo thẻ vẫn thấy ảnh có em bé ở mép bể. Tôi đã đổi `photos.fishTank` (`src/components/home/images.ts`) sang ảnh công nhân lắp bể tròn (cắt 4:3 từ `round-tanks-installation.webp`, xử lý đồng tông bằng `scripts/xu-ly-anh-trang-chu.mjs`, tệp `public/images/home/be-tron-lap-dat-*.webp`). Ảnh cũ `be-nuoi-thuy-san-*.webp` và ảnh gốc vẫn còn, không xoá. Đã chụp lại thẻ ở 1366 và 390 (`sau/the-be-ca-koi-1366.png`, `sau/the-be-ca-koi-390.png`), đo `currentSrc` đúng là `be-tron-lap-dat`, nhìn ảnh không có em bé. `npx tsc --noEmit` sạch.
