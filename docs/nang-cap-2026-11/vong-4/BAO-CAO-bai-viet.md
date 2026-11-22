# Báo cáo vòng bốn, vùng bài viết (tin tức, dự án, bài viết, dự án chi tiết)

Ảnh ở `vong-4/bai-viet/` (tên `<trang>-<cỡ>-dau.png` và `-toan-trang.png`, cỡ 1366, 390, 600). Số đo ở `report-rong.json`, `report-co-bai.json`, `report-morph.json`, `report-a11y.json`. Script: `scripts/vong4-bai-viet.ts` (chạy `rong`, `co-bai`, `morph`, `a11y`), `scripts/vong4-xem-truoc.ts` (bản sao của `verify-article-render.ts` đổi tên lớp đầu bài, ảnh ra `xem-truoc/`).

## Đã đổi gì
- **Thẻ bài `post-card.tsx`, `cards.css`**: giữ nguyên props. Ảnh nằm trong `ShapeFrame` có viền đồng lệch, bốn dáng xen kẽ theo thứ tự thẻ (cạnh vát trái, vòm, cạnh vát phải, viên nang). Bài nổi bật là vòm lớn, thẻ chữ trắng đè lên mép phải vòm, một góc vát lớn. Thẻ chữ đè góc dưới ảnh ở các thẻ sau, bên đè đổi theo chẵn lẻ. Ảnh và tiêu đề gắn `morphName('post-cover', slug)` và `morphName('post-title', slug)`. Bài không bìa dùng khung xanh đậm có vân tròn. `PostMedia` có thêm prop `fill`, mặc định như cũ.
- **Danh sách tin tức (`tin-tuc/page.tsx`, `news.css`, `news-toolbar.tsx`)** và **dự án (`du-an/page.tsx`, mới `du-an.css`)**: đầu trang `ListHero` (mới, `article/list-hero.tsx`): tin tức nền sóng nhựa tối, dự án nền ảnh thật tan dần (ảnh lắp bể tròn, có parallax), mép dưới sóng nhường cho khối giấy. Lưới ba cột, thẻ giữa hạ một nhịp, hàng cuối thiếu thẻ thì dồn vào giữa (không còn khoảng trống lệch phải). Chip, ô tìm, nút, phân trang thành viên thuốc. Cuối trang là `QuoteBand` (mới, `article/quote-band.tsx`): nền xanh đen mép cung, hoa văn trống đồng ló sau, một nút cam duy nhất.
- **Trạng thái rỗng (dữ liệu thật hiện 0 bài)**: tin tức là vòm ảnh xưởng, ảnh giao hàng hình tròn đè góc, gợn nước đồng phía sau, một câu văn và ba lối đi (báo giá, hỏi đáp, sản phẩm). Dự án là vòm ảnh lắp đặt, bồn nằm đè góc, kèm năm lĩnh vực thành hàng có huy hiệu dáng vòm. Chỉ dùng ảnh đã có trong kho (xưởng, lắp đặt, giao hàng), không gán ảnh cho ba nhóm chưa xác nhận.
- **Bài viết và dự án chi tiết (`article-view.tsx`, `post-detail.tsx`, `post-detail.css`, `anchor.tsx` mới)**: đầu bài là khối tối nền sóng nhựa, ảnh bìa trong vòm viền đồng (bấm vẫn mở ảnh đủ khung), tiêu đề bọc `Morph`. Bài không ảnh bìa dùng hoa văn trống đồng. Thân bài là cột 640px nằm giữa, chia sẻ bên trái, mục lục bên phải có đường kẻ và chấm báo mục đang đọc, thanh tiến độ giữ nguyên. Trích dẫn là thẻ giấy một góc vát với huy hiệu ngoặc tròn đè mép. Bảng có đầu xanh đậm, hàng xen kẽ, một góc vát. Ảnh trong bài bo 24px đều, ảnh rộng và ảnh nổi có một góc bo lớn hơn. Cuối bài: `QuoteBand` mép cung, rồi khối sáng mép cung có bài trước, bài sau, bài liên quan (thẻ bài ba dáng). Bản xem trước của admin dùng chung `ArticleView`, đã kiểm khớp (xem dưới). `cover-orient.tsx` không còn được dùng (khung vòm cố định), để lại tệp.
- **Chân trang**: chân trang có mép cong riêng, ở trang không do tôi cấu hình thì lộ nền trắng ở mép. Tôi thêm một đoạn nối màu (`::after`) cuối `.nl`, `.da`, `.art` theo màu khối cuối. `QuoteBand` mang lớp `art-cta-card` để luật có sẵn ở `chrome.css` ẩn lời kêu gọi riêng của chân trang (tránh hai nút báo giá liền nhau).

