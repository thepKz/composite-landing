'use client';
import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { catalogue } from '@/lib/catalogue';

export default function InquiryForm({product='',compact=false}:{product?:string;compact?:boolean}) {
  const [state,setState]=useState<'idle'|'busy'|'done'|'error'>('idle');
  const [error,setError]=useState('');
  const submitting=useRef(false);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(submitting.current)return; submitting.current=true; setState('busy');setError('');
    const data=Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error || 'Chưa gửi được yêu cầu. Anh/chị vui lòng thử lại.');
      setState('done');
    } catch(error) {setError(error instanceof Error?error.message:'Mất kết nối. Vui lòng thử lại.');setState('error');}finally{submitting.current=false;}
  }
  if(state==='done') return <div className="form-success" role="status"><CheckCircle2 size={40}/><h3>Đã nhận yêu cầu tư vấn</h3><p>Thông tin đã được lưu để Thành Lợi liên hệ với anh/chị.</p><button className="button button-outline" onClick={()=>setState('idle')}>Gửi nhu cầu khác</button></div>;
  const optionalFields = <>
    <div className="form-row"><label>Email (không bắt buộc)<input name="email" type="email" maxLength={254} autoComplete="email" placeholder="Email nhận thông tin"/></label><label>Nội dung liên hệ<select name="purpose" defaultValue="consultation"><option value="consultation">Tư vấn sản phẩm</option><option value="quotation">Yêu cầu báo giá</option><option value="support">Hỗ trợ kỹ thuật</option></select></label></div>
    <div className="form-row"><label>Kích thước / dung tích<input name="dimensions" maxLength={160} placeholder="Ví dụ: 2 m × 1 m × 1 m"/></label><label>Địa điểm lắp đặt / giao hàng<input name="location" maxLength={200} placeholder="Tỉnh/thành, địa điểm dự kiến"/></label></div>
  </>;
  return <form onSubmit={submit} className="inquiry-form">
    <div className="form-row"><label>Họ và tên<input name="name" required maxLength={100} autoComplete="name" placeholder="Tên của anh/chị"/></label><label>Số điện thoại<input name="phone" type="tel" required minLength={9} maxLength={20} autoComplete="tel" placeholder="Số điện thoại liên hệ"/></label></div>
    <label>Sản phẩm quan tâm<select name="product" defaultValue={product}><option value="">Tôi cần được tư vấn thêm</option>{catalogue.map(p=><option key={p.slug} value={p.name}>{p.name}</option>)}</select></label>
    {compact ? <details className="inquiry-optional" onInvalidCapture={event => { event.currentTarget.open = true; }}><summary>Thêm quy cách, địa điểm hoặc email</summary>{optionalFields}</details> : optionalFields}
    <label>Nhu cầu của anh/chị<textarea name="message" rows={3} maxLength={2000} placeholder="Kích thước dự kiến, mục đích sử dụng hoặc địa điểm lắp đặt…"/></label>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <label className="checkbox-label"><input type="checkbox" name="consent" value="yes" required/><span>Tôi đồng ý để Thành Lợi sử dụng thông tin này nhằm liên hệ tư vấn. <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a></span></label>
    {state==='error'&&<p className="error-message" role="alert">{error}</p>}
    <button className="button" disabled={state==='busy'}>{state==='busy'?'Đang gửi…':'Gửi yêu cầu tư vấn'}<ArrowUpRight size={18}/></button>
  </form>;
}
