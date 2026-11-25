import { db } from '@/lib/db';
import { consumeLimit, consumePublicLimit, createSession, validOrigin } from '@/lib/auth';
import { verifyPassword, sessionHash } from '@/lib/security';
import { readJson, RequestError } from '@/lib/http';
import { loginSchema } from '@/lib/auth-policy';
import { usesSupabaseAuth, verifySupabasePassword } from '@/lib/supabase-auth';

const dummyHash='scrypt:'+'0'.repeat(32)+':'+'0'.repeat(128);
function reply(body: { ok?: boolean; error?: string }, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '900' } : {}) } });
}
export async function POST(request:Request){
  if(!validOrigin(request))return reply({error:'Yêu cầu không hợp lệ. Vui lòng mở lại trang đăng nhập.'},403);
  try {
    if(!await consumePublicLimit(request,'login'))return reply({error:'Hệ thống đang nhận nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.'},429);
    const parsed=loginSchema.safeParse(await readJson(request,4000));
    if(!parsed.success)return reply({error:'Vui lòng kiểm tra email và mật khẩu.'},400);
    const email=parsed.data.email;
    const limitKey=`login:${sessionHash(email)}`;
    if(!await consumeLimit(limitKey,8,900))return reply({error:'Đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.'},429);
    const user=(await db.query('SELECT id,password_hash FROM users WHERE email=$1',[email])).rows[0];
    const valid=usesSupabaseAuth()
      ? await verifySupabasePassword(email,parsed.data.password)
      : await verifyPassword(parsed.data.password,user?.password_hash ?? dummyHash);
    if(!user || !valid)return reply({error:'Email hoặc mật khẩu chưa đúng.'},401);
    await db.query('DELETE FROM rate_limits WHERE key=$1',[limitKey]);
    await createSession(user.id);
    return reply({ok:true});
  } catch(error) {if(error instanceof RequestError)return reply({error:error.message},error.status);return reply({error:'Không thể đăng nhập lúc này. Vui lòng thử lại.'},503);}
}
