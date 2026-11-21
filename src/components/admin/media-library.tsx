'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, ImageIcon, Search, Check, Film, Copy, Trash2, Wand2, X, AlertCircle } from 'lucide-react';
import { api, jsonOptions, uploadFile, checkUpload } from './client-api';
import { searchText } from '@/lib/text';
import { useConfirm, useToast, SkeletonRows } from './ui';
import ImageEditor from './image-editor';

export type Media = { id: string; original_name: string; mime_type: string; size_bytes: number; alt: string; caption: string; used_count?: number };
type Detail = Media & { dimensions: { width: number; height: number } | null; used_in: { posts: { id: string; title: string; status: string }[]; products: { id: string; name: string }[] } };
type Queue = { key: number; name: string; progress: number; error?: string; done?: boolean };

const sizeText = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function MediaLibrary({ onSelect, imagesOnly = false, selectLabel }: { onSelect?: (item: Media) => void; imagesOnly?: boolean; selectLabel?: string }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | 'image' | 'video'>('all');
  const [selected, setSelected] = useState<Media | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [saving, setSaving] = useState(false);
  const [queue, setQueue] = useState<Queue[]>([]);
  const [over, setOver] = useState(false);
  const [editing, setEditing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  const load = useCallback(async () => {
    try { setItems(await api<Media[]>('/api/admin/media')); setError(''); }
    catch (failure) { setError((failure as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    setDetail(null);
    if (!selected) return;
    let cancelled = false;
    api<Detail>(`/api/admin/media/${selected.id}`).then(value => { if (!cancelled) setDetail(value); }).catch(() => {});
    return () => { cancelled = true; };
  }, [selected?.id]);

  async function uploadAll(files: File[]) {
    const entries: { key: number; file: File }[] = [];
    const rejected: Queue[] = [];
    for (const file of files) {
      const key = ++counter.current;
      const problem = checkUpload(file, imagesOnly);
      if (problem) rejected.push({ key, name: file.name, progress: 0, error: problem });
      else entries.push({ key, file });
    }
    setQueue(previous => [...previous.filter(item => !item.done), ...rejected, ...entries.map(entry => ({ key: entry.key, name: entry.file.name, progress: 0 }))]);
    let last: Media | null = null;
    for (const { key, file } of entries) {
      try {
        const result = await uploadFile<Media>(file, percent => setQueue(previous => previous.map(item => item.key === key ? { ...item, progress: percent } : item)));
        setItems(previous => [result, ...previous]);
        setQueue(previous => previous.map(item => item.key === key ? { ...item, progress: 100, done: true } : item));
        last = result;
      } catch (failure) {
        setQueue(previous => previous.map(item => item.key === key ? { ...item, error: (failure as Error).message } : item));
      }
    }
    if (last) { setSelected(last); toast(entries.length > 1 ? 'Đã tải lên xong. Hãy thêm mô tả cho từng ảnh.' : 'Đã tải lên. Hãy thêm mô tả cho ảnh.'); }
    window.setTimeout(() => setQueue(previous => previous.filter(item => !item.done)), 3000);
  }

  async function saveText() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api<Media>(`/api/admin/media/${selected.id}`, jsonOptions('PATCH', { alt: selected.alt, caption: selected.caption }));
      setItems(previous => previous.map(item => item.id === updated.id ? { ...item, ...updated } : item));
      toast('Đã lưu mô tả ảnh.');
    } catch (failure) { toast((failure as Error).message, 'error'); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!selected) return;
    const used = detail?.used_in;
    const inUse = used ? used.posts.length + used.products.length : selected.used_count ?? 0;
    if (inUse > 0) { toast('Tệp đang được dùng trong bài viết hoặc sản phẩm. Hãy gỡ tệp khỏi nội dung đó trước khi xoá.', 'error'); return; }
    if (!await confirm({ title: 'Xoá tệp này khỏi thư viện?', body: <p>Tệp "{selected.original_name}" sẽ bị xoá hẳn và không khôi phục được.</p>, confirmLabel: 'Xoá tệp', danger: true })) return;
    try {
      await api(`/api/admin/media/${selected.id}`, { method: 'DELETE' });
      setItems(previous => previous.filter(item => item.id !== selected.id));
      setSelected(null);
      toast('Đã xoá tệp.');
    } catch (failure) { toast((failure as Error).message, 'error'); }
  }

  async function copyLink() {
    if (!selected) return;
    try { await navigator.clipboard.writeText(`${location.origin}/api/media/${selected.id}`); toast('Đã chép liên kết.'); }
    catch { toast('Trình duyệt không cho chép tự động. Hãy chép tay liên kết trong ô.', 'error'); }
  }

  const shown = items.filter(item => (!imagesOnly || item.mime_type.startsWith('image/'))
    && (kind === 'all' || item.mime_type.startsWith(`${kind}/`))
    && searchText(`${item.original_name} ${item.alt} ${item.caption}`).includes(searchText(search)));
  const isImage = selected?.mime_type.startsWith('image/');
  const usage = detail?.used_in;
  const usageCount = usage ? usage.posts.length + usage.products.length : selected?.used_count ?? 0;

  return <div className="adm-library"
    onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); setOver(true); } }}
    onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOver(false); }}
    onDrop={event => { event.preventDefault(); setOver(false); const files = [...event.dataTransfer.files]; if (files.length) void uploadAll(files); }}>
    <div className="adm-dropzone" data-over={over}>
      <Upload size={28} aria-hidden="true" />
      <div><strong>Kéo thả ảnh vào đây để tải lên</strong><span className="field-help" style={{ display: 'block' }}>{imagesOnly ? 'Ảnh JPG, PNG, WebP, AVIF tối đa 10 MB mỗi ảnh.' : 'Ảnh tối đa 10 MB, video MP4 hoặc WebM tối đa 100 MB. Chọn được nhiều tệp một lần.'}</span></div>
      <button type="button" className="button" onClick={() => input.current?.click()}><Upload size={17} />Chọn tệp</button>
      <input ref={input} type="file" multiple hidden accept={imagesOnly ? 'image/jpeg,image/png,image/webp,image/avif' : 'image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm'} onChange={event => { const files = [...(event.target.files ?? [])]; event.target.value = ''; if (files.length) void uploadAll(files); }} />
    </div>
    {queue.length > 0 && <ul className="adm-uploads" aria-label="Tiến trình tải lên">{queue.map(item => <li key={item.key} data-error={item.error ? 'true' : undefined}>
      <span title={item.name}>{item.name}</span>
      {item.error ? <span role="alert" style={{ gridColumn: '2 / -1', display: 'flex', gap: 6, alignItems: 'center' }}><AlertCircle size={16} />{item.error}</span> : <><progress value={item.progress} max={100} aria-label={`Tiến trình ${item.name}`} /><span>{item.done ? 'Xong' : `${item.progress}%`}</span></>}
    </li>)}</ul>}
    <div className="list-controls" style={{ marginBottom: 0 }}>
      <div className="filter-tabs" role="group" aria-label="Lọc loại tệp">
        {([['all', 'Tất cả'], ['image', 'Ảnh'], ['video', 'Video']] as const).filter(([value]) => !imagesOnly || value !== 'video').map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}
      </div>
      <label className="search-control"><Search size={17} /><input aria-label="Tìm ảnh hoặc video" placeholder="Tìm theo tên hoặc mô tả" value={search} onChange={event => setSearch(event.target.value)} /></label>
    </div>
    {error && <p className="error-message" role="alert">{error} <button type="button" className="link-button" onClick={() => void load()}>Tải lại</button></p>}
    <div className="adm-media-layout" data-selected={Boolean(selected)}>
      <div>
        {loading ? <SkeletonRows rows={3} height={150} /> : shown.length ? <div className="adm-media-grid">{shown.map(item => <button type="button" key={item.id} className="adm-media-tile" aria-pressed={selected?.id === item.id} onClick={() => setSelected({ ...item })}>
          <span className="adm-media-frame">{item.mime_type.startsWith('image/') ? <img src={`/api/media/${item.id}`} alt={item.alt || item.original_name} loading="lazy" /> : <Film size={36} />}</span>
          {Number(item.used_count) > 0 && <span className="adm-media-used">Đang dùng</span>}
          <span className="adm-media-meta"><strong title={item.original_name}>{item.alt || item.original_name}</strong><small>{item.mime_type.startsWith('video/') ? 'Video' : 'Ảnh'}, {sizeText(Number(item.size_bytes))}</small></span>
        </button>)}</div> : <div className="admin-empty"><ImageIcon size={32} /><h3>{search || kind !== 'all' ? 'Không thấy tệp phù hợp' : 'Thư viện đang trống'}</h3><p>{search || kind !== 'all' ? 'Thử từ khóa khác hoặc bỏ bộ lọc.' : 'Kéo ảnh sản phẩm hoặc video vào khung phía trên để bắt đầu.'}</p></div>}
      </div>
      {selected && <aside className="adm-media-details" aria-label="Chi tiết tệp">
        <div className="panel-title" style={{ marginBottom: 0 }}><h3>Chi tiết tệp</h3><button type="button" className="icon-button" aria-label="Đóng chi tiết" onClick={() => setSelected(null)}><X size={18} /></button></div>
        {isImage ? <img className="adm-media-preview" src={`/api/media/${selected.id}`} alt={selected.alt || selected.original_name} /> : <video className="adm-media-preview" src={`/api/media/${selected.id}`} controls preload="metadata" />}
        <dl className="adm-facts">
          <dt>Tên tệp</dt><dd>{selected.original_name}</dd>
          <dt>Dung lượng</dt><dd>{sizeText(Number(selected.size_bytes))}</dd>
          {detail?.dimensions && <><dt>Kích thước</dt><dd>{detail.dimensions.width} x {detail.dimensions.height}</dd></>}
        </dl>
        <label>Mô tả ảnh<input value={selected.alt} maxLength={500} onChange={event => setSelected({ ...selected, alt: event.target.value })} placeholder="Ví dụ: Bể biogas composite xanh tại xưởng" /></label>
        <p className="field-help">Mô tả giúp người khiếm thị và Google hiểu ảnh.</p>
        <label>Chú thích<textarea value={selected.caption} maxLength={500} rows={2} onChange={event => setSelected({ ...selected, caption: event.target.value })} /></label>
        <div className="adm-inline-actions">
          <button type="button" className="button button-outline" disabled={saving} onClick={() => void saveText()}>{saving ? 'Đang lưu' : 'Lưu mô tả'}</button>
          {onSelect && <button type="button" className="button" onClick={() => onSelect(selected)}><Check size={17} />{selectLabel ?? (imagesOnly ? 'Chọn ảnh này' : 'Chèn tệp này')}</button>}
        </div>
        <div className="adm-inline-actions">
          {isImage && <button type="button" className="button button-outline button-small" onClick={() => setEditing(true)}><Wand2 size={16} />Chỉnh ảnh</button>}
          <button type="button" className="button button-outline button-small" onClick={() => void copyLink()}><Copy size={16} />Chép liên kết</button>
          <button type="button" className="button button-danger button-small" onClick={() => void remove()}><Trash2 size={16} />Xoá</button>
        </div>
        <div>
          <p className="adm-side-title">Đang dùng ở</p>
          {usageCount === 0 ? <p className="field-help">Chưa có bài viết hay sản phẩm nào dùng tệp này. Có thể xoá an toàn.</p> : usage ? <ul className="adm-used-list">{usage.posts.map(post => <li key={post.id}>Bài: {post.title}</li>)}{usage.products.map(product => <li key={product.id}>Sản phẩm: {product.name}</li>)}</ul> : <p className="field-help">Đang kiểm tra</p>}
        </div>
      </aside>}
    </div>
    {editing && selected && <ImageEditor mediaId={selected.id} onClose={() => setEditing(false)} onSaved={media => { setEditing(false); setItems(previous => [media, ...previous]); setSelected(media); }} />}
  </div>;
}
