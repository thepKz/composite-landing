# Báo cáo: khung chung và trang chủ

Ảnh kiểm: `docs/nang-cap-2026-11/sau-khung-trang-chu/` (tên `home-*` từ `shots.ts`, tên `khung-*` từ `scripts/shots-khung.ts`, số đo ở `khung-report.json`).

## Đã làm

### Khung chung mọi trang công khai
- **Thanh trên cùng**: hai hotline bấm gọi được, email, địa chỉ lấy từ `site-facts.ts`. Điện thoại chỉ còn hotline.
- **Header**: dính khi cuộn, thu gọn mượt (cao 84 xuống 68, logo thu nhẹ, đổ bóng). Menu Trang chủ, Giới thiệu, Sản phẩm, Dự án, Tin tức, Liên hệ. Sản phẩm xổ xuống có chuyển cảnh, ba dòng mũi nhọn (Bể biogas, Bể phốt và xử lý nước thải, Bể cá và thủy sản) đứng đầu kèm biểu tượng và mô tả một dòng, các nhóm còn lại ở cột phải. Mở bằng rê chuột, bấm hoặc phím mũi tên xuống, Esc đóng và trả tiêu điểm. Nút cam "Nhận báo giá".
- **Ngăn kéo điện thoại** toàn màn có chuyển cảnh, khóa cuộn nền, tiêu điểm vào trong, Tab giữ bên trong, Esc đóng, trả tiêu điểm về nút mở (đã đo, xem bên dưới).
- **Nút ghim**: điện thoại là thanh dưới cùng ba nút Gọi ngay, Chat Zalo, Báo giá. Máy bàn là cụm ba nút tròn góc phải dưới, nhãn hiện khi rê hoặc tiêu điểm. Tự lùi xuống khi biểu mẫu đang hiện hoặc có hộp ảnh mở. Chân trang chừa đệm để nút không che chữ.
- **Chân trang** theo mục 8: dải kêu gọi báo giá, giới thiệu ngắn kèm Facebook, TikTok, Zalo, liên kết nhanh, sản phẩm chủ lực, chính sách và hỗ trợ, liên hệ kèm bản đồ thu nhỏ (iframe tải lười). Dòng bản quyền có mã số thuế. Không vẽ nút tải hồ sơ năng lực vì chưa có tệp. Có liên kết tới `/chinh-sach-bao-hanh` (trang do agent khác tạo).
- **Chuyển trang**: `src/app/(public)/template.tsx` làm nội dung hiện dần mỗi lần đổi đường dẫn, thêm thanh tiến trình mảnh màu cam ở trên cùng (`route-feedback.tsx`). Chọn cách này thay vì View Transitions vì chắc hơn: docs Next 16 nói View Transitions cần React 19.3 và trình duyệt mới, hỏng thì không có gì.
- Chữ thân công khai 16px (`.public-site`), chữ phụ không dưới 14px, canh trái thay vì canh đều.

### Trang chủ (theo thứ tự thuyết phục của mục 2)
Banner, dải số liệu, giới thiệu, vì sao composite và Thành Lợi, sản phẩm chủ lực, hình ảnh thật, quy trình, hỏi đáp, tin tức, biểu mẫu báo giá.
- **Banner** (`components/home/hero-slider.tsx`): ba cảnh theo mục 2.1, chữ rút gọn, bỏ "100%" và "không rò rỉ", ghi 30 năm cho khớp dải số liệu. Ảnh: lắp bể tròn (cảnh 1), bể biogas màu trắng đúng ảnh gán cho nhóm biogas (cảnh 2), bể tròn xanh đúng ảnh nhóm thủy sản (cảnh 3). Chuyển cảnh mờ chồng, ảnh co nhẹ về cỡ gốc, chữ trồi lên so le. Có chỉ báo tiến trình chạy bằng CSS (hết thanh thì tự sang cảnh), tạm dừng khi rê chuột hoặc tiêu điểm, nút lùi, tới, dừng, phím mũi tên trái phải, vuốt ngang ở điện thoại. Bản giảm chuyển động đứng yên. Ba nút: Tư vấn miễn phí (cam), Xem sản phẩm (đổi theo cảnh), Gọi số hotline.
- **Số liệu**: thẻ nổi đè lên banner, số lớn đếm lên khi cuộn tới, đường kẻ ngăn, ở điện thoại 2 cột.
- **Giới thiệu ngắn** có ảnh xưởng và dấu mốc 2010.
- **Bảng so sánh**: cột Thành Lợi tô nổi (đầu cột xanh, ô nền xanh nhạt kèm dấu tích). Dưới 960px đổi thành thẻ theo tiêu chí, không tràn ngang. Bốn lý do có biểu tượng.
- **Sản phẩm**: bento 3 thẻ mũi nhọn lớn (có huy hiệu) cộng 4 thẻ nhỏ, đủ 7 nhóm, mỗi thẻ dẫn tới trang sản phẩm thật (chỉ dẫn tới nhóm đang có trong dữ liệu, thiếu thì về `/san-pham`). Nhóm chưa có ảnh đúng sản phẩm (bể phốt, bồn hóa chất) dùng thẻ màu có biểu tượng và con số, không gán ảnh sai.
- **Hình ảnh thật**: giữ `WorkshopStory` (cảnh GSAP xếp chồng ảnh và hộp xem ảnh lớn), chỉ nâng cỡ chữ chú thích lên 16px và bỏ `text-wrap: balance`.
- **Quy trình** 5 bước trên nền xanh đậm, đường nối chạy theo nhịp cuộn (GSAP), điện thoại xếp dọc.
- **Hỏi đáp** accordion bằng `<details>` có chuyển cảnh mở đóng mượt (`::details-content`), mở một mục thì mục khác đóng.
- **Tin tức**: chỉ hiện khi có bài. Thẻ không có ảnh bìa dùng nền xanh chuyển sắc kèm logo và loại bài (đã kiểm bằng bài mẫu tạm, đã xoá).
- **Biểu mẫu báo giá** đặt cuối, có ảnh và ba cam kết lấy từ hồ sơ.

