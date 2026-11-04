# Bàn giao Thành Lợi Composite

## Demo website nhiều trang trên Netlify

Gói mới: `deliverables/THANH-LOI-NETLIFY-WEBSITE-DEMO.zip`. Giải nén và kéo thư mục có `index.html` vào Netlify Drop. Đây là bản nhiều trang: trang chủ, về chúng tôi, sản phẩm/chi tiết, dự án, tin tức, tư vấn báo giá và hướng dẫn đặt hàng. Header/footer dẫn đến từng trang thật. Ảnh, font và GSAP được đóng gói cục bộ; bản đồ cần Internet.

Xuất lại từ ứng dụng đang chạy: `node scripts/export-netlify-demo.mjs`. Mặc định lấy dữ liệu từ `http://127.0.0.1:3002`, ghi vào `deliverables/netlify-site-demo`. Chỉ lấy nội dung đã công khai tại thời điểm export.

Bản tĩnh dùng để duyệt giao diện: form không gửi dữ liệu, không có admin/database hay tự đăng bài đến hạn. Các chức năng này chạy trong bản Next.js đầy đủ theo hướng dẫn bên dưới. Gói landing cũ vẫn giữ lại, không dùng thay gói WEBSITE mới.

Không tạo dự án hoặc bài viết giả để lấp chỗ trống. Dự án và tin tức sẽ có nội dung khi quản trị viên xuất bản. Thông tin hotline/email chưa được xác nhận; nút gọi/email chỉ hiện khi giá trị hợp lệ. Form hiện nhận thông tin nhu cầu, chưa hỗ trợ khách đính kèm CAD/PDF.

## Dữ liệu nằm ở đâu?

- PostgreSQL 17 lưu tài khoản, bài viết, lịch sử sửa, sản phẩm, mô tả media, thông tin liên hệ và yêu cầu tư vấn. Với Compose, dữ liệu nằm trong volume `database`.
- `data/uploads/` lưu ảnh/video tải lên. Database lưu tên tệp và quan hệ sử dụng; không nhúng video vào bản ghi.
- `public/images/` là ảnh dùng trong giao diện. Tám ảnh khách đã có thêm trong thư viện admin. Vị trí ảnh trên trang chủ hiện chỉnh trong mã nguồn.
- `.env` lưu cấu hình và mật khẩu; bàn giao qua kênh riêng. Không đưa file này vào source hoặc Docker image.

## Cài trên máy mới

1. Cài Node.js 24 và Docker Desktop/Engine với Compose.
2. Chép source, chạy `npm ci`. Chép `.env.example` thành `.env` và đặt mật khẩu riêng. Mật khẩu database trong URL cần URL-encode nếu có ký tự đặc biệt.
3. Chạy `docker compose up -d db`, rồi `npm run db:migrate` và `npm run db:seed`.
4. Đặt `ADMIN_EMAIL`, `ADMIN_PASSWORD` (ít nhất 12 ký tự), `ADMIN_NAME` trong môi trường shell; chạy `npm run admin:create`, sau đó xóa các biến này khỏi shell. Không có tài khoản/mật khẩu mặc định.
5. Nếu cài mới chưa có dữ liệu media, chạy `node --env-file=.env scripts/import-customer-media.mjs` để đưa ảnh khách vào admin. Chạy lại không ghi đè mô tả đã sửa.
6. Đặt `SITE_URL` đúng địa chỉ truy cập, chạy `npm run dev -- --port 3002` để kiểm tra cục bộ.

## Sao lưu

Chạy `npm run backup:create` tại thư mục dự án, khi Compose database đang hoạt động. Script dùng `DATABASE_URL` và xác nhận nó trỏ đúng database Compose của dự án.

Gói trong `backups/<thời điểm>/` gồm `database.dump`, thư mục `media/`, và `manifest.json` chứa SHA-256. Script giữ khóa ghi trong lúc sao lưu để database và ảnh/video cùng trạng thái; nên chạy lúc ít sử dụng, thao tác lưu bài có thể chờ. File chưa có manifest là bản chưa hoàn tất, không dùng để khôi phục.

Lưu toàn bộ thư mục gói ở nơi riêng có kiểm soát truy cập: chứa thông tin khách liên hệ và hash mật khẩu. Không phục vụ `backups/` qua web. Phiên đăng nhập và bộ đếm giới hạn truy cập không được chuyển sang hệ thống mới.

## Khôi phục an toàn

Ví dụ: `npm run backup:restore -- backups/TEN_GOI thanhloi_restored data/uploads-restored`

Script kiểm tra checksum trước khi tạo database. Database đích và thư mục media phải chưa tồn tại; script không ghi đè hoặc xóa dữ liệu đang chạy. Khi lỗi khôi phục, giữ lại bản nguồn và đích lỗi để kiểm tra; chọn một tên đích mới để thử lại.

Sau khôi phục, kiểm tra số bản ghi, ảnh/video, đăng nhập, bài nháp và bài công khai. Sau đó mới đổi **cả** database trong `DATABASE_URL` và đường dẫn `UPLOAD_DIR`, khởi động lại ứng dụng. Khi dùng Compose app, đặt APP_DATABASE theo database đã khôi phục và sửa bind mount media tương ứng. Giữ nguyên database cũ để có thể quay lại. Không chạy seed để thay thế việc restore.

## Chạy bản production

Dockerfile đóng gói Next.js standalone, chạy bằng user không đặc quyền. `docker compose -f compose.yaml -f compose.production.yaml up -d --build` chạy app và database. Cần hoàn tất migration/tạo admin trước đó theo bước cài mới. Trên Linux, cấp quyền ghi `data/uploads` cho UID 1000 của container.

App chỉ mở ở loopback qua `APP_PORT` (mặc định 3000); dùng reverse proxy HTTPS phía trước, đặt `SITE_URL` bằng origin HTTPS thực. Nếu cần giới hạn theo IP người truy cập, proxy phải ghi đè `X-Real-IP` và khi đó mới bật `TRUST_PROXY`. Cấu hình tên miền, HTTPS và hạ tầng triển khai thuộc bên nhận bàn giao; chưa triển khai công khai.

## Kiểm tra trước khi công khai

- Điền số điện thoại, email, địa chỉ và Zalo chính thức tại `/admin/cai-dat`.
- Chủ doanh nghiệp kiểm tra mô tả sản phẩm, quy cách, chính sách bảo mật.
- Thử gửi tư vấn, đăng một bài có ảnh/video, kiểm tra trên điện thoại.
- Sao lưu và thử khôi phục; giữ một bản sao ngoài máy chủ.

## Cập nhật phiên bản

Sao lưu trước khi cập nhật source. Chạy `npm ci` và `npm run db:migrate`, kiểm tra build, rồi chạy lại Compose với `--build`. Giữ image cũ và gói sao lưu để quay lại. Không tự chạy migration đảo ngược: nếu schema thay đổi không tương thích, khôi phục gói sang database/thư mục mới rồi chuyển cấu hình đồng thời.
