'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MessageCircle, Mail, MessageSquare } from 'lucide-react';
import { api, jsonOptions } from './client-api';
import { Dialog, SkeletonRows, useToast } from './ui';
import { formatVietnamDateTime } from '@/lib/post-time';

type Inquiry = { id: string; name: string; phone: string; product: string; message: string; status: 'new' | 'contacted' | 'closed'; created_at: string };
type Filter = 'all' | Inquiry['status'];
const names: Record<Inquiry['status'], string> = { new: 'Mới', contacted: 'Đã liên hệ', closed: 'Đã xong' };

/** Tách các dòng "Tên mục: giá trị" trong tin nhắn khách gửi thành từng trường, phần còn lại giữ nguyên xuống dòng. */
function parseMessage(message: string) {
  const fields: { label: string; value: string }[] = [];
  const rest: string[] = [];
  for (const line of message.split('\n')) {
    const match = /^([^:\n]{2,40}):\s*(.+)$/.exec(line);
    if (match && !/^https?$/i.test(match[1])) fields.push({ label: match[1].trim(), value: match[2].trim() });
    else if (line.trim()) rest.push(line);
  }
  return { fields, rest: rest.join('\n') };
}

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1100px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

function Detail({ item, busy, onStatus }: { item: Inquiry; busy: boolean; onStatus: (status: Inquiry['status']) => void }) {
  const { fields, rest } = parseMessage(item.message);
  const email = fields.find(field => /^email$/i.test(field.label))?.value;
  const digits = item.phone.replace(/\D/g, '');
  return <div className="adm-inquiry-detail-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div><h2>{item.name}</h2><p className="field-help">Gửi lúc {formatVietnamDateTime(item.created_at)}</p></div>
    <div className="adm-contact-actions">
      <a className="button" href={`tel:${item.phone}`}><Phone size={17} />Gọi {item.phone}</a>
      <a className="button button-outline" href={`https://zalo.me/${digits}`} target="_blank" rel="noreferrer"><MessageCircle size={17} />Nhắn Zalo</a>
      {email && <a className="button button-outline" href={`mailto:${email}`}><Mail size={17} />Gửi email</a>}
    </div>
    <dl className="adm-facts">
      <dt>Sản phẩm quan tâm</dt><dd>{item.product || 'Cần được tư vấn thêm'}</dd>
      <dt>Số điện thoại</dt><dd>{item.phone}</dd>
      {fields.map((field, index) => <span key={index} style={{ display: 'contents' }}><dt>{field.label}</dt><dd>{field.value}</dd></span>)}
    </dl>
    {rest && <div><p className="adm-side-title">Lời nhắn của khách</p><div className="adm-message">{rest}</div></div>}
    <div><p className="adm-side-title">Tình trạng xử lý</p>
      <div className="adm-seg" role="group" aria-label="Đổi tình trạng">{(['new', 'contacted', 'closed'] as const).map(status => <button type="button" key={status} aria-pressed={item.status === status} disabled={busy} onClick={() => item.status !== status && onStatus(status)}>{names[status]}</button>)}</div>
    </div>
  </div>;
}

export default function InquiryList() {
  const toast = useToast();
  const router = useRouter();
  const narrow = useNarrow();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('new');
  const [selectedId, setSelectedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState('');

  useEffect(() => { api<Inquiry[]>('/api/admin/inquiries').then(setItems).catch(failure => setError(failure.message)).finally(() => setLoading(false)); }, []);

  const counts = useMemo(() => ({ all: items.length, new: items.filter(i => i.status === 'new').length, contacted: items.filter(i => i.status === 'contacted').length, closed: items.filter(i => i.status === 'closed').length }), [items]);
  // Yêu cầu vừa đổi tình trạng vẫn hiện tới khi đổi bộ lọc, để không biến mất ngay trước mắt.
  const shown = items.filter(item => filter === 'all' || item.status === filter || item.id === pinned);
  const selected = items.find(item => item.id === selectedId) ?? (narrow ? undefined : shown[0]);

  async function setStatus(status: Inquiry['status']) {
    if (!selected) return;
    setBusy(true);
    try {
      const result = await api<Inquiry>('/api/admin/inquiries', jsonOptions('PATCH', { id: selected.id, status }));
      setItems(previous => previous.map(item => item.id === result.id ? result : item));
      setPinned(result.id);
      router.refresh();
      toast(`Đã đổi tình trạng thành "${names[status]}".`);
    } catch (failure) { toast((failure as Error).message, 'error'); }
    finally { setBusy(false); }
  }

  const tabs: [Filter, string][] = [['new', 'Mới'], ['contacted', 'Đã liên hệ'], ['closed', 'Đã xong'], ['all', 'Tất cả']];
  return <>
    <div className="admin-page-heading"><div><h1>Yêu cầu tư vấn</h1></div></div>
    <div className="list-controls"><div className="filter-tabs" role="group" aria-label="Lọc yêu cầu">{tabs.map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setPinned(''); }}>{label}<span>{counts[value]}</span></button>)}</div></div>
    {error && <p role="alert" className="error-message">{error}</p>}
    {loading ? <SkeletonRows rows={4} /> : shown.length ? <div className="adm-inquiries">
      <div className="adm-inquiry-list">{shown.map(item => <div className="adm-inquiry-row" key={item.id}><button type="button" className="adm-inquiry-item" aria-current={selected?.id === item.id} onClick={() => { setSelectedId(item.id); setOpen(true); }}>
        <span className="top"><strong>{item.name}</strong><span className={`status-badge ${item.status}`}>{names[item.status]}</span></span>
        <small>{item.phone}, {item.product || 'Cần tư vấn thêm'}</small>
        <small>{formatVietnamDateTime(item.created_at)}</small>
      </button><a className="adm-inquiry-call" href={`tel:${item.phone}`} aria-label={`Gọi ${item.name} số ${item.phone}`}><Phone size={20} /><span>Gọi</span></a></div>)}</div>
      {!narrow && selected && <section className="adm-inquiry-detail" aria-label="Chi tiết yêu cầu"><Detail item={selected} busy={busy} onStatus={status => void setStatus(status)} /></section>}
      {narrow && selected && <Dialog open={open} onClose={() => setOpen(false)} title="Chi tiết yêu cầu" width={560}><Detail item={selected} busy={busy} onStatus={status => void setStatus(status)} /></Dialog>}
    </div> : <div className="admin-empty"><MessageSquare size={32} /><h2>{filter === 'all' ? 'Chưa có yêu cầu nào' : 'Chưa có yêu cầu ở mục này'}</h2></div>}
  </>;
}
