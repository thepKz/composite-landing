import nodemailer from 'nodemailer';
import { siteUrl } from './seo';

export type MailEnv = Record<string, string | undefined>;
export type InquiryNotice = { name: string; phone: string; product?: string; message?: string; email?: string; createdAt?: Date };
export type BuiltMail = { subject: string; text: string; html: string; replyTo?: string };
export type SendResult = { ok: true; response: string } | { ok: false; skipped?: boolean; reason: string };

const SENDER_NAME = 'Website Thành Lợi Composite';
const GREEN = '#0f5132';
const TIMEOUT_MS = 10000;

export function mailConfigured(env: MailEnv = process.env) {
  return Boolean(env.SMTP_HOST?.trim() && env.SMTP_USER?.trim() && env.SMTP_PASS && env.MAIL_TO?.trim());
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Bỏ mọi ký tự xuống dòng và ký tự điều khiển để khách không chèn được dòng vào tiêu đề thư. */
export function oneLine(value: string) {
  return value.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

/** Che bớt địa chỉ thư, ví dụ jin***@gmail.com. */
export function maskEmail(address: string) {
  const [local, domain] = oneLine(address).split('@');
  if (!local || !domain) return '';
  return `${local.slice(0, Math.min(3, Math.max(1, local.length - 1)))}***@${domain}`;
}

export function vietnamTime(date: Date) {
  const parts = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hourCycle: 'h23' }).formatToParts(date);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${get('hour')}:${get('minute')}, ${get('day')}/${get('month')}/${get('year')}`;
}

const validEmail = (value: string) => /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/.test(value) && value.length <= 254;

function layout(title: string, rows: [string, string][], body: string, link: { href: string; label: string }) {
  const rowHtml = rows.map(([label, value]) => `<tr><td style="padding:8px 12px 8px 0;color:#4b5563;font-size:14px;vertical-align:top;width:110px">${escapeHtml(label)}</td><td style="padding:8px 0;font-size:16px;color:#111827;vertical-align:top">${value}</td></tr>`).join('');
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:16px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d1d5db;border-radius:8px;overflow:hidden">
<div style="background:${GREEN};color:#ffffff;padding:16px 20px;font-size:18px;font-weight:bold">${escapeHtml(title)}</div>
<div style="padding:16px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rowHtml}</table>${body}
<p style="margin:20px 0 4px"><a href="${escapeHtml(link.href)}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:16px">${escapeHtml(link.label)}</a></p></div>
</div></body></html>`;
}

export function buildInquiryMail(inquiry: InquiryNotice): BuiltMail {
  const name = oneLine(inquiry.name);
  const phone = oneLine(inquiry.phone);
  const product = oneLine(inquiry.product ?? '');
  const message = (inquiry.message ?? '').replace(/\r\n?/g, '\n').trim();
  const when = vietnamTime(inquiry.createdAt ?? new Date());
  const subject = oneLine(`Yêu cầu báo giá mới: ${name}${product ? `, ${product}` : ''}`).slice(0, 200);
  const link = siteUrl('/admin/yeu-cau');
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const email = oneLine(inquiry.email ?? '');

  const lines = [
    'Có một yêu cầu báo giá mới trên website.',
    '',
    `Họ tên: ${name}`,
    `Số điện thoại: ${phone}`,
  ];
  if (product) lines.push(`Sản phẩm: ${product}`);
  lines.push(`Thời điểm: ${when}`);
  if (message) lines.push('', 'Nội dung khách ghi:', message);
  lines.push('', `Xem trong trang quản trị: ${link}`);
  const text = lines.join('\n');

  const rows: [string, string][] = [
    ['Họ tên', `<strong>${escapeHtml(name)}</strong>`],
    ['Số điện thoại', `<a href="${escapeHtml(telHref)}" style="color:${GREEN};font-weight:bold">${escapeHtml(phone)}</a>`],
  ];
  if (product) rows.push(['Sản phẩm', escapeHtml(product)]);
  rows.push(['Thời điểm', escapeHtml(when)]);
  const body = message ? `<p style="margin:16px 0 4px;color:#4b5563;font-size:14px">Nội dung khách ghi</p><div style="white-space:pre-wrap;border-left:4px solid ${GREEN};background:#f3f7f4;padding:12px 16px;font-size:16px;color:#111827">${escapeHtml(message)}</div>` : '';
  const html = layout('Yêu cầu báo giá mới', rows, body, { href: link, label: 'Xem yêu cầu' });
  return { subject, text, html, replyTo: validEmail(email) ? email : undefined };
}

export function buildTestMail(): BuiltMail {
  const link = siteUrl('/admin/cai-dat');
  const when = vietnamTime(new Date());
  const text = `Đây là thư thử từ website Thành Lợi Composite.\nNếu bạn đọc được thư này, thư thông báo yêu cầu báo giá đã hoạt động.\nThời điểm: ${when}\n${link}`;
  const body = '<p style="margin:0;font-size:16px;color:#111827">Nếu bạn đọc được thư này, thư thông báo yêu cầu báo giá đã hoạt động.</p>';
  return { subject: 'Thư thử từ website Thành Lợi Composite', text, html: layout('Thư thử', [['Thời điểm', escapeHtml(when)]], body, { href: link, label: 'Mở cài đặt' }) };
}

/** Chỉ giữ mã lỗi và phản hồi của máy chủ thư, không giữ chuỗi có thể chứa thông tin đăng nhập. */
export function safeFailure(error: unknown) {
  const e = (error ?? {}) as { code?: unknown; responseCode?: unknown; response?: unknown };
  const code = typeof e.code === 'string' ? e.code : 'LOI';
  const responseCode = typeof e.responseCode === 'number' ? ` ${e.responseCode}` : '';
  const response = typeof e.response === 'string' ? ` ${e.response.replace(/\s+/g, ' ').slice(0, 200)}` : '';
  return `${code}${responseCode}${response}`;
}

async function deliver(mail: BuiltMail, env: MailEnv): Promise<SendResult> {
  if (!mailConfigured(env)) return { ok: false, skipped: true, reason: 'Chưa cấu hình thư.' };
  try {
    const port = Number(env.SMTP_PORT) || 465;
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST!.trim(), port, secure: port === 465,
      auth: { user: env.SMTP_USER!.trim(), pass: env.SMTP_PASS },
      connectionTimeout: TIMEOUT_MS, greetingTimeout: TIMEOUT_MS, socketTimeout: TIMEOUT_MS,
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const info = await Promise.race([
        transport.sendMail({
          from: { name: SENDER_NAME, address: env.SMTP_USER!.trim() },
          to: env.MAIL_TO!.trim(),
          replyTo: mail.replyTo,
          subject: mail.subject, text: mail.text, html: mail.html,
        }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })), TIMEOUT_MS + 2000); }),
      ]);
      return { ok: true, response: String(info.response ?? '') };
    } finally { clearTimeout(timer); transport.close(); }
  } catch (error) {
    return { ok: false, reason: safeFailure(error) };
  }
}

export async function sendInquiryNotice(inquiry: InquiryNotice, env: MailEnv = process.env): Promise<SendResult> {
  if (!mailConfigured(env)) return { ok: false, skipped: true, reason: 'Chưa cấu hình thư.' };
  return deliver(buildInquiryMail(inquiry), env);
}

export function sendTestNotice(env: MailEnv = process.env) {
  return deliver(buildTestMail(), env);
}
