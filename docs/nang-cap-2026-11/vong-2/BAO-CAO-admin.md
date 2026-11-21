# Báo cáo vòng hai: vùng admin

Ảnh trước ở `vong-2/admin/truoc/`, ảnh sau ở `vong-2/admin/sau/` (57 ảnh ba cỡ 1366x768, 390x844, 600x360) và `vong-2/admin/sau/luong/` (luồng soạn bài từng bước, hai cỡ). Mọi ảnh do `scripts/verify-admin-shots.ts` và `scripts/verify-editor-flow.ts` chụp.

## Skill đã gọi và script đã chạy

- Đã gọi `impeccable` (register product), `thiet-ke-ux-ui`, `design-taste-frontend`. Admin là giao diện làm việc nên phần trang tiếp thị của taste-skill không áp. Áp: khoá một màu nhấn, một thang bo góc, trạng thái nhấn, khung xương, tương phản; impeccable cấm viền cạnh màu một bên nên đã bỏ hai chỗ (thông báo, dòng yêu cầu đang chọn).
- `impeccable/scripts/detect.mjs` quét `src/app/admin` và `src/components/admin`: không phát hiện gì.
- `thiet-ke-ux-ui/scripts/contrast.py`: chữ chính trên nền trang 11,84:1; nút xanh 5,79:1; nút phụ trong thông báo 6,70:1; chữ cảnh báo trên nền vàng 6,05:1; chữ lỗi 7,14:1. Đều đạt.
- `ui_audit.py --render --stress` và `wrap_check.py` chưa chạy: hai script đọc tệp HTML tĩnh, admin là ứng dụng cần đăng nhập nên không đưa vào được. Thay bằng bộ quét tự viết đo trên trình duyệt thật (`verify-admin-text.ts`, thêm khung 600x360 và quét khi ngăn thiết lập mở).

## Điểm yếu thấy khi audit (trước khi sửa)

1. Nút Thiết lập và nút Đóng thiết lập hiện ra ở 1366 dù cột thiết lập đã nằm sẵn đó (luật `display:none` thua `.button`). Ở 1366 nút "Đóng thiết lập" nổi lơ lửng trên cột.
2. Ở 390 nút Thiết lập chỉ cuộn xuống cuối trang, không mở gì; nút Đóng nằm sau thanh nút dưới.
3. Ô hẹn giờ hiện mẫu tiếng Anh `mm/dd/yyyy --:-- --`.
4. Ở 600x360 ngăn thiết lập là ngăn riêng, thanh chỉnh ảnh phủ gần hết màn (210px trên 360px), ảnh trong bài cao 540px.
5. Gạch chữ đỏ báo sai chính tả tiếng Anh dưới mọi chữ tiếng Việt trong trình soạn.
6. Tổng quan không nói việc cần làm tiếp, khách chờ gọi lại nằm giữa danh sách.
7. Yêu cầu tư vấn: muốn gọi phải bấm vào dòng rồi bấm nút trong khung chi tiết (hai bước).
8. Tiêu đề trong danh sách bài bị cắt một dòng; thông báo lỗi tiêu đề trống chỉ hiện một dải đỏ trên cùng, ô tiêu đề không báo gì.
9. Hai viền màu một bên (thông báo, dòng yêu cầu đang chọn) vi phạm luật impeccable.
10. Không gợi ý phím tắt ngoài chú giải khi rê chuột (điện thoại không có).

## Đã sửa gì (tệp)

