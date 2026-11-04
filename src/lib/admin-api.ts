import { currentUser, validOrigin } from './auth';
import { RequestError } from './http';
import { ZodError } from 'zod';

export async function requireAdmin(request: Request) {
  if (!await currentUser()) throw new RequestError('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.', 401);
  if (!['GET','HEAD'].includes(request.method) && !validOrigin(request)) throw new RequestError('Nguồn yêu cầu không hợp lệ.', 403);
}
export function apiError(error: unknown) {
  if (error instanceof RequestError) return Response.json({error:error.message},{status:error.status});
  if (error instanceof ZodError) return Response.json({error:'Vui lòng kiểm tra các trường thông tin.',fields:error.issues.map(issue=>({path:issue.path.join('.'),message:issue.message}))},{status:400});
  if (error && typeof error==='object' && 'code' in error && error.code==='23505') return Response.json({error:'Đường dẫn hoặc thông tin này đã tồn tại. Vui lòng chọn giá trị khác.'},{status:409});
  console.error('Administration request failed.', error instanceof Error ? error.name : 'Unknown error');
  return Response.json({error:'Chưa lưu được thay đổi. Vui lòng thử lại.'},{status:500});
}
