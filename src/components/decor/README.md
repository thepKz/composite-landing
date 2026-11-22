# Bộ nền chung vòng bốn (`@/components/decor`)

Nhập từ một chỗ: `import { ShapeFrame, Pattern, FlowSection, Stack, StackStat, StackCard, FlowBackdrop, ScrollFx, Morph, morphName } from '@/components/decor'`.
Trang mẫu chạy được: `/thu-khung` (không vào menu, sitemap, noindex). Ảnh hoa văn xuất từ `assets/decor-originals/` bằng `node scripts/build-decor.mjs`.

## ShapeFrame
Khung ảnh không vuông. Dáng: `arch` (vòm), `circle`, `ring` (vành khuyên), `capsule` (viên nang), `slant` và `slant-reverse` (cạnh vát thùng xe), `porthole-trio` (một ảnh qua ba ô vòm).
```tsx
<ShapeFrame shape="arch" outline="bronze" focus="50% 60%" parallax morph={morphName('product-photo', slug)}>
  <img src="/images/home/hero-be-biogas-1080.webp" alt="Bể biogas composite" />
</ShapeFrame>
```
Props: `shape`, `children` (img), `ratio` (rộng/cao, có mặc định theo dáng), `outline` (`true`|'bronze'|'light'|'green'|'navy'), `outlineOffset` (14), `outlineDirection` ('br'|'bl'|'tr'|'tl'), `parallax` (`true` = 0.12 hoặc số 0.04 đến 0.3), `focus` (object-position, đặt cho từng ảnh để không cắt mất sản phẩm), `morph` (tên view transition), `className`, `style`.
Khung rộng 100% khối cha: đặt bề rộng ở khối bọc. Cho chỗ trống bên phải và dưới bằng đúng độ lệch viền nếu cần (ví dụ `padding: 0 14px 14px 0`), nếu không viền ló ra ngoài mép. Hậu bị: `data-sf`, `data-shape`, `data-sf-media`, `data-parallax` để GSAP bám.
Không hỗ trợ clip-path tham chiếu SVG thì bo góc gần đúng, bỏ viền.

## Pattern
Lớp trang trí tuyệt đối: `aria-hidden`, `alt=""`, tải lười, không nhận chuột. Đặt trong khối cha `position: relative` (FlowSection đã có, dùng prop `decor`).
```tsx
<Pattern kind="ripple" size="clamp(240px,30vw,420px)" top="-8%" right="-6%" opacity={0.6} blend="screen" />
<Pattern kind="paper" fade="both" opacity={0.8} />   {/* phủ kín khối cha */}
```
`kind`: `ripple` (gợn nước, nền trong), `drum` (trống đồng, nền trong, chỉ dùng tối đa hai lần mỗi trang, độ đục thấp), `weave` (vải sợi, ô lát), `resin` (sóng nhựa, phủ kín), `paper` (giấy ngà, phủ kín). Props: `opacity`, `size` (ripple, drum), `top|right|bottom|left`, `rotate`, `blend`, `fade` ('none'|'bottom'|'top'|'both'|'edges'), `className`, `style`.

## FlowSection
Vỏ khối trang. Nền (màu, ảnh nền, hoa văn) bị cắt theo mép bằng mask, nên hai khối kề nhau không có đường ngang thẳng.
```tsx
<FlowSection tone="dark" top="none">...</FlowSection>
<FlowSection tone="light" top="fade">...</FlowSection>            {/* chuyển màu 160-200px */}
<FlowSection tone="dark" top="arc" decor={<Pattern kind="resin" fade="both" />}>...</FlowSection>
<FlowSection tone="photo" top="wave" backdrop={{ src, srcSet, overlay: 0.7, fade: 'bottom', parallax: true }}>...</FlowSection>
```
Props: `tone` ('dark'|'light'|'photo'), `top` và `bottom` ('fade'|'arc'|'dome'|'wave'|'none'), `backdrop` ({src, srcSet?, sizes?, position?, overlay?, fade?, parallax?, opacity?}), `solid` (false = không tô nền, lộ FlowBackdrop), `inner` (mặc định true: cột có lề trái bằng lề phải, tối đa 1240px), `as`, `id`, `className`, `style`, `decor`, `aria-label(ledby)`.
Quy tắc:
- Mỗi mối nối chỉ khai một bên, thường là `top` của khối sau. Hai khối phải là anh em liền kề trong DOM thì phần chừa chỗ mới tự tính.
- Khối đầu trang dùng `top="none"`. Khối cuối cạnh chân trang cũng nên dùng mép cong ở `top`.
- Khối sau được kéo lên dưới khối trước bằng margin âm bằng chiều cao mép, cả hai tự thêm đệm. Đừng đặt margin âm riêng cho các khối này.
- `tone="photo"` bắt buộc có `backdrop` (lớp phủ giữ chữ đủ tương phản). Ảnh phủ mờ dần ở mép dưới (`fade`) thì khối sáng sau nó nhận tiếp bằng `top="fade"`.

