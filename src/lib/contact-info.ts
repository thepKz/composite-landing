import { facts } from './site-facts';

// Thông tin liên hệ đã chốt cho trang công khai: giá trị trong cài đặt admin thắng, ô trống rơi về hồ sơ nội dung.
// Hàm thuần, dùng được ở cả máy chủ lẫn trình duyệt.
export type ContactSettings = { phone?: string; phone2?: string; hours?: string; zalo?: string; email?: string; address?: string };
export type Hotline = { display: string; tel: string };
export type ContactInfo = { hotlines: Hotline[]; hours: string; zalo: string; email: string; address: string };

const digitsOnly = (value: string) => value.replace(/\D/g, '');
const validTel = (tel: string) => tel.length >= 9 && tel.length <= 15;

// Nhận cả chuỗi số lẫn liên kết zalo.me, trả về phần số.
export function zaloNumber(value?: string) {
  const text = value?.trim() || '';
  const fromLink = text.match(/zalo\.me\/([0-9+]+)/i)?.[1];
  const tel = digitsOnly(fromLink ?? text);
  return validTel(tel) ? tel : facts.zalo;
}

export function resolveContact(settings?: ContactSettings): ContactInfo {
  const hotlines: Hotline[] = [];
  const add = (display?: string) => {
    const text = display?.trim();
    const tel = text ? digitsOnly(text) : '';
    if (text && validTel(tel) && !hotlines.some(line => line.tel === tel)) hotlines.push({ display: text, tel });
  };
  // Mỗi vị trí lấy từ cài đặt, ô trống lấy số cùng vị trí trong hồ sơ.
  add(settings?.phone || facts.hotlines[0].display);
  add(settings?.phone2 || facts.hotlines[1]?.display);
  if (!hotlines.length) facts.hotlines.forEach(line => add(line.display));
  const email = settings?.email?.trim();
  const address = settings?.address?.trim();
  return {
    hotlines,
    hours: settings?.hours?.trim() || facts.hours,
    zalo: zaloNumber(settings?.zalo),
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : facts.email,
    address: !address || address === 'Phú Thọ' ? facts.address : address,
  };
}