### Biểu mẫu báo giá bốn bước (`inquiry-form.tsx`)
- Bước 1 liên hệ (họ tên, điện thoại có Zalo, tỉnh thành). Bước 2 bốn nút lớn chọn sản phẩm. Bước 3 nút quy mô theo `quoteScales` đổi theo sản phẩm, gợi ý dung tích hiện ngay trong ô gợi ý. Bước 4 ghi chú, đồng ý chính sách, gửi.
- Chỉ báo bước bấm được để quay lại, chuyển bước trượt mượt, quay lại không mất dữ liệu, kiểm lỗi khi rời ô, lời lỗi nói cách sửa, trạng thái "Đang gửi" có vòng quay, màn thành công tóm tắt lựa chọn và nút gọi hotline, lỗi mạng giữ nguyên dữ liệu. Chọn bằng chuột hoặc chạm thì tự sang bước kế sau 0,24 giây, bàn phím thì giữ nguyên. Radio thật nên dùng được hoàn toàn bằng bàn phím. Tiêu điểm chuyển về tiêu đề bước mới.
- Tương thích: giữ nguyên props `product`, `compact`, `demo`. Trang truyền sẵn sản phẩm thì chọn sẵn và nhảy tới bước quy mô, thiếu thông tin liên hệ thì "Tiếp tục" đưa về bước 1 rồi quay thẳng bước cuối. Chế độ demo vẫn không gửi và báo rõ. Giữ ô bẫy bot, ô đồng ý, giới hạn tốc độ và kiểm phía máy chủ.
- Máy chủ: lược đồ zod thêm `province`, `scale`, `scaleHint` (có mặc định rỗng, yêu cầu cũ vẫn hợp lệ), `inquiryMessage` ghi thêm "Tỉnh thành" và "Quy mô". Không vẽ nút đính kèm.

### Chuyển động
Hiện dần so le cho khối `data-reveal` làm trong `public-motion.tsx` (một IntersectionObserver cho mọi trang công khai, đặt `data-revealed`, chỉ số so le theo lô). Cảnh GSAP còn giữ: xếp chồng ảnh thật, đường nối quy trình. Gỡ các cảnh gắn với phần đã bỏ (khung hình mở rộng của banner cũ, cầu ảnh, chọn kích thước, chữ ký chân trang) vì chúng cũng xung đột với `[data-reveal]` của `motion.css` (xoá style nội tuyến thì khối quay về `opacity: 0`).
Tắt JavaScript dùng `@media (scripting: none)` để mọi khối hiện đủ. Không dùng cờ lớp trên `<html>` vì gây lỗi lệch hydrate (đã gặp và sửa).

## Đã kiểm (số do script đo, xem `khung-report.json`)
- `npx tsc --noEmit` sạch (lúc chạy lần cuối). `npx tsx --test tests/inquiry-details.test.ts`: 6 bài kiểm đạt, gồm yêu cầu cũ không có trường mới cho cùng nội dung tin nhắn.
- 1366x768 và 390x844, trang chủ cuộn hết: không tràn ngang (scrollWidth bằng innerWidth), không chữ thân dưới 14px, không vùng bấm thấp hơn 44px (điện thoại) hoặc 36px (máy bàn) trong header, nút ghim, biểu mẫu, banner, không có ký tự cấm (· — ; ! và khoảng trắng dính) trong chữ hiện ra.
- Giảm chuyển động: mọi khối hiện đủ (số khối kẹt ở opacity 0 là 0), thanh tiến trình banner không chạy. Tắt JavaScript: nội dung hiện đủ, không tràn ngang.
- Ngăn kéo điện thoại: tiêu điểm vào trong, bấm Tab 25 lần vẫn ở trong, Esc đóng và tiêu điểm về nút "Mở menu". Menu Sản phẩm máy bàn: Esc đóng và tiêu điểm về nút Sản phẩm.
- Biểu mẫu: quay lại giữ lựa chọn, lỗi mạng (chặn yêu cầu) giữ nguyên dữ liệu và ô đồng ý. Thành công và lỗi mạng chạy trên yêu cầu bị chặn ở trình duyệt nên không ghi vào cơ sở dữ liệu.
- Đã tự mở và xem ảnh: banner 3 cảnh, menu, ngăn kéo, số liệu, so sánh, sản phẩm, quy trình, hỏi đáp, tin tức (có và không có ảnh bìa), biểu mẫu các bước và các lỗi, chân trang, trang Giới thiệu (header và footer), cả hai cỡ.

