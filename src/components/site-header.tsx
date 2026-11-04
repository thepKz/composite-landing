'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight, ChevronDown, Phone } from 'lucide-react';
import { catalogue } from '@/lib/catalogue';
import { productGroups } from '@/lib/product-groups';
import './site-header.css';

type HeaderCompany = { name?: string; phone?: string; email?: string };
type NavigationProduct = { slug: string; name: string };

export default function SiteHeader({ company, products = catalogue }: { company?: HeaderCompany; products?: readonly NavigationProduct[] }) {
  const pathname = usePathname();
  const phone = company?.phone?.replace(/[\s.()-]/g, '');
  const validPhone = phone && /^(?:0\d{9}|\+84\d{9})$/.test(phone);
  const email = company?.email?.trim();
  const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const productsButton = useRef<HTMLButtonElement>(null);
  function close() { setOpen(false); setProductsOpen(false); }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) { setOpen(false); setProductsOpen(false); }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  function active(href: string) { return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)); }
  return <header ref={header} className="site-header public-header" onKeyDown={event => {
    if (event.key !== 'Escape') return;
    if (productsOpen) { setProductsOpen(false); productsButton.current?.focus(); }
    else if (open) { setOpen(false); menuButton.current?.focus(); }
  }}>
    <div className="header-topbar"><div className="container"><span>Sản xuất composite FRP tại Phú Thọ</span><div>{validEmail && <a href={`mailto:${email}`}>{email}</a>}<Link href="/huong-dan-dat-hang" onClick={close}>Hướng dẫn đặt hàng</Link></div></div></div>
    <div className="container header-inner">
      <Link href="/" className="brand" aria-label={`${company?.name || 'Thành Lợi Composite'} - Trang chủ`} onClick={close}>
        <img src="/images/thanh-loi-logo.png" alt="" width="56" height="56"/><span>THÀNH LỢI<small>COMPOSITE</small></span>
      </Link>
      <button ref={menuButton} type="button" className="menu-toggle" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => { setOpen(!open); setProductsOpen(false); }}>{open ? <X/> : <Menu/>}</button>
      <nav id="main-navigation" className={open ? 'main-nav open' : 'main-nav'} aria-label="Điều hướng chính">
        <Link href="/" aria-current={active('/') ? 'page' : undefined} onClick={close}>Trang chủ</Link>
        <Link href="/gioi-thieu" aria-current={active('/gioi-thieu') ? 'page' : undefined} onClick={close}>Về chúng tôi</Link>
        <div className="product-navigation" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setProductsOpen(false); }}>
          <button ref={productsButton} className="product-navigation-trigger" type="button" data-active={active('/san-pham')} aria-expanded={productsOpen} aria-controls="product-navigation-list" onClick={() => setProductsOpen(!productsOpen)} onKeyDown={event => {
            if(event.key==='ArrowDown'){event.preventDefault();setProductsOpen(true);requestAnimationFrame(()=>header.current?.querySelector<HTMLAnchorElement>('#product-navigation-list a')?.focus());}
          }}>Sản phẩm <ChevronDown size={16}/></button>
          <div id="product-navigation-list" className="product-navigation-list" hidden={!productsOpen}>
            {productGroups(products).map(product => <Link key={product.slug} href={`/san-pham/${product.slug}`} aria-current={pathname === `/san-pham/${product.slug}` || product.members.some(slug => pathname === `/san-pham/${slug}`) ? 'page' : undefined} onClick={close}>{product.name}<ArrowUpRight size={16}/></Link>)}
            <Link href="/san-pham" className="all-products-link" onClick={close}>Xem tất cả sản phẩm <ArrowUpRight size={16}/></Link>
          </div>
        </div>
        <Link href="/du-an" aria-current={active('/du-an') ? 'page' : undefined} onClick={close}>Dự án</Link>
        <Link href="/tin-tuc" aria-current={active('/tin-tuc') || active('/kien-thuc') ? 'page' : undefined} onClick={close}>Tin tức</Link>
        <Link href="/lien-he#gui-yeu-cau" className="button button-small quote-button" onClick={close}>Nhận báo giá <ArrowUpRight size={17}/></Link>
        {validPhone && <a className="header-phone" href={`tel:${phone}`}><Phone size={16}/>{company?.phone}</a>}
      </nav>
    </div>
  </header>;
}