- Ngăn thiết lập (`post-editor.tsx`, `admin-editor.css`): từ 1100px trở xuống hoặc khung thấp dưới 520px, cột thiết lập thành ngăn kéo bên phải, mở bằng nút Thiết lập (cả ở thanh trên và thanh nút dưới của điện thoại), có lớp mờ, tiêu đề "Thiết lập bài" và nút Đóng. Tiêu điểm vào nút Đóng, Tab giữ bên trong, Esc đóng, đóng xong tiêu điểm về nút đã mở. Ở 1366 cột vẫn cố định và các nút Thiết lập, Đóng ẩn. Chuyển động dùng `--dur-base`, `--ease-out`, có bản giảm chuyển động.
- Hẹn giờ (`editor/schedule-field.tsx` mới, `side-panel.tsx`): ba ô chọn có nhãn tiếng Việt (Ngày có "Hôm nay", "Ngày mai", thứ, ngày/tháng/năm; Giờ; Phút bước 5) và hai nút nhanh "Sáng mai 8 giờ", "Chiều mai 14 giờ". Giá trị vẫn là chuỗi `2026-11-25T08:00` giờ Việt Nam nên `vietnamInputToUtc`, `vietnamDateTimeInput` và phần máy chủ không đổi. Danh sách ngày dựng sau khi trang đã hiện (không gây lệch dựng trang). Không còn thuộc tính `min` theo phút: giờ đã qua hiện lời nhắc và khóa nút Đặt lịch đăng. Console không còn cảnh báo lệch dựng trang (đã đối chiếu cả ba cỡ).
- Khung thấp 600x360: thanh nút dưới đã ẩn từ vòng trước, nay thêm: thanh chỉnh ảnh gọn còn một khối thấp, ảnh trong bài tối đa 34% chiều cao màn, nút công cụ cao 36px (bộ quét bắt được 34px). Script đo: khi cuộn thanh trên cao 45px, hết thanh công cụ ở 89px, vùng viết còn 271px (trước vòng này khoảng 120px theo lời giao).
- Menu gạch chéo ở 390: đặt cách đáy `76px + vùng an toàn` để không bị thanh nút dưới che mục cuối (danh sách cuộn trong khung 42% chiều cao). Đường dẫn Tổng quan > Bài viết đã gọn từ vòng trước (ở 390 chỉ hiện "Bài viết > Viết bài mới"), ảnh kiểm trong `sau/390-soan-viet.png`.
- Lưu: lỗi thật tìm thấy khi chụp: lưu tự động xong mà trang chưa vẽ lại thì bấm Ctrl+S ngay sẽ gửi phiên bản cũ và hiện báo xung đột sai. Nay cập nhật phiên bản mới nhất ngay khi máy chủ trả lời. Tiêu đề trống: ô tiêu đề nhận tiêu điểm, gạch chân đỏ, chữ gợi ý đỏ. Tắt gạch chữ đỏ báo chính tả (`spellcheck`) ở tiêu đề, tóm tắt, vùng soạn.
- Phản hồi: thông báo có nút hành động (`ui.tsx`), dùng cho Hoàn tác khi bỏ ảnh bìa nhầm (thay cho hỏi lại). Bỏ viền cạnh màu của thông báo. Chân vùng soạn nhắc phím tắt dạng phím: `/`, Ctrl+S, Ctrl+K, kéo thả ảnh; nút Lưu nháp có gợi ý Ctrl+S.
- Tổng quan (`(protected)/page.tsx`, `admin.css`): khung "Việc nên làm tiếp" ngay dưới tiêu đề, chỉ một việc theo thứ tự: khách đang chờ gọi lại (nút Gọi số điện thoại một chạm), bản nháp chưa đăng, chưa có bài nào, ảnh chưa mô tả, rồi "Mọi việc đã xong".
- Yêu cầu tư vấn (`inquiry-list.tsx`): mỗi dòng có nút Gọi 64px bên phải, một chạm. Dòng đang chọn đổi viền cạnh thành khung đủ bốn cạnh.
- Danh sách bài: tiêu đề tối đa hai dòng, cắt có dấu ba chấm, không còn cụt một dòng.
- Hướng dẫn `ADMIN-GUIDE.md` cập nhật các điểm trên.

## Đã kiểm

