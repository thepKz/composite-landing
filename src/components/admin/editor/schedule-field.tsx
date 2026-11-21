'use client';
import { useEffect, useState } from 'react';
import { vietnamDateTimeInput } from '@/lib/post-time';

/**
 * Chọn ngày giờ đăng bằng tiếng Việt. Giá trị vào ra có dạng "2026-11-25T08:00" (giờ Việt Nam), cùng dạng với ô cũ,
 * nên phần lưu và đổi múi giờ ở máy chủ không đổi. Danh sách ngày dựng sau khi trang đã hiện để không lệch với bản dựng trên máy chủ.
 */
const pad = (value: number) => String(value).padStart(2, '0');
const hours = Array.from({ length: 24 }, (_, index) => pad(index));
const minutes = Array.from({ length: 12 }, (_, index) => pad(index * 5));
const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' });

function dayLabel(date: string, index: number) {
  const [year, month, day] = date.split('-');
  const name = weekday.format(new Date(`${date}T12:00:00Z`));
  const lead = index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : name.charAt(0).toUpperCase() + name.slice(1);
  return `${lead}, ${day}/${month}/${year}`;
}

export default function ScheduleField({ value, minValue, onChange }: { value: string; minValue: string; onChange: (value: string) => void }) {
  const [days, setDays] = useState<string[]>([]);
  useEffect(() => {
    const base = Date.now();
    setDays(Array.from({ length: 90 }, (_, index) => vietnamDateTimeInput(base + index * 86400000).slice(0, 10)));
  }, []);

  const [date = '', time = ''] = value.split('T');
  const [hour = '', minute = ''] = time.split(':');
  const tomorrow = days[1] ?? '';
  const options = date && !days.includes(date) ? [date, ...days] : days;
  const compose = (next: { date?: string; hour?: string; minute?: string }) => {
    const d = next.date ?? (date || tomorrow);
    if (!d) return;
    onChange(`${d}T${next.hour ?? (hour || '08')}:${next.minute ?? (minute || '00')}`);
  };
  const past = Boolean(value) && Boolean(minValue) && value < minValue;

  return <fieldset className="ed-schedule">
    <legend>Hẹn giờ đăng</legend>
    <div className="ed-schedule-quick">
      <button type="button" className="ed-chip" disabled={!tomorrow} onClick={() => onChange(`${tomorrow}T08:00`)}>Sáng mai 8 giờ</button>
      <button type="button" className="ed-chip" disabled={!tomorrow} onClick={() => onChange(`${tomorrow}T14:00`)}>Chiều mai 14 giờ</button>
    </div>
    <label>Ngày
      <select value={date} onChange={event => event.target.value ? compose({ date: event.target.value }) : onChange('')}>
        <option value="">Chọn ngày</option>
        {options.map(item => <option key={item} value={item}>{dayLabel(item, days.indexOf(item))}</option>)}
      </select>
    </label>
    <div className="ed-schedule-time">
      <label>Giờ
        <select value={hour} onChange={event => compose({ hour: event.target.value })}><option value="" disabled>Giờ</option>{hours.map(item => <option key={item} value={item}>{item}</option>)}</select>
      </label>
      <label>Phút
        <select value={minute} onChange={event => compose({ minute: event.target.value })}><option value="" disabled>Phút</option>{[...new Set([...minutes, ...(minute ? [minute] : [])])].sort().map(item => <option key={item} value={item}>{item}</option>)}</select>
      </label>
    </div>
    {past && <p className="error-message" role="alert">Giờ này đã qua, hãy chọn một giờ sau bây giờ.</p>}
    {value && <button type="button" className="link-button ed-schedule-clear" onClick={() => onChange('')}>Bỏ ngày giờ đã chọn</button>}
  </fieldset>;
}
