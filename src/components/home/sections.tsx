import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Droplets, FlaskConical, Layers, Phone, Shapes, ShieldCheck, Trash2, Truck, Wrench, Flame, Fish, Clock } from 'lucide-react';
import { comparison, facts, faqs, processSteps, reasons } from '@/lib/site-facts';
import { editorialAssets, productAssetBySlug } from '@/lib/customer-product-assets';
import PostCard, { type CardPost } from '@/components/article/post-card';
import ScrollDots from './scroll-dots';
import ProductTile from '@/components/pages/product-tile';

type Group = { slug: string };
const reveal = (index = 0) => ({ ['--reveal-index' as string]: index });

function Heading({ title, text, action }: { title: string; text?: string; action?: { href: string; label: string } }) {
  return <div className="tl-heading" data-reveal>
    <div><h2>{title}</h2>{text && <p>{text}</p>}</div>
    {action && <Link href={action.href} className="tl-link pressable">{action.label}<ArrowUpRight size={20} aria-hidden="true" /></Link>}
  </div>;
}

export function AboutSection({ address = facts.address }: { address?: string }) {
  return <section className="tl-section tl-about" id="gioi-thieu-ngan">
    <div className="container tl-about-grid">
      <div className="tl-about-copy" data-reveal>
        <h2>Về Thành Lợi Composite</h2>
        <p>Thành lập từ năm {facts.founded}, nhà máy đặt tại {address}. Chúng tôi thiết kế, sản xuất và cung cấp trọn gói sản phẩm composite FRP cho chăn nuôi, thủy sản, xử lý môi trường, công nghiệp hóa chất, vệ sinh đô thị và dân dụng.</p>
        <p className="tl-about-extra">Mỗi sản phẩm được kỹ sư tính kết cấu, chọn nhựa nền phù hợp và thử kín trước khi bàn giao.</p>
        <p className="tl-motto">Đúng yêu cầu, đúng tiến độ, bền vững theo thời gian.</p>
        <Link href="/gioi-thieu" className="tl-button is-dark pressable">Tìm hiểu thêm<ArrowRight size={20} aria-hidden="true" /></Link>
      </div>
      <figure className="tl-about-photo" data-reveal style={reveal(1)}>
        <img src={editorialAssets.story.src} alt={editorialAssets.story.alt} width={editorialAssets.story.width} height={editorialAssets.story.height} loading="lazy" />
        <figcaption><strong>{facts.founded}</strong><span>Khởi đầu tại Phú Thọ</span></figcaption>
      </figure>
    </div>
  </section>;
}

const reasonIcons = [ShieldCheck, BadgeCheck, Layers, Wrench];

export function WhySection() {
  const [own, ...others] = comparison.columns;
  return <section className="tl-section tl-why">
    <div className="container">
      <Heading title="Vì sao chọn composite FRP và Thành Lợi" text="So sánh nhanh với bể xây và bồn kim loại." />
      <div className="tl-table-wrap" data-reveal>
        <table className="tl-compare">
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
      <ul className="tl-reasons">{reasons.map((reason, index) => { const Icon = reasonIcons[index]; return <li key={reason.title} className="tl-reason" data-reveal style={reveal(index)}>
        <span className="tl-reason-icon"><Icon size={26} aria-hidden="true" /></span>
        <h3>{reason.title}</h3><p>{reason.text}</p>
      </li>; })}</ul>
    </div>
  </section>;
}

type Card = { slug: string; name: string; text: string; lead?: boolean; Icon: typeof Droplets; photo?: { src: string; alt: string; width: number; height: number }; stat?: string };