- `npx tsc --noEmit`: sạch (lúc kiểm cuối cùng, kể cả tệp ngoài vùng).
- `npm test`: 40 bài, xanh.
- `scripts/verify-editor-flow.ts` PASS cả hai cỡ (lượt cuối). Đã cập nhật: hẹn giờ bằng ba ô chọn, kiểm không còn `datetime-local`; ngăn thiết lập ở 390 (ẩn khi đóng, mở thì tiêu điểm vào nút Đóng, Tab 40 lần không thoát, Esc đóng và tiêu điểm về nút Thiết lập, ngăn nằm trọn trong 390); click đoạn cuối đổi thành đặt con trỏ bằng phím vì thanh chỉnh ảnh phủ đoạn đó khi ảnh còn được chọn.
- `scripts/verify-admin-text.ts`: sạch ở 1366, 390 và 600x360, kèm quét khi ngăn thiết lập mở: không ký tự cấm, không chữ dưới 14px, không tràn ngang, vùng bấm 36px (máy bàn) và 44px (điện thoại).
- `verify-admin-ui.ts`, `verify-admin-short.ts` (600x360), `verify-inquiry-ui.ts`: PASS.
- `verify-admin-shots.ts` (mới): 57 màn và trạng thái (đăng nhập, tổng quan, danh sách, thư viện, yêu cầu, sản phẩm, cài đặt, soạn rỗng, đang viết, menu gạch chéo, ngăn thiết lập, hộp chọn ảnh, ảnh được chọn, hộp chỉnh ảnh, xem trước, đang lưu, lỗi, bài hẹn giờ) ba cỡ: 0 màn tràn ngang, 0 bước lỗi. Console chỉ còn một cảnh báo của chế độ phát triển Next (tệp CSS được nạp trước mà chưa dùng ngay), không thuộc vùng admin và không xuất hiện ở bản chạy thật; không lỗi trình duyệt, không cảnh báo lệch dựng trang. Đã tự mở xem ảnh tổng quan, soạn, ngăn thiết lập, menu gạch chéo, ảnh được chọn, hộp chỉnh ảnh, xem trước, yêu cầu ở các cỡ.

## Chưa kiểm

- Thư viện ảnh: kéo thả, tìm, lọc đã có từ vòng trước; chọn nhiều ảnh một lúc chưa làm (cần đổi hợp đồng của hộp chọn ảnh).
- Hoàn tác mới có cho bỏ ảnh bìa. Xoá bài, xoá ảnh, chuyển về nháp vẫn dùng hộp xác nhận vì máy chủ chưa có thao tác khôi phục (cần thêm API, ngoài phạm vi chỉ-thêm này).
- Nút "Hoàn tác" của thông báo chưa có bước riêng trong luồng tự động.
- Chưa thử Safari, Firefox, màn cảm ứng thật. Chưa chạy `npm run build` (cấm). Chưa thử với người dùng thật.
- Ảnh 600x360 của thanh chỉnh ảnh vẫn chiếm khoảng 150px trên 360px khi mở, ảnh còn thấy khoảng 100px và cuộn được.

## Dữ liệu

Tài khoản và dữ liệu mẫu tự tạo đã xoá. Đếm cuối: 0 bài, 0 yêu cầu, 1 tài khoản. Ảnh là 30, không phải 26: 4 ảnh tạm tên `luong-34379b7b-...` và một bản `blue-box-tank-front (đã chỉnh)` tạo lúc 02:44 UTC từ một lượt chạy `verify-editor-flow.ts` trước các lượt cuối (các lượt cuối `luong-765e5542`, `c065825a`, `4e55cc28`, `f3d46b50` đều dọn sạch phần của mình, số ảnh giữ nguyên 30). Em không xoá vì tệp nằm trong `data/uploads` (đề cấm xoá trong `data/`) và chưa chắc lượt đó của em hay của agent khác chạy cùng lúc. Một dòng `post_media` mồ côi trỏ tới một trong bốn ảnh đó. Đề nghị người điều phối xoá tay hoặc cho phép em xoá bốn ảnh này. Lỗi gốc: bước dọn của `verify-editor-flow.ts` bỏ qua ảnh còn dòng `post_media` mồ côi; chưa sửa.

## Đề nghị cho tệp dùng chung

- Cảnh báo "CSS được nạp trước mà không dùng" trong chế độ phát triển nằm ở chuỗi nạp CSS của layout gốc, không phải admin.
- `tests`: chưa có bài kiểm đơn vị cho `ScheduleField` (chỉ kiểm qua luồng trình duyệt).


## Vòng sửa (21/11, theo lời chủ dự án "bỏ chữ thừa" và kiểm viên lượt hai)

Ảnh chụp lại ba cỡ ở `vong-2/admin/sau2/` (có thêm `thu-vien-chon-nhieu`). Luồng từng bước ở `vong-2/admin/sau/luong/`.

