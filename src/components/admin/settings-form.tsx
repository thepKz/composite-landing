'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { api, jsonOptions } from './client-api';
import { Skeleton, useToast } from './ui';

type Settings = { name: string; phone: string; phone2: string; email: string; address: string; zalo: string; hours: string; description: string };
const fields: { key: keyof Settings; label: string; type: string; help?: string; required?: boolean }[] = [
  { key: 'name', label: 'Tên thương hiệu', type: 'text', required: true },
  { key: 'phone', label: 'Số điện thoại chính', type: 'tel' },
  { key: 'phone2', label: 'Số điện thoại thứ hai', type: 'tel' },
  { key: 'email', label: 'Email liên hệ', type: 'email' },
  { key: 'address', label: 'Địa chỉ', type: 'text' },
  { key: 'hours', label: 'Giờ làm việc', type: 'text', help: 'Ví dụ: 7h30 đến 17h30, thứ Hai đến thứ Bảy.' },
  { key: 'zalo', label: 'Liên kết Zalo', type: 'url', help: 'Dạng https://zalo.me/ rồi tới số điện thoại Zalo.' },
];

export default function SettingsForm() {
  const toast = useToast();
  const [value, setValue] = useState<Settings | null>(null);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mail, setMail] = useState<{ enabled: boolean; to: string } | null>(null);
  const [mailBusy, setMailBusy] = useState(false);
  const [mailNote, setMailNote] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { api<Settings>('/api/admin/settings').then(result => { const full = { ...result, phone2: result.phone2 ?? '', hours: result.hours ?? '' }; setValue(full); setSaved(JSON.stringify(full)); }).catch(failure => setError(failure.message)); }, []);

  useEffect(() => { api<{ enabled: boolean; to: string }>('/api/admin/mail').then(setMail).catch(() => setMail({ enabled: false, to: '' })); }, []);

  async function sendTest() {
    if (mailBusy) return;
    setMailBusy(true); setMailNote(null);
    try { const result = await api<{ to: string }>('/api/admin/mail', { method: 'POST' }); setMailNote({ ok: true, text: `Đã gửi thư thử tới ${result.to}. Hãy mở hộp thư để kiểm tra.` }); toast('Đã gửi thư thử.'); }
    catch (failure) { setMailNote({ ok: false, text: (failure as Error).message }); }
    finally { setMailBusy(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy || !value) return;
    setBusy(true); setError('');
    try { const result = await api<Settings>('/api/admin/settings', jsonOptions('PUT', value)); setValue(result); setSaved(JSON.stringify(result)); toast('Đã lưu thông tin. Website đã dùng thông tin mới.'); }
    catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }

  const changed = value ? JSON.stringify(value) !== saved : false;
  return <>
    <div className="admin-page-heading"><div><h1>Thông tin website</h1><p>Hiện ở chân trang và phần liên hệ.</p></div></div>
    {error && <p className="error-message" role="alert" style={{ marginBottom: 16 }}>{error}</p>}
    {value ? <form className="settings-form admin-panel" onSubmit={save} aria-busy={busy}>
      {fields.map(({ key, label, type, help, required }) => <label key={key}>{label}
        <input disabled={busy} type={type} value={value[key]} required={required} maxLength={key === 'address' ? 500 : 200} onChange={event => setValue({ ...value, [key]: event.target.value })} />
        {help && <span className="field-help">{help}</span>}
      </label>)}
      <label>Giới thiệu ngắn<textarea disabled={busy} rows={3} value={value.description} maxLength={500} onChange={event => setValue({ ...value, description: event.target.value })} /></label>
      <p className="field-help">Mục để trống sẽ không hiện cho khách.</p>
      <div className="inline-actions">
        <button className="button pressable" disabled={busy || !changed}>{busy ? 'Đang lưu' : 'Lưu thông tin'}</button>
        <span className="field-help" role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{changed ? 'Có thay đổi chưa lưu' : <><CheckCircle2 size={16} />Đã lưu</>}</span>
      </div>
    </form> : !error && <div className="admin-panel" style={{ display: 'grid', gap: 12 }}><Skeleton height={44} /><Skeleton height={44} /><Skeleton height={44} /><Skeleton height={44} /></div>}
    {mail && <section className="settings-form admin-panel" aria-label="Thư thông báo" style={{ marginTop: 16 }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={18} />Thư thông báo</h2>
      <p role="status">{mail.enabled ? `Đang bật. Mỗi yêu cầu báo giá mới sẽ gửi thư tới ${mail.to}.` : 'Chưa bật. Cần thêm thông tin gửi thư trên máy chủ của website.'}</p>
      <div className="inline-actions">
        <button type="button" className="button button-outline pressable" disabled={!mail.enabled || mailBusy} onClick={() => void sendTest()}>{mailBusy ? 'Đang gửi' : 'Gửi thư thử'}</button>
        {mailNote && <span className={mailNote.ok ? 'field-help' : 'error-message'} role={mailNote.ok ? 'status' : 'alert'}>{mailNote.text}</span>}
      </div>
    </section>}
  </>;
}