## Bảng chữ
| Chữ cũ | Chữ mới | Dòng nguồn |
|---|---|---|
| Tin tức và kiến thức | Kiến thức về bồn bể composite, kể từ xưởng đến công trình | nhãn loại "Kiến thức sản phẩm", "Công trình thực tế" (có sẵn), xưởng Phú Thọ (mục 2.6) |
| (không có dòng dẫn) | Mỗi bài giải thích một vấn đề kỹ thuật hoặc ghi lại một công trình. | như trên |
| Cần chọn bồn bể ngay hôm nay | Kiến thức và công trình sẽ được đăng tại đây | không thêm dữ kiện, chỉ nói về chính mục |
| (rỗng) Sản phẩm, Hỏi đáp | Trong lúc chờ, phần Hỏi đáp đã có sẵn lời giải đáp về độ bền, loại nhựa, cách lắp đặt và cách sửa chữa bể composite. | mục 4.10 (`faqs`): bền hơn bể xây, loại nhựa và độ dày, sửa nứt, lắp ở vùng đất trũng |
| Dự án và công trình | Công trình đã bàn giao và vận hành ổn định | mục 2.2: "Công trình, trang trại đã bàn giao và vận hành ổn định" |
| 100+ công trình | 100+ dự án | mục 2.2 (100+ dự án) |
| (không có) | Các dự án trải từ trang trại, khu dân cư đến cơ sở thủy sản và nhà máy. | năm lĩnh vực có sẵn trong trang (chăn nuôi, dân dụng, thủy sản, công nghiệp) |
| (rỗng) | Hồ sơ từng công trình sẽ được đăng tại đây | không thêm dữ kiện |
| Năm lĩnh vực chúng tôi làm | Năm lĩnh vực công trình | danh sách lĩnh vực có sẵn |
| Chọn bồn bể cho nhu cầu của bạn | Dung tích bể được chọn từ nhu cầu sử dụng thực tế | mục 2.6 bước 2: kỹ sư dựa trên số vật nuôi, số người dùng hoặc mặt bằng để chốt phương án |
| Gửi mục đích và quy cách dự kiến để được tư vấn dung tích. | Gửi mục đích và quy cách dự kiến để kỹ sư Thành Lợi tư vấn dung tích phù hợp. | mục 2.6 |
| Có công trình cần tư vấn? (câu hỏi) | bỏ, thay bằng dải báo giá dùng chung | luật bỏ câu hỏi tu từ |
| Hãy thử từ khóa ngắn hơn hoặc chọn một gợi ý. | Từ khóa ngắn hơn hoặc một trong các gợi ý dưới đây sẽ cho kết quả rộng hơn. | |

Nhãn kỹ thuật (Trang chủ / Tin tức, Mục lục, Chia sẻ, Bài trước, Bài sau, phút đọc) giữ nguyên. Chữ của bài do người viết nhập (tiêu đề, trích dẫn, ô bảng) không sửa được bằng giao diện: tiêu đề bài mẫu dài còn dòng cuối lẻ ("ngầm" ở 390 và 600) là do chữ mẫu, không phải chữ giao diện.

