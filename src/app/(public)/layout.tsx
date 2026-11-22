import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PublicMotion from '@/components/public-motion';
import RouteFeedback from '@/components/route-feedback';
import ContactShortcuts from '@/components/contact-shortcuts';
import { FlowBackdrop, ScrollFx } from '@/components/decor';
import { company, products } from '@/lib/content';
import { resolveContact } from '@/lib/contact-info';
import './public.css';
import './public-navigation.css';
import './surface-refinement.css';
import './chrome.css';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [info, items] = await Promise.all([company(), products()]);
  const contactInfo = resolveContact(info);
  return <div className="public-site">
    <a href="#main" className="skip-link">Đến nội dung chính</a>
    <FlowBackdrop initial="light" />
    <ScrollFx />
    <RouteFeedback />
    <SiteHeader contact={contactInfo} products={items.map(({ slug, name }) => ({ slug, name }))} />
    <PublicMotion />
    {children}
    <SiteFooter />
    <ContactShortcuts contact={contactInfo} />
  </div>;
}
