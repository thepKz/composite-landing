import type { Metadata } from 'next';
import { FlowBackdrop, FlowSection, Pattern, ScrollFx, ShapeFrame, Stack, StackCard, StackStat, morphName } from '@/components/decor';
import './thu-khung.css';

// Trang thử bộ nền chung vòng bốn. Không vào menu, không vào sitemap, không cho máy tìm kiếm.
export const metadata: Metadata = { title: 'Thử khung', robots: { index: false, follow: false } };

const img = (name: string, widths: number[]) => ({ src: `/images/home/${name}-${widths[widths.length - 1]}.webp`, srcSet: widths.map(w => `/images/home/${name}-${w}.webp ${w}w`).join(', ') });
const biogas = img('hero-be-biogas', [480, 720, 1080]);
const rect = img('dai-be-chu-nhat', [480, 720, 960]);
const round = img('be-tron-lap-dat', [480, 720, 960]);
const fish = img('be-nuoi-thuy-san', [480, 720, 960]);
const capsule = img('dai-bon-trang', [360, 540, 720]);
const truck = img('dai-xe-ban-tai', [480, 720, 960]);
const delivery = img('giao-hang-boc-xep', [480, 720, 960]);
const workshop = img('gioi-thieu-xuong', [640, 960, 1276]);
const install = img('hero-lap-dat', [960, 1600, 2000]);

