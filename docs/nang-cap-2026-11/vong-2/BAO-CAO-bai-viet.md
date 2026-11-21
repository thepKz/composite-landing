# Báo cáo vòng hai, vùng bai-viet

Ảnh trước ở `vong-2/bai-viet/truoc/`, ảnh sau ở `vong-2/bai-viet/sau/` (mỗi mục có bản toàn trang và bản màn đầu `-dau`; số đo ở `report.json`). Script chụp: `scripts/vong2-bai-viet.ts`.

## Skill đã gọi, script đã chạy
- Đã gọi `impeccable`, `design-taste-frontend`, `thiet-ke-ux-ui`.
- `contrast.py`: chạy được (cần `PYTHONUTF8=1` trên Windows). Chữ thân 11,07:1, liên kết 7,54:1, chữ phụ 10,66:1, chữ trắng trên nền xanh đậm 12,58:1, chữ trắng trên nút cam 5,21:1, biểu tượng khung giữ chỗ 5,60:1. Đều đạt.
- `ui_audit.py`: KHÔNG chạy được (thiếu thư viện `bs4`, đề bài cấm `npm install`, `pip install` cũng không làm). Thay bằng số đo của chính `vong2-bai-viet.ts` (tràn ngang, chữ rớt từ lẻ, vùng bấm, ký tự cấm, lỗi console).
- `wrap_check.py --scan`: không đọc được thư mục (lỗi quyền), chỉ cho 1 lỗi giả. Thay bằng quét `grep` các ký tự `&nbsp;`, `text-wrap`, `·`, `—` trong vùng của tôi: 0 chỗ.

## Điểm yếu thấy trước khi sửa
1. Danh sách tin có 2 bài ở lưới 3 cột: thẻ nằm lẻ trái, bên phải trống (P2-6).
2. Mục lục máy bàn đánh dấu sai: về đầu trang vẫn sáng mục cuối "Lưu ý sau cùng".
3. Ảnh bìa ngang ở 1366x768 nằm dưới màn đầu (bắt đầu ở y=660), người đọc không thấy ảnh.
4. Khung ảnh thẻ tin: nền nhạt trống khi cuộn nhanh, ảnh bật ra đột ngột; ảnh 404 sẽ hiện biểu tượng ảnh vỡ.
5. Bài không bìa: ô thay thế nhạt, không ăn nhập với thẻ có ảnh.
6. Bảng 6 cột bị ép trong 720px, ô chữ rớt nhiều dòng.
7. Tiêu đề bài ảnh dọc rớt từ lẻ ("trũng"), cỡ chữ hai cột quá lớn.
8. Ở 390: hàng chia sẻ sát mép (P2-16), đường dẫn và thẻ loại cao 36px, gợi ý tìm 40px (dưới 44px).
9. 600x360: đường dẫn chiếm chỗ, tiêu đề bị đẩy xuống.
10. Tìm và lọc phải tải lại cả trang, không có phản hồi trong lúc chờ.

