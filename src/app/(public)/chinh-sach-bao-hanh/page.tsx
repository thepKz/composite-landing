import { FileText, Ruler, Wrench, ScrollText } from 'lucide-react';
import { FlowSection, Pattern, ShapeFrame, Stack, StackStat } from '@/components/decor';
import FlowHero from '@/components/pages/flow-hero';
import FlowCta from '@/components/pages/flow-cta';
import Reveal from '@/components/pages/reveal';
import { editorialAssets } from '@/lib/customer-product-assets';
import { variants } from '@/lib/trang-phu-media';
import '@/components/pages/pages.css';
import '@/components/pages/pages-v4.css';
import '../secondary-pages.css';

export const metadata = { title: 'Chính sách bảo hành', description: 'Bảo hành đến 10 năm tùy dòng sản phẩm composite Thành Lợi. Độ dày, loại nhựa, trọng lượng ghi trong hợp đồng, bể va đập có thể sửa chữa tại chỗ.', alternates: { canonical: '/chinh-sach-bao-hanh' } };

const points = [
  { icon: FileText, title: 'Thông số ghi trong hợp đồng', text: 'Độ dày thành bồn, chủng loại nhựa và trọng lượng tiêu chuẩn đều ghi rõ trong hợp đồng.' },
  { icon: Ruler, title: 'Kiểm tra được khi nhận hàng', text: 'Quý khách có thể kiểm tra tại xưởng hoặc đo độ dày thực tế khi nghiệm thu.' },
  { icon: Wrench, title: 'Sửa chữa được khi va đập', text: 'Kỹ thuật viên mài nhám và đắp vá bằng sợi thủy tinh và nhựa nền tại chỗ. Vị trí gia cố sau khi đóng rắn liền khối, đạt độ bền và độ kín tương đương ban đầu.' },
  { icon: ScrollText, title: 'Tuổi thọ thiết kế trên 30 năm', text: 'Bảo hành chính hãng đến 10 năm theo từng dòng sản phẩm, tuổi thọ thiết kế trên 30 năm trong điều kiện tiêu chuẩn.' },
];

export default function WarrantyPage() {
  const photo = editorialAssets.fit;
  return <main id="main" className="public-page tp tp-warranty tp4">
    <Reveal/>
    <FlowHero tone="teal" crumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Chính sách bảo hành' }]}
      title="Bảo hành đến 10 năm tùy dòng sản phẩm"
      lead="Độ dày thành bồn, chủng loại nhựa và trọng lượng tiêu chuẩn đều ghi trong hợp đồng và kiểm tra được khi nghiệm thu."
      visual={<Stack pattern={{ kind: 'ripple', blend: 'screen', opacity: 0.55 }} floatAt="bl" float={<StackStat value={10} unit="năm" label="Bảo hành tối đa" tone="light"/>}>
        <ShapeFrame shape="circle" ratio={1.2} outline="bronze" outlineOffset={12} focus="50% 50%">
          <img src={variants(photo.src).r43} alt={photo.alt} width={960} height={720} fetchPriority="high"/>
        </ShapeFrame>
      </Stack>}/>
    <FlowSection tone="light" top="dome" className="tp4-warranty-body" decor={<Pattern kind="paper" fade="both" opacity={0.85}/>}>
      <h2 className="tp-sr">Điều cần biết về bảo hành</h2>
      <ul className="tp4-points">
        {points.map((point, i) => <li className="tp-rv" style={{ ['--i' as string]: i }} key={point.title}><span className="tp4-badge-ico"><point.icon size={28} aria-hidden="true"/></span><h3>{point.title}</h3><p>{point.text}</p></li>)}
      </ul>
    </FlowSection>
    <FlowCta title="Cần biết thời hạn bảo hành từng dòng sản phẩm" text="Liên hệ hotline hoặc gửi nhu cầu, kỹ sư Thành Lợi tư vấn theo sản phẩm quý khách chọn." label="Liên hệ"/>
  </main>;
}