const cards: Card[] = [
  { slug: 'be-biogas-composite', name: 'Bể biogas composite', lead: true, Icon: Flame, photo: productAssetBySlug['be-biogas-composite'], text: 'Dung tích từ 1,5 m³ đến trên 13 m³, từ hộ nuôi nhỏ đến trang trại lớn. Kín khí, sinh gas mạnh, tự đẩy bã.' },
  { slug: 'be-phot-va-xu-ly-nuoc-thai', name: 'Bể phốt, nước thải', lead: true, Icon: Droplets, stat: 'Từ 1 m³', text: 'Từ 1 m³ cho gia đình 3 đến 6 người đến trên 100 m³ cho nhà trọ, khách sạn, trường học, nhà máy. Chống thấm.' },
  { slug: 'be-nuoi-trong-thuy-san', name: 'Bể cá Koi và bể nuôi thủy sản', lead: true, Icon: Fish, photo: productAssetBySlug['be-nuoi-trong-thuy-san'], text: 'Hồ cá Koi có vách lọc sân vườn, bể trữ hải sản nhà hàng, bể tròn đáy phễu nuôi tôm cá công nghệ cao.' },
  { slug: 'bon-chua-hoa-chat', name: 'Bồn chứa hóa chất', Icon: FlaskConical, stat: 'Kháng ăn mòn', text: 'Kháng axit, kiềm, muối và dung dịch ăn mòn cho nhà máy sản xuất và xử lý nước.' },
  { slug: 'thung-cho-tom-ca', name: 'Thùng chở hải sản sống', Icon: Truck, photo: productAssetBySlug['thung-cho-tom-ca'], text: 'Ba lớp bảo ôn PU Foam, vách chắn sóng, vừa xe từ 500 kg đến 15 tấn.' },
  { slug: 'xe-gom-rac', name: 'Thùng rác, xe gom rác', Icon: Trash2, photo: productAssetBySlug['xe-gom-rac'], text: 'Thùng 60 L đến 240 L, xe gom 400 L đến 1000 L, không mục gỉ.' },
  { slug: 'composite-theo-yeu-cau', name: 'Sản phẩm theo yêu cầu', Icon: Shapes, photo: productAssetBySlug['composite-theo-yeu-cau'], text: 'Gia công theo bản vẽ hoặc ý tưởng: bọc phủ chống thấm, tháp xử lý khí, vỏ thiết bị, bể bơi.' },
];

export function ProductBento({ groups }: { groups: Group[] }) {
  const available = new Set(groups.map(group => group.slug));
  return <section className="tl-section tl-products" id="san-pham">
    <div className="container">
      <Heading title="Sản phẩm chủ lực" text="Bảy nhóm sản phẩm, ba nhóm mũi nhọn đứng đầu." action={{ href: '/san-pham', label: 'Tất cả sản phẩm' }} />
      <div className="tl-bento">
        {[cards.filter(card => card.lead), cards.filter(card => !card.lead)].map((group, groupIndex) => <Fragment key={groupIndex}><div id={groupIndex === 0 ? 'tl-bento-leads' : undefined} className={groupIndex === 0 ? 'tl-bento-leads' : 'tl-bento-rest'}>
          {group.map((card, index) => {
            const href = available.has(card.slug) ? `/san-pham/${card.slug}` : '/san-pham';
            const Icon = card.Icon;
            return <Link key={card.slug} href={href} className={`tl-bento-card pressable${card.lead ? ' is-lead' : ''}`} data-reveal style={reveal(index)}>
              <div className="tl-bento-photo">
                {card.photo ? <img src={card.photo.src} alt={card.photo.alt} width={card.photo.width} height={card.photo.height} loading="lazy" /> : <ProductTile slug={card.slug} stat={card.stat} />}
                {card.lead && <span className="tl-bento-badge">Mũi nhọn</span>}
              </div>
              <div className="tl-bento-body">
                <h3>{card.name}</h3>
                <p>{card.text}</p>
                <span className="tl-bento-more">Xem chi tiết<ArrowRight size={18} aria-hidden="true" /></span>
              </div>
            </Link>;
          })}
        </div>{groupIndex === 0 && <ScrollDots target="tl-bento-leads" label="Ba nhóm mũi nhọn" />}</Fragment>)}
      </div>
    </div>
  </section>;
}