## Đã sửa gì
- `src/components/post-detail.css`: đầu bài gọn hơn (đệm và cỡ chữ), ảnh bìa tỉ lệ 2:1 để hiện sớm trong màn đầu (ảnh dọc vẫn hai cột 3:4, không đệm mờ, chữ nhỏ lại cho khỏi rớt từ), ảnh bìa vào bằng trượt nhẹ, hàng chia sẻ cuối bài ở 390 chia đều ba nút một hàng, vùng bấm 44px ở điện thoại, bảng giữ cột tối thiểu 150 (máy bàn) và 132 (điện thoại) rồi cuộn ngang trong khung riêng có bóng báo, khung thấp dưới 480px bỏ đường dẫn cho tiêu đề lên đầu. Có bản giảm chuyển động.
- `src/components/article/article-enhancer.tsx`: mục lục tính lại mục đang đọc từ vị trí thật của tiêu đề mỗi lần có tiêu đề qua đường đọc (IntersectionObserver, không thêm bộ nghe cuộn), nên cuộn nhanh và về đầu trang đều đúng.
- `src/components/article/post-card.tsx`, `cards.css`, `reveal.tsx`: khung ảnh thẻ có chủ đích (nền xanh đậm kèm biểu tượng làm chỗ giữ), ảnh hiện dần khi tải xong, chốt an toàn 5 giây, ảnh lỗi thì ẩn ảnh để lộ khung giữ chỗ. Bài không bìa dùng chính khung này với vân tròn mờ, hợp tông xanh nhận diện.
- `src/app/(public)/tin-tuc/page.tsx`, `news.css`, mới `news-toolbar.tsx`: lưới sáu cột tự co theo số bài (đủ ba thì ba cột, dư hai thì hai thẻ cuối chia đôi hàng, dư một thì thẻ cuối là thẻ ngang cả hàng; hai cột ở dưới 1000px, một cột ở dưới 700px). Bài mới nhất vẫn là thẻ lớn. Thanh tìm và lọc là thành phần máy khách: gõ là tìm sau 300 ms, vạch cam chạy khi đang tải, thẻ gợi ý và thẻ loại là liên kết nạp trước. Không có JavaScript thì nút Tìm vẫn gửi như cũ. Màn rỗng giữ nguyên (đã trung thực).
- Mục lục điện thoại (mục 4 đề bài): đã xác nhận trong mã và bằng bài mẫu đúng ba tiêu đề h2: hiện ở 390 và 600, ẩn ở 1366 (nơi có mục lục dính bên phải). Quy tắc là hiện khi bài có từ 3 tiêu đề h2 hoặc h3, vì dưới 3 mục thì mục lục không giúp điều hướng. Điều kiểm viên thấy (3 mục không hiện) rất có thể do bài đó chỉ có h2 và h3 rỗng hoặc h4, vốn không vào mục lục; tôi không tái hiện được.

## Đã kiểm (số đo từ script, bài mẫu `bm-v2-*`, đã xoá hết)
- Ba cỡ 1366x768, 390x844, 600x360, 33 mục chụp: không tràn ngang, không lỗi console do vùng này, không ảnh vỡ, không ký tự cấm trong main, không khối kẹt ẩn.
- Danh sách 1, 2, 3, 7 bài: không còn thẻ lẻ trái với khoảng trống phải (xem `tin-tuc-N-bai-1366.png`).
- Tương tác thật (bật chuyển động) ở cả ba cỡ: mục lục không sáng ở đầu trang và sáng đúng mục khi cuộn giữa bài, thanh tiến độ chạy (0,41 ở giữa bài 1366), hộp ảnh mở, Esc đóng, tiêu điểm về nút đã mở, ba nút chia sẻ cùng một hàng, ảnh thẻ không kẹt ẩn, tìm nhanh đổi địa chỉ và ra màn rỗng sau 386 đến 393 ms.
- Vùng bấm ở 390 và 600: không phần tử nào dưới 44px trong vùng bài viết (còn liên kết email 26px ở thanh trên cùng của header, ngoài vùng).
- `npx tsc --noEmit`: không lỗi trong vùng của tôi (còn 1 lỗi ở `scripts/vong2-khung.ts` của agent khác). `npm test`: 40 trên 40 đạt. `verify-article-render.ts`: đạt, màn xem trước của admin khớp trang công khai ở 1366 và 390 (tôi không đổi cấu trúc `ArticleView`).
- Số đếm cuối: 0 bài, 0 yêu cầu. Ảnh 30 và tài khoản 2, khác con số dự kiến 26 và 1: tôi không chèn ảnh hay tài khoản nào, chênh lệch do agent khác đang chạy cùng lúc (admin). Cần người điều phối đối chiếu.

## Chưa kiểm
- `ui_audit.py` (xem trên). Chưa đo hiệu năng Lighthouse, chưa thử Safari và Firefox.
- Từ lẻ cuối dòng còn đo ra ở tiêu đề h2 và mục danh sách ở 390 và một số tiêu đề h1 của bài mẫu: phụ thuộc độ dài tiêu đề thật, không cấm được bằng CSS khi bị cấm `balance`, `pretty` và NBSP. Tiêu đề thật cần duyệt khi đăng.
- Chưa thử ảnh bìa panorama hay cực cao. Chưa thử Zalo thật. Chưa thử với bài thật vì chưa có bài.
- Một ảnh `/api/media/...` trả 404 trên `/tin-tuc` và `/du-an` ở dữ liệu hiện tại (không phải bài mẫu của tôi); khung giữ chỗ che được, nhưng nên kiểm tệp ảnh thiếu.
- Thư mục `vong-2/bai-viet/tmp` còn lại (ảnh cắt tạm của tôi), lệnh xoá bị chặn; nhờ người điều phối xoá.

