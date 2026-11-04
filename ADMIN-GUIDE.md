# Hướng dẫn quản trị

Mở `/admin`, đăng nhập bằng tài khoản được bàn giao riêng. Trên điện thoại, nút ba gạch mở danh mục quản trị.

## Đăng bài

1. Vào **Bài viết → Viết bài mới**. Nhập tiêu đề cụ thể và tóm tắt ngắn.
2. Soạn nội dung. Thanh công cụ có tiêu đề 2/3/4, in đậm/nghiêng/gạch chân/gạch ngang, danh sách, trích dẫn, liên kết, bảng, ảnh/video và hoàn tác. Khi đặt con trỏ trong bảng, có thêm nút thêm/xóa hàng/cột.
3. Có thể mở **Khung nội dung gợi ý** để bắt đầu bài hướng dẫn hoặc công trình. Chỉ điền thông tin đã xác nhận; khung không tự tạo nội dung thật.
4. Chọn **Ảnh đại diện**. Tám ảnh khách gửi đã có trong thư viện; ảnh đại diện và ảnh chèn trong bài là hai lựa chọn riêng.
5. Bấm **Lưu nháp** để lưu trên máy chủ mà chưa công khai. **Xem trước** giúp đọc lại bố cục đang soạn.
6. Chọn loại nội dung: bài viết xuất hiện tại `/tin-tuc`, công trình tại `/du-an`. Xuất bản ngay khi đã kiểm tra thông tin; chuyển về nháp để ẩn nội dung khỏi khách.

## Đặt lịch đăng bài (GMT+7)

Chọn ngày và giờ Việt Nam trong phần xuất bản, rồi bấm đặt lịch. Ví dụ 09:00 luôn là 09:00 Việt Nam, kể cả khi máy quản trị viên dùng múi giờ khác. Lịch phải nằm trong tương lai theo đồng hồ máy chủ.

Bài chờ lịch vẫn sửa và lưu được mà không mất giờ đã hẹn. Có thể đổi lịch, hủy lịch về nháp hoặc xuất bản ngay. Danh sách hiển thị trạng thái chờ đăng cùng thời gian GMT+7. Khi đến hạn, bài xuất hiện ở lần tải trang tiếp theo; không cần bật trình duyệt quản trị hay chạy cron. Trước giờ hẹn, trang chi tiết, danh sách, sitemap và media riêng của bài chưa công khai.

Lịch chỉ hoạt động trong ứng dụng Next.js có database. Bản HTML demo Netlify là ảnh chụp nội dung tại lúc xuất bản build; cần export lại để cập nhật.

## Đăng nhập

Email được bỏ khoảng trắng đầu/cuối; có thể bật hiện mật khẩu để kiểm tra nhập liệu. Phiên đăng nhập kéo dài tối đa 12 giờ. Đăng nhập sai liên tiếp bị giới hạn; đăng nhập thành công tạo phiên mới cho trình duyệt. Nếu gặp lỗi kết nối, thử lại sau khi kết nối phục hồi. Khi đăng xuất báo lỗi máy chủ, phiên chưa được coi là đăng xuất thành công.

Khi sửa bài đã xuất bản, thay đổi chỉ ra ngoài website sau khi bấm **Cập nhật bài**. Không đóng tab trong lúc đang lưu. Nếu báo xung đột do bài được sửa ở nơi khác, giữ tab hiện tại và mở bài ở tab khác để đối chiếu.

Nội dung chưa lưu có bản phục hồi trong chính tab trình duyệt đó. Khi quay lại hoặc tải lại trang, xác nhận để phục hồi. Đây không thay thế **Lưu nháp**: đóng tab, xóa dữ liệu trình duyệt hoặc dùng máy khác có thể mất bản phục hồi. Mục **Lịch sử đã lưu** nạp phiên bản cũ vào trình soạn thảo; cần bấm lưu để áp dụng.

## Ảnh và video

Vào **Ảnh & video**, tải từng tệp: JPG/PNG/WebP/AVIF tối đa 10 MB, MP4/WebM tối đa 100 MB. Ảnh được tối ưu thành WebP. Với video lớn, xuất bản MP4 ngắn và dung lượng phù hợp trước khi tải lên.

Chọn tệp rồi nhập **Mô tả ảnh/video**, **Chú thích**, bấm **Lưu mô tả**. Khi chèn từ trình soạn bài, chọn **Chèn tệp này**. Không có tính năng xóa media trong bản hiện tại để tránh làm hỏng nội dung đã dùng tệp; thay ảnh của bài bằng nút đổi/bỏ ảnh đại diện.

Ảnh/video chưa được bài hoặc sản phẩm công khai sử dụng chỉ quản trị viên xem được. Việc đưa bài về nháp không làm ẩn một ảnh nếu ảnh đó vẫn đang được nội dung công khai khác sử dụng.

## Hiển thị trên Google

Mở phần **Hiển thị trên Google** trong trình soạn bài. Để trống sẽ dùng tiêu đề và tóm tắt bài. Nên viết đúng nội dung, tránh lặp từ khóa. Phần xem trước chỉ minh họa: Google có thể chọn cách hiển thị khác và không có cam kết thứ hạng.

Đường dẫn tự tạo từ tiêu đề. Khi đổi đường dẫn bài đã lưu, liên kết cũ chuyển hướng đến liên kết mới. Chọn đường dẫn ngắn, rõ nghĩa.

## Sản phẩm và liên hệ

**Sản phẩm** quản lý tên, mô tả, ứng dụng, quy cách, ảnh đại diện và trạng thái hiển thị. Giữ đúng đường kính biogas, dung tích bể phốt và thông số đã xác nhận.

**Yêu cầu tư vấn** lưu thông tin khách gửi từ website; cập nhật trạng thái sau khi xử lý. Hệ thống hiện lưu vào database, không tự gửi email/Zalo.

**Thông tin website** sửa tên thương hiệu, điện thoại, email, địa chỉ, Zalo và giới thiệu ngắn. Trường liên hệ để trống sẽ không hiển thị; cần điền thông tin chính thức trước khi công khai.

Ảnh và bố cục cố định của trang chủ do người phát triển cập nhật trong mã nguồn. Bài viết, sản phẩm, ảnh/video và thông tin liên hệ được quản lý qua admin.
