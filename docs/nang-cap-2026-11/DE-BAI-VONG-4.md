# Đề bài vòng bốn (22/11/2026): một mạch liền, khung không vuông, chồng lớp, hoa văn

Đọc `DE-BAI.md` (luật chữ, an toàn) và `DE-BAI-VONG-2.md` (bỏ chữ thừa, luật làm chung) trước. Tệp này thắng hai tệp kia ở chỗ nào nói khác.

## Lời chủ dự án ngày 22/11 (anh nói bằng giọng, em ghi lại ý)

1. Trang hiện là các hình chữ nhật, hình vuông xếp chồng lên nhau. Như vậy là có vấn đề.
2. Ảnh nền phải nối liền nhau giữa các khối, chuyển mượt, không có mép cắt ngang.
3. Lề hai bên chữ phải đều nhau.
4. Tiêu đề và nội dung phải cân nhắc lại. Giọng thuyết minh, nhưng là văn viết, không phải văn nói.
5. Sang trọng nhất có thể. Áp skill thiết kế ui ux của anh, đặc biệt view transition morph và GSAP.
6. Khung ảnh phải đa dạng, không chỉ chữ nhật hay vuông. Có thiết kế chồng lớp. Có hoa văn.
7. Cải thiện mạnh. Không hỏi lại.

Bản vòng ba đúng dữ kiện, không lỗi, nhưng nhìn toàn trang ở `vong-2/sau-cuoi-3/home-1366.png` thì thấy: mười khối, mỗi khối một dải ngang nền phẳng, mép trên mép dưới thẳng, ảnh nào cũng là hộp chữ nhật bo góc. Đó là thứ phải đổi.

## Hướng thiết kế người điều phối đã chọn: "Một dòng chảy"

Ý gốc: composite là nhựa lỏng chảy quanh sợi thủy tinh rồi đóng rắn thành khối liền. Trang cũng vậy: một tấm nền liền từ đầu tới chân, hình và chữ nổi trên đó, không có vách ngăn.

### 1. Nền liền mạch (bắt buộc)
- Không khối nào có mép ngang thẳng nhìn thấy được giữa hai màu nền. Chuyển từ vùng tối sang vùng sáng bằng một trong ba cách: dải chuyển màu dài từ 160px trở lên, đường cong lớn (cung tròn, vòm, sóng thoải lấy từ dáng vòm bể biogas) bằng SVG hoặc `clip-path`, hoặc ảnh nền mờ dần bằng `mask-image`.
- Ảnh nền thật (xưởng, bể, giao hàng) và nền hoa văn được trải sau nhiều khối liên tiếp, khối sau thấy tiếp phần ảnh của khối trước rồi mới tan. Ảnh nền luôn có lớp phủ đủ để chữ đạt tương phản 4,5:1.
- Có một lớp nền cố định hoặc trượt chậm đổi dần theo cuộn (GSAP ScrollTrigger, chỉ `opacity` và `transform`). Không có JavaScript thì nền tĩnh vẫn đẹp.
- Nhịp tối, sáng, tối của cả trang phải có chủ đích, không xen kẽ đều từng khối.

### 2. Khung ảnh không vuông (bắt buộc, ít nhất bốn kiểu trên trang chủ, hai kiểu trên mỗi trang phụ)
Lấy dáng từ chính sản phẩm, không dùng hình "blob" ngẫu nhiên:
- Vòm (đáy phẳng, đỉnh bán nguyệt) như vòm bể biogas.
- Tròn và vành khuyên như bể tròn nhìn từ trên.
- Viên nang nằm ngang như bồn chứa.
- Hình thang nghiêng hoặc cạnh vát như thùng xe.
- Cửa sổ ghép nhiều ô cong cùng một ảnh.
Làm thành thành phần dùng chung `src/components/decor/` (ví dụ `ShapeFrame` nhận `shape`, có viền mảnh lệch ra ngoài một nhịp, có bản dự phòng khi trình duyệt không hỗ trợ). Ảnh trong khung phải cắt đúng trọng tâm, không cắt mất sản phẩm.