## Chưa kiểm hoặc còn lại
- Luật skill: lượt đầu bỏ qua, đã bù ở vòng hai (mục "Skill đã gọi và đã áp" bên dưới).
- Gửi biểu mẫu thật vào cơ sở dữ liệu (kể cả giới hạn tốc độ) chưa chạy lại; chỉ kiểm lược đồ và nội dung tin nhắn bằng bài kiểm.
- Tab tin nhắn trong trang quản trị chưa xem để chắc dòng "Tỉnh thành" và "Quy mô" hiện đẹp.
- Một lượt `shots.ts` và một lượt `shots-khung.ts` báo 1 đến 3 lỗi tải "404" không rõ tài nguyên nào (không tái hiện khi tải riêng, nghi do đang sửa tệp song song). Lỗi "net::ERR_FAILED" trong báo cáo là do kịch bản cố tình chặn mạng để thử lỗi mạng.
- Bản đồ chân trang tải lười: ảnh toàn trang chụp trước khi nó tải nên hiện ô trống, ảnh `khung-footer-*` cho thấy bản đồ đã tải.
- Không thử trên Safari hoặc Firefox. `::details-content` (mở đóng mượt hỏi đáp) chỉ có từ Chromium 131, nơi khác mở đóng tức thì nhưng vẫn dùng được.
- Bản trình diễn tĩnh (`scripts/export-netlify-demo.mjs`) nhúng `public-choreography.js`; tệp này đã đổi, bản trình diễn xuất ra từ đây sẽ không còn các cảnh cũ. Chưa chạy lại tập lệnh xuất.

## Cần agent khác xử lý
- Trang `/chinh-sach-bao-hanh` (footer, dòng bản quyền và tab chân trang đã trỏ tới).
- Trang `lien-he` đang gọi `InquiryForm` không truyền sản phẩm: chạy bình thường (bắt đầu ở bước 1). Nên truyền `product` nếu trang biết loại sản phẩm. Hộp nền tối bao quanh biểu mẫu không còn cần chỉnh màu, thẻ biểu mẫu tự có nền trắng.
- Trang sản phẩm chi tiết truyền `compact` và tên sản phẩm: vẫn chạy, `compact` bị bỏ qua. Các trang có thể bỏ lớp `.inquiry-form` trong css của họ.
- Anh chị làm admin: nội dung tin nhắn có thêm hai dòng "Tỉnh thành" và "Quy mô".
- `.public-site p` giờ canh trái thay vì canh đều (đổi ở `chrome.css`), các trang phụ sẽ đổi theo.

## Tệp
Sửa: `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/components/site-header.tsx`, `site-header.css`, `site-footer.tsx`, `contact-shortcuts.tsx`, `public-motion.tsx`, `workshop-story.css`, `inquiry-form.tsx`, `src/lib/inquiry-details.ts`, `src/lib/public-choreography.js`, `tests/inquiry-details.test.ts`.
Mới: `src/app/(public)/chrome.css`, `home.css`, `template.tsx`, `src/components/route-feedback.tsx`, `inquiry-form.css`, `src/components/home/hero-slider.tsx`, `metrics-strip.tsx`, `sections.tsx`, `src/lib/nav-labels.ts`, `scripts/shots-khung.ts`.
Không còn dùng (để nguyên, không xoá): `cinematic-hero.tsx`, `hero-showcase.tsx`, `product-explorer.tsx`, `customer-gallery.tsx`, `landing-motion.tsx`, `material-lines.tsx`, `cinematic.css`, `landing.css`, `art-direction.css`.

---

# Vòng hai (toàn bộ phần công khai)

Phạm vi mở rộng sang mọi tệp dưới `src/app/(public)` và `src/components` (trừ admin). Không build, không bật hay tắt máy chủ. Ảnh kiểm nằm trong `sau-khung-trang-chu/`: `dung-thu-*` (người dùng thử, không giảm chuyển động), `khung-*`, `trang-chu-day-du-390.png`, `tin-tuc-the-noi-bat-anh-doc-*`, `bai-viet-nut-len-dau-*`, và số đo ở `audit/`.

## Skill đã gọi và đã áp

