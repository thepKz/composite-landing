# Báo cáo kiểm độc lập vòng 6: nhiều ảnh cho mỗi sản phẩm

Kiểm viên: độc lập, không sửa mã. Bản dev http://127.0.0.1:3002. Kịch bản: `scripts/_kd/kiem6.ts` (chính) và `scripts/_kd/post.ts` (hồi quy bài viết). Kết quả máy đo: `ket-qua-kiem.json` cùng thư mục, ảnh `d*` (máy bàn 1366x768), `m*` (điện thoại 390x844), `c*` (trang công khai), `r*` (hồi quy). Tôi đã tự mở xem các ảnh d02, d05, d09, c01, c03, m01, m02.

## Phán quyết

ĐẠT, không có P0, không có P1. Có 7 mục P2 (góp ý chất lượng, không chặn). Sản phẩm "Bồn chứa hóa chất composite" (tên thật trong dữ liệu, đề bài ghi "Bồn chứa hóa chất") chạy đúng toàn bộ luồng của chủ doanh nghiệp.

## Kết quả theo đề

1. Luồng chính (đạt)
   - Mục "Ảnh sản phẩm" có tiêu đề rõ, dòng đếm "4 ảnh, nên có khoảng 10", dòng hướng dẫn "Ảnh đầu tiên là ảnh đại diện. Dùng nút mũi tên để đổi chỗ ảnh.", nút "Thêm ảnh". Chữ dễ hiểu. Nhưng mục nằm sâu (xem P2-1).
   - Thêm 5 ảnh một lượt từ thư viện: đúng thứ tự đã bấm. Đưa ảnh 1 xuống sau, đưa ảnh 5 lên trước, bỏ ảnh 3: thứ tự đúng, tiêu điểm về nút "Thêm ảnh" sau khi bỏ. Trước khi lưu hiện "Ảnh có thay đổi, bấm Lưu sản phẩm để đưa lên website". Sau lưu: "Đã lưu, ảnh đã lên website".
   - Cơ sở dữ liệu: 4 dòng, đúng thứ tự, `cover_id` bằng ảnh đầu. Tải lại màn admin: thứ tự còn đúng.
   - Trang công khai, ngữ cảnh khách: đúng 4 ảnh nhỏ theo thứ tự, đếm "1 / 4", cả 4 ảnh trả 200, không ảnh vỡ. Bấm ảnh nhỏ 3, mũi tên sau, vòng về đầu, mũi tên trước vòng về cuối, phím mũi tên, phóng to (tiêu điểm vào "Đóng ảnh"), mũi tên trong hộp phóng to, Esc đóng và tiêu điểm về nút "Phóng to ảnh": tất cả đúng. Không tràn ngang ở 1366 và 390.
2. Biên (đạt)
   - Lưu danh sách rỗng: 200, `cover_id` về rỗng, trang công khai quay về bố cục không ảnh (khung minh hoạ có sẵn), không lỗi, không ảnh vỡ, không tràn ngang.
   - 21 ảnh thật, 21 mã ngẫu nhiên, 61 mã: 400, dữ liệu cũ giữ nguyên. Đúng 20 ảnh: 200.
   - Mã rác, mã là số, `media_ids` null, `media_ids` là chuỗi: 400, không 500.
   - Mã trùng: tự bỏ trùng giữ lần đầu, `cover_id` đúng ảnh đầu. Mã đúng dạng nhưng không có trong thư viện: 400 "Có ảnh không còn trong thư viện hoặc không phải ảnh. Vui lòng chọn lại ảnh.", danh sách cũ giữ nguyên.
   - Bản sửa cũ (`updated_at` lỗi thời): 409 bằng lời thường. Gửi khác nguồn (Origin lạ): 403. Không gửi `media_ids`: giữ nguyên danh sách. Gửi `cover_id` không có thật: 400 bằng lời thường.
   - Chưa đăng nhập: POST và GET sản phẩm 401, danh sách, chi tiết, xoá ảnh quản trị đều 401, `product_media` không đổi.
   - Xoá ảnh đang được sản phẩm dùng: API 409 "Tệp đang được dùng trong: Bồn chứa hóa chất composite. Hãy gỡ tệp khỏi nội dung đó trước khi xoá." Trong thư viện, nút Xoá hiện thông báo tương tự, chế độ "Chọn nhiều" khoá cả 4 ảnh đang dùng, ảnh hiện nhãn "Đang dùng" và chi tiết ghi "Sản phẩm: ...". Ảnh dùng bởi sản phẩm ẩn cũng bị chặn xoá (409).
   - Sản phẩm không hiển thị (tạo tạm, xoá sau): ảnh trong `product_media` của nó và ảnh `cover_id` của nó đều 404 với khách, trang `/san-pham/<slug>` 404, admin xem được (200). Bật hiển thị thì 200, ẩn lại thì 404 lại. Không lộ.
   - Ảnh không ai dùng: khách 404, admin 200. Ảnh vừa bỏ khỏi sản phẩm và ảnh sau khi lưu rỗng: khách 404.