### 1. Bảng chữ đã bỏ và đã giữ

Cách xét: xoá đi người dùng có mất thông tin hay làm sai không. Không thì bỏ.

| Chỗ | Chữ | Quyết định | Vì sao |
|---|---|---|---|
| Dưới tiêu đề trang Bài viết | "Kiến thức hữu ích và câu chuyện công trình." | Bỏ | Tên trang đã đủ, không việc nào cần làm theo câu này |
| Dưới tiêu đề Ảnh và video | "Tải lên một lần, dùng lại..." | Bỏ | Khung kéo thả nói sẵn việc cần làm |
| Dưới tiêu đề Yêu cầu tư vấn | "Thông tin khách để lại... Gọi hoặc nhắn Zalo..." | Bỏ | Nút Gọi, Nhắn Zalo tự nói |
| Dưới tiêu đề Sản phẩm | "Chỉnh nội dung, thông số và ảnh đại diện..." | Bỏ | Lặp lại những gì form hiện ra |
| Dưới tiêu đề Thông tin website | "Chỉ nhập thông tin chính thức của Thành Lợi" | Bỏ vế sau, giữ "Hiện ở chân trang và phần liên hệ." | Vế đầu cho biết ô này hiện ở đâu, là thông tin mới |
| Đăng nhập, cột trái | "Mọi thay đổi chỉ lên website khi anh chị bấm xuất bản." | Bỏ | Quảng bá, không giúp đăng nhập |
| Đăng nhập, dưới tiêu đề | "Dùng tài khoản được bàn giao riêng..." | Bỏ | Ô email và mật khẩu đã nói |
| Tổng quan, thẻ số | "Chưa hiện trên website", "Khách đọc được", "Chưa có lịch", "Cần gọi lại cho khách", "Đã xử lý hết" | Bỏ | Số và tên thẻ đã đủ. Giữ "Sắp đăng giờ..." vì là thông tin mới |
| Tổng quan, khung việc tiếp theo | Các câu giải thích dưới tiêu đề khung | Bỏ, giữ tên bài nháp khi có | Nút bên cạnh đã nói việc cần làm. Tên bài nháp là thông tin mới |
| Tổng quan, "Việc hay làm" | Tiêu đề nhìn thấy | Ẩn khỏi mắt, giữ cho trình đọc màn hình | Sáu lối tắt có tên rõ |
| Tổng quan, trạng thái rỗng | "Khi khách gửi biểu mẫu..., Bấm Viết bài mới để bắt đầu" | Rút còn "Chưa có yêu cầu nào." và "Chưa có bài viết nào." | Nút đã có ngay đó |
| Danh sách bài, rỗng | Hai đoạn gợi ý dưới tiêu đề rỗng | Bỏ, giữ tiêu đề và nút | Nút nói việc |
| Thư viện, rỗng | "Kéo ảnh sản phẩm..." và "Thử từ khóa khác..." | Bỏ | Khung kéo thả ngay phía trên |
| Yêu cầu tư vấn, rỗng | "Khi khách gửi biểu mẫu..." | Bỏ | Tiêu đề rỗng đã đủ |
| Sản phẩm | "Sẵn sàng chỉnh sửa", "Trạng thái hiển thị được áp dụng khi lưu", câu gợi ý khi danh sách rỗng | Bỏ | Không có thông tin mới |
| Sản phẩm, ảnh đại diện | Hai câu dài | Rút còn "Chưa có ảnh đại diện." và "Chọn ảnh thấy rõ toàn bộ sản phẩm." | Giữ yêu cầu về ảnh, bỏ giải thích chỗ hiện |
| Ngăn thiết lập, Xuất bản | Hai câu về bản nháp, "Trước giờ đó khách chưa thấy", "Chọn ngày và giờ, tính theo giờ Việt Nam." | Rút còn "Khách chưa thấy bài này." và "Sửa xong bấm Cập nhật bài để khách thấy thay đổi." | Giữ chỗ dễ nhầm: bài đã đăng không tự ghi đè. Ô chọn đã có nhãn |
| Đường dẫn | "Địa chỉ tự tạo từ tiêu đề, anh chị có thể sửa." | Bỏ, giữ "Đổi sau khi đã đăng thì liên kết cũ vẫn tự chuyển..." và dòng địa chỉ đầy đủ | Phần giữ lại để người dùng khỏi sợ đổi nhầm |
| Ảnh bìa | "Ảnh bìa hiện đầu bài và trong danh sách tin." và chữ "Chưa có ảnh bìa" trong khung trống | Bỏ. Giữ "Nên chọn ảnh ngang, thấy rõ sản phẩm." | Kiểm viên đã thấy lỗi ảnh bìa dọc, gợi ý này ngăn lỗi. Khung trống vẫn có nhãn cho trình đọc màn hình |
| Hiển thị trên Google | "Google có thể hiển thị khác và không có cam kết thứ hạng" | Bỏ, giữ "Để trống thì dùng tiêu đề và tóm tắt của bài." | Câu giữ lại cho biết hậu quả của việc để trống |
| Kiểm tra trước khi đăng | "Đây chỉ là gợi ý, anh chị vẫn đăng được..." | Bỏ | Huy hiệu "n gợi ý" đã nói |
| Khung gợi ý | "Chọn một dàn ý để bắt đầu. Khung chỉ có..." | Rút còn "Chỉ chèn tiêu đề các mục, nội dung anh chị tự điền." | Tránh hiểu nhầm khung có sẵn nội dung |
| Lịch sử đã lưu | "Chọn một bản cũ để nạp vào trình soạn." | Bỏ, giữ "Website chỉ đổi khi anh chị bấm lưu." | Câu giữ lại trấn an, người dùng khỏi sợ làm hỏng bài đang đăng |
| Hộp liên kết | "Dán địa chỉ trang web..." | Bỏ | Ô đã có gợi ý https:// và lỗi nói cách sửa |
| Thanh chỉnh ảnh | "Mô tả giúp Google và người khiếm thị hiểu ảnh" | Rút còn "Hãy mô tả ảnh cho người khiếm thị và Google." (chỉ hiện khi thiếu) | Là nhắc việc cần làm |
| Thư viện, chi tiết | "Mô tả giúp người khiếm thị và Google hiểu ảnh." dưới ô | Bỏ | Ô đã có ví dụ, thanh chỉnh ảnh trong bài đã nhắc |
| Thư viện, đang dùng ở | "Chưa có bài viết hay sản phẩm nào dùng tệp này. Có thể xoá an toàn." | Rút còn "Chưa dùng ở đâu, xoá được." | Giữ vì cho biết xoá có an toàn |
| Hộp chỉnh ảnh | "Kéo khung sáng... Kéo bốn góc..." | Bỏ | Khung và bốn góc nhìn là biết kéo |
| Hộp chỉnh ảnh | "Kết quả được lưu thành ảnh mới trong thư viện. Ảnh gốc không bị thay đổi." | Rút còn "Lưu thành ảnh mới, ảnh gốc giữ nguyên." | Người dùng sợ mất ảnh gốc, giữ |
| Thông tin website, giờ làm | "7h30 – 17h30" | Đổi "–" thành "đến" | Luật chữ: không gạch ngang |
| Giữ nguyên | Nhãn mọi ô nhập, dòng giới hạn dung lượng ở khung kéo thả, lỗi nói cách sửa, "Mục để trống sẽ không hiện cho khách", đường dẫn đầy đủ của bài, đếm ký tự Google, gợi ý phím tắt ở chân vùng soạn (chủ dự án đã yêu cầu), tên nhóm "Chủ đề nên viết" | Giữ | Mang thông tin mới hoặc ngăn làm sai |

