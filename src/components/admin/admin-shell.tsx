'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, FileText, Images, Package, MessageSquare, Settings, ExternalLink, LogOut, Menu, PanelLeftClose, PanelLeftOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { AdminProviders, Dialog, useConfirm, useToast } from './ui';

type NavItem = { href: string; label: string; icon: typeof FileText; count?: boolean };
const groups: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: '/admin', label: 'Tổng quan', icon: LayoutDashboard }] },
  { title: 'Nội dung', items: [
    { href: '/admin/bai-viet', label: 'Bài viết', icon: FileText },
    { href: '/admin/thu-vien', label: 'Ảnh và video', icon: Images },
    { href: '/admin/san-pham', label: 'Sản phẩm', icon: Package },
  ] },
  { title: 'Khách hàng', items: [{ href: '/admin/yeu-cau', label: 'Yêu cầu tư vấn', icon: MessageSquare, count: true }] },
  { title: 'Website', items: [{ href: '/admin/cai-dat', label: 'Thông tin website', icon: Settings }] },
];

const names: Record<string, string> = {
  bai_viet: 'Bài viết', thu_vien: 'Ảnh và video', san_pham: 'Sản phẩm', yeu_cau: 'Yêu cầu tư vấn', cai_dat: 'Thông tin website',
};
const sections: Record<string, string> = { 'bai-viet': 'bai_viet', 'thu-vien': 'thu_vien', 'san-pham': 'san_pham', 'yeu-cau': 'yeu_cau', 'cai-dat': 'cai_dat' };

function breadcrumbs(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (!parts.length) return [{ label: 'Tổng quan' }];
  const key = sections[parts[0]];
  const root = { label: names[key] ?? 'Quản trị', href: `/admin/${parts[0]}` };
  if (parts.length === 1) return [{ label: 'Tổng quan', href: '/admin' }, { label: root.label }];
  return [{ label: 'Tổng quan', href: '/admin' }, root, { label: parts[1] === 'moi' ? 'Viết bài mới' : 'Sửa bài viết' }];
}

function isCurrent(pathname: string, href: string) { return href === '/admin' ? pathname === href : pathname.startsWith(href); }

function Navigation({ pathname, newInquiries, onNavigate }: { pathname: string; newInquiries: number; onNavigate?: () => void }) {
  return <nav className="adm-nav" aria-label="Quản trị">
    {groups.map((group, index) => <div key={index} style={{ display: 'contents' }}>
      {group.title && <div className="adm-nav-group">{group.title}</div>}
      {group.items.map(({ href, label, icon: Icon, count }) => <Link key={href} href={href} onClick={onNavigate} aria-current={isCurrent(pathname, href) ? 'page' : undefined} title={label}>
        <Icon size={19} /><span className="adm-label">{label}</span>
        {count && newInquiries > 0 && <span className="count" aria-label={`${newInquiries} yêu cầu mới`}>{newInquiries}</span>}
      </Link>)}
    </div>)}
  </nav>;
}

function ShellInner({ children, name, newInquiries }: { children: React.ReactNode; name: string; newInquiries: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const wide = /^\/admin\/bai-viet\/[^/]+$/.test(pathname);

  useEffect(() => { try { setCollapsed(localStorage.getItem('thanhloi-sidebar') === '1'); } catch { /* không có bộ nhớ trình duyệt */ } }, []);
  useEffect(() => { setDrawer(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const onDown = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setMenu(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false); };
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menu]);

  function toggle() { setCollapsed(value => { try { localStorage.setItem('thanhloi-sidebar', value ? '0' : '1'); } catch { /* bỏ qua */ } return !value; }); }

  async function logout() {
    setMenu(false);
    if (document.documentElement.dataset.unsavedPost === 'true' && !await confirm({ title: 'Đăng xuất khi chưa lưu?', body: 'Bài viết còn thay đổi chưa lưu. Đăng xuất bây giờ sẽ không giữ lại phần đó.', confirmLabel: 'Đăng xuất', cancelLabel: 'Ở lại', danger: true })) return;
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      router.replace('/admin/login');
      router.refresh();
    } catch { toast('Chưa đăng xuất được. Vui lòng thử lại.', 'error'); }
  }

  const crumbs = breadcrumbs(pathname);
  const brand = <Link href="/admin" className="adm-brand" onClick={() => setDrawer(false)}><img src="/images/thanh-loi-logo.png" alt="" /><span className="adm-brand-text"><strong>Thành Lợi</strong><small>Quản trị website</small></span></Link>;

  return <div className="adm-shell" data-collapsed={collapsed || wide}>
    <aside className="adm-sidebar">
      {brand}
      <Navigation pathname={pathname} newInquiries={newInquiries} />
      <div className="adm-sidebar-foot">
        <button type="button" onClick={toggle} aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'} title={collapsed ? 'Mở rộng' : 'Thu gọn'}>{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}<span className="adm-label">Thu gọn</span></button>
      </div>
    </aside>
    <Dialog open={drawer} onClose={() => setDrawer(false)} drawer hideHead label="Danh mục quản trị">
      <div className="adm-sidebar" style={{ position: 'static', height: '100%', width: '100%' }}>
        {brand}
        <Navigation pathname={pathname} newInquiries={newInquiries} onNavigate={() => setDrawer(false)} />
        <div className="adm-sidebar-foot"><button type="button" onClick={() => void logout()}><LogOut size={19} />Đăng xuất</button></div>
      </div>
    </Dialog>
    <div className="adm-workspace">
      <header className="adm-topbar">
        <button type="button" className="icon-button adm-menu-button" onClick={() => setDrawer(true)} aria-label="Mở danh mục"><Menu size={20} /></button>
        <nav className="adm-crumbs" aria-label="Đường dẫn">
          {crumbs.map((crumb, index) => <span key={index} style={{ display: 'contents' }}>
            {index > 0 && <ChevronRight size={16} aria-hidden="true" className={index === 1 ? 'adm-crumb-first-sep' : undefined} />}
            {crumb.href ? <Link href={crumb.href} className={index === 0 ? 'adm-crumb-first' : undefined}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
          </span>)}
        </nav>
        <Link href="/" target="_blank" className="button button-outline button-small"><ExternalLink size={16} /><span className="adm-site-label">Xem website</span></Link>
        <div className="adm-user-menu" ref={menuRef}>
          <button type="button" className="adm-user-button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(value => !value)}>
            <span className="adm-avatar" aria-hidden="true">{name.trim().charAt(0).toUpperCase() || 'A'}</span><span className="adm-user-name">{name}</span><ChevronDown size={16} aria-hidden="true" />
          </button>
          {menu && <div className="adm-popover" role="menu"><button type="button" role="menuitem" onClick={() => void logout()}><LogOut size={17} />Đăng xuất</button></div>}
        </div>
      </header>
      <main className="adm-content" data-wide={wide} key={wide || pathname === '/admin/bai-viet/moi' ? 'editor' : pathname}>{children}</main>
    </div>
  </div>;
}

export default function AdminShell({ children, name, newInquiries = 0 }: { children: React.ReactNode; name: string; newInquiries?: number }) {
  return <AdminProviders><ShellInner name={name} newInquiries={newInquiries}>{children}</ShellInner></AdminProviders>;
}
