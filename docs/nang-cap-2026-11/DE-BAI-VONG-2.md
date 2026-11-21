# Đề bài vòng hai (21/11/2026): từ "sạch" lên "đắt tiền"

Đọc `DE-BAI.md` trước (luật chung, an toàn, chữ cấm vẫn giữ nguyên). Tệp này chỉ nói thêm phần vòng hai.

## Lời chủ dự án

"tiếp tục nâng cấp giao diện theo các skill và các cái ta mong muốn". Mục tiêu gốc không đổi: website trông đáng 40 triệu đồng, UI UX tốt, luồng gọn, admin và trang đăng bài tối ưu, hình ảnh được chỉnh, chuyển động và chuyển cảnh mượt.

## Vì sao chưa đạt (người điều phối tự xem ảnh ngày 21/11)

Bản hiện tại đúng dữ kiện, không lỗi, nhưng nhìn lướt vẫn giống mẫu dựng sẵn:

1. Mọi khối cùng một khuôn: tiêu đề trái, một dòng phụ, lưới thẻ viền mảnh. Không có khối nào là điểm nhớ. Thiếu nhịp dày và thoáng, thiếu tiêu điểm.
2. Banner trang chủ ở 1366: cụm nút đổi cảnh (lùi, dừng, tới) và thanh chỉ cảnh đè lên hàng nút "Nhận báo giá, Xem sản phẩm, Gọi". Lỗi thấy ngay.
3. Ảnh là ảnh điện thoại chụp tại xưởng, mỗi ảnh một tông, một kiểu cắt. Chưa có xử lý ảnh thống nhất (cắt, cân sáng, tông màu, bo góc, tỉ lệ).
4. Khối "Hình ảnh thật" chỉ là ba thẻ ảnh với chú thích chung chung. Khối báo giá dùng ảnh thùng vàng không ăn nhập.
5. Thẻ tin tức ở trang chủ và bản đồ chân trang trống trong ảnh chụp (tải lười chưa kịp, hoặc khung giữ chỗ quá nhạt). Người xem thật cuộn nhanh cũng sẽ thấy ô trống.
6. Chuyển động mới ở mức hiện dần. Chưa có chuyển động có nghĩa: đường quy trình chạy theo cuộn, số đếm, ảnh trượt chậm, thẻ phản hồi khi rê chuột, chuyển trang có chủ đích.
7. Khung nhỏ 600x360 của chủ dự án: phải kiểm lại, màn đầu phải thấy tiêu đề và một nút kêu gọi.
8. Còn 8 mục P2 chưa sửa trong `kiem-doc-lap/BAO-CAO-KIEM.md` (mục 6, 7, 9, 10, 11, 14, 16 công khai, 13 và 15 admin).

## Yêu cầu vòng hai

- **Bắt buộc gọi skill thật trước khi sửa**, không chép luật: `anthropic-skills:impeccable` (critique rồi polish, animate), `anthropic-skills:design-taste-frontend` (audit trước, chống mẫu dựng sẵn), `anthropic-skills:thiet-ke-ux-ui` (chạy `ui_audit.py --render --stress`, `contrast.py`, `wrap_check.py` nếu chạy được, không chạy được thì ghi rõ). Ghi trong báo cáo skill nào đã gọi, script nào đã chạy, kết quả.
- **Audit trước, sửa sau**: chụp vùng mình ở 1366x768, 390x844 và 600x360, tự xem ảnh, viết 5 tới 10 điểm yếu nhất, rồi mới sửa. Sửa xong chụp lại và đặt cạnh ảnh cũ.
- **Cái cơ bản trước**: không gì đè lên nhau, không ô trống, không chữ rớt một từ lẻ, vùng bấm đủ lớn, thẻ thấy rõ ở khung nhỏ. Sau đó mới tới cái đẹp.
- **Mỗi trang có ít nhất một khối là điểm nhớ** (bố cục khác hẳn lưới thẻ: ảnh lớn tràn, bento, số liệu cỡ lớn, dải ảnh trượt ngang, bảng tương tác). Không thêm khối chỉ để cho đủ, bớt chữ trước khi thêm.
- **Ảnh**: xử lý bằng sharp thành tệp mới (không ghi đè, không xoá ảnh gốc, không đụng `data/`): cắt đúng tỉ lệ khung dùng, cân sáng và tông cho đồng bộ, xuất webp nhiều cỡ. Không dùng ảnh sinh bằng máy giả làm ảnh sản phẩm. Không gán ảnh cho nhóm chưa được xác nhận (bể phốt, xử lý nước thải, bồn hóa chất).
- **Chuyển động**: chỉ transform và opacity, không nảy, dưới 600 ms cho giao diện, luôn có bản giảm chuyển động, nội dung không bao giờ kẹt ẩn. Dùng token trong `src/app/motion.css`. GSAP đã có sẵn nếu cần cuộn theo tiến độ.
- **Nội dung**: chỉ từ `final-docx.txt` và `src/lib/site-facts.ts`. Không bịa số liệu, khách hàng, chứng nhận, lời khen.
- Giữ màu nhận diện (xanh lục, xanh đen, cam đất), font đang dùng, logo.