`verify-admin-text.ts` và các script khác không tìm chữ đã bỏ (đã grep). Bộ quét chữ nay quét thêm màn thư viện ở chế độ chọn nhiều.

### 2. Dọn ảnh thử của `verify-editor-flow.ts`

- Script ghi lại id mọi ảnh do trình duyệt của nó tạo (tải lên, dán, ảnh "đã chỉnh") từ phản hồi `POST /api/admin/media` và `/edit`.
- Khối `finally` (chạy trước khi đóng trình duyệt, kể cả khi lỗi giữa chừng) đăng nhập bằng tài khoản tạm rồi xoá từng ảnh qua đúng đường xoá của ứng dụng `DELETE /api/admin/media/[id]`, thử lại tới 40 giây nếu ảnh đang bị bài khác tạm giữ. Cuối cùng so số ảnh trước và sau, khác thì báo thất bại. Không đụng ảnh có từ trước, không đụng `data/` trực tiếp.
- Chứng minh (số do script in): lượt `luong-47749d13` ảnh trước 30, sau 30; lượt mobile `luong-7a2fe9b8` trước 30, sau 30; lượt `luong-fec8b6bf` cố tình hỏng giữa chừng (selector sai) vẫn trước 30, sau 30.
- Hiện thư viện có 32 ảnh, không phải 30. Hai ảnh dư (`1d69adf9-...` và `d92bc7ae-...`, tên `luong-...`) đang bị các bài mẫu "Bài mẫu kiểm thử..." do agent khác dựng giữ (10 dòng `post_media`), nên đường xoá của ứng dụng chặn đúng luật và thử lại 40 giây vẫn không xong. Em không xoá tay. Khi các bài mẫu đó được dọn, xoá hai ảnh này trong màn Ảnh và video. Bốn ảnh `luong-34379b7b-...` cũ vẫn nguyên theo lệnh.