3. Bàn phím (đạt)
   - Tab tới "Thêm ảnh", Enter mở hộp, tiêu điểm vào nút "Đóng" trong hộp, 40 lần Tab đều ở trong hộp, Esc đóng và tiêu điểm về "Thêm ảnh".
   - Vùng bấm ở 390: các nút đổi chỗ, bỏ ảnh 44x44; nút trong hộp chọn từ 44px; trang công khai: mũi tên 44x44, "Phóng to ảnh" 132x44, ảnh nhỏ 68x56. Máy bàn: nút admin 43x40.
   - Không tràn ngang ở 1366 và 390 (màn sửa, hộp chọn, trang công khai). Console: 0 lỗi thật. Có 12 dòng 400 và 409 ở console do chính các lệnh API cố ý gửi sai của tôi.
4. Luật chữ (đạt, có góp ý nhỏ)
   - Quét mục ảnh và hộp chọn: không có "·", "—", chấm phẩy, chấm than, `&nbsp;`, không chữ in hoa cả cụm, không từ id, media, slug. Hai dòng bị bộ quét báo là dương tính giả (biểu thức chữ hoa của tôi khớp cả chữ thường có dấu); tôi đã đọc lại bằng mắt, không vi phạm. Còn lại xem P2-3, P2-4.
5. Hồi quy (đạt)
   - Soạn bài viết: nút "Chọn ảnh bìa" mở hộp, bấm một ảnh thì hiện thanh "Chọn làm ảnh bìa" (đơn, không phải thanh chọn nhiều), chọn xong hộp đóng và ảnh bìa hiện. Bấm "Đổi ảnh", bấm hai ảnh liên tiếp: chỉ một ảnh được chọn. Không lưu bài nào.
   - Trang thư viện ảnh: 26 ảnh, "Đang dùng" 4, chi tiết, chọn nhiều đều chạy.

## Lỗi

P0: không có.

P1: không có.

P2 (7):

