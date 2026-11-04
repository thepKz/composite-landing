import Link from 'next/link';
import DisclosureAnchor from '@/components/disclosure-anchor';
import '../secondary-pages.css';

export const metadata = { title: 'Đặt hàng, vận chuyển và bảo hành', description: 'Thông tin cần chuẩn bị khi đặt sản phẩm composite, trao đổi vận chuyển và điều kiện bảo hành.', alternates: { canonical: '/huong-dan-dat-hang' } };

export default function OrderingGuide() {
  return <main id="main" className="public-page secondary-page order-page">
    <DisclosureAnchor/>
    <section className="page-intro"><div className="container"><nav className="breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Hướng dẫn đặt hàng</span></nav><h1>Hướng dẫn đặt hàng</h1><p>Những thông tin cần biết từ lúc đặt bể đến khi nhận hàng.</p></div></section>
    <article className="reading support-reading">
      <h2>Thông tin cần có khi đặt hàng</h2>
      <ul className="order-preparation"><li>Mục đích sử dụng</li><li>Kích thước hoặc dung tích</li><li>Số lượng dự kiến</li><li>Địa điểm lắp đặt</li></ul>
      <p>Chưa có quy cách? Mô tả cách sử dụng; bản vẽ hoặc ảnh tham khảo có thể bổ sung khi tư vấn.</p>
      <Link className="button" href="/lien-he#gui-yeu-cau">Gửi nhu cầu của bạn</Link>
      <div className="order-details">
        <details className="secondary-disclosure"><summary>Quy trình đặt hàng</summary><ol><li><strong>Tiếp nhận:</strong> gửi yêu cầu qua biểu mẫu báo giá.</li><li><strong>Tư vấn:</strong> trao đổi vật liệu, kết cấu và điều kiện lắp đặt.</li><li><strong>Thống nhất:</strong> xác nhận quy cách, báo giá, tiến độ và phạm vi thực hiện.</li><li><strong>Sản xuất:</strong> thực hiện và kiểm tra theo nội dung đã thỏa thuận.</li><li><strong>Bàn giao:</strong> giao nhận, hướng dẫn sử dụng và hỗ trợ sau bán hàng.</li></ol></details>
        <details className="secondary-disclosure" id="van-chuyen"><summary>Vận chuyển & lắp đặt</summary><p>Cung cấp địa chỉ, đường tiếp cận và điều kiện nâng hạ. Phạm vi lắp đặt, chi phí và thời gian giao nhận được xác nhận trong báo giá hoặc hợp đồng.</p></details>
        <details className="secondary-disclosure" id="bao-hanh"><summary>Thông tin bảo hành</summary><p>Thời hạn, phạm vi và điều kiện bảo hành phụ thuộc sản phẩm và thỏa thuận đặt hàng. Kiểm tra các mục này trong báo giá hoặc hợp đồng trước khi xác nhận.</p><p>Khi cần hỗ trợ, chuẩn bị thông tin đơn hàng, ảnh tình trạng sản phẩm và mô tả điều kiện sử dụng.</p></details>
      </div>
    </article>
  </main>;
}
