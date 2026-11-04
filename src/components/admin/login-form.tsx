'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        setError(typeof result?.error === 'string' ? result.error : 'Máy chủ chưa phản hồi đúng. Vui lòng thử lại.');
        submitting.current = false;
        setBusy(false);
        return;
      }
      setShowPassword(false);
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.');
      submitting.current = false;
      setBusy(false);
    }
  }

  return <form onSubmit={login} className="inquiry-form" aria-busy={busy}>
    <label>Email quản trị<input name="email" type="email" required autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} readOnly={busy}/></label>
    <label>Mật khẩu<input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" maxLength={256} readOnly={busy}/></label>
    <label className="checkbox-label"><input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} aria-controls="admin-password" disabled={busy}/><span>Hiện mật khẩu</span></label>
    {error && <p className="error-message" role="alert">{error}</p>}
    {busy && <p role="status">Đang kiểm tra thông tin đăng nhập…</p>}
    <button type="submit" className="button" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}<ArrowRight size={18}/></button>
  </form>;
}
