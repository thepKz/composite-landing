'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { api } from './client-api';
import { searchText } from '@/lib/text';
import { formatVietnamDateTime, publicationState } from '@/lib/post-time';

type Post = { id: string; title: string; status: string; kind: string; updated_at: string; published_at: string | null; server_now: string };
const labels = { draft: 'Bản nháp', scheduled: 'Đã hẹn đăng', published: 'Đã xuất bản' };

export default function PostList() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [clock, setClock] = useState(() => ({ server: Date.now(), received: performance.now() }));
  const [now, setNow] = useState(Date.now());
  useEffect(() => { api<Post[]>('/api/admin/posts').then(value => { setItems(value); setClock({ server: value[0]?.server_now ? new Date(value[0].server_now).getTime() : Date.now(), received: performance.now() }); }).catch(error => setError(error.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { const tick = () => setNow(clock.server + performance.now() - clock.received); tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer); }, [clock]);
  const shown = items.filter(post => (filter === 'all' || publicationState(post.status, post.published_at, now) === filter) && searchText(post.title).includes(searchText(search)));
  return <>
    <div className="admin-page-heading"><div><h1>Bài viết</h1><p>Kiến thức hữu ích và câu chuyện công trình. Thời gian hiển thị theo Việt Nam (GMT+7).</p></div><Link className="button" href="/admin/bai-viet/moi"><Plus size={17}/>Viết bài mới</Link></div>
    <div className="list-controls"><div className="filter-tabs" role="group" aria-label="Lọc trạng thái">{[['all', 'Tất cả'], ['draft', labels.draft], ['scheduled', labels.scheduled], ['published', labels.published]].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div><label className="search-control"><Search size={17}/><input placeholder="Tìm bài viết…" aria-label="Tìm bài viết" value={search} onChange={event => setSearch(event.target.value)}/></label></div>
    {error && <p role="alert" className="error-message">{error}</p>}
    {loading ? <p>Đang tải bài viết…</p> : shown.length ? <div className="admin-table-wrap admin-responsive-table"><table className="admin-table"><thead><tr><th>Tiêu đề</th><th>Trạng thái</th><th>Xuất bản (GMT+7)</th><th>Cập nhật (GMT+7)</th><th>Thao tác</th></tr></thead><tbody>{shown.map(post => {
      const state = publicationState(post.status, post.published_at, now);
      return <tr key={post.id}><td><Link href={`/admin/bai-viet/${post.id}`}>{post.title}</Link><small>{post.kind === 'project' ? 'Công trình' : 'Kiến thức'}</small></td><td data-label="Trạng thái"><span className={`status-badge ${state}`}>{labels[state]}</span></td><td data-label="Xuất bản">{state !== 'draft' && post.published_at ? <time dateTime={post.published_at}>{formatVietnamDateTime(post.published_at)}</time> : 'Chưa công khai'}</td><td data-label="Cập nhật"><time dateTime={post.updated_at}>{formatVietnamDateTime(post.updated_at)}</time></td><td className="admin-row-action"><Link className="link-button" href={`/admin/bai-viet/${post.id}`}>Chỉnh sửa</Link></td></tr>;
    })}</tbody></table></div> : <div className="admin-empty"><FileText size={32}/><h2>{search || filter !== 'all' ? 'Không tìm thấy bài viết phù hợp.' : 'Bắt đầu bằng bài viết đầu tiên.'}</h2>{search || filter !== 'all' ? <><p>Thử từ khóa khác hoặc xem lại tất cả trạng thái.</p><button className="button button-outline" onClick={()=>{setSearch('');setFilter('all');}}>Xóa bộ lọc</button></> : <><p>Chia sẻ cách lựa chọn sản phẩm hoặc một công trình đã được xác nhận.</p><Link className="button" href="/admin/bai-viet/moi">Viết bài mới</Link></>}</div>}
  </>;
}
