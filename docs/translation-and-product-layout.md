# Dịch bài viết và bố cục ảnh sản phẩm

## Quản trị

- Thông tin website → Dịch bài viết sang tiếng Anh: thay khóa Gemini hoặc model. Để trống khóa để giữ khóa hiện tại. Nút kiểm tra thực hiện một yêu cầu dịch ngắn tới Google trước khi lưu.
- Trong bài viết → Thiết lập → Dịch sang tiếng Anh: xem bản dịch, chọn Lưu thành bản nháp tiếng Anh, mở bản nháp để chỉnh sửa. Bài gốc không bị ghi đè. Không tự xuất bản bản dịch.
- Sản phẩm → Chỉnh sửa → Ảnh trong từng phần: thêm ảnh vào bảng dung tích, cấu tạo, đặt hàng, hỏi đáp hoặc tư vấn. Chọn trái/phải/trước/sau, xếp dọc/lưới, hiện toàn ảnh/lấp đầy khung. Kéo thả hoặc dùng nút đổi thứ tự và ô Chuyển đến; bấm Lưu sản phẩm để áp dụng.
- Mỗi phần tối đa 6 ảnh. Màn hình nhỏ tự chuyển về một cột. Thư viện chặn xóa ảnh đang được sử dụng.

## Triển khai

1. Chạy `npm run db:migrate` trước khi triển khai code mới. Migration `004_product_section_images.sql` thêm cột JSONB, giữ dữ liệu cũ.
2. Thiết lập `GEMINI_ENCRYPTION_KEY` trên server: 32 byte ngẫu nhiên biểu diễn bằng 64 ký tự hex. Giữ cùng giá trị giữa các deployment dùng chung database; sao lưu an toàn. Không thay giá trị này nếu chưa mã hóa lại khóa Gemini đã lưu.
3. Khóa Gemini lưu AES-256-GCM trong `site_settings.gemini_translation`, bảng private có RLS. API chỉ trả trạng thái đã cấu hình và model; không trả khóa. Không dùng biến `NEXT_PUBLIC_` cho khóa.
4. Có thể dùng `GEMINI_API_KEY` server-side làm nguồn dự phòng khi chưa lưu khóa vào database. Cấu hình database được ưu tiên.
5. Build, deploy, kiểm tra dịch bản nháp và lưu/tải lại bố cục sản phẩm. Model đã kiểm tra thực tế: `gemini-3.1-flash-lite`.

Dịch tối đa 45.000 ký tự/1.500 đoạn chữ mỗi yêu cầu, 20 yêu cầu/giờ cho toàn trang quản trị. Nội dung chữ được gửi tới Google; ảnh, URL và bố cục được giữ ở phía ứng dụng. Bản dịch tiếng Anh là bài nháp riêng, chưa phải hệ thống chuyển ngôn ngữ toàn website.
