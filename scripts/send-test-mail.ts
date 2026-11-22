import { mailConfigured, sendTestNotice } from '../src/lib/mail';

// Gửi đúng một thư thử tới MAIL_TO. Chạy: node --env-file=.env --import tsx scripts/send-test-mail.ts
if (!mailConfigured()) {
  console.log('Chưa đủ cấu hình thư (SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO).');
  process.exit(1);
}
const result = await sendTestNotice();
if (result.ok) console.log(`Đã gửi. Phản hồi của máy chủ thư: ${result.response}`);
else { console.log(`Chưa gửi được. Lý do: ${result.reason}`); process.exitCode = 1; }
