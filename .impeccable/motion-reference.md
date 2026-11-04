# Motion research — 2026-11-04

Nguồn tuyển chọn: https://www.footer.design/styles/animated . Đã mở website thật và cuộn từng trang bằng trình duyệt; nhận xét dưới đây mô tả hành vi nhìn thấy, không khẳng định thư viện triển khai khi chưa kiểm tra source.

## 1. Eclipse Space

- Gallery: https://www.footer.design/sites/eclipse-space
- Website đã xem: https://www.eclipse.space/
- Hero là một cảnh vệ tinh lớn gần đầy viewport trên nền tối. Khi cuộn, cảnh thu nhỏ thành khung chữ nhật ở chính giữa; nền chuyển sang sáng, header đổi tương phản theo nền. Khung tiếp tục co trong lúc câu giới thiệu xuất hiện ở cạnh trái.
- Section tiếp theo dùng chữ rất lớn; các chữ từ nhạt thành đậm theo vị trí cuộn. Một vài hình/biểu tượng chen vào trong typography làm nhịp đọc giàu hình ảnh hơn.
- Bài học: sức nặng đến từ sự biến đổi hình học và quan hệ giữa hai section, không phải tăng khoảng cách fade-in. Dùng một ảnh thật chủ đạo với aperture mở/co; phần copy và CTA luôn đọc được. Không áp dụng footage vệ tinh/3D vào sản phẩm thật.

## 2. Digital Metal

- Gallery: https://www.footer.design/sites/digital-metal
- Website đã xem: https://www.digitalmetal.io/
- Hero chia hai nửa tương phản trắng/đen; bên chữ có lưới kỹ thuật, bên vật thể có nhãn kích thước/vật liệu. Khi tải xong, vật thể kim loại và lớp wireframe xuất hiện trong vùng tối. Đây là trải nghiệm sản phẩm, không phải ảnh banner trang trí chung.
- Section sau dùng ảnh sản phẩm cắt nền rải quanh một tuyên bố lớn ở giữa, thay vì hàng card đồng kích thước. Phần quy trình nền đen có một bước sáng, các bước còn lại nhạt; hình minh họa riêng đứng cạnh.
- Bài học: tạo một khu trưng bày sản phẩm thật, ảnh cắt nền đúng silhouette khi ảnh cho phép. Thông số phải lấy từ tài liệu; không tự tạo số đo, hứa thời gian giao hàng hay chứng nhận.

## 3. ++hellohello

- Gallery: https://www.footer.design/sites/hellohello
- Website đã xem: https://www.hellohello.is/
- Mở đầu có typography Hello/Bonjour/Hola/Olá chuyển theo lớp mask, trên cảnh nền tối có ánh đỏ. Cảm giác mạnh vì chữ lớn và bề mặt chuyển động cùng lúc.
- Đoạn giới thiệu giữ câu headline lớn gần trên cùng, các ảnh khác nhau đi lên chồng lớp ở giữa; nội dung hai bên được bổ sung khi cuộn. Vị trí ảnh thay đổi đáng kể trong khi cấu trúc chính tạm giữ ổn định.
- Bài học: một đoạn scroll có diễn biến rõ ba nhịp có giá trị hơn 8 section cùng fade. Có thể dùng ba ảnh thật KHÁC NHAU của sản xuất/sản phẩm/lắp đặt; không nhân bản một ảnh làm nhiều lớp. Không để ảnh phủ phần chữ quan trọng như một số trạng thái tham khảo.

## 4. Aperios Design

- Gallery: https://www.footer.design/sites/aperios-design
- Website đã xem: https://aperios-design.co.uk/
- Mở đầu headline đen rất lớn, nền sáng ít chi tiết, hai thanh màu nhỏ bên rìa. Cuộn sang một mặt hình/video dự án cực rộng mang màu đỏ, vàng, đen; logo hàng ngang đóng vai trò nhịp nối trước phần số liệu.
- Danh sách ảnh có nhãn DOM “Liquid distortion media”, nhưng kiểm tra này chưa đủ chứng minh shader/liquid distortion thực sự chạy theo hover; không sao chép tên kỹ thuật như một kết luận.
- Bài học: chuyển nền và thay đổi tỷ lệ hình ảnh có thể rất mạnh mà vẫn rõ nội dung. Một section full-bleed nên là điểm cao trào có chủ đích, không dùng mọi section như nhau.

## Choreography đề xuất cho Thành Lợi

1. Hero: headline ngắn, rõ sản phẩm; ảnh thật độc nhất đặt trong khung aperture SVG. Load sequence 1.2–1.6s: aperture từ dải chéo mở thành hình bo bất đối xứng, ảnh từ scale1.15 về1, chữ từng cụm trượt qua mask; CTA hiện sớm, không chờ toàn bộ màn trình diễn. Không dùng overlay loading bắt đợi.
2. Rời hero: scrub khoảng 70–100vh desktop, ảnh/phông chuyển tỷ lệ và nền sáng lộ lên. Một đường viền SVG tự vẽ hỗ trợ cảm giác tạo hình composite, không giả lập bồn 3D. Nội dung tiếp theo bắt đầu hiện trong cùng chuyển cảnh.
3. Danh mục: lựa chọn nhóm làm ảnh thật tương ứng chuyển qua clip polygon; mô tả và link giữ ổn định. Không tự gán ảnh sai ứng dụng nếu folder không chứng minh được.
4. Câu thương hiệu: typography lớn có reveal theo cụm từ; dùng gradient nền phẳng chuyển qua 2 màu trong timeline, không dùng gradient trên chữ. Giữ một bản văn semantic; các lớp hiệu ứng aria-hidden.
5. Ảnh thực tế: một đoạn xếp lớp 3 ảnh khác nhau, hướng chuyển động trái/giữa/phải có chủ ý; desktop có thể pin ngắn, mobile trở lại flow dọc. Chỉ một vùng pin chính trên trang để tránh kéo dài thao tác.
6. Quy trình: đường nối SVG được vẽ và từng bước đổi màu theo tiến độ cuộn; không cho toàn bộ 5 bước bay vào cùng lúc.
7. Footer: chữ Thành Lợi lớn lộ từ mask khi section đi vào, nền khác rõ section tư vấn; CTA có arrow dịch chuyển và nền trượt khi hover/focus.

## Giới hạn kỹ thuật

- Dùng GSAP ScrollTrigger hiện có; SVG path interpolation cùng số điểm hoặc clip-path polygon không cần thêm thư viện morph.
- Giữ HTML/ảnh đọc được mặc định khi JS lỗi; GSAP cleanup theo route và matchMedia.
- prefers-reduced-motion: bỏ pin/scrub/parallax, hiển thị bố cục tĩnh đầy đủ.
- Tránh animating width/height toàn trang liên tục; ưu tiên transform, clip-path và SVG path trên vùng có giới hạn. Không lạm dụng filter blur lên ảnh lớn.
- Responsive phải kiểm tra 390/768/1024/1440; chữ không nbsp, không ép cắt từng âm tiết tiếng Việt. Chia cụm từ bằng span inline-block khi có ý nghĩa, cho phép wrap tự nhiên ở mobile.
- Phân biệt nguồn cảm hứng và nguồn hình: không lấy ảnh, logo hay nội dung của các website tham khảo vào sản phẩm.
