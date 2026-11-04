import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PublicMotion from '@/components/public-motion';
import ContactShortcuts from '@/components/contact-shortcuts';
import { company, products } from '@/lib/content';
import './public.css';
import './public-navigation.css';
import './surface-refinement.css';
export const dynamic='force-dynamic';
export default async function PublicLayout({children}:{children:React.ReactNode}){const [info,items]=await Promise.all([company(),products()]);return <div className="public-site"><a href="#main" className="skip-link">Đến nội dung chính</a><SiteHeader company={info} products={items.map(({slug,name})=>({slug,name}))}/><PublicMotion/>{children}<SiteFooter/><ContactShortcuts company={info}/></div>;}