function Photo({ photo, alt }: { photo: { src: string; srcSet: string }; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={photo.src} srcSet={photo.srcSet} sizes="(max-width:700px) 90vw, 420px" alt={alt} loading="lazy" decoding="async" />;
}

export default function FrameLab() {
  return (
    <main id="main" className="tk">
      <FlowBackdrop initial="dark" />
      <ScrollFx />

      <FlowSection tone="dark" top="none" aria-labelledby="tk-h1" decor={<Pattern kind="weave" opacity={0.2} fade="bottom" />}>
        <div className="tk-head">
          <h1 id="tk-h1">Thử khung ảnh, mép khối, chồng lớp</h1>
          <p>Trang thử nội bộ của bộ nền chung. Dáng khung đo bằng cung tròn thật, ảnh giữ đúng trọng tâm.</p>
        </div>
        <div className="tk-row tk-row--3">
          <figure><ShapeFrame shape="arch" outline focus="50% 60%" morph={morphName('product-photo', 'be-biogas')}><Photo photo={biogas} alt="Bể biogas composite" /></ShapeFrame><figcaption>Vòm (arch)</figcaption></figure>
          <figure><ShapeFrame shape="circle" outline="light" focus="50% 55%"><Photo photo={round} alt="Bể tròn lắp đặt" /></ShapeFrame><figcaption>Tròn (circle)</figcaption></figure>
          <figure><ShapeFrame shape="ring" outline focus="50% 50%"><Photo photo={fish} alt="Bể nuôi thủy sản" /></ShapeFrame><figcaption>Vành khuyên (ring)</figcaption></figure>
        </div>
      </FlowSection>

      <FlowSection tone="light" top="fade" decor={<Pattern kind="paper" opacity={0.8} fade="both" />}>
        <div className="tk-row tk-row--2">
          <figure><ShapeFrame shape="capsule" outline="green" focus="50% 60%"><Photo photo={capsule} alt="Bồn composite nằm ngang" /></ShapeFrame><figcaption>Viên nang (capsule)</figcaption></figure>
          <figure><ShapeFrame shape="slant" outline="navy" ratio={1.6} focus="50% 50%"><Photo photo={truck} alt="Xe bán tải chở bể" /></ShapeFrame><figcaption>Cạnh vát (slant)</figcaption></figure>
          <figure><ShapeFrame shape="slant-reverse" outline="bronze" ratio={1.6} focus="50% 50%"><Photo photo={delivery} alt="Giao hàng bốc xếp" /></ShapeFrame><figcaption>Cạnh vát ngược (slant-reverse)</figcaption></figure>
          <figure className="tk-wide"><ShapeFrame shape="porthole-trio" outline focus="50% 50%"><Photo photo={rect} alt="Dãy bể chữ nhật" /></ShapeFrame><figcaption>Ba ô cong một ảnh (porthole-trio)</figcaption></figure>
        </div>
      </FlowSection>

      <FlowSection tone="dark" top="arc" decor={<><Pattern kind="resin" opacity={0.35} fade="both" /><Pattern kind="drum" size="clamp(220px,30vw,420px)" top="-6%" right="-4%" opacity={0.26} /></>}>
        <div className="tk-split">
          <div className="tk-copy">
            <h2>Cụm chồng ba lớp</h2>
            <p>Hoa văn nằm sau, ảnh chính trong khung vòm, thẻ số liệu nổi đè góc. Số đếm một lần khi cuộn tới.</p>
          </div>
          <Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.7 }} float={<StackStat value={2010} grouping={false} label="Năm thành lập" tone="light" />} floatAt="br">
            <ShapeFrame shape="arch" outline focus="50% 55%" parallax><Photo photo={workshop} alt="Xưởng sản xuất" /></ShapeFrame>
          </Stack>
        </div>
      </FlowSection>

      <FlowSection tone="light" top="dome" decor={<Pattern kind="paper" opacity={0.85} fade="both" />}>
        <div className="tk-head tk-head--dark">
          <h2>Năm hoa văn</h2>
          <p>Mỗi ô là một lớp trang trí tuyệt đối, không nhận chuột, không thay ảnh sản phẩm.</p>
        </div>
        <div className="tk-tiles">
          {([['ripple', 'dark', 'screen'], ['drum', 'dark', 'screen'], ['weave', 'dark', 'normal'], ['resin', 'dark', 'normal'], ['paper', 'light', 'normal']] as const).map(([kind, tone, blend]) => (
            <div key={kind} className="tk-tile" data-tone={tone}>
              <Pattern kind={kind} blend={blend} {...(kind === 'ripple' ? { size: '90%', left: '5%', top: '10%', opacity: 0.8 } : kind === 'drum' ? { size: '80%', left: '10%', top: '10%', opacity: 0.6 } : kind === 'weave' ? { opacity: 0.5 } : kind === 'resin' ? { opacity: 0.9 } : { opacity: 1 })} />
              <span>{kind}</span>
            </div>
          ))}
        </div>
      </FlowSection>

      <FlowSection tone="photo" top="wave" backdrop={{ src: install.src, srcSet: install.srcSet, sizes: '100vw', position: '50% 50%', overlay: 0.7, fade: 'bottom', parallax: true }}>
        <div className="tk-split tk-split--rev">
          <div className="tk-copy">
            <h2>Ảnh nền thật tan sang khối kế</h2>
            <p>Ảnh có lớp phủ giữ chữ rõ, trượt chậm khi cuộn, mờ dần ở mép dưới để khối sáng bên dưới nhận tiếp.</p>
          </div>
          <Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.6 }} float={<StackCard tone="light"><p>Thẻ chữ đè góc ảnh, nằm trên nền đặc.</p></StackCard>} floatAt="bl">
            <ShapeFrame shape="circle" outline="light" focus="50% 55%" parallax={0.08}><Photo photo={round} alt="Bể tròn lắp đặt" /></ShapeFrame>
          </Stack>
        </div>
      </FlowSection>

      <FlowSection tone="light" top="fade" decor={<Pattern kind="paper" opacity={0.8} fade="both" />}>
        <div className="tk-head tk-head--dark">
          <h2>Đường vẽ dần và số đếm</h2>
        </div>
        <svg className="tk-line" viewBox="0 0 1000 120" preserveAspectRatio="none" role="presentation" aria-hidden="true">
          <path data-draw d="M10 90C140 90 160 30 290 30S440 90 570 90 720 30 850 30 940 60 990 60" fill="none" stroke="#b94918" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ul className="tk-stats">
          <li><span data-count="25">25</span><b>năm</b></li>
          <li><span data-count="1500">1.500</span><b>bể</b></li>
          <li><span data-count="7.2" data-count-decimals="1">7,2</span><b>m³</b></li>
        </ul>
      </FlowSection>

      <FlowSection tone="dark" solid={false} top="none">
        <div className="tk-head">
          <h2>Nền liền: khối không tô nền, lớp nền cố định đổi dần theo cuộn</h2>
          <p>Cuộn tiếp, nền chuyển từ xanh đen sang giấy rồi sang ảnh, không có mép nào.</p>
        </div>
        <div className="tk-gap" />
      </FlowSection>
      <FlowSection tone="light" solid={false} top="none">
        <div className="tk-head tk-head--dark">
          <h2>Vùng sáng giữa dòng chảy</h2>
          <p>Chữ tối trên nền giấy, vẫn cùng một tấm nền liền.</p>
        </div>
        <div className="tk-gap" />
      </FlowSection>
      <FlowSection tone="photo" solid={false} top="none">
        <div className="tk-head">
          <h2>Vùng ảnh sóng nhựa</h2>
          <p>Lớp phủ tối giữ chữ đạt tương phản.</p>
        </div>
        <div className="tk-gap" />
      </FlowSection>

      <FlowSection tone="dark" top="arc" decor={<><Pattern kind="weave" opacity={0.22} /><Pattern kind="drum" size="clamp(260px,34vw,460px)" bottom="-14%" left="50%" opacity={0.3} style={{ marginLeft: 'calc(clamp(260px,34vw,460px) / -2)' }} /></>}>
        <div className="tk-head">
          <h2>Chân trang: huy hiệu trống đồng, độ đục thấp</h2>
        </div>
        <div className="tk-gap tk-gap--short" />
      </FlowSection>
    </main>
  );
}