## Stack
Cụm chồng tối đa ba lớp: hoa văn (sau) + tiêu điểm (children) + lớp nổi.
```tsx
<Stack pattern={{ kind: 'ripple', blend: 'screen' }} floatAt="br"
       float={<StackStat value={2010} grouping={false} label="Năm thành lập" tone="light" />}>
  <ShapeFrame shape="arch">...</ShapeFrame>
</Stack>
```
`StackStat` ({value, unit?, label?, decimals?, grouping?, tone?}) là số lớn, số thì tự đếm một lần khi cuộn tới. `StackCard` ({children, tone?}) là thẻ chữ đè góc. Ở 390px lớp nổi nhỏ lại và nằm sát mép, hoa văn lùi vào trong, không tràn ngang. `depth={false}` để tắt tách lớp theo độ sâu.

## FlowBackdrop (client)
Nền cố định đổi dần theo cuộn giữa các tông `data-flow-tone` của FlowSection.
```tsx
<FlowBackdrop initial="dark" />
```
Chỉ thấy ở nơi khối để `solid={false}` (nền liền cả trang) hoặc ở khe giữa các mép. Có mặt thì tự bỏ nền phẳng của `.public-site` (`:has(.tl-fb)`). Không JS hoặc giảm chuyển động: một tông tĩnh theo `initial`. Chỉ opacity và transform.

## ScrollFx (client)
Đặt một lần mỗi trang: `<ScrollFx />`. Móc:
- `data-parallax="0.12"` trượt chậm hơn khối cha (ShapeFrame `parallax` và backdrop `parallax` đã tự gắn).
- `data-depth="0.6"` tách theo độ sâu (±48px nhân số này), số âm trượt ngược.
- `data-draw` trên `path` hoặc nhóm SVG: vẽ dần theo cuộn. `data-draw="once"` vẽ một lần.
- `data-count="1500"` trên phần tử không có con: đếm một lần. `data-count-decimals="1"`, `data-count-group="false"` (năm). Nội dung chữ ban đầu nên là số cuối để không JS vẫn đúng.
Giảm chuyển động: không chạy. Trùng tên: `data-count` đã dùng làm số lượng ở lưới tin (`.tl-news-grid`, có phần tử con) nên bị bỏ qua đúng chỗ.

## Morph chuyển trang
Next 16.4 (React 19.3) bật view transition sẵn, không cần cấu hình (cờ `experimental.viewTransition` đã bỏ từ 16.3).
```tsx
// thẻ ở danh sách
<ShapeFrame shape="arch" morph={morphName('product-photo', product.slug)}>...</ShapeFrame>
// đầu trang chi tiết: cùng tên
<ShapeFrame shape="capsule" morph={morphName('product-photo', product.slug)}>...</ShapeFrame>
// phần tử bất kỳ
<Morph name={morphName('product-title', slug)}><h1>...</h1></Morph>
```
`morphName(kind, id)` bỏ dấu, chữ thường, gạch nối. Kind có sẵn: `product-photo`, `product-title`, `post-cover`, `post-title`, `project-photo`, `nav-pill`. Mỗi tên chỉ được xuất hiện một lần trên mỗi trang. Cặp chỉ hình thành khi trang đích dựng xong cùng lượt chuyển (trang đã nạp trước). `template.tsx` bọc cả trang bằng `ViewTransition` (hiện dần 320ms, mờ đi 150ms); CSS ở `src/app/motion.css` (`--vt-dur`, lớp `tl-morph`), tắt khi giảm chuyển động.

## Thay đổi vòng bốn, đợt trang chủ (22/11/2026)
- `shape-frame.css`: `.tl-sf__defs` thêm `visibility:visible`. Lỗi gặp: hai khung cùng dáng và cùng tỉ lệ dùng chung một `id` clipPath; nếu khung đầu tiên nằm trong khối `visibility:hidden` (ví dụ cảnh banner chưa hiện) thì mọi khung còn lại bị cắt hết, ảnh biến mất. Sửa tương thích ngược, không đổi prop.
- Lưu ý khi dùng: `FlowSection as="footer"` kết hợp `inner={false}` cho chân trang. Chân trang trang chủ kéo lên đè đáy khối báo giá (margin âm có sẵn của FlowSection), các trang khác ghi đè `margin-top:0` trong `chrome.css` để không che nội dung cuối trang.
- Lưu ý khi dùng: các lớp `.tl-hero`, `.tl-title`, `.tl-wrap` ở `chrome.css` và `home.css` thuộc trang chủ và khung chung. `.tl-wrap` (cột chữ lề đều) nằm trong `chrome.css` nên trang phụ dùng được.

## Vòng sửa (22/11/2026)
- Chân trang (`FlowSection as="footer"` ở `site-footer.tsx`) tự nối với khối đứng trước: `chrome.css` đặt `--fs-join` theo `data-tone` của FlowSection cuối `main` (tối, ảnh, sáng) và tô vào góc cung. Không còn số cứng 140px; `.art::after` ở `article/list.css` giờ thừa, agent bài viết có thể bỏ.
- Lời kêu gọi riêng của trang: thêm thuộc tính `data-has-cta` vào bất kỳ phần tử nào trong trang thì chân trang ẩn dải kêu gọi của nó. Các lớp cũ `.tl-form`, `.tp-cta-band`, `.art-cta-card`, `.nl-cta-card` vẫn có tác dụng.
- `motion.css`: chuyển trang giữ trang cũ đục tới khi trang mới phủ, nền `::view-transition` xanh đen, không còn khung giữa chừng trắng.
