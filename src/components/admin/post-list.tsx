'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, FileText, Pencil, ExternalLink, Copy, FileX2, Trash2, ImageIcon } from 'lucide-react';
import { api, jsonOptions } from './client-api';
import { SkeletonRows, useConfirm, useToast } from './ui';
import { searchText } from '@/lib/text';
import { postPath } from '@/lib/post-path';
import { formatVietnamDateTime, publicationState, type PublicationState } from '@/lib/post-time';

type Post = { id: string; title: string; slug: string; status: string; kind: string; version: number; cover_id: string | null; updated_at: string; published_at: string | null; server_now: string };
type Filter = 'all' | PublicationState;
type Sort = 'recent' | 'oldest' | 'title';
const labels: Record<PublicationState, string> = { draft: 'Bản nháp', scheduled: 'Đã hẹn đăng', published: 'Đã đăng' };

export default function PostList() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [clockBase, setClockBase] = useState(() => ({ server: Date.now(), received: 0 }));
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const value = await api<Post[]>('/api/admin/posts');
      setItems(value);
      setClockBase({ server: value[0]?.server_now ? new Date(value[0].server_now).getTime() : Date.now(), received: performance.now() });
      setError('');
    } catch (failure) { setError((failure as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const tick = () => setNow(clockBase.server + performance.now() - clockBase.received);
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [clockBase]);

  const stateOf = useCallback((post: Post) => publicationState(post.status, post.published_at, now), [now]);
  const counts = useMemo(() => {
    const result = { all: items.length, draft: 0, scheduled: 0, published: 0 };
    for (const post of items) result[stateOf(post)]++;
    return result;
  }, [items, stateOf]);
  const shown = useMemo(() => {
    const list = items.filter(post => (filter === 'all' || stateOf(post) === filter) && searchText(post.title).includes(searchText(search)));
    list.sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'vi') : sort === 'oldest' ? +new Date(a.updated_at) - +new Date(b.updated_at) : +new Date(b.updated_at) - +new Date(a.updated_at));
    return list;
  }, [items, filter, search, sort, stateOf]);

  async function duplicate(post: Post) {
    setBusy(post.id);
    try { const copy = await api<Post>(`/api/admin/posts/${post.id}/duplicate`, { method: 'POST' }); setItems(previous => [copy, ...previous]); toast('Đã nhân bản thành bản nháp mới.'); }
    catch (failure) { toast((failure as Error).message, 'error'); }
    finally { setBusy(''); }
  }
  async function toDraft(post: Post) {
    if (!await confirm({ title: 'Chuyển bài về nháp?', body: <p>Bài "{post.title}" sẽ không còn hiện trên website. Nội dung vẫn được giữ.</p>, confirmLabel: 'Chuyển về nháp', cancelLabel: 'Hủy' })) return;
    setBusy(post.id);
    try { const updated = await api<Post>(`/api/admin/posts/${post.id}/draft`, jsonOptions('POST', { version: post.version })); setItems(previous => previous.map(item => item.id === post.id ? { ...item, ...updated } : item)); toast('Đã chuyển bài về nháp.'); }
    catch (failure) { toast((failure as Error).message, 'error'); }
    finally { setBusy(''); }
  }
  async function remove(post: Post) {
    if (!await confirm({ title: 'Xoá bài viết này?', body: <p>Bài "{post.title}" sẽ bị xoá cùng lịch sử sửa và không khôi phục được. Ảnh trong thư viện vẫn còn.</p>, confirmLabel: 'Xoá bài', danger: true })) return;
    setBusy(post.id);
    try { await api(`/api/admin/posts/${post.id}`, { method: 'DELETE' }); setItems(previous => previous.filter(item => item.id !== post.id)); toast('Đã xoá bài viết.'); }
    catch (failure) { toast((failure as Error).message, 'error'); }
    finally { setBusy(''); }
  }

  const tabs: [Filter, string][] = [['all', 'Tất cả'], ['draft', labels.draft], ['scheduled', labels.scheduled], ['published', labels.published]];
  const filtering = Boolean(search) || filter !== 'all';

  return <>
    <div className="admin-page-heading">
      <div><h1>Bài viết</h1><p>Kiến thức hữu ích và câu chuyện công trình.</p></div>
      <Link className="button pressable" href="/admin/bai-viet/moi"><Plus size={17} />Viết bài mới</Link>
    </div>
    <div className="list-controls">
      <div className="filter-tabs" role="group" aria-label="Lọc theo trạng thái">{tabs.map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{counts[value]}</span></button>)}</div>
      <div className="inline-actions">
        <label className="select-inline">Sắp xếp<select value={sort} onChange={event => setSort(event.target.value as Sort)}><option value="recent">Mới sửa trước</option><option value="oldest">Cũ nhất trước</option><option value="title">Theo tên</option></select></label>
        <label className="search-control"><Search size={17} /><input placeholder="Tìm bài viết" aria-label="Tìm bài viết" value={search} onChange={event => setSearch(event.target.value)} /></label>
      </div>
    </div>
    {error && <p role="alert" className="error-message">{error} <button type="button" className="link-button" onClick={() => void load()}>Thử lại</button></p>}
    {loading ? <SkeletonRows rows={5} /> : shown.length ? <div className="adm-posts" role="table" aria-label="Danh sách bài viết">
      <div className="adm-post-head" role="row"><span role="columnheader">Ảnh</span><span role="columnheader">Tiêu đề</span><span role="columnheader">Trạng thái</span><span role="columnheader">Sửa lần cuối</span><span role="columnheader">Thao tác</span></div>
      {shown.map(post => {
        const state = stateOf(post);
        return <div className="adm-post-row" role="row" key={post.id}>
          <span className="adm-thumb" role="cell">{post.cover_id ? <img src={`/api/media/${post.cover_id}`} alt="" loading="lazy" /> : <ImageIcon size={20} aria-hidden="true" />}</span>
          <div className="adm-post-title" role="cell"><Link href={`/admin/bai-viet/${post.id}`}>{post.title}</Link><small>{post.kind === 'project' ? 'Công trình' : 'Kiến thức'}</small></div>
          <span role="cell"><span className={`status-badge ${state}`}>{labels[state]}</span>{state === 'scheduled' && post.published_at && <small style={{ display: 'block' }}>{formatVietnamDateTime(post.published_at)}</small>}</span>
          <span role="cell"><time dateTime={post.updated_at}>{formatVietnamDateTime(post.updated_at)}</time></span>
          <div className="adm-post-actions" role="cell">
            <Link className="icon-button" href={`/admin/bai-viet/${post.id}`} aria-label={`Sửa ${post.title}`} title="Sửa"><Pencil size={17} /></Link>
            {state === 'published' && <Link className="icon-button" href={postPath(post)} target="_blank" aria-label={`Xem ${post.title} trên website`} title="Xem trên website"><ExternalLink size={17} /></Link>}
            <button type="button" className="icon-button" disabled={busy === post.id} onClick={() => void duplicate(post)} aria-label={`Nhân bản ${post.title}`} title="Nhân bản"><Copy size={17} /></button>
            {state !== 'draft' && <button type="button" className="icon-button" disabled={busy === post.id} onClick={() => void toDraft(post)} aria-label={`Chuyển ${post.title} về nháp`} title="Chuyển về nháp"><FileX2 size={17} /></button>}
            <button type="button" className="icon-button" disabled={busy === post.id} onClick={() => void remove(post)} aria-label={`Xoá ${post.title}`} title="Xoá"><Trash2 size={17} /></button>
          </div>
        </div>;
      })}
    </div> : <div className="admin-empty">
      <FileText size={32} />
      <h2>{filtering ? 'Không tìm thấy bài viết phù hợp' : 'Viết bài đầu tiên của anh chị'}</h2>
      {filtering ? <><p>Thử từ khóa khác hoặc xem tất cả trạng thái.</p><button type="button" className="button button-outline" onClick={() => { setSearch(''); setFilter('all'); }}>Xóa bộ lọc</button></>
        : <><p>Chia sẻ cách chọn sản phẩm hoặc một công trình đã làm. Trình soạn có sẵn dàn ý để bắt đầu nhanh.</p><Link className="button" href="/admin/bai-viet/moi"><Plus size={17} />Viết bài mới</Link></>}
    </div>}
  </>;
}
