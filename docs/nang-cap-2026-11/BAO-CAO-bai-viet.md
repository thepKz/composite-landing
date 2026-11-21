# Báo cáo agent bai-viet

Trạng thái: xong và đã chụp, đã tự xem ảnh ở 1366 và 390. `npx tsc --noEmit` sạch. Ảnh ở `docs/nang-cap-2026-11/sau-bai-viet/` (lát cắt ở `lat/`, số đo ở `report.json`).

## Đã làm

Trang bài viết `/tin-tuc/[slug]` và `/du-an/[slug]` (viết lại `src/components/post-detail.tsx`, `post-detail.css`, `rich-content.tsx`):
- Đầu bài: đường dẫn một dòng (tên bài cắt bằng dấu ba chấm), nhãn loại nội dung, tiêu đề lớn, tóm tắt, ngày viết kiểu Việt ("20 tháng 11, 2026"), thời gian đọc tính từ số chữ (200 chữ mỗi phút), ngày cập nhật khi khác ngày đăng.
- Ảnh bìa: khung 16:9 (4:3 ở điện thoại), ảnh nằm trọn trong khung, hai bên là chính ảnh làm mờ. Ảnh dọc hay ngang đều không bị cắt, không còn dải xám.
- Thân bài: cột 720px, chữ 18px (17px ở điện thoại), giãn dòng 1,85, h2 có đường kẻ trên, h3, h4, danh sách, trích dẫn dạng thẻ, bảng có viền, tiêu đề cột, hàng xen kẽ, khung cuộn ngang riêng kèm bóng báo còn cuộn được, mã, đường kẻ, video, liên kết ngoài mở tab mới với `noopener noreferrer`.
- Ảnh: chú thích, bấm phóng to trong hộp `dialog` (có chuyển cảnh mờ vào ra, Esc đóng, nút đóng, trước và sau bằng nút hoặc phím mũi tên, tiêu điểm trả về nút đã mở, bấm nền để đóng). Trình hiển thị đọc thêm thuộc tính `align` (left, right, center, wide, full), `width` (10 đến 100) và `caption` của ảnh nếu agent admin thêm. Thiếu hoặc lạ thì dùng mặc định. Nút lạ thì hiện nội dung con thay vì bỏ.
- Mục lục tự sinh từ h2, h3 (mã neo duy nhất, tiếng Việt bỏ dấu), dính bên phải ở máy bàn, đánh dấu mục đang đọc bằng IntersectionObserver, bấm cuộn mượt (dùng sẵn `scroll-behavior` của trang). Điện thoại: khối gập đầu bài, tự gập lại sau khi bấm. Dưới ba tiêu đề thì ẩn.
- Thanh tiến độ đọc cam mảnh trên cùng, nút lên đầu trang, thanh chia sẻ dính bên trái ở máy bàn và hàng chia sẻ cuối bài: sao chép liên kết (thông báo "Đã sao chép liên kết", có phương án dự phòng), Facebook, Zalo (liên kết chia sẻ, không nhúng script ngoài).
- Cuối bài: khối kêu gọi báo giá (nút cam #b94918 như nút ở thanh trên) gắn sản phẩm liên quan theo từ khoá trong tiêu đề và tóm tắt (không khớp thì trỏ về danh sách sản phẩm), bài trước và bài sau cùng loại, bài liên quan dạng thẻ (không ảnh thì có khung biểu tượng).
- Dữ liệu có cấu trúc: `@graph` gồm Article (thêm wordCount, timeRequired, articleSection) và BreadcrumbList; metadata thêm Twitter card, siteName, section. Canonical, ảnh chia sẻ giữ nguyên.
- Trang dự án: cùng hệ, thêm khối thông tin chỉ gồm trường có thật (loại hình, ngày đăng, cập nhật, sản phẩm liên quan). Không bịa trường.

Trang danh sách `/tin-tuc` (viết lại `page.tsx`, thêm `news.css`):
- Bài mới nhất chiếm rộng ở trang 1, sau đó lưới 3 cột (2 rồi 1 theo cỡ màn). Thẻ có viền rõ, di chuột nhấc nhẹ, ảnh phóng nhẹ, mũi tên trượt, hiện dần so le.
- Lọc loại nội dung bằng thẻ bấm có số bài (đếm theo từ khoá đang tìm), ô tìm gọn có biểu tượng, thẻ gợi ý từ khoá (Biogas, Bể phốt, Bể cá), dòng số kết quả, phân trang có nút trước, sau, số trang. Trạng thái trên đường dẫn (`q`, `kind`, `page`) giữ nguyên, trang quá số thì 404 như cũ.
- Trạng thái rỗng thật (chưa có bài, tìm không thấy, loại chưa có bài) có lối đi tiếp, không bài giả. Bỏ thanh bên, thay bằng một khối báo giá gọn cuối trang khi có bài.
- `/kien-thuc` và `/kien-thuc/[slug]` giữ nguyên: proxy chuyển hướng 301, trang chỉ trả 404 cho bản nháp. Không đụng.

Hành vi cũ giữ nguyên: truy vấn lọc, tìm ILIKE, phân trang, chuyển hướng dự án sang `/du-an`, bài nháp và bài hẹn giờ không lộ (điều kiện `status='published' AND published_at<=now()` ở mọi truy vấn mới).

Chuyển động: hiện dần so le (`data-art-reveal`, chỉ ẩn khi đã có JavaScript, khối đang thấy sẵn hiện luôn không chớp), chuyển cảnh hộp ảnh, mục lục đánh dấu mượt, phản hồi nhấn (`.pressable`), toast. Chỉ transform và opacity. Bản giảm chuyển động hiện đủ, không có gì kẹt ở opacity 0. Không JavaScript thì bài đọc đủ (mục lục và nút bấm chỉ là bổ trợ).

## Luật skill đã áp
- thiet-ke-ux-ui mục 0: chữ một dòng cho nhãn và nút, không NBSP, không balance, pretty, không `<br>`, không chữ xám để hạ cấp (dùng xanh đậm đặc), thẻ có sức nặng hoặc bỏ thẻ, hai bên bảng có viền, trạng thái đủ (rỗng, tìm không thấy, đã sao chép).
- impeccable: không sọc viền bên trên thẻ (mục lục đang đọc dùng nền, không dùng sọc), không chữ gradient, độ rộng cột đọc 65 đến 72 ký tự, ease-out mũ, không nảy, bản giảm chuyển động bắt buộc, reveal không chặn nội dung.
- design-taste-frontend: khung ảnh nền mờ thay vì cắt, bố cục ba cột (chia sẻ, thân bài, mục lục), IntersectionObserver và CSS thay cho theo dõi cuộn nặng (chỉ một bộ nghe cuộn thụ động gộp bằng rAF cho thanh tiến độ), một màu nhấn cam cho báo giá. Luật cấm gạch ngang, "·" áp theo đề chung (đề chung thắng khi mâu thuẫn, ví dụ dùng Be Vietnam Pro và lucide-react sẵn có).

## Tệp
Sửa: `src/components/post-detail.tsx`, `post-detail.css`, `rich-content.tsx`, `src/app/(public)/tin-tuc/page.tsx`.
Mới: `src/components/article/` (`article-utils.ts`, `article-enhancer.tsx`, `reveal.tsx`, `post-card.tsx`, `cards.css`), `src/app/(public)/tin-tuc/news.css`, `scripts/shots-bai-viet.ts`.
Không đụng: `posts.ts`, `post-path.ts`, `post-time.ts`, `seo.ts`, các trang `[slug]` (đã dùng sẵn PostDetail).

## Đã kiểm (bằng `scripts/shots-bai-viet.ts`, bài mẫu tạm chèn rồi xoá, đếm lại bằng truy vấn: còn 0 bài mẫu)
- 18 mục chụp: danh sách (trang 1, trang 2, lọc dự án, rỗng), bài đầy đủ, bài tiêu đề rất dài kèm bảng 6 cột, bài không ảnh bìa, dự án chi tiết, ở 1366 và 390. Không tràn ngang, không ảnh vỡ, không chữ thân dưới 16px, không ký tự cấm (·, —, ;, !) trong main, không khối kẹt ở opacity 0.
- Tương tác thật (bật chuyển động): hộp ảnh mở, Esc đóng, tiêu điểm trả về nút đã mở (đều đúng, cả hai cỡ); sao chép liên kết hiện thông báo; mục lục máy bàn đánh dấu mục đang đọc, mục lục điện thoại mở, bấm mục thì tự gập; bảng 6 cột cuộn ngang trong khung riêng, trang không tràn; thanh tiến độ chạy, nút lên đầu trang hiện sau khi cuộn.
- Lỗi đã thấy bằng mắt và đã sửa: ô tìm hiện nhãn thừa (thiếu lớp ẩn), nút lên đầu trang và thông báo đè thanh liên hệ dưới đáy ở điện thoại (nâng lên), nút chia sẻ co chữ ở điện thoại (cho xuống hàng), cột đầu bảng rớt dòng giữa mã sản phẩm (đặt bề rộng tối thiểu), mục lục giữ mục cũ khi về đầu trang (xoá đánh dấu), thẻ lọc xếp ba tầng ở điện thoại (một hàng cuộn ngang).
- Phát hiện về dữ liệu: ảnh trong thư viện chỉ phục vụ công khai khi gắn với bài đã xuất bản qua bảng nối. Script cũ của tôi quên bước này nên ảnh 404, đã sửa trong script. Thư viện có một số ảnh mất tệp thật (404 dù có gắn bài), script chỉ dùng ảnh có tệp.

## Chưa kiểm
- Liên kết Zalo (`sp.zalo.me/plugins/share?url=`) chưa mở thật trên Zalo.
- Hộp ảnh chưa thử bằng bàn phím Tab giữ vòng trong hộp (dùng thẻ `dialog`, hộp thoại chuẩn nên trình duyệt tự giữ, nhưng chưa đo).
- Lần chạy đầu tiên của script có một lỗi console 404 trên `/tin-tuc` (chỉ lần tải đầu, tải lại thì không có, không tái hiện bằng script riêng).
- Chưa thử với bài thật vì cơ sở dữ liệu chưa có bài; chưa thử ảnh bìa cực rộng (panorama) hay cực cao.
- Chưa đo điểm Lighthouse, chưa thử trên Safari và Firefox (bố cục dùng `:has` cho bóng báo bảng cuộn, `@starting-style` cho chuyển cảnh hộp ảnh: trình duyệt cũ chỉ mất hiệu ứng, không mất nội dung).
- Lỗi hydrate toàn trang do lớp `tl-js` trên html (không phải của vùng này) đã thấy ở lượt chụp đầu rồi tự hết sau khi agent khác sửa.

## Cần agent khác
- Agent admin: nếu thêm thuộc tính ảnh thì dùng đúng tên `align` (left, right, center, wide, full), `width` (số 10 đến 100), `caption`, và cho `cleanDocument` giữ chúng. Hiện `cleanDocument` chỉ giữ `src`, `alt`, `title`, nên trình hiển thị chưa thấy các thuộc tính mới cho tới khi sửa.
- Agent trang chủ: khối tin ở trang chủ nên dùng `PostCard` trong `src/components/article/post-card.tsx` cho đồng bộ.
