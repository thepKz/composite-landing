import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Check, Clock, Layers, Phone, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { comparison, facts, faqs, processSteps, reasons } from '@/lib/site-facts';
import { productAssetBySlug } from '@/lib/customer-product-assets';
import PostCard, { type CardPost } from '@/components/article/post-card';
import { FlowSection, Morph, Pattern, ShapeFrame, Stack, StackCard, StackStat, morphName } from '@/components/decor';
import { Drawing } from '@/components/pages/product-tile';
import ScrollDots from './scroll-dots';
import PhotoStrip from './photo-strip';
import EagerImages from './eager-images';
import { heightOf, photos, srcOf, srcSet } from './images';

type Group = { slug: string };
const reveal = (index = 0) => ({ ['--reveal-index' as string]: index }) as CSSProperties;

function Title({ id, children }: { id?: string; children: ReactNode }) {
  return <h2 id={id} className="tl-title" data-reveal>{children}</h2>;
}

/* Giới thiệu và số liệu. Cụm chồng ba lớp: hoa văn trống đồng, ảnh xưởng trong khung vòm, số năm thành lập đè góc. */
export function AboutSection({ metricsSlot }: { address?: string; metricsSlot: ReactNode }) {
  const image = photos.workshop;
  return <FlowSection tone="light" top="arc" id="gioi-thieu-ngan" aria-labelledby="tl-about-h" inner={false} className="tl-about-section" decor={<Pattern kind="paper" opacity={0.9} fade="both" />}>
    <div className="tl-wrap">
      <Title id="tl-about-h">Composite khắc phục điểm yếu của gạch và kim loại</Title>
      <div className="tl-about">
        <div className="tl-about-visual" data-reveal>
          <Stack pattern={{ kind: 'drum', size: 'clamp(220px,30vw,400px)', opacity: 0.42, blend: 'multiply' }} floatAt="br" float={<StackStat value={String(facts.founded)} label="Năm thành lập" tone="dark" />}>
            <ShapeFrame shape="arch" ratio={0.86} outline="bronze" focus="50% 55%" parallax>
              <img src={srcOf(image, 960)} srcSet={srcSet(image)} sizes="(max-width: 960px) 80vw, 480px" alt={image.alt} width={960} height={heightOf(image, 960)} loading="lazy" decoding="async" />
            </ShapeFrame>
          </Stack>
        </div>
        <div className="tl-about-copy" data-reveal style={reveal(1)}>
          <p>Từ năm {facts.founded}, nhà máy tại Phú Thọ thiết kế, sản xuất và cung cấp trọn gói sản phẩm nhựa cốt sợi thủy tinh cho chăn nuôi, thủy sản, dân dụng, vệ sinh đô thị, xử lý môi trường và công nghiệp hóa chất.</p>
          <p>Mỗi sản phẩm được kỹ sư tính kết cấu, chọn dòng nhựa nền phù hợp và kiểm định độ kín trước khi bàn giao.</p>
          <p className="tl-motto">Đúng yêu cầu, đúng tiến độ, bền vững theo thời gian.</p>
          <Link href="/gioi-thieu" className="tl-button is-dark pressable">Tìm hiểu thêm<ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </div>
      {metricsSlot}
    </div>
  </FlowSection>;
}

const reasonIcons = [ShieldCheck, Clock, Layers, Wrench] as const;