## Lời chủ dự án ngày 21/11 (thêm giữa vòng, thắng mọi mục khác)

"người ta nhìn vào biết làm gì rồi thì k cần ghi chữ thừa như hình ảnh thật..."

Nghĩa là: thứ gì nhìn là hiểu (dải ảnh, bản đồ, biểu mẫu, bảng, lưới sản phẩm) thì không đặt tiêu đề, dòng phụ hay chú thích chỉ để gọi tên nó. Với từng tiêu đề khối, dòng phụ, chú thích ảnh, nhãn, câu dẫn: xoá đi người xem có mất thông tin gì không. Không mất thì xoá. Chỉ giữ chữ mang thông tin mới (tên sản phẩm, số liệu, điều kiện, việc cần làm). Ví dụ phải bỏ: tiêu đề "Hình ảnh thật" và dòng "Chụp tại xưởng Phú Thọ và trên đường giao hàng", chú thích ảnh kiểu "Bể chữ nhật xếp hàng trong xưởng", dòng "Bảy nhóm sản phẩm, ba nhóm mũi nhọn đứng đầu", nhãn "Dung tích" dưới một con số đã có đơn vị. Tiêu đề h2 cần cho trình đọc màn hình thì giữ trong mã nhưng ẩn khỏi mắt.

## Luật làm chung (bốn agent chạy cùng lúc)

- Chỉ sửa tệp trong vùng của mình (ghi trong lời giao). Cần đổi tệp dùng chung thì ghi đề nghị vào báo cáo, không tự sửa.
- Trang đang chạy sẵn ở http://127.0.0.1:3002 (bản dev của người điều phối, tự nạp lại khi sửa). **Không bật, không tắt máy chủ nào. Không chạy `npm run build`, không chạy `npm install`.** Chỉ chạy `npx tsc --noEmit` và `npm test`.
- Không tắt tiến trình theo tên. Không đọc hay in `.env` (script chạy bằng `node --env-file=.env --import tsx ...` là được). Không đẩy mã, không commit. Không dùng cổng 4310, 4311, 3000.
- Dữ liệu thử tự tạo thì tự xoá. Cuối lượt đếm lại: 0 bài, 0 yêu cầu, 26 ảnh, 1 tài khoản.
- Chụp ảnh bằng Playwright (channel chrome), mẫu ở `scripts/shots.ts`. Ảnh để ở `docs/nang-cap-2026-11/vong-2/<tên vùng>/truoc` và `sau`.
- Báo cáo ở `docs/nang-cap-2026-11/vong-2/BAO-CAO-<tên vùng>.md`: điểm yếu đã thấy, đã sửa gì (tệp), skill và script đã chạy, đã kiểm gì, chưa kiểm gì, đề nghị cho tệp dùng chung.
- Tệp UTF-8 không BOM. Ghi bằng công cụ sửa tệp hoặc node, không dùng `Set-Content`, `Out-File`, `>`.
- Next.js 16.4.6 có thay đổi phá vỡ: đọc `node_modules/next/dist/docs/` khi dùng API của Next.