## Số đo (script đo, bài mẫu `bm-v4-*`)
- **Lề trái và phải** (toạ độ thật, `getBoundingClientRect`, mọi cột `tl-fs__inner`, `art-layout`, `art-main`): lệch tối đa **0,00 px** ở 1366, 768, 390 (cũng 600). 28 phép đo trang rỗng và có bài.
- **Ký tự mỗi dòng cột đọc** (đo bằng canvas theo font thật): 70,3 ở 1366 và 768 (cột 640px, chữ 18px), 62,8 ở 600, 40,7 ở 390 (khung hẹp, không thể hơn). Trước khi chỉnh cột 660px đo ra 72,5, nên hạ còn 640px.
- Không tràn ngang ở cả bốn cỡ, 0 ảnh vỡ, 0 lỗi console, 0 ký tự cấm (`· — ; !`) trong `main`, 0 khối kẹt ẩn sau khi cuộn (lần đầu đo ra 3 tới 9 khối kẹt, do script cuộn mượt không tới đáy, đã sửa script bằng cuộn tức thì), vùng bấm đạt (36px máy bàn, 44px điện thoại) trừ `art-zoom` 2px đo được ở lần đầu khi ảnh chưa tải, lần sau không còn.
- Ngắt dòng tiêu đề và đoạn dẫn của đầu trang (script in từng dòng): sau chỉnh không còn từ lẻ, không tách từ ghép ở 1366, 768, 600 (tin tức: "Kiến thức về bồn bể composite, / kể từ xưởng đến công trình"; dự án: "Công trình đã bàn giao và / vận hành ổn định"). Ở 390 tiêu đề tin tức ba dòng, không từ lẻ. Chiều rộng tiêu đề chốt bằng `max-width` theo `em` hoặc `ch`, không dùng NBSP, `balance`, `<br>`.
- Tương phản (`contrast.py`): trắng trên xanh đen 14,73; chữ phụ trên xanh đen 12,55 và 11,28; trắng trên nút cam 5,21; chữ thân trên giấy 11,17; mục lục 8,29; chữ trong thẻ trích dẫn 10,89; liên kết 7,61. Tương phản chữ trên ảnh nền đầu trang dự án (lớp phủ 0,82) mới kiểm bằng mắt.

## Morph (thử bằng Playwright, Chrome, bài mẫu tạm)
- Danh sách sang bài: `document.startViewTransition` chạy, cả cặp ảnh bìa và cặp tiêu đề đều có `::view-transition-old` và `::view-transition-new` cùng tên (`tl-post-cover-<slug>`, `tl-post-title-<slug>`), nên ảnh và tiêu đề biến thành đầu bài. **Đạt**. Ảnh chụp giữa chuyển động: `morph-giua-chuyen-di.png`.
- Bài về danh sách (bấm đường dẫn "Tin tức"): cặp chỉ hình thành khi thẻ nằm trong khung nhìn lúc về tới danh sách. Ở khung 1366x768 thẻ nổi bật nằm dưới màn đầu (đầu trang, thanh lọc chiếm chỗ) nên chỉ có `old`, không có `new`, chuyển trang thành mờ thường. Ở khung cao 1300px cả hai cặp đủ `old` và `new`. **Chưa đạt ở 1366x768**, ghi như giới hạn đã biết.
- Nút quay lại của trình duyệt: không phát sinh view transition mới (số bản ghi không tăng). Chưa xử lý.
- Giảm chuyển động và tắt JavaScript: không khối nào mờ, không tràn, tiêu đề và thẻ hiện đủ (`report-a11y.json`).

## Kiểm
- `npx tsc --noEmit`: sạch. `npm test`: 48 trên 48 đạt.
- `verify-article-render` (bản `vong4-xem-truoc.ts`): bản xem trước admin khớp trang công khai ở 1366 và 390 (đầu bài, ảnh bìa 400x420, thân bài 640px, mục lục, chia sẻ cùng số đo).
- Tự xem từng ảnh ở 1366, 390, 600: thấy bốn dáng khung (vòm, cạnh vát hai chiều, viên nang), chồng lớp (thẻ chữ đè ảnh, ảnh tròn đè vòm, huy hiệu ngoặc đè thẻ trích dẫn), hoa văn (sóng nhựa, gợn nước, trống đồng, giấy), không đếm được dải chữ nhật xếp chồng. Mép nối đầu trang, thân, dải báo giá, chân trang liền, không đường ngang thẳng. Đã tìm ra và sửa khi xem: thẻ nổi bật mất ảnh ở 390 (khung ảnh co về 0 do `align-items:center`), dải báo giá không hiện trong ảnh chụp toàn trang (lỗi cuộn của script), chữ tiêu đề rớt từ lẻ, đơn vị "dự án" xuống dòng, cột nút "Xem..." lệch ở năm lĩnh vực, mép trắng giữa trang và chân trang, hai nút báo giá liền nhau.
- Ba vòng chụp, xem và sửa.