/* Lý do và bảng so sánh trên cùng một nền ảnh thật trải qua hai cụm. */
export function WhySection() {
  const [own, ...others] = comparison.columns;
  const image = photos.structure;
  return <FlowSection tone="photo" top="dome" aria-labelledby="tl-why-h" inner={false} className="tl-why-section"
    backdrop={{ src: srcOf(image, 960), srcSet: srcSet(image), sizes: '100vw', position: '50% 50%', overlay: 0.74, fade: 'bottom', parallax: true }}
    decor={<Pattern kind="ripple" size="clamp(260px,34vw,520px)" top="2%" right="-8%" opacity={0.5} blend="screen" />}>
    <div className="tl-wrap">
      <Title id="tl-why-h">Bể đúc liền khối bền hơn bể xây và bồn kim loại</Title>
      <div className="tl-why">
        <div className="tl-why-visual" data-reveal>
          <Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.7 }} floatAt="bl" float={<StackStat value={10} unit="năm" label="Bảo hành tối đa" tone="light" />}>
            <ShapeFrame shape="circle" outline="light" focus="50% 50%" parallax={0.08}>
              <img src={srcOf(photos.fishTank, 720)} srcSet={srcSet(photos.fishTank)} sizes="(max-width: 960px) 70vw, 420px" alt={photos.fishTank.alt} width={720} height={heightOf(photos.fishTank, 720)} loading="lazy" decoding="async" />
            </ShapeFrame>
          </Stack>
        </div>
        <ul className="tl-reasons">{reasons.map((item, index) => {
          const Icon = reasonIcons[index];
          return <li key={item.title} data-reveal style={reveal(index)}>
            <Icon size={28} aria-hidden="true" />
            <div><h3>{item.title}</h3><p>{item.text}</p></div>
          </li>;
        })}</ul>
      </div>
      <h3 className="tl-sr">So với bể xây và bồn kim loại</h3>
      <div className="tl-compare-wrap" data-reveal>
        <table className="tl-compare">
          <colgroup><col className="c-criterion" /><col className="c-own" /><col /><col /></colgroup>
          <thead><tr><th scope="col"><span className="tl-sr">Tiêu chí</span></th><th scope="col" className="is-own">{own}</th>{others.map(name => <th scope="col" key={name}>{name}</th>)}</tr></thead>
          <tbody>{comparison.rows.map(row => <tr key={row.criterion}><th scope="row">{row.criterion}</th>{row.values.map((value, index) => <td key={index} className={index === 0 ? 'is-own' : undefined}>{index === 0 && <Check size={18} aria-hidden="true" />}<span>{value}</span></td>)}</tr>)}</tbody>
        </table>
        <div className="tl-compare-mobile">
          <ul className="tl-own-list">{comparison.rows.map(row => <li key={row.criterion}>
            <strong>{row.criterion}</strong>
            <span><Check size={18} aria-hidden="true" />{row.values[0]}</span>
          </li>)}</ul>
          <details className="tl-more-compare">
            <summary><span>Xem so sánh đầy đủ</span><span className="tl-faq-mark" aria-hidden="true"><i /><i /></span></summary>
            <div className="tl-compare-cards">{comparison.rows.map(row => <article className="tl-compare-card" key={row.criterion}>
              <h3>{row.criterion}</h3>
              <dl>{row.values.slice(1).map((value, index) => <div key={index}><dt>{comparison.columns[index + 1]}</dt><dd>{value}</dd></div>)}</dl>
            </article>)}</div>
          </details>
        </div>
      </div>
    </div>
  </FlowSection>;
}

type Lead = { slug: string; name: string; text: string; shape: 'arch' | 'ring' | 'circle'; ratio: number; focus?: string; photo?: { src: string; alt: string; width: number; height: number; srcSet?: string }; stat?: string };

const leads: Lead[] = [
  { slug: 'be-biogas-composite', name: 'Bể biogas composite', shape: 'arch', ratio: 0.8, focus: '50% 62%', photo: productAssetBySlug['be-biogas-composite'], text: 'Dung tích từ 1,5 m³ đến trên 13 m³, từ hộ nuôi nhỏ đến trang trại lớn. Kín khí, sinh gas mạnh, tự đẩy bã ra ngoài.' },
  { slug: 'be-phot-va-xu-ly-nuoc-thai', name: 'Bể phốt, nước thải', shape: 'ring', ratio: 1, stat: 'Từ 1 m³', text: 'Từ 1 m³ cho gia đình ba đến sáu người đến trên 100 m³ cho nhà trọ, khách sạn, trường học và nhà máy.' },
  { slug: 'be-nuoi-trong-thuy-san', name: 'Bể cá Koi và thủy sản', shape: 'circle', ratio: 1, focus: '50% 52%', text: 'Hồ cá Koi sân vườn có vách lọc, bể trữ hải sản nhà hàng, bể đáy phễu nuôi tôm cá.' },
];

type Minor = { slug: string; name: string; text: string; shape: 'slant' | 'slant-reverse' | 'capsule'; ratio: number; focus?: string; photo?: { src: string; alt: string; width: number; height: number }; stat?: string };