## Đề nghị cho tệp ngoài vùng
- Header: liên kết email thanh trên cùng cao 26px, dưới 36px của máy bàn.
- Agent trang chủ: khối tin ở trang chủ nên dùng `PostCard` (khung ảnh mới có chỗ giữ và ảnh hiện dần).
- Thanh liên hệ cố định ở dưới đáy điện thoại che một phần bài ở khung 600x360 (xem `bai-viet-600-dau.png`).

## Vòng sửa (theo lời chủ dự án 21/11 và kiểm viên lượt hai)

Ảnh chụp lại ở `vong-2/bai-viet/sau/` (33 mục, ba cỡ). Script: `scripts/vong2-bai-viet.ts` (đã thêm cách cuộn tức thì của kiểm viên và đo mục lục sau khi chụp toàn trang).

### Bảng chữ: bỏ hay giữ
| Chữ | Quyết định | Lý do |
|---|---|---|
| Đường dẫn: tên bài lặp lại ngay trên tiêu đề | BỎ (còn Trang chủ / Tin tức hoặc Dự án) | Tiêu đề ngay dưới đã nói; còn xoá luôn lỗi đường dẫn xuống hai dòng ở 390 (P2-7). Dữ liệu đường dẫn cho công cụ tìm kiếm vẫn đủ ba cấp |
| Nhãn "Mục lục" trên mục lục máy bàn | BỎ khỏi mắt, giữ nhãn ẩn cho trình đọc màn hình | Danh sách tiêu đề dính bên phải nhìn là hiểu |
| "Mục lục bài viết" trên nút gập điện thoại | Giữ, rút còn "Mục lục" kèm số mục | Nút gập cần tên để biết bấm ra gì |
| "Chia sẻ bài viết" trên hàng nút cuối bài | BỎ khỏi mắt, giữ nhãn ẩn | Ba nút có biểu tượng và tên (Sao chép, Facebook, Zalo) |
| Khối thông tin dự án (Loại hình, Ngày đăng, Cập nhật, Sản phẩm liên quan) | BỎ cả khối | Loại hình đã có ở thẻ loại, ngày và cập nhật đã có ở dòng ngày đầu bài, sản phẩm liên quan đã là nút ở khối báo giá |
| "Bài viết liên quan" trên ba thẻ | BỎ khỏi mắt, giữ tiêu đề ẩn | Ba thẻ bài viết nhìn là hiểu |
| "Đọc bài viết" cuối thẻ | BỎ chữ, giữ mũi tên | Cả thẻ bấm được |
| Dòng dẫn "Hướng dẫn chọn bồn bể và những công trình..." đầu danh sách tin | BỎ | Không có thông tin mới |
| "Gợi ý tìm" trước ba thẻ gợi ý | BỎ khỏi mắt, giữ nhãn ẩn | Ba thẻ cạnh ô tìm |
| Dòng "N bài viết" | BỎ khi không tìm và không phân trang | Số bài đã nằm trong thẻ loại. Giữ khi có từ khoá hoặc nhiều trang vì lúc đó mang thông tin |
| Dòng phụ trong khối báo giá cuối danh sách tin | BỎ | Tiêu đề và nút đã đủ |
| Dòng phụ trong khối báo giá cuối bài | Giữ, rút ngắn còn "Gửi mục đích và quy cách dự kiến để được tư vấn dung tích." | Cho biết việc cần làm |
| Dòng phụ trang rỗng | Rút còn "Bạn có thể xem sản phẩm hoặc gửi nhu cầu để được tư vấn." | Giữ lối đi tiếp |
| Thẻ loại, ngày, thời gian đọc, ngày cập nhật, "Bài trước", "Bài sau", số trên thẻ lọc | Giữ | Mang thông tin hoặc chỉ hướng |
| Chú thích ảnh do người viết nhập | Giữ nguyên | Theo đề |

