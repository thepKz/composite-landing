# Báo cáo bộ nền chung vòng bốn (22/11/2026)

## Đã làm
- `scripts/build-decor.mjs`: xuất webp vào `public/images/decor/`, tự hạ chất lượng nếu vượt 250 KB. Kết quả: song-nhua 960 (16 KB), 1600 (36 KB); giay-soi 960 (7 KB), 1600 (24 KB); gon-nuoc 480 (37 KB), 960 (94 KB), có alpha; trong-dong 480 (129 KB), 720 (247 KB), có alpha; soi-thuy-tinh 512 (27 KB). Cỡ 2400 của hai nền lớn bỏ qua vì ảnh gốc chỉ rộng 1672px, không phóng to. Trống đồng chỉ tới 720 vì nét quá dày, 960 nặng 400 KB trở lên.
- `src/components/decor/`: `shape-frame`, `pattern`, `flow-section`, `stack`, `flow-backdrop`, `scroll-fx`, `morph`, `index.ts`, `README.md` kèm CSS từng phần.
- `src/app/motion.css`: thêm khối View Transitions (token `--vt-dur`, lớp `tl-morph`, vào, ra, tắt khi giảm chuyển động). Không xoá token cũ.
- `src/app/(public)/template.tsx`: bọc `ViewTransition` (sửa, xem dưới).
- Trang thử `/thu-khung` (noindex, ngoài menu và sitemap).

## View transition
Không cần cấu hình: tài liệu Next 16 ghi cờ `experimental.viewTransition` đã bỏ từ 16.3. Dùng `<ViewTransition>` của React 19.3.1. Không đổi `next.config.ts`, không cần khởi động lại bản dev.
- `template.tsx`: bọc trang bằng `ViewTransition name="tl-page" enter exit default="none"`.
- `.public-site .tl-page-enter` bị tắt trong `@supports selector(::view-transition)` (motion.css), vì animation mờ đầu làm ảnh chụp trang mới trong suốt. Trình duyệt không hỗ trợ vẫn dùng animation cũ ở chrome.css. Không sửa `route-feedback.tsx`: thanh tiến trình không xung đột.
- Nhóm `root` đặt 0s để tiêu đề, đầu trang đứng yên, chỉ khối nội dung và các cặp morph chuyển động.

## Đã kiểm
- `npx tsc --noEmit` sạch. `npm test` 48 đạt, 0 lỗi.
- Playwright (Chrome) `/thu-khung` ở 1366x768, 390x844, 600x360, toàn trang, ảnh ở `docs/nang-cap-2026-11/vong-4/nen-chung/` (`thu-khung-<cỡ>-toan-trang.png`, cùng sáu khung nhìn `khung-nhin-1366-0..5.png`). Tự xem: bảy dáng khung đúng dáng (vòm, tròn, vành khuyên, viên nang, hai cạnh vát, ba ô vòm), viền đồng lệch đúng theo dáng, mép fade/arc/dome/wave liền, không có đường ngang thẳng, ảnh nền thật tan sang khối sáng, chồng ba lớp gọn ở 390.
- Đo: `scrollWidth` bằng `innerWidth` ở cả ba cỡ (1366, 390, 600), không ảnh vỡ, không lỗi console (chỉ cảnh báo preload CSS của Next dev).
- Điều hướng từ `/thu-khung` sang `/gioi-thieu`: `document.startViewTransition` được gọi 1 lần, không lỗi, cả khi giảm chuyển động.
- Số năm hiện `2010` (đã bỏ dấu phân cách, có prop `grouping`).
- Skill: đã gọi `anthropic-skills:thiet-ke-ux-ui` và `anthropic-skills:impeccable`; không chạy `ui_audit.py`, `wrap_check.py`, `contrast.py` (không thuộc phạm vi bộ nền, các trang dùng bộ nền sẽ phải chạy).

## Chưa kiểm
- Morph thật giữa hai trang có cặp tên trùng: chưa có trang đích, chỉ kiểm được gọi `startViewTransition`. Người dựng trang chi tiết phải thử.
- Độ mượt cuộn (khung hình) của ScrollFx và FlowBackdrop chưa đo. Chưa thử Safari, Firefox. Chưa kiểm không JavaScript bằng tắt hẳn JS (CSS tĩnh theo thiết kế).
- Tương phản chữ trên `tone="photo"` mới xem bằng mắt, chưa đo bằng script.
- Chưa kiểm bàn phím, trợ năng của trang thử (không có phần tử tương tác ngoài menu có sẵn).

## Giới hạn đã biết và lưu ý cho ba agent dùng bộ nền
1. Mép khối: mỗi mối nối chỉ khai một bên (thường `top` của khối sau), khối phải liền kề trong DOM (dùng `:has` và `+`). Khối đầu trang dùng `top="none"`. Khai cả `top` và `bottom` cho cùng một mối nối sẽ lấy chiều cao lớn hơn, hai mép chồng nhau.
2. Chiều cao mép: fade 160 đến 200px, arc 56 đến 112px, dome 96 đến 200px, wave 64 đến 120px; khối tự cộng đệm (khoảng 0,6 lần chiều cao mép mỗi đầu), nên khoảng cách giữa hai khối sẽ lớn hơn trước. Chỉnh `--fs-pad` nếu cần dày hơn hoặc thoáng hơn.
3. `FlowBackdrop` chỉ thấy khi khối `solid={false}` hoặc ở khe giữa mép. Khi có mặt, `.public-site` mất nền phẳng (`:has(.tl-fb)`). Chuyển tông đặt ở 92% chiều cao khung nhìn để tiêu đề khối sau không rơi vào nền sai tông.
4. `ShapeFrame` rộng 100% khối cha. Viền lệch ló ra ngoài, nên để chỗ trống bằng độ lệch ở bên lệch (xem trang thử). `ratio` tuỳ chọn đổi cả đường cắt nên cung vẫn tròn thật.
5. Trình duyệt không hiểu `clip-path: url(#id)` thì khung bo góc gần đúng, bỏ viền.
6. Móc `data-count` đã được lưới tin dùng làm số lượng (`.tl-news-grid`, `eager-images.tsx`): ScrollFx chỉ đếm phần tử không có phần tử con.
7. Hoa văn trống đồng: tối đa hai lần mỗi trang, độ đục thấp (theo đề). Cần thêm hoa văn thì đề nghị người điều phối sinh.
8. Trang thử có chữ tiếng Anh tên dáng (arch, ring...) vì chỉ là trang nội bộ, không dùng làm mẫu chữ.
