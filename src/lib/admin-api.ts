import { currentUser, validOrigin } from './auth';
import { RequestError } from './http';
import { ZodError } from 'zod';
import type { core } from 'zod';

/** Lời Việt cho luật kiểm dữ liệu chưa có lời riêng (lời mặc định của thư viện là tiếng Anh, không có dấu). */
export function issueMessage(issue: core.$ZodIssue): string {
  if (/[^\x00-\x7F]/.test(issue.message)) return issue.message;
  const origin = 'origin' in issue ? String(issue.origin) : '';
  switch (issue.code) {
    case 'invalid_type': return issue.input === undefined ? 'Thiếu thông tin này.' : 'Thông tin này không đúng dạng.';
    case 'invalid_format': return 'Thông tin này không đúng định dạng.';
    case 'too_big': return origin === 'array' ? 'Có quá nhiều mục.' : origin === 'string' ? 'Nội dung này quá dài.' : 'Số này quá lớn.';
    case 'too_small': return origin === 'array' ? 'Chưa đủ số mục.' : origin === 'string' ? 'Nội dung này quá ngắn hoặc còn trống.' : 'Số này quá nhỏ.';
    default: return 'Thông tin này không hợp lệ.';
  }
}

/** Câu chính trên cùng: lấy câu của luật đánh dấu headline (ví dụ quá 20 ảnh), không có thì câu chung. */
export function validationHeadline(error: ZodError): string {
  const marked = error.issues.find(issue => issue.code === 'custom' && issue.params?.headline === true);
  return marked ? marked.message : 'Vui lòng kiểm tra các trường thông tin.';
}

export async function requireAdmin(request: Request) {
  if (!await currentUser()) throw new RequestError('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.', 401);
  if (!['GET','HEAD'].includes(request.method) && !validOrigin(request)) throw new RequestError('Nguồn yêu cầu không hợp lệ.', 403);
}
export function apiError(error: unknown) {
  if (error instanceof RequestError) return Response.json({error:error.message},{status:error.status});
  if (error instanceof ZodError) return Response.json({error:validationHeadline(error),fields:error.issues.map(issue=>({path:issue.path.join('.'),message:issueMessage(issue)}))},{status:400});
  if (error && typeof error==='object' && 'code' in error && error.code==='23505') return Response.json({error:'Đường dẫn hoặc thông tin này đã tồn tại. Vui lòng chọn giá trị khác.'},{status:409});
  console.error('Administration request failed.', error instanceof Error ? error.name : 'Unknown error');
  return Response.json({error:'Chưa lưu được thay đổi. Vui lòng thử lại.'},{status:500});
}