const minors: Minor[] = [
  { slug: 'bon-chua-hoa-chat', name: 'Bồn chứa hóa chất', shape: 'capsule', ratio: 1.25, stat: 'Kháng ăn mòn', text: 'Kháng axit, kiềm, muối và dung dịch ăn mòn cho nhà máy sản xuất và xử lý nước.' },
  { slug: 'thung-cho-tom-ca', name: 'Thùng chở hải sản sống', shape: 'slant', ratio: 1.25, focus: '50% 55%', photo: productAssetBySlug['thung-cho-tom-ca'], text: 'Ba lớp bảo ôn PU Foam, vách chắn sóng, vừa xe từ 500 kg đến 15 tấn.' },
  { slug: 'xe-gom-rac', name: 'Thùng rác, xe gom rác', shape: 'slant-reverse', ratio: 1.25, focus: '50% 58%', photo: productAssetBySlug['xe-gom-rac'], text: 'Thùng 60 đến 240 L, xe gom 400 đến 1000 L, không gỉ.' },
  { slug: 'composite-theo-yeu-cau', name: 'Sản phẩm theo yêu cầu', shape: 'slant', ratio: 1.25, focus: '50% 50%', photo: productAssetBySlug['composite-theo-yeu-cau'], text: 'Gia công theo bản vẽ hoặc ý tưởng, gồm bể bơi, tháp xử lý khí, vỏ thiết bị và bọc phủ chống thấm.' },
];

function Spec({ kind, stat, big = false }: { kind: 'septic' | 'tank'; stat?: string; big?: boolean }) {
  return <div className={`tl-spec${big ? ' is-big' : ''}`} data-kind={kind}>
    <Pattern kind="resin" opacity={0.7} />
    <Pattern kind="ripple" size="90%" left="5%" top="8%" opacity={0.55} blend="screen" />
    {kind === 'tank' && <Drawing kind="tank" className="tl-spec-art" />}
    {stat && kind === 'tank' && <strong>{stat}</strong>}
  </div>;
}

export function ProductsSection({ groups, children }: { groups: Group[]; children?: ReactNode }) {
  const available = new Set(groups.map(group => group.slug));
  const hrefOf = (slug: string) => (available.has(slug) ? `/san-pham/${slug}` : '/san-pham');
  return <FlowSection tone="light" top="none" id="san-pham" aria-labelledby="tl-products-h" inner={false} className="tl-products-section" decor={<><Pattern kind="paper" opacity={0.9} fade="both" /><Pattern kind="ripple" size="clamp(240px,30vw,460px)" top="30%" left="-9%" opacity={0.5} blend="multiply" /></>}>
    <div className="tl-wrap">
      <Title id="tl-products-h">Mỗi sản phẩm được tính kết cấu theo công trình</Title>
      <div id="tl-lead-row" className="tl-leads">
        {leads.map((lead, index) => {
          const photo = lead.slug === 'be-nuoi-trong-thuy-san' ? undefined : lead.photo;
          return <Link key={lead.slug} href={hrefOf(lead.slug)} className="tl-lead pressable" data-reveal style={reveal(index)}>
            <div className="tl-lead-media">
              <ShapeFrame shape={lead.shape} ratio={lead.ratio} outline={lead.shape === 'circle' ? 'green' : 'bronze'} focus={lead.focus} morph={morphName('product-photo', lead.slug)}>
                {lead.shape === 'ring'
                  ? <Spec kind="septic" />
                  : lead.slug === 'be-nuoi-trong-thuy-san'
                    ? <img src={srcOf(photos.fishTank, 720)} srcSet={srcSet(photos.fishTank)} sizes="(max-width: 760px) 70vw, 380px" alt={photos.fishTank.alt} width={720} height={heightOf(photos.fishTank, 720)} loading="lazy" decoding="async" />
                    : photo && <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />}
              </ShapeFrame>
              {lead.stat && <p className="tl-lead-stat">{lead.stat}</p>}
            </div>
            <div className="tl-lead-body">
              <Morph name={morphName('product-title', lead.slug)}><h3>{lead.name}</h3></Morph>
              <p>{lead.text}</p>
              <span className="tl-lead-more" aria-hidden="true"><ArrowRight size={20} /></span>
            </div>
          </Link>;
        })}
      </div>
      <ScrollDots target="tl-lead-row" label="Ba nhóm chủ lực" />
      <ul className="tl-minors">
        {minors.map((item, index) => <li key={item.slug} data-reveal style={reveal(index)}>
          <Link href={hrefOf(item.slug)} className="tl-minor pressable">
            <div className="tl-minor-media">
              <ShapeFrame shape={item.shape} ratio={item.ratio} focus={item.focus} outline={item.photo ? undefined : 'bronze'} outlineOffset={8} morph={morphName('product-photo', item.slug)}>
                {item.photo ? <img src={item.photo.src} alt={item.photo.alt} width={item.photo.width} height={item.photo.height} loading="lazy" decoding="async" /> : <Spec kind="tank" stat={item.stat} />}
              </ShapeFrame>
            </div>
            <div className="tl-minor-body">
              <Morph name={morphName('product-title', item.slug)}><h3>{item.name}</h3></Morph>
              <p>{item.text}</p>
            </div>
          </Link>
        </li>)}
      </ul>
      <div className="tl-more-row"><Link href="/san-pham" className="tl-link pressable">Tất cả sản phẩm<ArrowUpRight size={20} aria-hidden="true" /></Link></div>
    </div>
    {children}
  </FlowSection>;
}

