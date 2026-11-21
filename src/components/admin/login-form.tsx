'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const data = { email: String(form.get('email') ?? '').trim(), password: String(form.get('password') ?? '') };
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

  return <form onSubmit={login} className="adm-login-form" aria-busy={busy} noValidate={false}>
    <label>Email quản trị<input name="email" type="email" required autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} readOnly={busy} /></label>
    <div className="adm-field">
      <label htmlFor="admin-password">Mật khẩu</label>
      <span className="adm-password">
        <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" maxLength={256} readOnly={busy} />
        <button type="button" onClick={() => setShowPassword(value => !value)} aria-controls="admin-password" aria-pressed={showPassword} disabled={busy}>
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        </button>
      </span>
    </div>
    {error && <p className="error-message" role="alert">{error}</p>}
    <button type="submit" className="button pressable" disabled={busy}>{busy ? <><span className="adm-spinner" aria-hidden="true" />Đang đăng nhập</> : <>Đăng nhập<ArrowRight size={18} /></>}</button>
    {busy && <p role="status" className="field-help">Đang kiểm tra thông tin đăng nhập.</p>}
  </form>;
}
