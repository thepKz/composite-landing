import { isDemoMode } from '@/lib/demo-mode';
import InquiryForm from '@/components/inquiry-form';
import ArticleReveal from '@/components/article/reveal';
import HeroSlider from '@/components/home/hero-slider';
import MetricsStrip from '@/components/home/metrics-strip';
import { AboutSection, FaqSection, NewsSection, PhotoBand, ProcessSection, ProductsSection, QuoteSection, WhySection } from '@/components/home/sections';
import { metrics } from '@/lib/site-facts';
import { productGroups } from '@/lib/product-groups';
import { contact, products, publishedPosts } from '@/lib/content';
import './home.css';

export const metadata = { alternates: { canonical: '/' } };

// Nhịp nền: tối (banner) rồi sáng (giới thiệu, sản phẩm, dải ảnh) rồi tối (lý do, quy trình) rồi sáng (hỏi đáp, tin, báo giá) rồi tối (chân trang).
// Mối nối: cung, vòm, sóng, mờ dần. Không khối nào có mép ngang thẳng giữa hai màu.
export default async function Home() {
  const [items, posts, info] = await Promise.all([products(), publishedPosts(3), contact()]);
  return <main id="main" className="public-page home-page">
    <ArticleReveal />
    <HeroSlider hotline={info.hotlines[0]} />
    <AboutSection address={info.address} metricsSlot={<MetricsStrip items={metrics} />} />
    <ProductsSection groups={productGroups(items)}><PhotoBand /></ProductsSection>
    <WhySection />
    <ProcessSection />
    <FaqSection hotline={info.hotlines[0]} />
    <NewsSection posts={posts} />
    <QuoteSection form={<InquiryForm demo={isDemoMode()} hours={info.hours} hotlineTel={info.hotlines[0].tel} />} />
  </main>;
}
