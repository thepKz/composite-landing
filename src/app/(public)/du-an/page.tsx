import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Building2, Factory, Fish, Sprout, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { editorialAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import PostCard, { type CardPost } from '@/components/article/post-card';
import ListHero from '@/components/article/list-hero';
import QuoteBand from '@/components/article/quote-band';
import Reveal from '@/components/article/reveal';
import '@/components/article/list.css';
import './du-an.css';

export const metadata = { title: 'Dự án Thành Lợi Composite', description: 'Các lĩnh vực và dự án ứng dụng composite FRP do Thành Lợi thực hiện và công bố.', alternates: { canonical: '/du-an' } };

const fields = [
  { icon: Sprout, title: 'Chăn nuôi', text: 'Bể biogas composite đường kính 2,4 – 3,0 m cho trang trại lợn quy mô lớn.', href: '/san-pham/be-biogas-composite', link: 'Xem bể biogas' },
  { icon: Building2, title: 'Dân dụng và khu đô thị', text: 'Bể phốt tự hoại ba ngăn và module xử lý nước thải cho khu dân cư, nhà trọ, nhà máy.', href: '/san-pham/be-phot-va-xu-ly-nuoc-thai', link: 'Xem bể phốt' },
  { icon: Fish, title: 'Thủy sản và cảnh quan', text: 'Dàn bể tròn đáy phễu nuôi tôm cá công nghệ cao RAS và hồ cá Koi tích hợp lọc.', href: '/san-pham/be-nuoi-trong-thuy-san', link: 'Xem bể thủy sản' },
  { icon: Factory, title: 'Công nghiệp và vận tải', text: 'Bồn chứa hóa chất kháng axit và thùng chở thủy hải sản sống bảo ôn ba lớp.', href: '/san-pham/bon-chua-hoa-chat', link: 'Xem bồn hóa chất' },
  { icon: Trash2, title: 'Vệ sinh đô thị', text: 'Thùng rác công cộng và xe gom rác đẩy tay cho xã nông thôn mới, khu đô thị.', href: '/san-pham/xe-gom-rac', link: 'Xem thùng rác' },
];

// Khi chưa có dự án đăng riêng, trang dùng ảnh công trình và xưởng thật đã có, không chú thích, không gán cho nhóm chưa xác nhận.
const photo = (asset: { src: string; alt: string }, kind: 'r43' | 'r169' = 'r43') => { const v = variants(asset.src); return { src: kind === 'r169' ? v.r169 : v.r43, small: v.r43Small, alt: asset.alt }; };
const heroPhoto = photo(editorialAssets.hero, 'r169');
const archPhoto = photo(editorialAssets.hero);
const capsulePhoto = photo(editorialAssets.fit);

type Row = CardPost & { published_at: Date };

export default async function ProjectsPage() {
  const { rows } = isDemoMode() ? { rows: [] as Row[] } : await db.query<Row>("SELECT id,slug,title,excerpt,kind,cover_id,published_at FROM posts WHERE kind='project' AND status='published' AND published_at <= now() ORDER BY published_at DESC,id DESC");
  const [first, ...rest] = rows;
  return <main id="main" className="public-page da">
    <ListHero id="da-title" titleWidth="19ch" crumb="Dự án" title="Công trình đã bàn giao và vận hành ổn định"
      lead="Các dự án trải từ trang trại, khu dân cư đến cơ sở thủy sản và nhà máy."
      backdrop={{ src: heroPhoto.src, srcSet: `${heroPhoto.src} 1600w`, sizes: '100vw', position: '50% 60%', overlay: 0.82, fade: 'bottom', parallax: true }}
      aside={<StackStat value="100+" unit="dự án" tone="light" />} />

    <FlowSection tone="light" top="wave" className="da-body" decor={<Pattern kind="paper" opacity={0.9} fade="both" />}>
      {first ? <div className="da-posts">
        <h2 className="da-sr">Dự án đã đăng</h2>
        <PostCard post={first} featured titleTag="h3" />
        {rest.length > 0 && <div className="da-grid">{rest.map((post, index) => <PostCard key={post.id} post={post} index={index} titleTag="h3" />)}</div>}
      </div> : <div className="da-void">
        <Stack className="da-void-stack" pattern={{ kind: 'ripple', opacity: 0.7 }} floatAt="br"
          float={<ShapeFrame shape="capsule" ratio={1.8} outline="green" outlineOffset={8} focus="50% 50%"><img src={capsulePhoto.small} alt={capsulePhoto.alt} sizes="240px" loading="lazy" decoding="async" /></ShapeFrame>}>
          <ShapeFrame shape="arch" ratio={0.92} outline="bronze" focus="50% 55%" parallax>
            <img src={archPhoto.src} srcSet={`${archPhoto.small} 520w, ${archPhoto.src} 960w`} sizes="(max-width:900px) 80vw, 460px" alt={archPhoto.alt} loading="lazy" decoding="async" />
          </ShapeFrame>
        </Stack>
        <div className="da-void-text" data-art-reveal>
          <h2>Hồ sơ từng công trình sẽ được đăng tại đây</h2>
          <p>Trong lúc chờ, năm lĩnh vực dưới đây cho thấy nơi các sản phẩm composite của Thành Lợi đã được lắp đặt.</p>
        </div>
      </div>}

      <div className="da-fields">
        <h2 data-art-reveal>Năm lĩnh vực công trình</h2>
        <ul className="da-field-list">
          {fields.map((field, i) => <li key={field.title} data-art-reveal style={{ ['--i' as string]: i }}>
            <Link className="da-field" href={field.href} aria-label={`${field.title}: ${field.link}`}>
              <span className="da-field-badge" aria-hidden="true"><field.icon size={26} strokeWidth={1.6} /></span>
              <span className="da-field-title">{field.title}</span>
              <span className="da-field-text">{field.text}</span>
              <span className="da-field-go">{field.link}<ArrowUpRight size={18} aria-hidden="true" /></span>
            </Link>
          </li>)}
        </ul>
        <p className="da-more"><Link href="/san-pham" className="lh-link pressable">Tất cả sản phẩm<ArrowRight size={18} aria-hidden="true" /></Link></p>
      </div>
    </FlowSection>

    <QuoteBand id="da-cta-title" />
    <Reveal />
  </main>;
}
