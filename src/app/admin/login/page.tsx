import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LoginForm from '@/components/admin/login-form';

export default async function Login() {
  if (isDemoMode()) {
    return <main className="adm-login"><div className="adm-login-main" style={{ gridColumn: '1 / -1' }}><div className="adm-login-card"><h1>Bản xem thử website</h1><p>Phần quản trị sẽ bật khi website kết nối kho dữ liệu. Anh chị có thể xem giao diện và sản phẩm ngay trên bản này.</p><Link href="/" className="button">Về trang chủ</Link></div></div></main>;
  }
  let user;
  let unavailable = false;
  try { user = await currentUser(); } catch { unavailable = true; }
  if (user) redirect('/admin');
  return <main className="adm-login">
    <section className="adm-login-aside" aria-hidden="true">
      <img src="/images/thanh-loi-logo.png" alt="" />
      <h2>Viết bài, quản lý ảnh và theo dõi khách hỏi mua</h2>
    </section>
    <section className="adm-login-main"><div className="adm-login-card">
      <div><h1>Đăng nhập quản trị</h1></div>
      {unavailable && <p role="alert" className="error-message">Hệ thống đang gián đoạn. Vui lòng thử đăng nhập lại sau.</p>}
      <LoginForm />
      <Link href="/" className="adm-login-back">Về website</Link>
    </div></section>
  </main>;
}
