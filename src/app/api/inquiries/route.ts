import { randomUUID } from 'node:crypto';
import { after } from 'next/server';
import { sendInquiryNotice } from '@/lib/mail';
import { inquirySchema, inquiryMessage } from '@/lib/inquiry-details';
import { db } from '@/lib/db';
import { consumeLimit, consumePublicLimit, validOrigin } from '@/lib/auth';
import { readJson, RequestError } from '@/lib/http';
export const maxDuration = 30;

export async function POST(request:Request){
  if(!validOrigin(request)) return Response.json({error:'Yêu cầu không hợp lệ.'},{status:403});
  if(Number(request.headers.get('content-length') || 0)>12000) return Response.json({error:'Nội dung quá dài.'},{status:413});
  try {
    if(!await consumePublicLimit(request,'inquiry'))return Response.json({error:'Hệ thống đang nhận nhiều yêu cầu. Vui lòng thử lại sau.'},{status:429});
    const parsed=inquirySchema.safeParse(await readJson(request));
    if(!parsed.success) return Response.json({error:'Vui lòng kiểm tra họ tên, số điện thoại, email và đồng ý liên hệ.'},{status:400});
    const p=parsed.data;
    if(!await consumeLimit(`inquiry:${p.phone.replace(/\D/g,'')}`,3,3600))return Response.json({error:'Số điện thoại này đã gửi nhiều yêu cầu. Vui lòng thử lại sau một giờ.'},{status:429});
    await db.query('INSERT INTO inquiries(id,name,phone,product,message,consent_at) VALUES ($1,$2,$3,$4,$5,now())',[randomUUID(),p.name,p.phone.replace(/[^\d+]/g,''),p.product,inquiryMessage(p)]);
    const notice={name:p.name,phone:p.phone,product:p.product,message:inquiryMessage(p),email:p.email,createdAt:new Date()};
    try{after(async()=>{const result=await sendInquiryNotice(notice);if(!result.ok&&!result.skipped)console.error('Không gửi được thư thông báo yêu cầu mới.',result.reason.split(' ')[0]);});}catch{console.error('Không lên lịch được thư thông báo yêu cầu mới.');}
    return Response.json({ok:true},{status:201});
  } catch(error) {if(error instanceof RequestError)return Response.json({error:error.message},{status:error.status});return Response.json({error:'Chưa lưu được yêu cầu. Vui lòng thử lại sau.'},{status:503});}
}
