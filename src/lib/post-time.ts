export const publicationTimezone = 'Asia/Ho_Chi_Minh';
export type PublicationState = 'draft' | 'scheduled' | 'published';

export function publicationState(status: string, publishedAt: string | Date | null | undefined, now: number): PublicationState {
  const timestamp = publishedAt ? new Date(publishedAt).getTime() : NaN;
  if (status !== 'published' || !Number.isFinite(timestamp)) return 'draft';
  return timestamp > now ? 'scheduled' : 'published';
}

export function vietnamDateTimeInput(value: string | Date | number): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: publicationTimezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

export function vietnamInputToUtc(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  // datetime-local has no zone; this field always represents modern Vietnamese civil time.
  const date = new Date(`${value}:00+07:00`);
  if (!Number.isFinite(date.getTime()) || vietnamDateTimeInput(date) !== value) return null;
  return date.toISOString();
}

export function formatVietnamDateTime(value: string | Date): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { timeZone: publicationTimezone, dateStyle: 'short', timeStyle: 'short', hourCycle: 'h23' }).format(date);
}