export function RealPhotosSection({ children }: { children: ReactNode }) {
  return <section className="tl-section tl-photos">
    <div className="container">
      <Heading title="Hình ảnh thật" text="Sản phẩm chụp tại xưởng Phú Thọ và trên đường giao hàng." action={{ href: '/du-an', label: 'Xem dự án' }} />
      {children}
    </div>
  </section>;
}

// Tên bước rút gọn từ hồ sơ để vừa một dòng ở cột hẹp, nội dung mô tả giữ nguyên.
const stepTitles = ['Tiếp nhận nhu cầu', 'Tư vấn dung tích', 'Báo giá, ký hợp đồng', 'Sản xuất, kiểm định', 'Lắp đặt, bảo hành'];

export function ProcessSection() {
  return <section className="tl-section tl-process">
    <div className="container">
      <Heading title="Quy trình năm bước" text="Bạn chưa cần có bản vẽ, chỉ cần nói nhu cầu." />
      <ol className="tl-steps" id="tl-steps">{processSteps.map((step, index) => <li key={step.title} className="tl-step" data-reveal style={reveal(index)}>
        <span className="tl-step-number">{index + 1}</span>
        <h3>{stepTitles[index] ?? step.title}</h3><p>{step.text}</p>
      </li>)}</ol>
      <ScrollDots target="tl-steps" label="Năm bước" />
    </div>
  </section>;
}

export function FaqSection({ hotline = facts.hotlines[0] }: { hotline?: { display: string; tel: string } }) {
  return <section className="tl-section tl-faq">
    <div className="container tl-faq-grid">
      <div className="tl-faq-intro" data-reveal>
        <h2>Câu hỏi thường gặp</h2>
        <p>Chưa thấy câu bạn cần? Gọi hotline để kỹ sư trả lời trực tiếp.</p>
        <div className="tl-faq-actions">
          <a href={`tel:${hotline.tel}`} className="tl-button is-dark pressable"><Phone size={20} aria-hidden="true" />{hotline.display}</a>
          <Link href="/hoi-dap" className="tl-link pressable">Xem tất cả câu hỏi<ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="tl-faq-list">{faqs.map((item, index) => <details key={item.q} name="tl-faq" className="tl-faq-item" data-reveal style={reveal(index)}>
        <summary><span>{item.q}</span><span className="tl-faq-mark" aria-hidden="true"><i /><i /></span></summary>
        <div className="tl-faq-answer"><p>{item.a}</p></div>
      </details>)}</div>
    </div>
  </section>;
}

export function NewsSection({ posts }: { posts: CardPost[] }) {
  if (!posts.length) return null;
  return <section className="tl-section tl-news">
    <div className="container">
      <Heading title="Tin tức và chia sẻ" action={{ href: '/tin-tuc', label: 'Xem tất cả' }} />
      <div className="tl-news-grid">{posts.map((post, index) => <PostCard key={post.id} post={post} index={index} />)}</div>
    </div>
  </section>;
}

export function QuoteSection({ form }: { form: ReactNode }) {
  return <section className="tl-section tl-quote" id="tu-van">
    <div className="container tl-quote-grid">
      <div className="tl-quote-copy" data-reveal>
        <h2>Nhận báo giá nhanh</h2>
        <p>Bốn bước ngắn, khoảng 15 giây. Kỹ sư gọi lại để chốt dung tích tiết kiệm nhất.</p>
        <ul className="tl-quote-points">
          <li><Clock size={22} aria-hidden="true" />Báo giá trong 15 đến 60 phút khi đủ thông tin</li>
          <li><Truck size={22} aria-hidden="true" />Hỗ trợ vận chuyển và lắp đặt toàn quốc</li>
          <li><ShieldCheck size={22} aria-hidden="true" />Bảo hành đến 10 năm theo từng dòng sản phẩm</li>
        </ul>
        <figure className="tl-quote-photo"><img src={editorialAssets.contact.src} alt={editorialAssets.contact.alt} width={editorialAssets.contact.width} height={editorialAssets.contact.height} loading="lazy" /></figure>
      </div>
      <div className="tl-quote-form" data-reveal style={reveal(1)}>{form}</div>
    </div>
  </section>;
}