## Skill và script đã chạy
- Gọi thật: `anthropic-skills:thiet-ke-ux-ui` (đọc `motion.md` mục 13 đến 15 và `text-fit.md`), `anthropic-skills:impeccable` (bolder, animate, polish; không chạy `context.mjs` vì kho không có PRODUCT.md và luật dự án thắng), `anthropic-skills:design-taste-frontend`. Không gọi được `high-end-visual-design`.
- `contrast.py`: chạy (số ở trên). `copy_lint.py`: chạy cho tám chuỗi, hai "cần sửa" là báo nhầm vì hai dòng đó là đoạn dẫn, không phải tiêu đề. `ui_audit.py --code` trên `article/`, `post-detail.css`, `du-an/`: 0 chặn, 0 cần sửa, 3 xem lại là ba bộ nghe cuộn có sẵn của `article-enhancer.tsx` (thụ động, gộp theo khung hình, từ vòng hai). `ui_audit.py --render`: không chạy được (thiếu thư viện `playwright` của Python, cấm cài), thay bằng `vong4-bai-viet.ts`. `wrap_check.py`: không chạy, thay bằng bảng ngắt dòng thật của script đo.

## Dữ liệu cuối
Đếm bằng truy vấn sau mỗi lần chạy: **0 bài, 0 yêu cầu, 26 ảnh, 1 tài khoản** (đúng chỉ tiêu). Bài mẫu `bm-v4-*` và bài dò đã xoá, script dọn cả khi lỗi. `verify-article-render` tự tạo và tự xoá tài khoản tạm, đếm lại vẫn 1.

## Chưa kiểm
- Morph quay về danh sách ở 1366x768 (xem trên), nút quay lại của trình duyệt. Chưa thử Safari, Firefox. Chưa đo độ mượt cuộn (khung hình) và GSAP: `ScrollFx` do agent trang chủ gắn vào layout công khai giữa lượt, nên các lần chụp đầu chạy khi chưa có; parallax ảnh bìa chưa được đo bằng toạ độ trước và sau cuộn. Số "100+" là chữ nên không đếm.
- Tương phản chữ trên ảnh nền đầu trang dự án mới xem bằng mắt. Chưa thử bài bìa rất cao hoặc rất rộng, chưa thử bài thật (kho 0 bài). Chưa kiểm bàn phím cho hộp ảnh trong khung vòm ngoài việc giữ nguyên mã.
- Tiêu đề bài thật cần duyệt khi đăng: chữ người viết có thể rớt từ lẻ.

## Đề nghị cho bộ `decor/` và tệp ngoài vùng
1. `ShapeFrame`: nhận `ratio` theo dải (ví dụ `ratio={[0.95, 1.4]}` đổi theo bề rộng) để ảnh dọc và ngang đều đúng dáng, hiện phải chọn một tỉ lệ cho cả hai.
2. `FlowSection`: thêm `bottom="join"` hoặc xuất biến để khối cuối trang tự nối màu với chân trang. Tôi phải thêm `::after` ở `.nl`, `.da`, `.art`. Nếu chân trang đổi chiều cao mép (140px) thì sửa số này ở `article/list.css`.
3. `Morph`: ghi vào README rằng cặp chỉ hình thành khi phần tử nằm trong khung nhìn lúc đến trang đích. Bộ nên có cách ép khung nhìn đầu trang danh sách thấy thẻ nổi bật (đề nghị trang chủ và danh sách đặt thẻ đầu tiên cao dưới 700px).
4. Chân trang `chrome.css` hiện dùng danh sách lớp (`.art-cta-card`, `.nl-cta-card`) để ẩn lời kêu gọi riêng: nên đổi thành một thuộc tính chung như `data-page-cta`, khỏi mượn lớp cũ.
5. Cần thêm hoa văn: chưa cần.
