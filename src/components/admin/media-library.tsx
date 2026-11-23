'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, ImageIcon, Search, Check, Film, Copy, Trash2, Wand2, X, AlertCircle, ListChecks } from 'lucide-react';
import { api, jsonOptions, uploadFile, checkUpload } from './client-api';
import { searchText } from '@/lib/text';
import { useConfirm, useToast, SkeletonRows } from './ui';
import ImageEditor from './image-editor';

export type Media = { id: string; original_name: string; mime_type: string; size_bytes: number; alt: string; caption: string; used_count?: number };
type Detail = Media & { dimensions: { width: number; height: number } | null; used_in: { posts: { id: string; title: string; status: string }[]; products: { id: string; name: string }[] } };
type Queue = { key: number; name: string; progress: number; error?: string; done?: boolean };

const sizeText = (bytes: number) => bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// onSelectMany: chọn nhiều ảnh một lượt (sản phẩm). taken: ảnh đã có, hiện "Đã thêm" và không chọn lại. room: số ảnh còn thêm được.
export default function MediaLibrary({ onSelect, onSelectMany, taken = [], room = Infinity, imagesOnly = false, selectLabel }: { onSelect?: (item: Media) => void; onSelectMany?: (items: Media[]) => void; taken?: string[]; room?: number; imagesOnly?: boolean; selectLabel?: string }) {
  const choosing = Boolean(onSelectMany);
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
  // Chọn nhiều để xoá một lượt (chỉ ở trang thư viện, không ở hộp chọn ảnh cho bài). Tệp đang được dùng không chọn được.
  const [multi, setMulti] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
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
    const added: string[] = [];
    for (const { key, file } of entries) {
      try {
        const result = await uploadFile<Media>(file, percent => setQueue(previous => previous.map(item => item.key === key ? { ...item, progress: percent } : item)));
        setItems(previous => [result, ...previous]);
        setQueue(previous => previous.map(item => item.key === key ? { ...item, progress: 100, done: true } : item));
        last = result;
        added.push(result.id);
      } catch (failure) {
        setQueue(previous => previous.map(item => item.key === key ? { ...item, error: (failure as Error).message } : item));
      }
    }
    if (choosing && added.length) { const fit = added.slice(0, Math.max(0, room - picked.length)); setPicked(previous => [...previous, ...fit]); if (fit.length < added.length) toast(`Đã tải lên ${added.length} ảnh. Chỉ chọn thêm được ${fit.length} ảnh vì sản phẩm tối đa 20 ảnh.`, 'error'); }
    else if (last) { setSelected(last); toast(entries.length > 1 ? 'Đã tải lên xong. Hãy thêm mô tả cho từng ảnh.' : 'Đã tải lên. Hãy thêm mô tả cho ảnh.'); }
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

  async function removePicked() {
    const ids = picked.filter(id => items.some(item => item.id === id && !Number(item.used_count)));
    if (!ids.length) return;
    if (!await confirm({ title: `Xoá ${ids.length} tệp khỏi thư viện?`, body: <p>{ids.length} tệp sẽ bị xoá hẳn và không khôi phục được.</p>, confirmLabel: `Xoá ${ids.length} tệp`, danger: true })) return;
    setBulkBusy(true);
    const done: string[] = [];
    for (const id of ids) {
      try { await api(`/api/admin/media/${id}`, { method: 'DELETE' }); done.push(id); } catch { /* tệp vừa được bài dùng hoặc đã mất, giữ lại */ }
    }
    setItems(previous => previous.filter(item => !done.includes(item.id)));
    setPicked(previous => previous.filter(id => !done.includes(id)));
    if (selected && done.includes(selected.id)) setSelected(null);
    setBulkBusy(false);
    toast(done.length === ids.length ? `Đã xoá ${done.length} tệp.` : `Đã xoá ${done.length} trên ${ids.length} tệp. Số còn lại đang được dùng.`, done.length === ids.length ? 'success' : 'error');
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
      <div><strong>Kéo thả ảnh vào đây để tải lên</strong><span className="field-help" style={{ display: 'block' }}>{imagesOnly ? 'Mỗi ảnh nặng tối đa 10 MB.' : 'Ảnh tối đa 10 MB, video MP4 hoặc WebM tối đa 100 MB. Chọn được nhiều tệp một lần.'}</span></div>
      <button type="button" className={imagesOnly ? 'button button-outline' : 'button'} onClick={() => input.current?.click()}><Upload size={17} />Chọn tệp</button>
      <input ref={input} type="file" multiple hidden accept={imagesOnly ? 'image/jpeg,image/png,image/webp,image/avif' : 'image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm'} onChange={event => { const files = [...(event.target.files ?? [])]; event.target.value = ''; if (files.length) void uploadAll(files); }} />
    </div>
    {queue.length > 0 && <ul className="adm-uploads" aria-label="Tiến trình tải lên">{queue.map(item => <li key={item.key} data-error={item.error ? 'true' : undefined}>
      <span title={item.name}>{item.name}</span>
      {item.error ? <span role="alert" style={{ gridColumn: '2 / -1', display: 'flex', gap: 6, alignItems: 'center' }}><AlertCircle size={16} />{item.error}</span> : <><progress value={item.progress} max={100} aria-label={`Tiến trình ${item.name}`} /><span>{item.done ? 'Xong' : `${item.progress}%`}</span></>}
    </li>)}</ul>}
    <div className="list-controls" style={{ marginBottom: 0 }}>
      {!imagesOnly && <div className="filter-tabs" role="group" aria-label="Lọc loại tệp">
        {([['all', 'Tất cả'], ['image', 'Ảnh'], ['video', 'Video']] as const).filter(([value]) => !imagesOnly || value !== 'video').map(([value, label]) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>)}
      </div>}
      {!onSelect && !choosing && <button type="button" className="button button-outline" aria-pressed={multi} onClick={() => { setMulti(value => !value); setPicked([]); setSelected(null); }}><ListChecks size={17} />{multi ? 'Xong' : 'Chọn nhiều'}</button>}
      <label className="search-control"><Search size={17} /><input aria-label={imagesOnly ? 'Tìm ảnh' : 'Tìm ảnh hoặc video'} placeholder="Tìm theo tên hoặc mô tả" value={search} onChange={event => setSearch(event.target.value)} /></label>
    </div>
    {error && <p className="error-message" role="alert">{error} <button type="button" className="link-button" onClick={() => void load()}>Tải lại</button></p>}
    {multi && <div className="adm-bulkbar" role="status"><strong>{picked.length ? `Đã chọn ${picked.length} tệp` : 'Bấm vào ảnh để chọn'}</strong><span className="adm-bulk-actions"><button type="button" className="button button-outline" disabled={!picked.length || bulkBusy} onClick={() => setPicked([])}>Bỏ chọn</button><button type="button" className="button button-danger" disabled={!picked.length || bulkBusy} onClick={() => void removePicked()}><Trash2 size={17} />{bulkBusy ? 'Đang xoá' : `Xoá ${picked.length || ''}`.trim()}</button></span></div>}
    <div className="adm-media-layout" data-selected={Boolean(selected)}>
      <div>
        {loading ? <SkeletonRows rows={3} height={150} /> : shown.length ? <div className="adm-media-grid">{shown.map((item, index) => { const have = choosing && taken.includes(item.id); const locked = have || (multi && Number(item.used_count) > 0); const on = picked.includes(item.id); const full = choosing && !on && picked.length >= room; return <button type="button" key={item.id} className="adm-media-tile" aria-label={imagesOnly ? `${item.alt || `Ảnh số ${index + 1}`}, ${sizeText(Number(item.size_bytes))}` : undefined} data-picked={on || undefined} disabled={locked} aria-disabled={full || undefined} aria-pressed={multi || choosing ? on : selected?.id === item.id} onClick={() => { if (multi || choosing) { if (full) { toast('Đã đủ 20 ảnh cho sản phẩm này.', 'error'); return; } setPicked(previous => on ? previous.filter(id => id !== item.id) : [...previous, item.id]); } else setSelected({ ...item }); }}>
          <span className="adm-media-frame">{item.mime_type.startsWith('image/') ? <img src={`/api/media/${item.id}`} alt={item.alt || (imagesOnly ? `Ảnh số ${index + 1}` : item.original_name)} loading="lazy" /> : <Film size={36} />}</span>
          {have ? <span className="adm-media-used">Đã thêm</span> : !choosing && Number(item.used_count) > 0 && <span className="adm-media-used">Đang dùng</span>}
          <span className="adm-media-meta"><strong title={item.alt || undefined}>{item.alt || (imagesOnly ? 'Ảnh chưa có mô tả' : item.original_name)}</strong><small>{item.mime_type.startsWith('video/') ? 'Video' : 'Ảnh'}, {sizeText(Number(item.size_bytes))}</small></span>
        {on && <span className="adm-media-check" aria-hidden="true"><Check size={16} /></span>}
        </button>; })}</div> : <div className="admin-empty"><ImageIcon size={32} /><h3>{search || kind !== 'all' ? 'Không thấy tệp phù hợp' : 'Thư viện đang trống'}</h3></div>}
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
        <label>Chú thích<textarea value={selected.caption} maxLength={500} rows={2} onChange={event => setSelected({ ...selected, caption: event.target.value })} /></label>
        <div className="adm-inline-actions">
          <button type="button" className="button button-outline" disabled={saving} onClick={() => void saveText()}>{saving ? 'Đang lưu' : 'Lưu mô tả'}</button>
          </div>
        <div className="adm-inline-actions">
          {isImage && <button type="button" className="button button-outline button-small" onClick={() => setEditing(true)}><Wand2 size={16} />Chỉnh ảnh</button>}
          <button type="button" className="button button-outline button-small" onClick={() => void copyLink()}><Copy size={16} />Chép liên kết</button>
          <button type="button" className="button button-danger button-small" onClick={() => void remove()}><Trash2 size={16} />Xoá</button>
        </div>
        <div>
          <p className="adm-side-title">Đang dùng ở</p>
          {usageCount === 0 ? <p className="field-help">Chưa dùng ở đâu, xoá được.</p> : usage ? <ul className="adm-used-list">{usage.posts.map(post => <li key={post.id}>Bài: {post.title}</li>)}{usage.products.map(product => <li key={product.id}>Sản phẩm: {product.name}</li>)}</ul> : <p className="field-help">Đang kiểm tra</p>}
        </div>
      </aside>}
    </div>
    {choosing && <div className="adm-pick-bar is-multi" role="region" aria-label="Ảnh đang chọn">
      <span role="status">{picked.length ? `Đã chọn ${picked.length} ảnh` : 'Bấm ảnh để chọn nhiều ảnh'}</span>
      <button type="button" className="button button-outline" disabled={!picked.length} onClick={() => setPicked([])}>Bỏ chọn</button>
      <button type="button" className="button" disabled={!picked.length} onClick={() => onSelectMany?.(picked.map(id => items.find(item => item.id === id)).filter((item): item is Media => Boolean(item)))}><Check size={17} />{picked.length ? `Thêm ${picked.length} ảnh` : 'Thêm ảnh'}</button>
    </div>}
    {onSelect && selected && !multi && <div className="adm-pick-bar" role="region" aria-label="Ảnh đang chọn">
      {isImage ? <img src={`/api/media/${selected.id}`} alt="" /> : <Film size={24} aria-hidden="true" />}
      <span title={selected.alt || undefined}>{selected.alt || (imagesOnly ? 'Ảnh chưa có mô tả' : selected.original_name)}</span>
      <button type="button" className="button" onClick={() => onSelect(selected)}><Check size={17} />{selectLabel ?? (imagesOnly ? 'Chọn ảnh này' : 'Chèn tệp này')}</button>
    </div>}
    {editing && selected && <ImageEditor mediaId={selected.id} onClose={() => setEditing(false)} onSaved={media => { setEditing(false); setItems(previous => [media, ...previous]); setSelected(media); }} />}
  </div>;
}