### 3. P2 của kiểm viên lượt hai thuộc admin

`BAO-CAO-KIEM-2.md` không còn mục P2 nào thuộc admin: mục 13 cũ (admin 390) đã ghi "Hết", mục 15 cũ (hẹn giờ tiếng Anh, cột tiêu đề cắt cụt) đã hết. P1-4 (ảnh `luong-` ở đầu thư viện) là dữ liệu thử chờ chủ dự án quyết định. Mục P2-13 về "Chat Zalo" và "Nhắn Zalo" thuộc trang công khai, admin chỉ dùng "Nhắn Zalo".

### 4. Chọn nhiều ảnh để xoá một lượt

Làm (trang Ảnh và video, không có ở hộp chọn ảnh cho bài). Nút "Chọn nhiều" bật chế độ, bấm ảnh để chọn (dấu tích, viền xanh), ảnh "Đang dùng" bị khoá không chọn được, thanh trên cho biết "Đã chọn N tệp" kèm Bỏ chọn và Xoá N. Xoá luôn hỏi xác nhận nêu đúng số tệp, rồi xoá lần lượt qua đường xoá của ứng dụng (máy chủ vẫn chặn ảnh vừa được bài dùng, khi đó báo "Đã xoá a trên b tệp"). Luồng kiểm tự động: tải hai ảnh, chọn nhiều, ảnh đang dùng bị khoá, xoá hai ảnh, danh sách trở về số cũ. Ảnh `sau2/1366-thu-vien-chon-nhieu.png`.

### Đã kiểm trong vòng này

`npx tsc --noEmit` (tệp vùng em sạch; còn lỗi ở `src/components/home/sections.tsx` của agent khác), `npm test` 40 bài xanh, `verify-admin-text.ts` sạch ba cỡ, `verify-admin-ui.ts`, `verify-admin-short.ts`, `verify-inquiry-ui.ts` PASS, `verify-editor-flow.ts` PASS desktop và mobile (mỗi lượt riêng; một lượt mobile hỏng một lần vì trang công khai trả 404 lúc đó, chạy lại thì đạt, nghi trùng giờ với script của agent khác, chưa tìm ra nguyên nhân chắc chắn). Chụp ba cỡ: 0 tràn ngang; ở 1366 bước "xem trước" lỡ một lần do hộp "Khôi phục bài đang viết dở" hiện (do kịch bản chụp, không phải lỗi giao diện).

### Chưa kiểm

Nhánh báo "Đã xoá a trên b tệp" (khi ảnh vừa được bài dùng giữa chừng) mới đọc mã, chưa chạy. Chưa đếm lại được 30 ảnh vì hai ảnh bị giữ như nêu trên. Dữ liệu cuối của em: 0 bài, 0 yêu cầu, 1 tài khoản của em đã xoá; các bài mẫu hiện có trong cơ sở dữ liệu thuộc người khác.