Đã gọi bằng công cụ Skill: `thiet-ke-ux-ui`, `impeccable`, `design-taste-frontend`. Đã đọc `web.md`, `text-fit.md`, `motion.md` của skill đầu.

- thiet-ke-ux-ui, mục 0 và text-fit: chữ một dòng, cấm `text-wrap` (đã gỡ `balance` ở `surface-refinement.css`), cấm chữ giảm độ đục để hạ cấp, nhãn nút không xuống dòng, soát dòng cuối lẻ bằng `scripts/kiem-tieu-de.ts` (đo từng từ trên trình duyệt thật). web.md: một lời kêu gọi chính lặp đầu, giữa, cuối nên bỏ dải kêu gọi thứ hai. motion.md: chỉ transform và opacity, chữ trồi so le, mặt nạ, có bản giảm chuyển động.
- impeccable: bỏ viền màu dày một bên (dòng khẩu hiệu), không thẻ lồng, bo góc một hệ (10px cho nút chọn, thay kiểu viên thuốc).
- design-taste-frontend: kiểm tương phản nút và biểu mẫu, phần đầu banner tối đa bốn khối chữ, không hai lời kêu gọi cùng ý, bento có nhịp (3 thẻ lớn cộng 4 thẻ nhỏ), ảnh thật, không dải chữ trang trí.

Script của skill:

- `ui_audit.py --render --stress` chạy trên bản HTML lưu của trang chủ và trang biogas (`scripts/snapshot-html.ts` lưu trang đã dựng, CSS nhúng). Python mặc định thiếu Playwright nên dùng Python 3.13 đã cài thêm `playwright` và `beautifulsoup4`. Chromium của Playwright Python (bản 1255) chưa có, nên trỏ một thư mục tạm có đường nối tới bản 1254 đã sẵn trên máy, không tải gì thêm.
  - Trang chủ: lần đầu 13 chặn, 206 cần sửa. Sau khi sửa: 13 chặn, 115 cần sửa. Trang biogas: 1 chặn, 114 cần sửa.
  - Mọi mục chặn đã xác minh là báo nhầm: chữ ẩn dành cho trình đọc màn hình (`tl-sr`) bị tính là cắt, và 6 dòng chú thích ảnh vượt mép ở 768 do bản lưu mang theo vị trí GSAP của cảnh xếp chồng ảnh.
  - Phần cần sửa còn lại gồm `TXT-COMPOUND` và `TXT-ORPHAN` ở đoạn văn thân (xuống dòng giữa các âm tiết ở đoạn dài là bình thường), `R-FAINT` ở nhãn ẩn của nút nổi (ẩn có chủ ý tới khi rê chuột), `MOT-LAYOUTPROP` ở chuyển cảnh hỏi đáp (`::details-content`), và font chưa nạp trong bản lưu. Đầy đủ ở `audit/ui-audit-home.txt` và `audit/ui-audit-sanpham.txt`.
- `contrast.py` cho 18 cặp màu chính (`audit/contrast.txt`): chữ thường đều từ 4,95:1 trở lên (chữ chính 11,94:1, nút cam 5,21:1, xanh 5,79:1, vàng chanh trên xanh đậm 11,96:1). Viền ô nhập 3,17:1 (đạt cho đồ họa). Viền nút mạng xã hội ở chân trang 2,51:1 không đạt nên đã đổi sang màu sáng hơn.
- `wrap_check.py` không dùng vì cần tệp font; thay bằng `scripts/kiem-tieu-de.ts` đo trên Chromium với font thật.

## Đã sửa theo danh sách

