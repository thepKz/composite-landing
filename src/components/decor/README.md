# Bộ nền chung vòng bốn (`@/components/decor`)

Nhập từ một chỗ: `import { ShapeFrame, Pattern, FlowSection, Stack, StackStat, StackCard, FlowBackdrop, ScrollFx, Morph, morphName } from '@/components/decor'`.
Trang mẫu chạy được: `/thu-khung` (không vào menu, sitemap, noindex). Ảnh hoa văn xuất từ `assets/decor-originals/` bằng `node scripts/build-decor.mjs`.

## ShapeFrame
Khung ảnh chữ nhật hoặc vuông, bo góc nhẹ (mặc định 12px). Từ vòng năm (22/11/2026, theo lời khách "lấy full hình, đừng cắt góc, thay hết vuông chữ nhật") mọi `shape` (`arch`, `circle`, `ring`, `capsule`, `slant`, `slant-reverse`, `porthole-trio`) đều hiện thành chữ nhật. Tên dáng giữ để các trang cũ không vỡ, dáng chỉ còn quyết định tỉ lệ mặc định. Không clip-path, không mặt nạ, không cắt góc. `porthole-trio` là một ảnh liền.
```tsx
<ShapeFrame shape="arch" ratio={photo.ratio} outline="bronze" morph={morphName('product-photo', slug)}>
  <img src="/images/home/ph-white-spherical-tank-720.webp" alt="Bể composite dạng cầu" width={720} height={960} />
</ShapeFrame>
```
Props: `shape`, `children` (img), `ratio` (rộng/cao; với ảnh sản phẩm đặt đúng width/height thật của ảnh để thấy trọn ảnh), `fit` ('contain' mặc định | 'cover'), `outline` (`true`|'bronze'|'light'|'green'|'navy', viền mảnh hình chữ nhật lệch một nhịp), `outlineOffset` (14), `outlineDirection` ('br'|'bl'|'tr'|'tl'), `radius` (12), `parallax` (chỉ có tác dụng khi `fit='cover'`), `focus` (object-position), `morph`, `className`, `style`.
- `fit='contain'` (an toàn cho ảnh sản phẩm): ảnh nằm trọn trong khung, khoảng thừa là nền giấy (`--sf-bg`, mặc định #e9efe9). Ở lưới cần các ô bằng nhau, đặt chung một `ratio` cho cả hàng, ảnh khác tỉ lệ sẽ nằm giữa nền giấy.
- `fit='cover'` chỉ dùng cho ảnh trang trí hoặc khi `ratio` đã bằng tỉ lệ ảnh. Bộ quét `scripts/kiem-khung-anh-v5.mjs` báo lỗi khi tỉ lệ khung lệch tỉ lệ ảnh quá 3% mà vẫn dùng cover.
- Khung rộng 100% khối cha: đặt bề rộng ở khối bọc, chừa chỗ phải và dưới bằng đúng độ lệch viền (ví dụ `padding: 0 10px 10px 0`) nếu dùng `outline`.
- Hậu bị: `data-sf`, `data-shape`, `data-fit`, `data-sf-media`, `data-parallax`. `framePath` và `clipId` đã bỏ.

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
<Stack clear pattern={{ kind: 'ripple', blend: 'screen' }} floatAt="br"
       float={<StackStat value={2010} grouping={false} label="Năm thành lập" tone="light" />}>
  <ShapeFrame shape="arch">...</ShapeFrame>
</Stack>
```
`StackStat` ({value, unit?, label?, decimals?, grouping?, tone?}) là số lớn, số thì tự đếm một lần khi cuộn tới. `StackCard` ({children, tone?}) là thẻ chữ đè góc. Ở 390px lớp nổi nhỏ lại và nằm sát mép, hoa văn lùi vào trong, không tràn ngang. `depth={false}` để tắt tách lớp theo độ sâu. `clear`: lớp nổi nằm dưới ảnh, chỉ chạm mép dưới 20px, không che sản phẩm (dùng cho mọi ảnh sản phẩm).

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

## Thay đổi vòng năm (22/11/2026), lời khách thắng tài liệu cũ
- Bỏ yêu cầu khung dáng lạ. `ShapeFrame` chỉ còn chữ nhật hoặc vuông bo nhẹ, thêm `fit`, `radius`; `Stack` thêm `clear`.
- Ảnh sản phẩm thật xuất đủ khung vào `public/images/home/ph-*.webp` bằng `scripts/xu-ly-anh-trang-chu-v5.mjs`, dữ liệu ở `src/components/home/photos-real.ts` (tỉ lệ đo từ ảnh gốc). Ảnh gốc ở `products-2026` giữ nguyên.
- Nền khối (`FlowSection` backdrop, mép cong, ảnh tan dần) vẫn được cover. Đó là nền trang trí, không phải ảnh sản phẩm.
