import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LoginForm from '@/components/admin/login-form';
export default async function Login(){
  let user;
  let unavailable=false;
  try { user=await currentUser(); } catch { unavailable=true; }
  if(user)redirect('/admin');
  return <main className="login-page"><div className="login-card"><Link href="/" className="brand" aria-label="Thành Lợi Composite - Về website"><img src="/images/thanh-loi-logo.png" alt="" width="56" height="56"/><span>THÀNH LỢI<small>COMPOSITE</small></span></Link><h1>Đăng nhập quản trị</h1><p>Quản lý bài viết, hình ảnh, sản phẩm và yêu cầu tư vấn.</p>{unavailable&&<p role="alert" className="error-message">Hệ thống đang gián đoạn. Vui lòng thử đăng nhập lại sau.</p>}<LoginForm/><Link href="/" className="login-back">← Về website</Link></div></main>;
}