/* Dải ảnh thật nằm cuối khối sản phẩm, tràn hai mép. */
export function PhotoBand() {
  return <div className="tl-band" data-reveal>
    <h2 className="tl-sr">Hình ảnh sản phẩm thực tế</h2>
    <PhotoStrip />
  </div>;
}

const stepTitles = ['Tiếp nhận nhu cầu', 'Tư vấn dung tích', 'Báo giá, ký hợp đồng', 'Sản xuất, kiểm định', 'Lắp đặt, bảo hành'];
const stepTexts: Record<number, string> = {
  1: 'Kỹ sư dựa trên số vật nuôi, số người dùng hoặc mặt bằng để chốt phương án tiết kiệm.',
  2: 'Gửi báo giá chi tiết trong một đến 24 giờ, thống nhất bản vẽ và tiến độ bàn giao.',
};

/* Quy trình năm bước: đường vẽ dần theo cuộn, nút số nằm trên đường. */
export function ProcessSection() {
  return <FlowSection tone="dark" top="none" aria-labelledby="tl-process-h" inner={false} className="tl-process-section" decor={<><Pattern kind="resin" opacity={0.42} fade="both" /><Pattern kind="weave" opacity={0.2} /></>}>
    <div className="tl-wrap">
      <Title id="tl-process-h">Kỹ sư chốt phương án từ nhu cầu sử dụng thực tế</Title>
      <div className="tl-flow">
        <svg className="tl-flow-line is-h" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path className="tl-flow-track" d="M0 28 L100 28 C200 28 200 52 300 52 C400 52 400 28 500 28 C600 28 600 52 700 52 C800 52 800 28 900 28 L1000 28" fill="none" vectorEffect="non-scaling-stroke" />
          <path className="tl-flow-draw" data-draw d="M0 28 L100 28 C200 28 200 52 300 52 C400 52 400 28 500 28 C600 28 600 52 700 52 C800 52 800 28 900 28 L1000 28" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="tl-flow-steps">{processSteps.map((step, index) => <li key={step.title} data-reveal style={reveal(index)}>
          <span className="tl-step-number">{index + 1}</span>
          {index < processSteps.length - 1 && <svg className="tl-flow-seg" viewBox="0 0 24 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path className="tl-flow-track" d="M12 0 V100" fill="none" vectorEffect="non-scaling-stroke" /><path className="tl-flow-draw" data-draw d="M12 0 V100" fill="none" vectorEffect="non-scaling-stroke" /></svg>}
          <h3>{stepTitles[index] ?? step.title}</h3>
          <p>{stepTexts[index] ?? step.text}</p>
        </li>)}</ol>
      </div>
    </div>
  </FlowSection>;
}

export function FaqSection({ hotline = facts.hotlines[0] }: { hotline?: { display: string; tel: string } }) {
  return <FlowSection tone="light" top="wave" aria-labelledby="tl-faq-h" inner={false} className="tl-faq-section" decor={<Pattern kind="paper" opacity={0.9} fade="both" />}>
    <div className="tl-wrap">
      <Title id="tl-faq-h">Những điều quý khách thường hỏi trước khi đặt bể</Title>
      <div className="tl-faq-list">{faqs.map((item, index) => <details key={item.q} name="tl-faq" className="tl-faq-item" data-reveal style={reveal(index)}>
        <summary><span>{item.q}</span><span className="tl-faq-mark" aria-hidden="true"><i /><i /></span></summary>
        <div className="tl-faq-answer"><p>{item.a}</p></div>
      </details>)}</div>
      <div className="tl-faq-call" data-reveal>
        <p>Cần hỏi thêm, quý khách có thể gọi trực tiếp cho kỹ sư.</p>
        <div className="tl-faq-actions">
          <a href={`tel:${hotline.tel}`} className="tl-button is-dark pressable"><Phone size={20} aria-hidden="true" />{hotline.display}</a>
          <Link href="/hoi-dap" className="tl-link pressable">Xem tất cả câu hỏi<ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  </FlowSection>;
}

export function NewsSection({ posts }: { posts: CardPost[] }) {
  if (!posts.length) return null;
  return <FlowSection tone="light" top="none" aria-labelledby="tl-news-h" inner={false} className="tl-news-section" decor={<Pattern kind="paper" opacity={0.9} fade="both" />}>
    <div className="tl-wrap">
      <h2 id="tl-news-h" className="tl-sr">Tin tức</h2>
      <EagerImages className="tl-news-grid" count={posts.length}>{posts.map((post, index) => <PostCard key={post.id} post={post} index={index} featured={posts.length === 1} />)}</EagerImages>
      <div className="tl-more-row"><Link href="/tin-tuc" className="tl-link pressable">Tất cả tin tức<ArrowUpRight size={20} aria-hidden="true" /></Link></div>
    </div>
  </FlowSection>;
}

export function QuoteSection({ form }: { form: ReactNode }) {
  const image = photos.loading;
  const cover = { src: '/images/home/hero-xe-ban-tai-1600.webp', srcSet: '/images/home/hero-xe-ban-tai-960.webp 960w, /images/home/hero-xe-ban-tai-1600.webp 1600w' };
  return <FlowSection tone="light" top="none" id="tu-van" aria-labelledby="tl-quote-h" inner={false} className="tl-quote-section"
    backdrop={{ ...cover, sizes: '100vw', position: '50% 55%', overlay: 0.9, fade: 'top', parallax: true }}>
    <div className="tl-wrap">
      <Title id="tl-quote-h">Gửi nhu cầu, kỹ sư báo giá trong 15 đến 60 phút</Title>
      <div className="tl-quote-grid">
        <div className="tl-quote-copy" data-reveal>
          <div className="tl-quote-visual">
            <Stack pattern={{ kind: 'ripple', blend: 'multiply', opacity: 0.55 }} floatAt="br" float={<StackCard tone="dark"><p>Mẫu bể tiêu chuẩn giao trong khoảng 2 đến 3 ngày.</p></StackCard>}>
              <ShapeFrame shape="porthole-trio" outline="bronze" outlineOffset={10} focus="50% 55%">
                <img src={srcOf(image, 720)} srcSet={srcSet(image)} sizes="(max-width: 1100px) 90vw, 520px" alt={image.alt} width={720} height={heightOf(image, 720)} loading="lazy" decoding="async" />
              </ShapeFrame>
            </Stack>
          </div>
          <ul className="tl-quote-points">
            <li><Truck size={22} aria-hidden="true" />Vận chuyển và lắp đặt tận nơi trên toàn quốc</li>
            <li><ShieldCheck size={22} aria-hidden="true" />Bảo hành đến 10 năm theo từng dòng sản phẩm</li>
          </ul>
        </div>
        <div className="tl-quote-form" data-reveal style={reveal(1)}>{form}</div>
      </div>
    </div>
  </FlowSection>;
}
