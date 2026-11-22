import Link from 'next/link';
import { ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import Reveal from '@/components/pages/reveal';
import OrderTabs, { type OrderLine } from '@/components/pages/order-tabs';
import { processSteps } from '@/lib/site-facts';
import { productGuidance } from '@/lib/product-guidance';
import { editorialAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';

export const metadata = { title: 'Hướng dẫn đặt hàng', description: 'Quy trình đặt hàng năm bước, thông tin cần cung cấp theo từng dòng sản phẩm, thời gian báo giá, giao hàng và lắp đặt.', alternates: { canonical: '/huong-dan-dat-hang' } };

const lines: OrderLine[] = [
  { id: 'biogas', label: 'Bể biogas', slug: 'be-biogas-composite' },
  { id: 'phot', label: 'Bể phốt', slug: 'be-phot-composite' },
  { id: 'ca', label: 'Bể cá', slug: 'be-nuoi-trong-thuy-san' },
  { id: 'hoa-chat', label: 'Bồn hóa chất', slug: 'bon-chua-hoa-chat' },
  { id: 'thung-cho', label: 'Thùng chở', slug: 'thung-cho-tom-ca' },
  { id: 'rac', label: 'Thùng rác', slug: 'xe-gom-rac' },
  { id: 'yeu-cau', label: 'Theo yêu cầu', slug: 'composite-theo-yeu-cau' },
].map(item => ({ id: item.id, label: item.label, href: `/san-pham/${item.slug}`, items: productGuidance(item.slug).order }));

// Rút gọn một câu bước 1 cho vừa cột, không đổi nghĩa.
const stepText: Record<string, string> = { [processSteps[0].title]: 'Chọn quy mô trên website hoặc gọi hotline, nhắn Zalo.', [processSteps[1].title]: 'Kỹ sư chốt phương án theo số vật nuôi, số người dùng hoặc mặt bằng.' };

const times = [
  { value: '15 – 60 phút', label: 'Báo giá nhanh, kể từ khi nhận đủ thông tin' },
  { value: '2 – 3 ngày', label: 'Giao mẫu tiêu chuẩn có sẵn khuôn' },
  { value: '10 – 25 ngày', label: 'Giao hàng đơn thiết kế riêng' },
];

const groundSteps = ['Hút cạn nước trong hố đào', 'Gia cố đáy bằng cát đầm chặt hoặc bê tông lót phẳng, không để gạch đá sắc nhọn', 'Hạ bể đúng vị trí rồi bơm nước vào lòng bể để cân bằng với lực đẩy nổi của nước ngầm', 'Lấp đất mịn theo từng lớp và đầm đều tay'];

export default function OrderingGuide() {
  const hero = editorialAssets.bridge;
  const truck = editorialAssets.gallery[1];
  return <main id="main" className="public-page tp tp-order tp4">
    <Reveal/>
    <FlowHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Hướng dẫn đặt hàng' }]}
      title="Từ nhu cầu sử dụng đến bảo hành qua năm bước"
      lead="Quý khách chọn quy mô, kỹ sư tư vấn dung tích, hai bên thống nhất báo giá, rồi nhà máy sản xuất và lắp đặt."
      actions={<Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link>}
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="bl" float={<StackStat value={5} unit="bước" tone="light"/>}>
        <ShapeFrame shape="arch" ratio={1.05} outline="bronze" outlineOffset={14} focus="50% 55%">
          <img src={variants(hero.src).sq} alt={hero.alt} width={1000} height={1000} fetchPriority="high"/>
        </ShapeFrame>
      </Stack>}/>

    <FlowSection tone="light" top="dome" className="tp4-order-steps" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <h2 className="tp-sr">Quy trình năm bước</h2>
      <div className="tp4-path">
        <svg className="tp4-path__line" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-draw d="M100 4 C200 4 200 86 300 86 S400 4 500 4 S600 86 700 86 S800 4 900 4" fill="none" strokeWidth="2" strokeLinecap="round"/></svg>
        <ol>
          {processSteps.map((step, i) => <li className="tp-rv" style={{ ['--i' as string]: i }} key={step.title}>
            <span className="tp4-path__no" aria-hidden="true">{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{stepText[step.title] ?? step.text}</p>
          </li>)}
        </ol>
      </div>
    </FlowSection>

    <FlowSection tone="dark" top="wave" className="tp4-fs--teal tp4-order-info" decor={<>
      <Pattern kind="weave" fade="both" opacity={0.18}/>
      <Pattern kind="ripple" size="clamp(240px,30vw,440px)" top="-6%" right="-6%" opacity={0.45} blend="screen"/>
    </>}>
      <h2 className="tp4-h2 tp-rv">Mỗi dòng sản phẩm cần một bộ thông tin riêng</h2>
      <div className="tp-rv"><OrderTabs lines={lines}/></div>
    </FlowSection>

    <FlowSection tone="light" top="dome" className="tp4-order-ship" id="van-chuyen" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <ul className="tp4-times">
        {times.map((item, i) => <li className="tp-rv" style={{ ['--i' as string]: i }} key={item.value}><Clock size={24} aria-hidden="true"/><p className="tp4-times__v">{item.value}</p><p>{item.label}</p></li>)}
      </ul>
      <p className="tp4-times-note tp-rv">Báo giá chi tiết kèm bản vẽ và tiến độ gửi trong 1 – 24 giờ.</p>
      <h2 className="tp4-h2 tp-rv">Giao hàng, lắp đặt toàn quốc</h2>
      <div className="tp4-ship">
        <div className="tp-rv">
          <Stack pattern={{ kind: 'ripple', blend: 'multiply', opacity: 0.5 }} floatAt="br">
            <ShapeFrame shape="slant" ratio={1.35} outline="green" outlineOffset={12} focus="50% 55%" parallax>
              <img src={variants(truck.src).r43} alt={truck.alt} width={960} height={720} loading="lazy"/>
            </ShapeFrame>
          </Stack>
          <p className="tp4-body">Hỗ trợ xe tải ghép chuyến giao hàng và lắp đặt toàn quốc, hướng dẫn hoặc trực tiếp lắp đặt tại công trình.</p>
        </div>
        <div className="tp-rv" style={{ ['--i' as string]: 1 }}>
          <h3>Vùng đất trũng, nước ngầm</h3>
          <ol className="tp4-order-path">{groundSteps.map(text => <li key={text}>{text}</li>)}</ol>
        </div>
      </div>
    </FlowSection>

    <FlowSection id="bao-hanh" tone="dark" top="arc" className="tp4-order-warranty" decor={<>
      <Pattern kind="resin" fade="both" opacity={0.4}/>
      <Pattern kind="ripple" size="clamp(240px,30vw,440px)" bottom="-20%" left="-6%" opacity={0.45} blend="screen"/>
    </>}>
      <div className="tp4-teaser tp-rv">
        <ShieldCheck size={40} aria-hidden="true"/>
        <div><h2 className="tp4-h2">Bảo hành đến 10 năm</h2><p>Thời hạn tùy từng dòng sản phẩm.</p></div>
        <Link href="/chinh-sach-bao-hanh" className="tp-btn tp-btn-ghost-light">Xem chính sách <ArrowUpRight size={18} aria-hidden="true"/></Link>
      </div>
    </FlowSection>
  </main>;
}