### 3. Chồng lớp (bắt buộc)
- Ảnh đè lên ảnh, ảnh tràn qua ranh giới hai vùng nền, số liệu lớn nằm nửa trong nửa ngoài khung ảnh, thẻ chữ đè lên góc ảnh, hoa văn nằm sau và ló ra ngoài mép khung.
- Mỗi cụm chồng tối đa ba lớp, có một lớp là tiêu điểm. Không để chữ đè lên vùng ảnh nhiễu.
- Ở 390px các lớp vẫn chồng nhưng gọn lại, không tràn ngang, không che chữ.

### 4. Hoa văn (đã sinh sẵn qua 9router, ảnh gốc ở `assets/decor-originals/`, thư mục này đưa lên kho được)
| Tệp gốc | Là gì | Gợi ý dùng |
|---|---|---|
| `soi-thuy-tinh-toi.png` | vải sợi thủy tinh đan, xanh đen, lát liền được | nền vùng tối, phủ rất nhẹ |
| `song-nhua-toi.png` | sóng nhựa xanh ngọc trên nền đen, một ánh đồng ở góc | nền banner trang phụ, vùng chuyển, chân trang |
| `giay-soi-sang.png` | giấy ngà có vân sợi rất nhẹ | nền vùng sáng thay cho màu phẳng |
| `gon-nuoc-net-manh.png` | hai chùm vòng gợn nước nét mảnh màu đồng, nền trong | sau khung ảnh, góc khối |
| `hoa-van-trong-dong.png` | huy hiệu tròn kiểu trống đồng nét vàng đồng, nền trong | điểm nhấn hiếm: sau số "2010", chân trang, trang 404. Tối đa hai lần mỗi trang, độ đục thấp |
Xử lý bằng sharp thành webp nhiều cỡ vào `public/images/decor/` (không sửa tệp gốc). Hoa văn là trang trí: `alt=""`, `aria-hidden`, không bao giờ thay ảnh sản phẩm. Được vẽ thêm hoa văn SVG tay (vòng đồng tâm, đường đồng mức, lưới sợi) nếu cần nét sắc. Cần thêm hoa văn thì ghi đề nghị trong báo cáo, người điều phối sinh.

### 5. Lề đều hai bên chữ
- Mọi khối chữ nằm trong một khung có lề trái bằng lề phải ở mọi bề rộng (đo bằng toạ độ thật, lệch tối đa 1px). Ảnh được phép tràn mép, chữ thì không.
- Khối chữ đứng riêng (tiêu đề khối, đoạn dẫn) căn giữa trục trang hoặc nằm trong cột có lề trong đều hai bên. Chữ trong thẻ có đệm trái bằng đệm phải.
- Dòng chữ thân dài 45 tới 75 ký tự.

### 6. Chữ: giọng thuyết minh, văn viết
Người đọc là chủ trang trại, chủ nhà hàng, kỹ sư dự án. Hình dung một người dẫn phim tài liệu doanh nghiệp đọc chậm rãi, nhưng câu chữ là văn viết chỉn chu.
- Câu trọn vẹn, có chủ ngữ. Không khẩu ngữ ("chỉ cần nói", "bạn cần gì"), không câu hỏi tu từ, không khẩu hiệu, không lời rao.
- Tiêu đề là một nhận định có nội dung, không phải tên mục. Ví dụ hướng viết (phải đối chiếu hồ sơ trước khi dùng): thay "Vì sao chọn Thành Lợi" bằng một câu nói điều composite làm được mà bể xây không làm được; thay "Chưa cần bản vẽ, chỉ cần nói nhu cầu." bằng một câu văn viết về việc kỹ sư lập phương án từ nhu cầu sử dụng.
- Xưng "Thành Lợi" hoặc "chúng tôi", gọi "quý khách" hoặc nói thẳng về công trình. Một cách xưng hô cho cả trang.
- Chỉ dùng dữ kiện trong `docs/nang-cap-2026-11/final-docx.txt` và `src/lib/site-facts.ts`. Được viết lại câu, không đổi nghĩa, không thêm số, khách hàng, chứng nhận. Vẫn giữ luật bỏ chữ thừa: chữ ít mà đắt.
- Luật chữ cấm trong `DE-BAI.md` giữ nguyên. Tiêu đề mục tiêu một dòng ở 1366, tối đa hai dòng ở 390, không rớt một từ lẻ.
- Báo cáo có bảng: chữ cũ, chữ mới, dòng nguồn trong hồ sơ.