1. Nút lên đầu trang ở bài viết: máy bàn đặt ngay trên cụm nút nổi. Đo: đáy nút lên đầu 560, đỉnh nút gọi 576, không chồng. Điện thoại: đáy 768, thanh dưới đỉnh 786, không chồng.
2. Thẻ bài nổi bật ở `/tin-tuc`: khoá khung 340 tới 420px, ảnh nằm trọn trong khung với nền mờ của chính ảnh. Đo với ảnh dọc 1200x1600: cao 420px ở 1366 (trước đó hơn 600px), 444px ở 390 (xếp dọc).
3. Một lời kêu gọi cuối: dải ở chân trang tự ẩn bằng CSS `:has()` khi trang có biểu mẫu báo giá, `cta-band` hoặc thẻ kêu gọi của bài viết và trang tin. Áp cho trang chủ, liên hệ, chi tiết sản phẩm, Danh mục, nhóm bể phốt, Dự án, Hỏi đáp, bài viết, tin tức.
4. Nút chọn đổi từ viên thuốc sang bo 10px: nút quy mô, bộ lọc, nhãn gợi ý, thẻ gợi ý, tab, thanh mục lục dính, nút mạng xã hội ở chân trang, chip tóm tắt biểu mẫu. Huy hiệu nhỏ bo 8px. Chỉ giữ tròn cho số bước và nút hình tròn.
5. `InquiryForm` có thêm thuộc tính `scale` và sự kiện `tl:quote-scale` (xuất `QUOTE_SCALE_EVENT`). Ở chi tiết sản phẩm, bấm một quy mô là biểu mẫu chọn sẵn quy mô đó, bấm Nhận báo giá thì cuộn tới biểu mẫu đã chọn sẵn, không tải lại trang. Quy mô không có sẵn trong danh sách của biểu mẫu (ví dụ 5 – 10 con lợn) được thêm thành một lựa chọn riêng. Đã chạy thật ở cả hai cỡ. Thiếu thông tin liên hệ thì Tiếp tục đưa về bước 1 kèm một dòng nhắc, không báo lỗi khi khách chưa kịp nhập.
6. `/hoi-dap` có trong footer (cột Hỗ trợ) và nút Xem tất cả câu hỏi ở khối hỏi đáp trang chủ.
7. Chiều cao trang chủ ở 390 (do `shots.ts` đo, có hai bài mẫu ở khối tin): 10.843px, trước đó 17.946px. Không có bài tin: 9.639px. Cách làm: bảng so sánh chỉ hiện cột Thành Lợi dạng danh sách kèm nút Xem so sánh đầy đủ, bốn lý do thành hàng gọn có biểu tượng bên trái, ba nhóm mũi nhọn thành dải cuộn ngang có chấm chỉ báo và bốn nhóm còn lại thành hàng gọn, ba ảnh thật thành dải cuộn ngang, quy trình thành dải cuộn ngang có chỉ báo, bỏ ảnh minh hoạ ở khối báo giá, rút một đoạn giới thiệu, chân trang hai cột. Mục tiêu dưới 12.000px đạt.
8. Khối tin trang chủ dùng `PostCard` (thẻ cũ gỡ).
9. Đường nối quy trình dừng đúng tâm bước 5 ở máy bàn. Điện thoại không còn đường nối vì quy trình thành dải cuộn. Tiêu đề viết lại: "Nhận tư vấn dung tích và báo giá" thành "Nhận báo giá nhanh", chân trang "Cần báo giá nhanh", tên bước quy trình rút còn một dòng, tên thẻ sản phẩm rút ("Bể phốt, nước thải", "Thùng chở hải sản sống"), trang tin "Tin tức và kiến thức".
10. Banner: ảnh mở bằng mặt nạ quét từ phải qua trái (1,15 giây) trong khi cảnh cũ nằm dưới, ảnh phóng chậm kiểu Ken Burns (11 giây), tiêu đề trồi từng từ qua mặt nạ so le, các khối chữ còn lại trồi so le.
    - Tương phản chữ trên ảnh thật, đo bằng `scripts/do-tuong-phan-banner.ts` (điểm sáng nhất dưới từng khối chữ): ban đầu ở 390 cảnh 1 chữ nhỏ vàng chanh chỉ 2,56:1 và tiêu đề 4,07:1, đã làm đậm lớp phủ. Sau đó mọi cảnh, mọi khối chữ đều đạt: tối thiểu 5,27:1 ở 1366 (cảnh 3, chữ nhỏ vàng chanh) và 7,87:1 ở 390.
    - Tải nhanh: ảnh cảnh đầu có `fetchpriority=high` và bản 1600 (228KB thay vì 570KB) hoặc 960 (106KB) ở điện thoại, ảnh cảnh 2 và 3 chỉ tải sau khi trang nhàn. LCP đo trên bản chạy phát triển: 704ms ở 1366, 524ms ở 390 (chưa phải bản build).
11. Cụm nút nổi: rê chuột hoặc tiêu điểm bàn phím hiện nhãn có chuyển cảnh, mỗi nút có `aria-label`.
12. Đã xoá `cinematic-hero.tsx`, `hero-showcase.tsx`, `product-explorer.tsx`, `customer-gallery.tsx`, `landing-motion.tsx`, `material-lines.tsx`, `disclosure-anchor.tsx` và `cinematic.css`, `landing.css`, `art-direction.css`, sau khi tìm khắp `src`, `scripts`, `tests` không còn ai nhập.
    - Phát hiện: thư mục `backups/public-redesign-.../` (bản sao cũ, không nằm trong git) vẫn nhập bốn tệp đầu và làm `tsc` báo lỗi, nên đã thêm `backups` vào `exclude` của `tsconfig.json`. Không đụng tệp trong `backups`.
    - `scripts/export-netlify-demo.mjs` không nhập tệp nào bị xoá (nó tải CSS của trang đang chạy qua mạng), nhưng nhúng `src/lib/public-choreography.js` (đã đổi ở vòng một) và `scripts/demo/demo.js` có thể còn trỏ tới lớp cũ. Chưa sửa theo yêu cầu.
