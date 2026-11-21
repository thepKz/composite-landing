'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, ChevronDown, Droplets, Fish, Flame, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { catalogue } from '@/lib/catalogue';
import { productGroups } from '@/lib/product-groups';
import { resolveContact, type ContactInfo } from '@/lib/contact-info';
import { cleanLabel } from '@/lib/nav-labels';
import './site-header.css';

type NavigationProduct = { slug: string; name: string };

// Ba dòng mũi nhọn đứng đầu menu, kèm một dòng mô tả. Chữ lấy từ hồ sơ nội dung.
const spearheads = [
  { slug: 'be-biogas-composite', name: 'Bể biogas composite', line: 'Từ 1,5 m³ đến 13 m³ cho hộ nuôi và trang trại', Icon: Flame },
  { slug: 'be-phot-va-xu-ly-nuoc-thai', name: 'Bể phốt và xử lý nước thải', line: 'Từ 1 m³ cho gia đình đến nhà máy', Icon: Droplets },
  { slug: 'be-nuoi-trong-thuy-san', name: 'Bể cá và thủy sản', line: 'Hồ cá Koi, bể trữ hải sản, bể nuôi tôm cá', Icon: Fish },
] as const;

const links = [
  { href: '/', label: 'Trang chủ' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/du-an', label: 'Dự án' },
  { href: '/tin-tuc', label: 'Tin tức', also: '/kien-thuc' },
  { href: '/lien-he', label: 'Liên hệ' },
];

const focusable = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function SiteHeader({ products = catalogue, contact = resolveContact() }: { contact?: ContactInfo; products?: readonly NavigationProduct[] }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobileProducts, setMobileProducts] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const productsButton = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number>(0);
  const hoverOpenedAt = useRef(0);
  const groups = productGroups(products);
  const featured = spearheads.filter(item => groups.some(group => group.slug === item.slug));
  const others = groups.filter(group => !spearheads.some(item => item.slug === group.slug));
  const quoteHref = pathname === '/' ? '/#tu-van' : '/lien-he#gui-yeu-cau';

  const active = useCallback((href: string, also?: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`) || (!!also && (pathname === also || pathname.startsWith(`${also}/`)));
  }, [pathname]);

  const closeAll = useCallback(() => { setDrawer(false); setMenu(false); setMobileProducts(false); }, []);

  // Đổi trang thì đóng mọi thứ.
  useEffect(() => { closeAll(); }, [pathname, closeAll]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bấm ra ngoài thì đóng menu xổ xuống.
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setMenu(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  // Ngăn kéo: khoá cuộn nền, đưa tiêu điểm vào trong, trả về nút mở khi đóng.
  useEffect(() => {
    if (!drawer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => closeButton.current?.focus());
    const wide = matchMedia('(min-width: 961px)');
    const onWide = () => { if (wide.matches) setDrawer(false); };
    wide.addEventListener('change', onWide);
    const opener = menuButton.current;
    return () => { document.body.style.overflow = previous; cancelAnimationFrame(frame); wide.removeEventListener('change', onWide); opener?.focus({ preventScroll: true }); };
  }, [drawer]);

  function trapKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') { event.stopPropagation(); setDrawer(false); return; }
    if (event.key !== 'Tab') return;
    const items = [...(drawerRef.current?.querySelectorAll<HTMLElement>(focusable) ?? [])].filter(item => item.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function openMenu() { window.clearTimeout(hoverTimer.current); hoverOpenedAt.current = Date.now(); setMenu(true); }
  function scheduleClose() { window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => setMenu(false), 160); }

  const productActive = active('/san-pham');

  return <>
    <div className="tl-topbar">
      <div className="container tl-topbar-inner">
        <div className="tl-topbar-phones">
          <Phone size={16} aria-hidden="true" />
          {contact.hotlines.map(line => <a key={line.tel} href={`tel:${line.tel}`}>{line.display}</a>)}
        </div>
        <a className="tl-topbar-extra" href={`mailto:${contact.email}`}><Mail size={16} aria-hidden="true" />{contact.email}</a>
        <span className="tl-topbar-extra"><MapPin size={16} aria-hidden="true" />{contact.address}</span>
      </div>
    </div>
    <header ref={header} className="tl-header public-header" data-scrolled={scrolled} onKeyDown={event => {
      if (event.key === 'Escape' && menu) { setMenu(false); productsButton.current?.focus(); }
    }}>
      <div className="container tl-header-inner">
        <Link href="/" className="tl-brand" aria-label="Thành Lợi Composite, về trang chủ">
          <img src="/images/thanh-loi-logo.png" alt="" width="48" height="48" />
          <span>THÀNH LỢI<small>COMPOSITE</small></span>
        </Link>
        <nav className="tl-nav" aria-label="Điều hướng chính">
          {links.slice(0, 2).map(item => <Link key={item.href} href={item.href} className="pressable" aria-current={active(item.href) ? 'page' : undefined}>{item.label}</Link>)}
          <div className="tl-menu" onPointerEnter={event => { if (event.pointerType === 'mouse') openMenu(); }} onPointerLeave={event => { if (event.pointerType === 'mouse') scheduleClose(); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false); }}>
            <button ref={productsButton} type="button" className="tl-menu-trigger pressable" data-active={productActive} aria-expanded={menu} aria-controls="tl-products-panel" onClick={() => { if (Date.now() - hoverOpenedAt.current < 700) return; setMenu(value => !value); }} onKeyDown={event => {
              if (event.key === 'ArrowDown') { event.preventDefault(); setMenu(true); requestAnimationFrame(() => header.current?.querySelector<HTMLAnchorElement>('#tl-products-panel a')?.focus()); }
            }}>Sản phẩm<ChevronDown size={16} aria-hidden="true" /></button>
            <div id="tl-products-panel" className="tl-panel" data-open={menu} inert={!menu}>
              <div className="tl-panel-featured">
                {featured.map(({ slug, name, line, Icon }) => <Link key={slug} href={`/san-pham/${slug}`} className="tl-feature" aria-current={pathname === `/san-pham/${slug}` ? 'page' : undefined}>
                  <span className="tl-feature-icon"><Icon size={22} aria-hidden="true" /></span>
                  <span className="tl-feature-text"><strong>{name}</strong><span>{line}</span></span>
                </Link>)}
              </div>
              <div className="tl-panel-more">
                {others.map(group => <Link key={group.slug} href={`/san-pham/${group.slug}`} aria-current={pathname === `/san-pham/${group.slug}` ? 'page' : undefined}>{cleanLabel(group.name)}</Link>)}
                <Link href="/san-pham" className="tl-panel-all">Xem tất cả sản phẩm<ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
          {links.slice(2).map(item => <Link key={item.href} href={item.href} className="pressable" aria-current={active(item.href, item.also) ? 'page' : undefined}>{item.label}</Link>)}
        </nav>
        <div className="tl-header-actions">
          <Link href={quoteHref} className="tl-cta pressable">Nhận báo giá</Link>
          <button ref={menuButton} type="button" className="tl-burger pressable" aria-label="Mở menu" aria-haspopup="dialog" aria-expanded={drawer} aria-controls="tl-drawer" onClick={() => setDrawer(true)}><Menu size={24} aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    <div ref={drawerRef} id="tl-drawer" className="tl-drawer" data-open={drawer} role="dialog" aria-modal="true" aria-label="Menu" inert={!drawer} onKeyDown={trapKeys}>
      <div className="tl-drawer-head">
        <span className="tl-drawer-title">Menu</span>
        <button ref={closeButton} type="button" className="tl-burger pressable" aria-label="Đóng menu" onClick={() => setDrawer(false)}><X size={24} aria-hidden="true" /></button>
      </div>
      <nav className="tl-drawer-nav" aria-label="Điều hướng trên điện thoại">
        {links.slice(0, 2).map(item => <Link key={item.href} href={item.href} aria-current={active(item.href) ? 'page' : undefined} onClick={closeAll}>{item.label}</Link>)}
        <button type="button" className="tl-drawer-toggle" aria-expanded={mobileProducts} aria-controls="tl-drawer-products" data-active={productActive} onClick={() => setMobileProducts(value => !value)}>Sản phẩm<ChevronDown size={20} aria-hidden="true" /></button>
        <div id="tl-drawer-products" className="tl-drawer-sub" data-open={mobileProducts} inert={!mobileProducts}>
          <div>
            {featured.map(({ slug, name }) => <Link key={slug} href={`/san-pham/${slug}`} onClick={closeAll}>{name}</Link>)}
            {others.map(group => <Link key={group.slug} href={`/san-pham/${group.slug}`} onClick={closeAll}>{cleanLabel(group.name)}</Link>)}
            <Link href="/san-pham" onClick={closeAll}>Xem tất cả sản phẩm</Link>
          </div>
        </div>
        {links.slice(2).map(item => <Link key={item.href} href={item.href} aria-current={active(item.href, item.also) ? 'page' : undefined} onClick={closeAll}>{item.label}</Link>)}
      </nav>
      <div className="tl-drawer-foot">
        <Link href={quoteHref} className="tl-cta tl-cta-wide pressable" onClick={closeAll}>Nhận báo giá</Link>
        <div className="tl-drawer-phones">{contact.hotlines.map(line => <a key={line.tel} href={`tel:${line.tel}`} className="pressable"><Phone size={18} aria-hidden="true" />{line.display}</a>)}</div>
      </div>
    </div>
  </>;
}