### Mục lục sáng nhầm ở đầu trang
Tái hiện đúng cách của kiểm viên (cuộn tức thì xuống cuối từng bước 400px, chờ, `scrollTo(0,0)`, chụp toàn trang): sau lần chụp, ở `scrollY = 0` mục cuối vẫn sáng ("Lưu ý sau cùng", "Mục thứ ba"). Nguyên nhân: chụp toàn trang đổi cỡ khung nhìn làm tiêu đề ra vào vùng đọc, bộ quan sát chạy lúc đó rồi không có gì tính lại. Sửa trong `article-enhancer.tsx`: sát đầu trang (dưới 8px) thì không mục nào sáng, và tính lại một lần sau khi cuộn dừng hoặc đổi cỡ cửa sổ (nghe thụ động, gộp theo khung hình). Đo lại: ở 1366, 390, 600, bốn kiểu bài, sau chụp toàn trang không còn mục nào sáng (`tocAfterShot` trong `report.json`).

### Chữ rớt từ lẻ ở 390
Phần giao diện: không còn chỗ nào trong nhãn, tiêu đề khối, nút (đường dẫn một dòng, nút gập, hàng chia sẻ, khối báo giá). Còn lại là chữ do người viết nhập: tiêu đề h2 và dòng danh sách trong bài, ô bảng, tiêu đề thẻ bài. Không sửa được bằng CSS khi bị cấm `balance`, `pretty` và NBSP; cách xử lý là người viết đổi câu khi thấy. Ví dụ trong bài mẫu: "vùng đất / trũng".

### Thời gian đọc
Cách tính cũ: đếm từ chia 200, đã đếm chữ trong bảng và danh sách, nhưng nối từ cuối của ô hoặc mục này dính vào từ đầu ô kế bên (đếm hụt mỗi ô một từ) và bỏ qua ngắt dòng. Sửa `article-utils.ts`: các khối cách nhau bằng khoảng trắng, ngắt dòng tính là khoảng trắng, mỗi ảnh hoặc video cộng 12 giây. Thử bằng bài giả 150 chữ, 20 mục danh sách 5 chữ, bảng 6 hàng 3 cột 4 chữ: đếm đúng 322 từ, 2 phút. Bài mẫu trong tấm ảnh của người điều phối thực chất ngắn (khoảng 130 chữ nên "1 phút" là đúng); nếu bài thật dài mà vẫn ghi 1 phút thì gửi lại nội dung để đối chiếu.

### P2 của kiểm viên thuộc vùng này
- P2-6 bảng rộng hơn khung: giữ cuộn ngang trong khung riêng, bóng hai mép báo còn cuộn, cột tối thiểu 150 (máy bàn) và 132 (điện thoại). Chưa thêm gợi ý chữ vì bị cấm chữ thừa.
- P2-7 đường dẫn hai dòng ở 390: hết (do bỏ tên bài khỏi đường dẫn). Áp cho trang chi tiết bài và dự án; trang chi tiết sản phẩm thuộc vùng khác.
- P2-8 email thanh trên cùng 26px: ngoài vùng, đã ghi đề nghị phía trên.
- Các mục P2 khác thuộc trang chủ, banner, biểu mẫu, chân trang, admin: ngoài vùng.

### Đã kiểm trong vòng sửa
`npx tsc --noEmit` sạch, `npm test` 40 trên 40, `verify-article-render.ts` đạt (xem trước admin khớp công khai), tìm quét ký tự cấm trong vùng 0 chỗ, hàng chia sẻ ba nút một hàng ở cả ba cỡ, hộp ảnh và tìm nhanh vẫn chạy. Đã tự xem ảnh danh sách tin 1366 và chi tiết dự án 390 sau khi bỏ chữ.
Đếm cuối lượt: 4 bài, 2 yêu cầu, 32 ảnh, 2 tài khoản. Không phải của tôi: 4 bài có slug đuôi `a5ef47d0` (`mau-nhap`, `mau-hen`, `mau-dang`, `cach-chon-dung-tich...`) và dữ liệu đang tăng do agent khác chạy cùng lúc (kịch bản của tôi tự xoá hết bài `bm-v2-*`, kiểm lại còn 0). Cần đếm lại khi các agent kia xong.