13. `.public-site p` canh trái: đã sửa tận gốc ở `public.css`. `globals.css` còn một quy tắc canh đều cho lớp `.product-detail` cũ không còn dùng (không sửa vì tệp dùng chung với admin). Lớp `.inquiry-form` thừa: đã bỏ bốn quy tắc ở `public.css`, các tệp css cũ khác đã xoá cùng `cinematic.css`, `landing.css`, `art-direction.css`.
14. Tự dùng thử bằng `scripts/dung-thu.ts` (không giảm chuyển động, hai cỡ): mở menu, đổi cảnh banner (chụp giữa lúc chuyển và sau khi xong), cuộn hết trang chủ chụp khung giữa chừng và đo khối kẹt ở trạng thái ẩn (không có khối nào kẹt ở mỗi bước cuộn). Đi từ thẻ sản phẩm tới chi tiết biogas, chọn 15 – 30 con lợn, bấm Nhận báo giá, điền tên Kiểm thử giao diện, tỉnh Phú Thọ, tới bước cuối, gửi thật. Bản ghi có dòng "Tỉnh thành: Phú Thọ" và "Quy mô: 15 – 30 con lợn (gợi ý bể 6 m³)" ở cả hai cỡ, đã xoá đúng bản ghi theo id (`deleted: 1` mỗi lần), không lỗi console.

## Số đo cuối

- `npx tsc --noEmit` sạch. `npm test`: 36 bài đạt. `shots.ts --only=public`: 38 màn, chỉ trang 404 báo mã 404 (đúng), không tràn ngang, không ảnh vỡ, trang chủ không lỗi console.
- `shots-khung.ts`: không tràn ngang, không chữ thân dưới 14px, không vùng bấm thấp (hai cỡ), không khối kẹt ở giảm chuyển động hay khi tắt JavaScript, ngăn kéo giữ tiêu điểm, biểu mẫu giữ dữ liệu khi lỗi mạng.

## Chưa làm hoặc còn lại

- Quét tiêu đề còn 40 mục dòng cuối lẻ một từ, chủ yếu ở trang phụ (ví dụ "Về Thành Lợi Composite" ở 390, tên sản phẩm trong thẻ Danh mục như "Bể phốt và bể xử lý nước thải composite", vài tiêu đề thẻ ở 1366). Cần sửa chữ hoặc bề rộng khung từng chỗ, danh sách đầy đủ ở `audit/tieu-de.json`. Trên trang chủ chỉ còn câu hỏi hỏi đáp dài (lấy nguyên từ hồ sơ).
- Chuyển cảnh mở đóng hỏi đáp dùng `block-size` (thuộc tính bố cục) vì không có cách thuần transform cho chiều cao tự động. Header giữ chiều cao cố định để nội dung không giật, hiệu ứng thu gọn chỉ còn đổ bóng và thu nhỏ logo.
- Chưa đo bản build (LCP chỉ trên bản chạy phát triển), chưa thử Safari và Firefox.
- Khối tin trang chủ chưa kiểm với ba bài thật có ảnh bìa dọc ở điện thoại (thẻ nổi bật ở trang tin đã kiểm bằng ảnh dọc thay vào trong trình duyệt).
- Python Playwright và beautifulsoup4 đã cài thêm vào Python 3.13 để chạy script skill. Thư mục trình duyệt tạm nằm ngoài dự án.

---

# Vòng ba (sửa theo báo cáo kiểm độc lập)

Nguồn: `kiem-doc-lap/BAO-CAO-KIEM.md`. Phạm vi như vòng hai (mọi thứ công khai, không đụng admin, không build, không bật hay tắt máy chủ). Ảnh và số đo mới nằm trong `sau-khung-trang-chu/` (`khung-thap-*`, `vong3-*`, `dung-thu-*`) và `sau-khung-trang-chu/audit/` (`tieu-de.json`, `do-chu.json`, `kiem-hien-dan.json`, `tuong-phan-banner.json`).

## P1

