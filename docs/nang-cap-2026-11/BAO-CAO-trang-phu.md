# Báo cáo agent trang-phu

Nội dung lấy từ hồ sơ Final V2 và `src/lib/site-facts.ts`, rút gọn, không thêm số. Cam kết tuyệt đối ("100%", "tuyệt đối", "vĩnh viễn", "an toàn tuyệt đối", "trọn đời") đã viết giảm.

## Đã làm theo từng màn

- **Giới thiệu** (`/gioi-thieu`): đầu trang rừng có ảnh xưởng, dải số liệu `metrics` nền vàng chanh, câu chuyện kèm mốc 2010 / 15+ năm / 25+ tỉnh, tầm nhìn và sứ mệnh hai cột tối, bốn giá trị, năng lực sản xuất (ảnh, nguyên vật liệu, sơ đồ năm khu trong nhà máy), kiểm soát chất lượng bốn bước dạng sơ đồ, lĩnh vực ứng dụng.
- **Danh mục** (`/san-pham`): bảy nhóm đúng thứ tự hồ sơ, ba dòng mũi nhọn lên đầu có nhãn "Mũi nhọn", bộ lọc theo lĩnh vực (lọc tại chỗ có chuyển cảnh, giữ được `?nhom=`, tên nhóm cũ vẫn dẫn đúng), thẻ có ảnh thật trong khung nền mờ, dòng chưa có ảnh xác nhận thì thẻ dựa vào thông số.
- **Nhóm bể phốt và xử lý nước thải**: hai thẻ, khối "chưa rõ chọn loại nào", hỏi đáp.
- **Chi tiết sản phẩm** (`/san-pham/[slug]`, đủ tám sản phẩm): bộ ảnh, tên, mô tả, ô thông số, nút chọn quy mô, bảng chọn dung tích, cấu tạo và ưu điểm, phụ kiện, thông tin cần cung cấp, hỏi đáp (có dữ liệu có cấu trúc cho tìm kiếm), biểu mẫu báo giá ngay tại trang, sản phẩm liên quan, thanh mua dính kèm mục lục ở máy bàn.
  - Bảng 4.2 Biogas (mã TLC-BIO, số đường kính theo hồ sơ, bỏ 2,70 / 2,45 cũ), 4.3 bể phốt, 4.4 bể cá, 4.7 thùng rác nằm trong `src/lib/product-guidance.ts` theo slug. Bồn hóa chất, thùng chở, theo yêu cầu dùng khối điểm nhấn thay bảng (hồ sơ không có bảng).
  - Chọn quy mô: bấm nút thì dòng bảng sáng lên, hiện gợi ý dung tích, "Nhận báo giá" cuộn tới biểu mẫu. Bấm vào dòng bảng cũng chọn được.
  - Bảng ở điện thoại đổi thành thẻ từng dòng. Cỡ trung (761–1100px) cuộn ngang có cột đầu dính, bóng mờ hai mép và dòng gợi ý vuốt.
  - Thư viện ảnh: mũi tên, phím trái phải, vuốt, phóng to trong hộp thoại có chuyển cảnh mở và đóng, tiêu điểm về nút "Phóng to".
- **Dự án** (`/du-an`): lời dẫn, năm nhóm lĩnh vực (ghi rõ là nhóm lĩnh vực, chưa phải dự án đã bàn giao, không bịa tên hay địa điểm), lưới thẻ ảnh khi có bài loại dự án, trạng thái rỗng trung thực dẫn tới liên hệ.
- **Liên hệ**: thẻ thông tin đủ dòng (pháp nhân, mã số thuế, địa chỉ, hai hotline bấm gọi, Zalo, email, giờ làm), biểu mẫu, bản đồ Google `facts.mapEmbed` tải lười có khung và chú thích. Đã kiểm bản đồ hiện đúng khi cuộn tới.
- **Hướng dẫn đặt hàng**: quy trình năm bước, tab thông tin cần cung cấp theo bảy dòng sản phẩm (có phím mũi tên), ba mốc thời gian lấy từ hỏi đáp, vận chuyển và lắp đặt (mốc `#van-chuyen`), bốn bước lắp ở nền đất trũng, khối dẫn sang bảo hành (mốc `#bao-hanh`).
- **Trang mới**: `/chinh-sach-bao-hanh` (chỉ nói điều hồ sơ có), `/hoi-dap` (năm câu, có dữ liệu có cấu trúc). Cả hai đã vào `sitemap.ts`.
- **Chính sách bảo mật**: giữ nguyên nội dung, nâng trình bày (mục lục, bốn khối).
- **404**: lối về, gọi hotline, gợi ý ba sản phẩm. Dùng `(public)/[...slug]/page.tsx` gọi `notFound()` để trang 404 nằm trong khung có đầu trang và chân trang, vẫn trả mã 404. `app/not-found.tsx` còn lại làm dự phòng.
- **Mọi trang phụ**: đầu trang bốn tông (rừng, mòng két, vàng chanh, giấy) cùng một hệ, đường dẫn, hiện dần khi cuộn (tự viết, mặc định thấy hết, có đồng hồ an toàn 5 giây, bản giảm chuyển động hiện đủ), phản hồi nhấn trên nút, thẻ, nút lọc, tab, chữ thân 16px, chữ phụ tối thiểu 14px.