### 7. Chuyển động
- **Morph khi chuyển trang** bằng View Transitions: ảnh và tên sản phẩm ở thẻ biến thành ảnh và tiêu đề đầu trang chi tiết, thẻ bài viết thành đầu bài, mục menu đang chọn trượt. Đọc `node_modules/next/dist/docs/` về view transition của Next 16 và React 19 trước khi viết. Trình duyệt không hỗ trợ thì chuyển trang thường.
- **GSAP ScrollTrigger**: nền đổi dần theo cuộn, ảnh trong khung trượt chậm hơn khung, đường quy trình vẽ dần, số đếm một lần, cụm chồng lớp tách nhẹ theo độ sâu. Nạp GSAP động, không chặn màn đầu.
- Chỉ `transform`, `opacity`, `clip-path`. Không nảy. Giao diện dưới 600 ms, cảnh theo cuộn bám tiến độ cuộn. `prefers-reduced-motion`: bỏ hết, nội dung hiện đủ. Không gì kẹt ẩn khi không có JavaScript.
- Không giật khung: kiểm ở 1366 rằng cuộn hết trang không có khối nào nhảy bố cục.

### 8. Giữ nguyên
Màu nhận diện (xanh lục, xanh đen, cam đất cho nút báo giá), font Be Vietnam Pro, logo, mọi luồng và dữ kiện, trợ năng (tiêu điểm thấy rõ, bàn phím, vùng bấm 44px ở điện thoại), biểu mẫu báo giá và toàn bộ admin. Ba nhóm chưa có ảnh thật (bể phốt, xử lý nước thải, bồn hóa chất) vẫn không được gán ảnh, dùng hoa văn và thông số.

## Skill bắt buộc gọi thật (ghi kết quả vào báo cáo)
`anthropic-skills:thiet-ke-ux-ui` (đọc `motion.md`, `web.md`, `text-fit.md`, chạy `ui_audit.py --render --stress`, `wrap_check.py`, `contrast.py`), `anthropic-skills:impeccable` (bolder, animate, polish), `anthropic-skills:design-taste-frontend` (kiểm trước khi giao), `anthropic-skills:high-end-visual-design` nếu gọi được.

## Luật làm chung
Như `DE-BAI-VONG-2.md` mục cuối: chỉ sửa vùng của mình, bản dev ở http://127.0.0.1:3002, không bật tắt máy chủ, không `npm run build`, không `npm install`, không tắt tiến trình theo tên, không đọc `.env`, không commit, không đẩy, dữ liệu thử tự dọn (0 bài, 0 yêu cầu, 26 ảnh, 1 tài khoản), tệp UTF-8 không BOM, ảnh chụp ở `docs/nang-cap-2026-11/vong-4/<vùng>/`, báo cáo `docs/nang-cap-2026-11/vong-4/BAO-CAO-<vùng>.md`.

## Xong khi
- Chụp 1366x768, 390x844, 600x360 (cả ảnh toàn trang), tự xem từng ảnh, đặt cạnh ảnh `vong-2/sau-cuoi-3`.
- Nhìn ảnh toàn trang thu nhỏ: không đếm được các dải chữ nhật xếp chồng, thấy ít nhất bốn dáng khung khác nhau, thấy chồng lớp, thấy hoa văn.
- Lề chữ trái phải đo bằng script, lệch tối đa 1px, ghi số.
- Không tràn ngang, không ảnh vỡ, không lỗi console, `npx tsc --noEmit` sạch, `npm test` đạt.
- Báo rõ đã kiểm gì, chưa kiểm gì.