1. **Nút Gọi hotline ở màn Đã nhận yêu cầu**: ép chữ và biểu tượng trắng cho `a.tl-form-button.is-solid` (liên kết bị màu mặc định đè). Đo trên bản chạy thật sau khi gửi (cả hai cỡ): chữ trắng trên nền xanh, tương phản 5,79:1 (yêu cầu 4,5:1). Đã sửa.
2. **Khung thấp (cao dưới 520px)**: bỏ thanh trên cùng, header còn 52px (logo 36px), thanh liên hệ dưới ẩn khi đang ở đầu trang (quan sát một mốc ở đầu trang, không nghe sự kiện cuộn) và hiện thu gọn 44px khi cuộn, banner bỏ đoạn mô tả và nút gọi, chữ tiêu đề theo chiều cao khung, ngăn kéo menu chia hai cột để thấy đủ mục. Đo ở 600x360: thanh cố định chiếm 53px (trước 168px), tiêu đề không bị cắt, thấy hai nút kêu gọi ngay màn đầu. Đo ở 800x600: thanh trên và header 109px, cụm nút nổi đứng bên phải không che nút (ảnh `khung-thap-truoc-*` và `khung-thap-sau-*`). Đã sửa.
3. **Banner cảnh 2 và 3**: đã đọc kích thước thật mọi ảnh bằng sharp và xem từng ảnh.
   - Cảnh 2: ảnh bể biogas đúng sản phẩm nhưng chỉ 1200x1600 (dọc, nhỏ hơn khung ngang), nên đổi bố cục thành ảnh đóng khung bên phải ở đúng cỡ (cao tối đa 500px, không phóng), chữ bên trái, nền màu thương hiệu phủ lên `material-background.webp`. Điện thoại: ảnh ở trên, chữ ở dưới.
   - Cảnh 3: thay ảnh trẻ em mặc đồ kem ốc bằng ảnh thùng composite xanh trên xe bán tải (`pickup-blue-tank`, 1600x1200, ảnh ngang đủ lớn, đã gắn là "Phù hợp không gian vận chuyển" trong thư viện ảnh, đúng với thùng chở hải sản). Tỉ lệ phóng tối đa 1,0 ở 1366 và 1,2 ở 1920. Tiêu đề viết lại cho khớp ảnh: "Thùng chở hải sản sống, bể nuôi thủy sản và hồ cá Koi".
   - Đo lại tương phản chữ trên ảnh ở cảnh 2 và 3 sau khi đổi: đạt (từ 5,27:1 trở lên ở 1366, từ 7,87:1 ở 390, `audit/tuong-phan-banner.json`). Đã sửa.
4. **Tiêu đề, nhãn, chip rớt một từ lẻ**: đã rút chữ hoặc đổi cỡ, chip chọn quy mô và bộ lọc một dòng (`white-space: nowrap` cho thành phần vốn một dòng), không dùng ký tự dính từ hay `text-wrap`. Quét 12 trang ở 390 và 1366 (`scripts/kiem-tieu-de.ts`): tiêu đề, nhãn nút, chip và mục đóng mở còn **0** dòng cuối lẻ một từ (trước đó 38 mục sau vòng hai, kiểm viên đếm 12 chỗ ở 1366 và 17 chỗ ở 390). Đã sửa chữ: "Về Thành Lợi", "Chất lượng qua bốn bước", "Hình học và độ kín", "Nghiệm thu công trình", "Thông tin cần có", "Vùng đất trũng, nước ngầm", "Chọn dung tích theo đàn", "Thông tin thu thập", tên bước quy trình, tên nhóm sản phẩm ở danh mục và chân trang, câu hỏi "Bể bị nứt vỡ có sửa được không?". Đã sửa.
5. **Ảnh dọc đệm mờ**: bỏ hết nền mờ.
   - Thẻ tin, thẻ bài, thẻ danh mục: `object-fit: cover` canh giữa, tỉ lệ cố định (16:10 và 4:3). Thẻ nổi bật vẫn cao tối đa 420px (đo lại với ảnh dọc).
   - Đầu bài viết: ảnh dọc thì hai cột (chữ một bên, ảnh 3:4 đúng tỉ lệ một bên), ảnh ngang phủ khung 16:9, điện thoại ảnh 4:5 dưới tiêu đề. Nhận biết bằng kích thước ảnh thật khi tải xong (`cover-orient.tsx`). Đã xem ảnh `vong3-bai-viet-anh-doc-1366.png` và `-390.png`.
   - Thư viện ảnh sản phẩm: khung nền trung tính sạch, ảnh nằm trọn. Đã sửa.
6. **Ô thay thế cho nhóm chưa có ảnh xác nhận (bể phốt, bể xử lý nước thải, bồn hóa chất)**: thành phần `product-tile.tsx` dùng ở trang chủ và danh mục. Nền `material-background.webp` phủ màu thương hiệu, thông số lớn, hình vẽ nét tự vẽ bằng SVG (trụ nằm ngang chia ba ngăn cho bể phốt, cụm ba module nối ống cho xử lý nước thải, trụ đứng có nắp vòm và thang cho bồn hóa chất), cùng tỉ lệ khung với thẻ ảnh. Không gán ảnh sản phẩm chưa xác nhận. Đã sửa. Ghi chú: ô vẽ nét đúng với bể phốt và bồn hóa chất đã thấy trên ảnh, riêng cụm module xử lý nước thải chưa thấy trên trang vì nhóm này được gộp với bể phốt thành một thẻ.
7. **Màu chữ phụ**: chữ thân và chữ phụ trên nền sáng đổi về mực đậm thương hiệu `#113d4c` (24 chỗ trong 12 tệp css, cộng các biến `--muted`, `--tp-body`, `--tl-muted`), phân cấp bằng cỡ và độ đậm. Mô tả thẻ và bảng nâng tối thiểu 15px (34 quy tắc từ 14px lên 15px), đoạn văn 16px. Số cụm chữ đúng 14px (đếm trên 12 trang, `scripts/do-chu.ts`): 120 ở 1366 và 120 ở 390 (kiểm viên đếm 523 ở 1366). Cụm 14px còn lại chỉ ở nhãn nhỏ, chú thích ảnh, đường dẫn, huy hiệu, bước biểu mẫu, chip ứng dụng và dòng chữ thương hiệu "COMPOSITE". Chữ dưới 14px còn 1 cụm (nhãn ẩn của ô tìm kiếm dành cho trình đọc màn hình). Đã sửa.
8. **Lưới an toàn hiện dần**: ba lớp. (1) quan sát giao cắt có vùng đệm 200px trên và dưới nên khối hiện trước khi vào khung. (2) quét mỗi 250ms: khối đã ở trong hoặc phía trên khung nhìn mà chưa hiện thì hiện ngay, sau 1 giây kể từ khi tải thì mọi khối phía trên hiện hết, phủ cả ba hệ hiện dần đang có (`data-reveal`, `tp-rv`, `data-art-reveal`). (3) nếu script chưa chạy sau 2 giây thì CSS tự hiện mọi khối (`html:not([data-tl-motion])`). Hiện dần rút còn 300ms, so le 30ms. Kiểm bằng `scripts/kiem-hien-dan.ts`: nhảy cuộn từng 2000px, chờ 500ms rồi đếm khối còn mờ trong khung nhìn: **0** ở trang chủ, chi tiết biogas, Dự án, cả 1366 và 390. Đã sửa.

