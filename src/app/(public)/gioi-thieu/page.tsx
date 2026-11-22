import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, ClipboardCheck, Eye, HeartHandshake, Lightbulb, Layers, Rocket, Shapes, Sparkles, ShieldCheck, Waypoints } from 'lucide-react';
import { facts, metrics } from '@/lib/site-facts';
import { editorialAssets, additionalCustomerAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import PhotoStrip from '@/components/pages/photo-strip';
import FlowHero from '@/components/pages/flow-hero';
import FlowCta from '@/components/pages/flow-cta';
import Reveal from '@/components/pages/reveal';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';

export const metadata = {
  title: 'Giới thiệu Thành Lợi Composite',
  description: 'Thành Lợi Composite sản xuất bể biogas, bể phốt, bể thủy sản và bồn bể composite FRP tại Phú Thọ từ năm 2010.',
  alternates: { canonical: '/gioi-thieu' },
};

// Nhãn số liệu rút gọn cho vừa cột, không đổi nghĩa so với site-facts.
const metricLabel: Record<string, string> = { '100+': 'Công trình, trang trại bàn giao, vận hành ổn định', '25+': 'Khách hàng, đại lý, trang trại, nhà máy toàn quốc' };

const values = [
  { icon: ShieldCheck, title: 'Chữ tín làm gốc', text: 'Đúng độ dày vật liệu, đúng loại nhựa, đúng dung tích, đúng tiến độ đã thỏa thuận.' },
  { icon: BadgeCheck, title: 'Chất lượng làm nền tảng', text: 'Không pha tạp chất làm giảm cơ tính. Thử kín nước, kín khí trước khi xuất xưởng.' },
  { icon: HeartHandshake, title: 'Tận tâm phục vụ', text: 'Tư vấn đúng, đủ theo quy mô thực tế để khách tiết kiệm chi phí.' },
  { icon: Lightbulb, title: 'Đổi mới và sáng tạo', text: 'Cải tiến khuôn mẫu và công nghệ gia công cho bề mặt đẹp, chịu lực tốt, dễ vận chuyển.' },
];

const zones = [
  { icon: Shapes, name: 'Chế tạo khuôn mẫu' },
  { icon: Layers, name: 'Đắp tay và phun sợi' },
  { icon: Waypoints, name: 'Quấn sợi bồn công nghiệp' },
  { icon: Sparkles, name: 'Hoàn thiện bề mặt' },
  { icon: ClipboardCheck, name: 'Kiểm định chất lượng' },
];

const qc = [
  { title: 'Nguyên liệu đầu vào', text: 'Kiểm tra nhựa nền và sợi thủy tinh trước khi đưa vào sản xuất.' },
  { title: 'Độ dày từng lớp', text: 'Giám sát lớp lót chống thấm và lớp kết cấu chịu lực.' },
  { title: 'Hình học và độ kín', text: 'Đo kích thước, độ cứng Barcol, thử kín nước hoặc kín khí sau khi tháo khuôn.' },
  { title: 'Nghiệm thu công trình', text: 'Cùng chủ đầu tư kiểm tra thực tế ngay tại chân công trình.' },
];

const fields = [
  { label: 'Chăn nuôi', href: '/san-pham/be-biogas-composite' },
  { label: 'Thủy sản', href: '/san-pham/be-nuoi-trong-thuy-san' },
  { label: 'Xử lý nước thải', href: '/san-pham/be-phot-va-xu-ly-nuoc-thai' },
  { label: 'Hóa chất', href: '/san-pham/bon-chua-hoa-chat' },
  { label: 'Vệ sinh đô thị', href: '/san-pham/xe-gom-rac' },
  { label: 'Theo yêu cầu', href: '/san-pham/composite-theo-yeu-cau' },
];

// Dải ảnh không lặp ảnh đã dùng ở đầu trang, khối câu chuyện và khối nhà máy.
const stripAssets = [editorialAssets.bridge, editorialAssets.footer, editorialAssets.gallery[0], editorialAssets.contact, editorialAssets.gallery[1], additionalCustomerAssets[1]];
const strip = stripAssets.map(asset => { const v = variants(asset.src); return { src: v.r43, srcSet: `${v.r43Small} 520w, ${v.r43} 960w`, alt: asset.alt, label: '' }; });

const parseMetric = (value: string) => ({ n: parseInt(value, 10), plus: value.endsWith('+') });

export default function AboutPage() {
  const hero = editorialAssets.hero;
  const story = editorialAssets.story;
  const detail = editorialAssets.contact;
  const shop = editorialAssets.fit;
  return <main id="main" className="public-page tp tp-about tp4">
    <Reveal/>
    <FlowHero tone="forest" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Giới thiệu' }]}
      title="Không nứt như bê tông, không gỉ như kim loại"
      lead="Từ năm 2010, Thành Lợi chế tạo bể và bồn composite FRP tại Phú Thọ, mỗi sản phẩm qua khảo sát thực tế và kiểm định độ kín."
      actions={<>
        <Link href="/lien-he#gui-yeu-cau" className="tp-btn tp-btn-cta">Nhận báo giá <ArrowUpRight size={18} aria-hidden="true"/></Link>
        <Link href="/san-pham" className="tp-btn tp-btn-ghost-light">Xem sản phẩm</Link>
      </>}
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.6 }} floatAt="bl" float={<StackStat value={facts.founded} grouping={false} label="Năm thành lập" tone="light"/>}>
        <ShapeFrame shape="arch" ratio={0.95} outline="bronze" outlineOffset={14} focus="50% 55%" parallax>
          <img src={variants(hero.src).sq} alt={hero.alt} width={1000} height={1000} fetchPriority="high"/>
        </ShapeFrame>
      </Stack>}/>

    <FlowSection tone="light" top="dome" className="tp4-about-story" decor={<>
      <Pattern kind="paper" fade="both" opacity={0.85}/>
      <Pattern kind="drum" size="clamp(240px,30vw,420px)" top="2%" left="-8%" opacity={0.22} blend="multiply"/>
    </>}>
      <h2 className="tp4-h2 tp-rv">Mỗi bể đều qua khảo sát thực tế trước khi sản xuất</h2>
      <div className="tp4-story">
        <div className="tp-rv">
          <p className="tp4-statement">Thành Lợi khởi đầu từ nhu cầu tìm vật liệu thay cho bê tông xây gạch, vốn dễ nứt thấm, và kim loại, vốn dễ gỉ sét trong môi trường khắc nghiệt.</p>
          <p className="tp4-body">Kỹ sư tính độ dày kết cấu và chọn nhựa nền Polyester hoặc Vinyl Ester phù hợp từng khách hàng.</p>
        </div>
        <div className="tp-rv" style={{ ['--i' as string]: 1 }}>
          <Stack pattern={{ kind: 'ripple', blend: 'multiply', opacity: 0.5 }} floatAt="br" float={<div className="tp4-ring-float"><ShapeFrame shape="circle" outline="light" outlineOffset={8} focus="50% 50%"><img src={variants(detail.src).sq} alt={detail.alt} width={400} height={400} loading="lazy"/></ShapeFrame></div>}>
            <ShapeFrame shape="slant" ratio={1.3} outline="bronze" outlineOffset={12} focus="50% 50%" parallax>
              <img src={variants(story.src).r32} alt={story.alt} width={1400} height={933} loading="lazy"/>
            </ShapeFrame>
          </Stack>
        </div>
      </div>
      <div className="tp4-metrics-wrap">
        <svg className="tp4-wave" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-draw d="M0 40 C150 0 250 80 400 40 S650 0 800 40 S1050 80 1200 40" fill="none" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round"/></svg>
        <ul className="tp4-metrics">
          {metrics.map((metric, i) => { const m = parseMetric(metric.value); return <li className="tp-rv" style={{ ['--i' as string]: i }} key={metric.label}>
            <p className="tp4-metric__v"><span data-count={m.n}>{m.n}</span>{m.plus ? <span>+</span> : null}<b>{metric.unit}</b></p>
            <p className="tp4-metric__l">{metricLabel[metric.value] ?? metric.label}</p>
          </li>; })}
        </ul>
      </div>
    </FlowSection>

    <FlowSection tone="dark" top="wave" className="tp4-fs--teal tp4-about-strip" aria-labelledby="tp-strip-title" inner={false} decor={<>
      <Pattern kind="weave" fade="both" opacity={0.2}/>
      <Pattern kind="ripple" size="clamp(260px,32vw,480px)" top="-4%" right="-6%" opacity={0.45} blend="screen"/>
    </>}>
      <div className="tl-fs__inner"><h2 id="tp-strip-title" className="tp4-h2 tp-rv">Thành phẩm từ xưởng Phú Thọ đến chân công trình</h2></div>
      <div className="tp4-strip tp-rv"><PhotoStrip photos={strip} label="Ảnh xưởng và công trình, dùng phím mũi tên để xem tiếp"/></div>
    </FlowSection>

    <FlowSection tone="light" top="fade" className="tp4-about-purpose" decor={<>
      <Pattern kind="paper" fade="both" opacity={0.85}/>
      <Pattern kind="ripple" size="clamp(240px,30vw,440px)" bottom="-6%" right="-8%" opacity={0.5} blend="multiply"/>
    </>}>
      <h2 className="tp4-h2 tp-rv">Mỗi thiết bị hướng tới độ bền trên 30 năm</h2>
      <div className="tp4-purpose">
        <article className="tp-rv"><span className="tp4-badge-ico"><Eye size={28} aria-hidden="true"/></span><h3>Tầm nhìn</h3><p>Trở thành thương hiệu sản xuất và gia công composite FRP được tin dùng hàng đầu Việt Nam, đưa vật liệu bền vững vào môi trường, nông nghiệp tuần hoàn và công nghiệp hiện đại.</p></article>
        <article className="tp-rv" style={{ ['--i' as string]: 1 }}><span className="tp4-badge-ico"><Rocket size={28} aria-hidden="true"/></span><h3>Sứ mệnh</h3><p>Cung cấp thiết bị composite bền trên 30 năm, tối ưu chi phí dài hạn, đồng hành từ khảo sát, thiết kế đến lắp đặt và bảo hành.</p></article>
      </div>
      <ul className="tp4-values">
        {values.map((value, i) => <li className="tp-rv" style={{ ['--i' as string]: i }} key={value.title}><value.icon size={28} aria-hidden="true"/><h3>{value.title}</h3><p>{value.text}</p></li>)}
      </ul>
    </FlowSection>

    <FlowSection tone="dark" top="dome" className="tp4-fs--forest tp4-about-factory" decor={<>
      <Pattern kind="resin" fade="both" opacity={0.4}/>
      <Pattern kind="drum" size="clamp(220px,26vw,360px)" top="6%" right="-5%" opacity={0.22} blend="screen"/>
    </>}>
      <h2 className="tp4-h2 tp-rv">Năm khu chức năng, từ khuôn mẫu đến kiểm định</h2>
      <div className="tp4-zones-wrap tp-rv">
        <svg className="tp4-zones-line" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path data-draw d="M40 60 C140 10 200 110 300 60 S440 10 540 60 S700 110 800 60 S900 20 960 60" fill="none" strokeWidth="2" strokeLinecap="round"/></svg>
        <ol className="tp4-zones" aria-label="Các khu trong nhà máy">
          {zones.map(zone => <li key={zone.name}><span className="tp4-zone-ico"><zone.icon size={26} aria-hidden="true"/></span><strong>{zone.name}</strong></li>)}
        </ol>
      </div>
      <div className="tp4-materials">
        <div className="tp-rv">
          <Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.5 }} floatAt="tr" float={<div className="tp4-ring-float is-sm"><ShapeFrame shape="ring" outline="bronze" outlineOffset={8} focus="50% 50%"><img src={variants(stripAssets[0].src).sq} alt="" width={400} height={400} loading="lazy"/></ShapeFrame></div>}>
            <ShapeFrame shape="circle" outline="bronze" outlineOffset={12} focus="50% 50%" parallax>
              <img src={variants(shop.src).sq} alt={shop.alt} width={1000} height={1000} loading="lazy"/>
            </ShapeFrame>
          </Stack>
        </div>
        <div className="tp-rv" style={{ ['--i' as string]: 1 }}>
          <h3>Nguyên vật liệu tuyển chọn</h3>
          <ul className="tp-pill-list">
            <li>Nhựa Polyester không no</li><li>Nhựa Isophthalic</li><li>Nhựa Vinyl Ester</li><li>Sợi thủy tinh Mat</li><li>Sợi Woven Roving</li>
          </ul>
          <p>Nhựa nền chính phẩm kết hợp sợi thủy tinh nhập khẩu, kháng tia UV, kháng axit, kiềm và chịu lực cơ học tốt.</p>
        </div>
      </div>
    </FlowSection>

    <FlowSection tone="light" top="arc" className="tp4-about-qc" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <h2 className="tp4-h2 tp-rv">Bốn bước kiểm tra chất lượng</h2>
      <ol className="tp4-steps">
        {qc.map((step, i) => <li className="tp-rv" style={{ ['--i' as string]: i }} key={step.title}>
          <span className="tp4-steps__no" aria-hidden="true">{i + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </li>)}
      </ol>
    </FlowSection>

    <FlowSection tone="dark" top="dome" className="tp4-about-fields" decor={<>
      <Pattern kind="weave" fade="top" opacity={0.2}/>
      <Pattern kind="ripple" size="clamp(240px,30vw,440px)" top="-10%" left="-8%" opacity={0.45} blend="screen"/>
    </>}>
      <h2 className="tp4-h2 tp-rv">Một vật liệu cho chăn nuôi, thủy sản và môi trường</h2>
      <nav className="tp4-fields" aria-label="Lĩnh vực phục vụ">
        {fields.map((item, i) => <Link key={item.label} href={item.href} className="tp-rv" style={{ ['--i' as string]: i }}>{item.label}<ArrowUpRight size={20} aria-hidden="true"/></Link>)}
      </nav>
    </FlowSection>
    <FlowCta top="none"/>
  </main>;
}
