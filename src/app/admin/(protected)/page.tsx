import Link from 'next/link';
import { ArrowRight, Plus, FileText, Images, Package, MessageSquare, Settings, CheckCircle2, Circle, PenLine, CalendarClock, Phone } from 'lucide-react';
import { db } from '@/lib/db';
import { formatVietnamDateTime } from '@/lib/post-time';

type Row = Record<string, string | number | null>;

export default async function Dashboard() {
  const [counts, scheduled, recentPosts, inquiries, media, products, siteRow, nextCall, lastDraft] = await Promise.all([
    db.query(`SELECT count(*) FILTER (WHERE status='draft')::int AS drafts,
      count(*) FILTER (WHERE status='published' AND published_at>now())::int AS scheduled,
      count(*) FILTER (WHERE status='published' AND published_at<=now())::int AS published FROM posts`),
    db.query("SELECT id,title,published_at FROM posts WHERE status='published' AND published_at>now() ORDER BY published_at LIMIT 3"),
    db.query("SELECT id,title,status,updated_at,published_at FROM posts ORDER BY updated_at DESC LIMIT 5"),
    db.query("SELECT id,name,phone,product,status,created_at FROM inquiries ORDER BY created_at DESC LIMIT 5"),
    db.query("SELECT count(*)::int AS total, count(*) FILTER (WHERE mime_type LIKE 'image/%' AND btrim(alt)='')::int AS missing FROM media_assets"),
    db.query("SELECT count(*) FILTER (WHERE is_published)::int AS shown, count(*)::int AS total FROM products"),
    db.query("SELECT value FROM site_settings WHERE key='company'"),
    db.query("SELECT name,phone FROM inquiries WHERE status='new' ORDER BY created_at DESC LIMIT 1"),
    db.query("SELECT id,title FROM posts WHERE status='draft' ORDER BY updated_at DESC LIMIT 1"),
  ]);
  const site = (siteRow.rows[0]?.value ?? {}) as Record<string, string>;
  const missingContact = [['phone', 'số điện thoại'], ['email', 'email'], ['zalo', 'Zalo'], ['address', 'địa chỉ']].filter(([key]) => { const value = String(site[key] ?? '').trim(); return !value || (key === 'address' && value === 'Phú Thọ'); }).map(([, label]) => label);
  const stat = counts.rows[0];
  const fresh = (await db.query("SELECT count(*)::int AS total FROM inquiries WHERE status='new'")).rows[0].total as number;
  const missingAlt = media.rows[0].missing as number;
  const checks = [
    { ok: missingContact.length === 0, text: missingContact.length === 0 ? 'Thông tin liên hệ đã điền đủ trong Thông tin website' : `Chưa điền trong Thông tin website: ${missingContact.join(', ')}`, href: '/admin/cai-dat', link: 'Điền ngay' },
    { ok: (stat.published as number) > 0, text: (stat.published as number) > 0 ? `Đã có ${stat.published} bài đang đăng` : 'Chưa có bài nào được đăng', href: '/admin/bai-viet/moi', link: 'Viết bài' },
    { ok: (products.rows[0].shown as number) > 0, text: `${products.rows[0].shown} trên ${products.rows[0].total} sản phẩm đang hiển thị`, href: '/admin/san-pham', link: 'Xem sản phẩm' },
    { ok: missingAlt === 0, text: missingAlt === 0 ? 'Ảnh trong thư viện đều có mô tả' : `${missingAlt} ảnh chưa có mô tả`, href: '/admin/thu-vien', link: 'Thêm mô tả' },
    { ok: fresh === 0, text: fresh === 0 ? 'Không còn yêu cầu tư vấn chờ xử lý' : `${fresh} yêu cầu tư vấn chưa liên hệ`, href: '/admin/yeu-cau', link: 'Xử lý ngay' },
  ];
  // Việc nên làm tiếp: chỉ một việc, theo thứ tự ưu tiên khách hàng, bài đang viết dở, rồi mới tới việc dọn dẹp.
  const call = nextCall.rows[0] as Row | undefined;
  const draft = lastDraft.rows[0] as Row | undefined;
  const next = call ? { tone: 'urgent', title: fresh > 1 ? `${fresh} khách đang chờ gọi lại` : `${call.name} đang chờ gọi lại`, body: '', primary: { href: `tel:${call.phone}`, label: `Gọi ${call.phone}` }, secondary: { href: '/admin/yeu-cau', label: 'Xem yêu cầu' } }
    : draft ? { tone: 'todo', title: 'Còn một bản nháp chưa đăng', body: String(draft.title), primary: { href: `/admin/bai-viet/${draft.id}`, label: 'Viết tiếp' }, secondary: null }
    : (stat.published as number) === 0 ? { tone: 'todo', title: 'Website chưa có bài viết nào', body: '', primary: { href: '/admin/bai-viet/moi', label: 'Viết bài đầu tiên' }, secondary: null }
    : missingAlt > 0 ? { tone: 'todo', title: `${missingAlt} ảnh chưa có mô tả`, body: '', primary: { href: '/admin/thu-vien', label: 'Thêm mô tả' }, secondary: null }
    : { tone: 'done', title: 'Mọi việc đã xong', body: '', primary: { href: '/admin/bai-viet/moi', label: 'Viết bài mới' }, secondary: null };
  const stateName: Record<string, string> = { draft: 'Bản nháp', published: 'Đã đăng' };
  const state = (post: Row) => post.status === 'draft' ? 'draft' : new Date(String(post.published_at)).getTime() > Date.now() ? 'scheduled' : 'published';
  const stateLabel = (post: Row) => state(post) === 'scheduled' ? 'Đã hẹn đăng' : stateName[String(post.status)];

  return <>
    <div className="admin-page-heading">
      <div><h1>Tổng quan</h1></div>
      {next.tone !== 'done' && <Link href="/admin/bai-viet/moi" className="button button-outline"><Plus size={18} />Viết bài mới</Link>}
    </div>

    <section className="adm-next" data-tone={next.tone} aria-label="Việc nên làm tiếp">
      <div><h2>{next.title}</h2>{next.body && <p>{next.body}</p>}</div>
      <div className="adm-next-actions">
        <a className="button pressable" href={next.primary.href}>{next.primary.label}<ArrowRight size={17} /></a>
        {next.secondary && <Link className="button button-outline" href={next.secondary.href}>{next.secondary.label}</Link>}
      </div>
    </section>

    <div className="adm-stats">
      <Link href="/admin/bai-viet" className="adm-stat"><span>Bài nháp đang chờ</span><strong>{stat.drafts}</strong></Link>
      <Link href="/admin/bai-viet" className="adm-stat"><span>Bài hẹn giờ</span><strong>{stat.scheduled}</strong>{scheduled.rows[0] && <small>{`Sắp đăng ${formatVietnamDateTime(scheduled.rows[0].published_at)}`}</small>}</Link>
      <Link href="/admin/bai-viet" className="adm-stat"><span>Bài đang đăng</span><strong>{stat.published}</strong></Link>
      <Link href="/admin/yeu-cau" className="adm-stat" data-alert={fresh > 0}><span>Yêu cầu tư vấn mới</span><strong>{fresh}</strong></Link>
    </div>

    <div className="adm-dash-grid">
      <div className="adm-dash-col">
        <section className="adm-card">
          <div className="panel-title"><h2>Yêu cầu tư vấn mới nhất</h2><Link href="/admin/yeu-cau" className="link-button">Xem tất cả</Link></div>
          {inquiries.rows.length ? <div className="adm-rows">{inquiries.rows.map(row => <div className="adm-row" key={row.id}>
            <div><strong>{row.name}</strong><small>{row.product || 'Cần được tư vấn thêm'}, {formatVietnamDateTime(row.created_at)}</small></div>
            <span className={`status-badge ${row.status}`}>{row.status === 'new' ? 'Mới' : row.status === 'contacted' ? 'Đã liên hệ' : 'Đã xong'}</span>
            <a className="icon-button" href={`tel:${row.phone}`} aria-label={`Gọi ${row.name}`}><Phone size={18} /></a>
          </div>)}</div> : <p className="field-help">Chưa có yêu cầu nào.</p>}
        </section>
        <section className="adm-card">
          <div className="panel-title"><h2>Bài sửa gần đây</h2><Link href="/admin/bai-viet" className="link-button">Xem tất cả</Link></div>
          {recentPosts.rows.length ? <div className="adm-rows">{recentPosts.rows.map(post => <div className="adm-row" key={post.id}>
            <div><strong><Link href={`/admin/bai-viet/${post.id}`}>{post.title}</Link></strong><small>Sửa lúc {formatVietnamDateTime(post.updated_at)}</small></div>
            <span className={`status-badge ${state(post)}`}>{stateLabel(post)}</span>
          </div>)}</div> : <p className="field-help">Chưa có bài viết nào.</p>}
        </section>
      </div>
      <div className="adm-dash-col">
        <section className="adm-card">
          <div className="panel-title"><h2 className="adm-sr">Việc hay làm</h2></div>
          <div className="adm-shortcuts">
            <Link href="/admin/bai-viet/moi"><PenLine size={20} />Viết bài mới</Link>
            <Link href="/admin/thu-vien"><Images size={20} />Tải ảnh lên</Link>
            <Link href="/admin/yeu-cau"><MessageSquare size={20} />Xem yêu cầu</Link>
            <Link href="/admin/san-pham"><Package size={20} />Sửa sản phẩm</Link>
            <Link href="/admin/bai-viet"><FileText size={20} />Danh sách bài</Link>
            <Link href="/admin/cai-dat"><Settings size={20} />Thông tin website</Link>
          </div>
        </section>
        {scheduled.rows.length > 0 && <section className="adm-card">
          <div className="panel-title"><h2>Sắp đăng</h2></div>
          <div className="adm-rows">{scheduled.rows.map(post => <div className="adm-row" key={post.id}><CalendarClock size={18} aria-hidden="true" /><div><strong><Link href={`/admin/bai-viet/${post.id}`}>{post.title}</Link></strong><small>{formatVietnamDateTime(post.published_at)}</small></div></div>)}</div>
        </section>}
        <section className="adm-card">
          <div className="panel-title"><h2>Trước khi đưa website lên mạng</h2></div>
          <ul className="adm-checklist">{checks.map(item => <li key={item.text} data-todo={!item.ok}>{item.ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{item.text}{!item.ok && <> <Link href={item.href} className="link-button">{item.link}</Link></>}</span></li>)}</ul>
        </section>
      </div>
    </div>
  </>;
}
