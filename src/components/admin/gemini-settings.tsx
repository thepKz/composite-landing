'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { api, jsonOptions } from './client-api';

type Status = { configured: boolean; model: string };
export default function GeminiSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [model, setModel] = useState('gemini-3.1-flash-lite');
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    api<Status>('/api/admin/settings/gemini').then(value => { setStatus(value); setModel(value.model); }).catch(failure => setError(failure.message));
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const value = await api<Status>('/api/admin/settings/gemini', jsonOptions('PUT', { model, ...(key.trim() ? { apiKey: key.trim() } : {}) }));
      setStatus(value); setKey(''); setMessage('Đã kiểm tra khóa và model, lưu cấu hình dịch.');
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }
  return <form className="settings-form admin-panel" onSubmit={save} aria-busy={busy} style={{ marginTop: 24 }}>
    <h2>Dịch bài viết sang tiếng Anh</h2>
    <p>{status ? status.configured ? 'Đã có khóa Gemini. Mở bài viết để tạo bản dịch nháp.' : 'Thêm khóa Gemini để dịch nội dung trong trình soạn bài.' : 'Đang tải cấu hình dịch…'}</p>
    <label>Model<input value={model} onChange={event => setModel(event.target.value)} maxLength={100} pattern="gemini-[a-z0-9.\-]+" required disabled={busy || !status}/></label>
    <label>{status?.configured ? 'Thay khóa API' : 'Khóa API'}<input type="password" autoComplete="new-password" value={key} onChange={event => setKey(event.target.value)} maxLength={512} required={!status?.configured} disabled={busy || !status}/></label>
    <p className="field-help">{status?.configured ? 'Để trống để giữ khóa hiện tại. ' : ''}Khóa được mã hóa trong Supabase; chỉ máy chủ đọc để gọi Google. Bản dịch luôn được tạo ở trạng thái nháp.</p>
    {error && <p role="alert" className="error-message">{error}</p>}
    {message && <p role="status" className="save-status">{message}</p>}
    <div><button className="button button-outline" disabled={busy || !status}>{busy ? 'Đang kiểm tra…' : 'Kiểm tra và lưu'}</button></div>
  </form>;
}