## Vòng ba (21/11)

Ảnh chụp lại ba cỡ ở `vong-2/admin/sau3/` (thêm các trạng thái menu Thêm, bảng, sau xuất bản, việc tiếp theo, chọn nhiều ảnh). Luồng từng bước ở `vong-2/admin/sau/luong/`.

### 1. Lượt mobile hỏng vì trang công khai trả 404: nguyên nhân thật

- Chạy lặp nhiều lần: 6 lượt, rồi 10 lượt (đang sửa nên nhiều lượt hỏng vì lỗi khác), rồi 8 lượt yên tĩnh không sửa tệp nào: 8 trên 8 đạt, lần mở bài đầu tiên sau khi xuất bản luôn trả 200.
- Bắt được đúng một lần 404 khi script đã gắn sẵn chẩn đoán (`CẢNH BÁO`): bài ở trạng thái đã đăng trong cơ sở dữ liệu, nhưng đường dẫn trong cơ sở dữ liệu là đường dẫn tự sinh từ tiêu đề (`bai-kiem-thu-luong-luong-...-mobile`) chứ không phải đường dẫn script đã gõ (`luong-...-mobile`). Tức là trang công khai 404 đúng, vì script mở địa chỉ khác với địa chỉ bài thật. Thứ tự giữa xuất bản và mở trang không sai: bài xuất bản lúc `published_at` bằng `clock_timestamp()` của cơ sở dữ liệu, trang công khai lọc `published_at <= now()`, trang công khai là `force-dynamic`, không có bộ nhớ đệm giữ 404 (đã đọc `posts.ts`, `post-detail.tsx`, `(public)/layout.tsx`).
- Vì sao đường dẫn gõ vào bị mất: lượt đó chạy đúng lúc em và agent khác đang sửa tệp nguồn, bản dev tải lại cả trang giữa chừng, trạng thái chưa lưu (đường dẫn vừa gõ) mất, bản nháp tự lưu trước đó mang đường dẫn tự sinh. Đây là hành vi của chế độ phát triển (tải nóng), không phải lỗi sản phẩm: bản chạy thật không có tải nóng. Chưa chứng minh được 100% (không bắt được thêm lần thứ hai khi yên tĩnh), nên ghi là kết luận có khả năng cao nhất.
- Kết luận: không phải lỗi sản phẩm, người dùng bấm Xem bài ngay sau khi xuất bản không gặp 404 (8 lượt yên tĩnh kiểm lần mở đầu tiên). Chỉ sửa script: (a) trước khi xuất bản kiểm ô đường dẫn còn đúng giá trị đã gõ; (b) sau khi xuất bản ghi lại đường dẫn trong cơ sở dữ liệu so với mong đợi; (c) nếu trang công khai không trả 200 ở lần đầu thì mở lại tới 20 lần, in trạng thái cơ sở dữ liệu và số mili giây, và vẫn báo thất bại để không che lỗi.
- Hai lỗi lẻ khác thấy trong lúc lặp, đều do sửa tệp đồng thời hoặc do mã mới của em, đã xử lý: hộp chọn ảnh bị nới rộng quá màn (xem mục 2).

### 2. Trang soạn bài, tự dùng như người dùng lần đầu ở 390x844 và 600x360

Những chỗ phải dừng lại nghĩ, và cách sửa:

| Chỗ vướng | Sửa |
|---|---|
| 15 nút cùng lúc trên thanh công cụ, phải cuộn ngang tìm | Điện thoại và khung thấp chỉ còn 5 nút (hoàn tác, kiểu đoạn, đậm, danh sách, ảnh) và menu "Thêm" gom 10 việc còn lại (in nghiêng, gạch chân, gạch ngang chữ, danh sách đánh số, trích dẫn, liên kết, video, bảng, đường kẻ, làm lại). Menu dùng vị trí cố định nên thanh cuộn không cắt, Esc đóng và trả tiêu điểm về nút, mũi tên lên xuống đổi mục, mỗi mục cao 44px. Thanh vừa khít 390 và 600, không cuộn ngang. Máy bàn giữ nguyên |
| Bảng trên điện thoại: tám nút chữ cuộn ngang | Còn "Thêm hàng", "Thêm cột" và menu "Sửa bảng" (hàng trên, cột trái, hàng tiêu đề, xóa hàng, cột, bảng) |
| Xuất bản xong chỉ có dòng "Đã xuất bản", không biết làm gì tiếp | Thông báo có nút "Xem bài" (mở tab mới); ngăn Xuất bản của bài đang đăng có ba nút: Xem bài, Chép liên kết, Viết bài mới |
| Chọn ảnh từ thư viện rồi phải cuộn xuống đáy chi tiết mới thấy nút Chèn | Thanh dính ở đáy hộp: ảnh nhỏ, tên và nút "Chèn vào bài" hiện ngay khi chạm ảnh. Tải ảnh mới xong thì ảnh vừa tải được chọn sẵn, chỉ cần bấm Chèn |
| Hộp thoại rộng hơn màn hình khi nội dung dài một dòng | Sửa gốc: lớp phủ của mọi hộp thoại dùng cột `minmax(0,1fr)` (lỗi này em tự gây ra bằng thanh chọn ảnh, bắt được ở 390 vì không bấm được nút Chèn) |
| Trạng thái lưu | Đã thấy ngay ở thanh trên mọi cỡ: "Sẽ tự lưu", "Đang lưu", "Đã lưu 12:26", không phải sửa |
| Thông báo "Xem bài" bị xuống hai dòng | Nút không xuống dòng |

Còn lại, chưa sửa: ảnh trong bài ở 600x360 vẫn bị thanh chỉnh ảnh phủ một phần (cuộn được); thanh nút dưới của điện thoại ghi "Thiết lập" nhưng nút "Xem trước" ở thanh trên chỉ có biểu tượng con mắt (có nhãn cho trình đọc màn hình, chưa thử với người thật).

### 3. Các màn còn lại ở 600x360 và 390

- Bài viết: ở 600x360 ô sắp xếp và ô tìm nằm cùng một hàng, bộ lọc thấp lại, hàng bài đầu tiên thấy ngay (trước đó phải cuộn mới thấy). Ở 390 mỗi hàng gồm ảnh nhỏ, tên (hai dòng), loại, huy hiệu trạng thái và giờ sửa nằm cùng một dòng, nút thao tác một dòng dưới (trước đó huy hiệu và giờ chiếm hai dòng riêng).
- Tổng quan: hai nút của khung "Việc nên làm tiếp" nằm cạnh nhau khi đủ chỗ.
- Ảnh và video: khung kéo thả thành một hàng ngang ở 480 đến 800 px.
- Yêu cầu tư vấn, Sản phẩm, Thông tin website: đã xem ở hai cỡ, không có gì đè lên nhau, thẻ viền rõ, không sửa thêm.

### 4. Kiểm

`npx tsc --noEmit` sạch (lúc kiểm cuối), `npm test` 40 bài xanh, `verify-admin-text.ts` sạch (1366, 390, 600x360, kèm ngăn thiết lập và chế độ chọn nhiều), `verify-admin-ui.ts`, `verify-admin-short.ts` (vùng viết còn 267px ở 600x360 khi cuộn), `verify-inquiry-ui.ts` đạt, `verify-editor-flow.ts` đạt cả hai cỡ (thêm bước: thanh công cụ gọn có tối đa 6 nút, menu Thêm nằm trọn trong 390 và Esc trả tiêu điểm; thông báo "Xem bài" sau xuất bản; ba nút Việc tiếp theo có đúng đường dẫn). Chụp ba cỡ: 0 tràn ngang, 0 bước lỗi, console chỉ còn cảnh báo CSS của bản dev. Mọi lượt dọn ảnh đều ra ảnh trước 26, sau 26.

### Chưa kiểm

Chưa thử nút Chép liên kết (trình duyệt tự động không cấp quyền clipboard). Chưa thử với người dùng thật, Safari, Firefox, màn cảm ứng thật. Nguyên nhân tải nóng ở mục 1 chưa tái hiện được lần hai.

### Dữ liệu

Đếm cuối: 0 bài, 0 yêu cầu, 26 ảnh, 1 tài khoản.
