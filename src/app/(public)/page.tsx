import { isDemoMode } from '@/lib/demo-mode';
import InquiryForm from '@/components/inquiry-form';
import ArticleReveal from '@/components/article/reveal';
import HeroSlider from '@/components/home/hero-slider';
import MetricsStrip from '@/components/home/metrics-strip';
import { AboutSection, FaqSection, NewsSection, ProcessSection, ProductBento, QuoteSection, RealPhotosSection, WhySection } from '@/components/home/sections';
import { metrics } from '@/lib/site-facts';
import { productGroups } from '@/lib/product-groups';
import { contact, products, publishedPosts } from '@/lib/content';
import './home.css';

export const metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const [items, posts, info] = await Promise.all([products(), publishedPosts(3), contact()]);
  return <main id="main" className="public-page home-page">
    <ArticleReveal />
    <HeroSlider hotline={info.hotlines[0]} />
    <MetricsStrip items={metrics} />
    <AboutSection address={info.address} />
    <WhySection />
    <ProductBento groups={productGroups(items)} />
    <RealPhotosSection />
    <ProcessSection />
    <FaqSection hotline={info.hotlines[0]} />
    <NewsSection posts={posts} />
    <QuoteSection form={<InquiryForm demo={isDemoMode()} hours={info.hours} hotlineTel={info.hotlines[0].tel} />} />
  </main>;
}
