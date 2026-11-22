import { requireAdmin, apiError } from '@/lib/admin-api';
import { consumeLimit } from '@/lib/auth';
import { RequestError } from '@/lib/http';
import { mailConfigured, maskEmail, sendTestNotice } from '@/lib/mail';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const on = mailConfigured();
    return Response.json({ enabled: on, to: on ? maskEmail(process.env.MAIL_TO ?? '') : '' });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    if (!mailConfigured()) throw new RequestError('Thư thông báo chưa được bật.', 400);
    if (!await consumeLimit('admin:test-mail', 5, 3600)) throw new RequestError('Đã gửi thư thử nhiều lần. Vui lòng thử lại sau.', 429);
    const result = await sendTestNotice();
    if (!result.ok) {
      console.error('Gửi thư thử thất bại.', result.reason.split(' ')[0]);
      return Response.json({ ok: false, error: 'Chưa gửi được thư thử. Vui lòng kiểm tra tài khoản gửi thư.' }, { status: 502 });
    }
    return Response.json({ ok: true, to: maskEmail(process.env.MAIL_TO ?? '') });
  } catch (error) { return apiError(error); }
}