## P2 (phần công khai)

Đã làm: 1 (dải số liệu ở 1366x768 không còn bị cắt nửa chữ số: banner thấp hơn và dải kéo lên), 2 và 3 (nới khoảng thở tiêu đề các bước biểu mẫu), 4 (câu ở màn thành công căn giữa), 5 (một nhãn cho một ý định: nút chính trên banner, header và thanh nổi đều là "Nhận báo giá"; "Gửi yêu cầu" giữ cho nút gửi), 12 (chữ "COMPOSITE" của logo lên 14px, vẫn in hoa vì là chữ thương hiệu).
Chưa làm, lý do: 6 và 7 (trang Dự án và Tin tức khi chỉ có một hai mục, dòng phụ lệch đường chữ: phụ thuộc dữ liệu thật, cần có nhiều bài mới đánh giá được bố cục), 8 (khoảng trắng lớn ở ảnh chụp toàn trang Dự án: đã xử lý gốc bằng lưới an toàn hiện dần ở mục 8 trên đây, ảnh chụp toàn trang vẫn có thể hiện lại vì cách chụp), 9 (nhãn nút nổi đè chữ ở lề phải: cụm nút nổi cố định nên che chữ ở lề là không tránh được ở máy bàn, đã thu nhỏ còn nút tròn 52px), 10 (bản đồ chân trang: chưa đổi cỡ và độ sáng vì cần thử với bản đồ thật của Google), 11 (thẻ "Các dòng khác" cao thấp lệch nhau: để lộn xộn ít hơn nên chưa ép bằng nhau), 14 (một điểm dừng Tab không đo ra viền ở 390: chưa xác định được phần tử), 16 (nút chia sẻ bài viết xuống hàng ở 390 và nút chọn quy mô cao 26px: nút quy mô trong bảng ẩn ở điện thoại, chưa xác minh phần tử nào đo ra 26px). Mục 13 và 15 thuộc admin, không làm.

## Số đo cuối vòng ba

- `npx tsc --noEmit` sạch. `npm test`: 36 bài đạt. `shots.ts --only=public`: 38 màn, chỉ trang 404 báo mã 404 (đúng), không tràn ngang, không ảnh vỡ, không lỗi console.
- Chiều cao trang chủ ở 390: 10.955px (có bài mẫu ở khối tin), 9.751px khi không có bài.
- Dòng cuối lẻ một từ ở tiêu đề, nhãn nút, chip: 0 ở 390 và 1366 (12 trang).
- Cụm chữ 14px: 120 ở 1366 và 120 ở 390 (nhãn nhỏ, chú thích, đường dẫn, huy hiệu, chữ thương hiệu).
- Nhảy cuộn 2000px, chờ 500ms: 0 khối còn mờ.
- Nút Gọi hotline: 5,79:1. Banner ba cảnh: từ 5,27:1.
- Người dùng thử bằng `dung-thu.ts` (không giảm chuyển động, hai cỡ): không khối kẹt ẩn, gửi thật một yêu cầu thử, bản ghi có đủ tỉnh thành và quy mô, đã xoá đúng bản ghi theo id.

## Phát hiện trong lúc sửa

- Khi bọc đầu bài viết tôi đặt tên lớp `art-top`, trùng với nút lên đầu trang nên cả đầu bài biến mất. Đã đổi sang `art-opener` và xem lại ảnh sau sửa. Các ảnh `bai-viet-*` do `shots.ts` chụp ở giữa chừng không dùng làm bằng chứng, ảnh cuối đã chụp lại.
