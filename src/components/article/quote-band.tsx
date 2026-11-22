import { ArrowUpRight } from 'lucide-react';
import { FlowSection, Pattern } from '@/components/decor';
import { Anchor } from './anchor';
import './list.css';

/** Dải kêu gọi báo giá cuối trang tin, dự án và bài viết. Nền xanh đen nối với khối sáng phía trên bằng mép cung, hoa văn trống đồng ló sau. */
export default function QuoteBand({ preview, product, id = 'qb-title' }: { preview?: boolean; product?: { slug: string; name: string } | null; id?: string }) {
  const reveal = preview ? {} : { 'data-art-reveal': true };
  return <FlowSection tone="dark" top="arc" className="qb" aria-labelledby={id}
    decor={<>
      <Pattern kind="resin" opacity={0.4} fade="both" />
      <Pattern kind="drum" size="clamp(240px,34vw,460px)" top="-14%" right="-6%" opacity={0.26} />
    </>}>
    {/* art-cta-card: móc để chân trang ẩn lời kêu gọi riêng của nó, trang đã có dải báo giá này */}
    <div className="qb-inner art-cta-card" {...reveal}>
      <h2 id={id}>Dung tích bể được chọn từ nhu cầu sử dụng thực tế</h2>
      <p>Gửi mục đích và quy cách dự kiến để kỹ sư Thành Lợi tư vấn dung tích phù hợp.</p>
      <div className="qb-actions">
        <Anchor preview={preview} href="/lien-he#gui-yeu-cau" className="lh-btn-quote pressable">Nhận báo giá<ArrowUpRight size={18} aria-hidden="true" /></Anchor>
        <Anchor preview={preview} href={product ? `/san-pham/${product.slug}` : '/san-pham'} className="lh-btn-ghost pressable">{product ? product.name : 'Xem sản phẩm'}</Anchor>
      </div>
    </div>
  </FlowSection>;
}