- P2-1. Mục "Ảnh sản phẩm" nằm sau cả khối nội dung và thông số, cách đầu trang khoảng 1143px, ở 1366x768 phải cuộn gần hai màn mới thấy (ảnh d02). Chủ doanh nghiệp mở sản phẩm sẽ không thấy chỗ thêm ảnh ngay. Gốc: thứ tự khối trong `src/components/admin/product-manager.tsx` dòng 22 (`ProductPhotos` đặt sau "Thông số & ứng dụng"). Gợi ý: đưa mục ảnh lên ngay sau "Nội dung sản phẩm", hoặc thêm nút "Thêm ảnh" ở đầu trang.
- P2-2. Hộp chọn ảnh của sản phẩm vẫn ghi "Tìm ảnh hoặc video" dù chỉ có ảnh (`src/components/admin/media-library.tsx` dòng 154, không xét `imagesOnly`).
- P2-3. Di chuột vào ảnh trong hộp chọn hiện tên tệp tiếng Anh kiểu `blue-box-tank-front.webp`, `customer-08.webp` (`media-library.tsx` dòng 163, `title={item.original_name}`). Chữ kỹ thuật lộ ra cho người không rành máy. Dòng "Ảnh JPG, PNG, WebP, AVIF tối đa 10 MB mỗi ảnh." (dòng 141) cũng thiên về kỹ thuật.
- P2-4. Ở 390, thanh dưới hộp chọn bị cắt: "Bấm vào ảnh để chọn, chọn được nhiều ..." (ảnh m02). Gốc: `src/app/admin/admin.css` dòng 493 (`white-space: nowrap; text-overflow: ellipsis`) với chuỗi ở `media-library.tsx` dòng 192. Gợi ý: rút câu hoặc cho xuống dòng.
- P2-5. Lỗi kiểm tra dữ liệu trả về ở mục `fields` còn tiếng Anh: "Invalid UUID", "Too big: expected array to have <=60 items", "expected array, received null" (`src/lib/admin-api.ts` dòng 11, `src/lib/product-media.ts` dòng 12 giới hạn 60 không có lời Việt). Giao diện không bắn các giá trị này nên chủ doanh nghiệp không gặp, chỉ lộ khi gọi API trực tiếp. Thông báo chính "Vui lòng kiểm tra các trường thông tin." vẫn là lời thường, và khi quá 20 ảnh thì lời Việt nằm trong `fields` chứ không ở dòng chính.
- P2-6. Mọi ảnh `/api/media/[id]` trả `Cache-Control: private, no-store` (`src/app/api/media/[id]/route.ts` dòng 17). Trang sản phẩm có tới 20 ảnh nên khách mở lại hay chuyển ảnh đều tải lại từ máy chủ, chậm khi mạng yếu. Có thể đã có từ trước tính năng này, nhưng nay ảnh nhiều hơn nên ảnh hưởng lớn hơn. Chỉ nên cho cache đối với ảnh đã công khai.
- P2-7. Hộp chọn có hai nút nền xanh đậm cùng lúc ("Chọn tệp" và "Thêm 5 ảnh", ảnh d05, m02), làm nút hành động chính không nổi bật. Chỉ là thẩm mỹ.

## Số đếm dữ liệu cuối (đo bằng truy vấn sau khi dọn)

| Mục | Trước | Sau |
|---|---|---|
| Bài viết | 0 | 0 |
| Yêu cầu | 0 | 0 |
| Ảnh thư viện | 26 | 26 |
| Tài khoản | 1 | 1 |
| Dòng `product_media` | 0 | 0 |
| Sản phẩm | 8 | 8 (sản phẩm ẩn tạm đã xoá) |
| `cover_id` mọi sản phẩm | rỗng | rỗng |

Tôi cũng trả `updated_at` của 8 sản phẩm về đúng giá trị trước khi thử (so sánh đúng, `true`). Các tài khoản tạm đã xoá trong `finally`. Không đụng `data/`.

## Điều chưa kiểm được

- Tải ảnh mới lên ngay trong hộp chọn sản phẩm (sẽ tạo thêm ảnh thư viện, phá số đếm 26), nên không thử đường tự chọn ảnh vừa tải.
- Sản phẩm có tệp video trong `product_media`: thư viện không có video, nên chỉ đọc mã (cả hai nơi đều lọc `image/%`), chưa thử thực tế.
- Hai quản trị viên sửa cùng lúc ở hai máy (chỉ thử `updated_at` lỗi thời, đúng 409).
- Kéo thả thứ tự: tính năng không có, chỉ có nút. Chưa thử trình đọc màn hình thật, chỉ kiểm nhãn.
- Chỉ thử trên Chrome bản dev (có chấm "N" của công cụ dev đè lên nút "Thêm ảnh" ở 390, không tính là lỗi), chưa thử Safari, Firefox, mạng chậm, bản chạy thật.
- Chưa thử với ảnh có mô tả trống hoặc rất dài trên trang công khai.
