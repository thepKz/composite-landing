import { destroySession, validOrigin } from '@/lib/auth';
export async function POST(request:Request){
  const headers={'Cache-Control':'no-store'};
  if(!validOrigin(request))return Response.json({error:'Yêu cầu không hợp lệ.'},{status:403,headers});
  try {
    await destroySession();
    return Response.json({ok:true},{headers});
  } catch {
    return Response.json({error:'Chưa đăng xuất được. Vui lòng thử lại.'},{status:503,headers});
  }
}