## Dữ liệu
- `catalogue.ts` cập nhật theo hồ sơ, giữ nguyên slug. `xe-gom-rac` đổi tên hiển thị thành "Thùng rác và xe gom rác". Thứ tự: biogas, phốt, xử lý nước thải, thủy sản, hóa chất, thùng chở, rác, theo yêu cầu.
- `product-groups.ts`: tên và thứ tự nhóm theo hồ sơ (menu đầu trang và chân trang đổi theo vì dùng chung hàm này).
- `scripts/apply-final-content.ts`: chỉ ghi đè dòng còn nguyên như hai bản seed cũ (bản trong mã trước đó và bản đang nằm trong cơ sở dữ liệu cục bộ), in ra đã đổi gì. Đã chạy trên cơ sở dữ liệu cục bộ: đổi 8 dòng. Chạy lại: đã khớp 8, đổi 0. Chỉ đụng bảng `products`.

## Luật skill đã áp
- `thiet-ke-ux-ui`: mục 0.2 chữ một dòng, không NBSP, không `text-wrap`, không `<br>`; 0.3 không chữ xám để hạ cấp, không dấu cấm; 0.4 số lớn thay chữ, bỏ nhãn thừa, thẻ có viền rõ; ngân sách ký tự cho tiêu đề và nút (tiêu đề trang liên hệ rút còn "Liên hệ và báo giá" để không rớt dòng lẻ ở 390).
- `impeccable`: bảng cấm tuyệt đối (không viền một bên, không chữ gradient, không kính mờ), tương phản (đã dùng nút cam #b94918 trên chữ trắng), trạng thái đầy đủ (rỗng, chưa chọn, đã chọn), giảm chuyển động, chỉ hoạt họa `transform` và `opacity`.
- `design-taste-frontend`: nhịp đa dạng bố cục (không lặp ảnh trái chữ phải quá hai lần liền), hero đủ một khung nhìn, một nhãn mỗi ý, ảnh thật thay minh họa vẽ tay, thanh dính có mục đích, hiện dần có lý do.
- Ghi chú: DE-BAI cho phép "–" cho khoảng số nên giữ, skill taste cấm. Theo DE-BAI.

## Đã kiểm
- `npx tsc --noEmit` sạch. Quét ký tự cấm (`·`, `—`, `;`, `!`, `&nbsp;`, `<br>`, `text-wrap`, chữ in hoa cả cụm) trong mọi tệp của vùng: sạch.
- `scripts/shots.ts --only=public` (38 màn, 1366 và 390) vào `docs/nang-cap-2026-11/sau-trang-phu`: không tràn ngang, không ảnh vỡ ở các trang của tôi, không lỗi console ngoài chính mã 404 của trang 404 và một lỗi tải ảnh 404 ở trang chủ (không thuộc vùng tôi).
- `scripts/shots-trang-phu.ts` (ảnh vào `sau-trang-phu/tuong-tac`): chọn quy mô sáng đúng một dòng, cuộn tới biểu mẫu; phím mũi tên đổi ảnh; Escape đóng và tiêu điểm về nút "Phóng to"; thanh dính hiện sau khi cuộn qua phần đầu; lọc thủy sản còn 2 thẻ; bảng thành thẻ ở 390 không tràn; 404 trả mã 404. Đã tự xem ảnh từng màn ở hai cỡ.
- Kích thước vùng bấm: nút và chip từ 44px; ô lọc, tab 44px.

## Chưa kiểm
- Chưa chạy `npm run build` (đề cấm). Chưa kiểm Lighthouse hay tốc độ.
- Chưa đo tương phản bằng script, mới dựa vào cặp màu đã chọn. Chưa kiểm bằng đọc màn hình thật.
- Chưa kiểm điều hướng bằng bàn phím trọn trang, chỉ kiểm thư viện ảnh, tab đặt hàng.
- Vuốt ngang ảnh chỉ kiểm bằng sự kiện con trỏ mô phỏng, chưa thử trên máy thật.
- Ảnh trang chi tiết bể phốt, bể xử lý nước thải, hóa chất dùng khung thông số (chưa có ảnh xác nhận).

## Điều cần chú ý, cần agent khác hoặc chủ dự án quyết
1. **Hai lời kêu gọi liền nhau**: chân trang của agent khung-trang-chủ đã có dải "Cần tư vấn dung tích và báo giá". Tôi bỏ dải của mình ở Giới thiệu, Hướng dẫn đặt hàng, Bảo hành (vì các trang này đã có nút cam trong thân), nhưng còn dải ở Danh mục, Nhóm bể phốt, Dự án, Hỏi đáp (`src/components/pages/cta-band.tsx`). Nếu chân trang giữ dải của nó thì nên bỏ dải của tôi, một dòng ở mỗi trang.
2. **Biểu mẫu**: biểu mẫu mới theo bước chỉ hiện ô nhu cầu ở bước cuối nên tôi không ghi sẵn quy mô vào được (`prefilled: null`). Mã ghi sẵn có sẵn trong `scale-picker.tsx`, sẽ chạy nếu biểu mẫu có ô `textarea[name="message"]` trong `#tu-van` lúc bấm. Nên cho biểu mẫu nhận tên quy mô qua thuộc tính (ví dụ `scale`).
3. **Ảnh gán cho biogas**: ảnh thứ hai ("Thành phẩm tại xưởng") là các bồn trắng nằm ngang, có thể là bể phốt. Giữ nguyên như bản cũ, cần chủ doanh nghiệp xác nhận.
4. **Mâu thuẫn hồ sơ**: báo giá "1 – 24 giờ" (quy trình năm bước) và "15 – 60 phút" (hỏi đáp). Trang đặt hàng ghi cả hai: báo giá nhanh 15 – 60 phút, báo giá chi tiết 1 – 24 giờ.
5. Link `/hoi-dap` chưa có trong menu hay chân trang, nên thêm vào chân trang (cột Hỗ trợ). `/chinh-sach-bao-hanh` chân trang đã có.
6. Thanh dính của tôi đặt `top: 69px` ngay dưới đầu trang dính của agent khung (cao 68px khi đã cuộn). Nếu đổi chiều cao đầu trang cần đổi lại.
7. Không có chính sách CSP chặn iframe. `X-Frame-Options: DENY` không ảnh hưởng iframe bản đồ nhúng.
8. Lúc chụp có hai lần dev server báo lỗi biên dịch do tệp của agent admin đang sửa dở (`admin-editor.css`, `post-editor.tsx`), đã chờ hết rồi chụp lại.
9. Lỗi hydration "tl-js" trên `<html>` thấy lúc đầu đến từ tập lệnh trong layout gốc của agent khác, sau đó đã hết.

## Tệp đã sửa hoặc tạo
Sửa: `src/lib/catalogue.ts`, `src/lib/product-guidance.ts`, `src/lib/product-groups.ts`, `src/components/product-card.tsx`, `src/components/product-photo-gallery.tsx`, `src/components/product-assets.css`, `src/app/sitemap.ts`, `src/app/not-found.tsx`, `src/app/(public)/secondary-pages.css`, `src/app/(public)/gioi-thieu/page.tsx`, `san-pham/page.tsx`, `san-pham/[slug]/page.tsx`, `san-pham/[slug]/product-detail.css`, `san-pham/be-phot-va-xu-ly-nuoc-thai/page.tsx`, `du-an/page.tsx`, `lien-he/page.tsx`, `huong-dan-dat-hang/page.tsx`, `chinh-sach-bao-mat/page.tsx`, `scripts/shots.ts` (chỉ thêm một dòng đường dẫn).
Tạo: `src/components/pages/` (`pages.css`, `reveal.tsx`, `page-hero.tsx`, `cta-band.tsx`, `catalogue-browser.tsx`, `scale-picker.tsx`, `faq-list.tsx`, `order-tabs.tsx`, `not-found-view.tsx`), `src/app/(public)/chinh-sach-bao-hanh/page.tsx`, `src/app/(public)/hoi-dap/page.tsx`, `src/app/(public)/not-found.tsx`, `src/app/(public)/[...slug]/page.tsx`, `scripts/apply-final-content.ts`, `scripts/shots-trang-phu.ts`.
Không sửa `scripts/seed.ts` (vẫn đọc `catalogue.ts` mới và không ghi đè).
