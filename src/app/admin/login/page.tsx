import { isDemoMode } from '@/lib/demo-mode';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LoginForm from '@/components/admin/login-form';
export default async function Login(){
  if(isDemoMode()) return <main className="login-page"><div className="login-card"><h1>Bản xem thử website</h1><p>Quản trị và lưu dữ liệu sẽ được bật khi website kết nối database. Anh/chị có thể xem giao diện và sản phẩm ngay trên bản demo.</p><Link href="/" className="button">Về trang chủ</Link></div></main>;
  let user;
  let unavailable=false;
  try { user=await currentUser(); } catch { unavailable=true; }
  if(user)redirect('/admin');
  return <main className="login-page"><div className="login-card"><Link href="/" className="brand" aria-label="Thành Lợi Composite - Về website"><img src="/images/thanh-loi-logo.png" alt="" width="56" height="56"/><span>THÀNH LỢI<small>COMPOSITE</small></span></Link><h1>Đăng nhập quản trị</h1><p>Quản lý bài viết, hình ảnh, sản phẩm và yêu cầu tư vấn.</p>{unavailable&&<p role="alert" className="error-message">Hệ thống đang gián đoạn. Vui lòng thử đăng nhập lại sau.</p>}<LoginForm/><Link href="/" className="login-back">← Về website</Link></div></main>;
}
