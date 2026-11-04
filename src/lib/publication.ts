import { RequestError } from './http';

export type PublicationAction = 'publish' | 'schedule' | 'save';
type PreviousPublication = { status: string; published_at: Date | string | null } | null;

export function resolvePublicationTime(status: 'draft' | 'published', action: PublicationAction | undefined, scheduledAt: string | undefined, previous: PreviousPublication, now: Date): Date | null {
  const previousTime = previous?.published_at ? new Date(previous.published_at) : null;
  if (status === 'draft') {
    if (action === 'schedule' || action === 'publish' || scheduledAt !== undefined) throw new RequestError('Lưu nháp không được kèm lệnh xuất bản hoặc lịch đăng.', 400);
    return previousTime && previousTime <= now ? previousTime : null;
  }
  if (action === 'schedule') {
    if (!scheduledAt || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(scheduledAt)) throw new RequestError('Chọn ngày và giờ xuất bản theo giờ Việt Nam (GMT+7).', 400);
    const scheduled = new Date(scheduledAt);
    if (!Number.isFinite(scheduled.getTime()) || scheduled.toISOString().slice(0,19) !== scheduledAt.slice(0,19) || scheduled <= now) throw new RequestError('Thời gian hẹn đăng phải ở tương lai. Vui lòng chọn lại giờ Việt Nam (GMT+7).', 400);
    return scheduled;
  }
  if (scheduledAt !== undefined) throw new RequestError('Thời gian hẹn đăng cần đi kèm thao tác đặt lịch.', 400);
  if (action === 'save' && previous?.status !== 'published') throw new RequestError('Hãy chọn xuất bản ngay hoặc đặt lịch cho bài viết.', 400);
  // Saving an existing scheduled post preserves its schedule; only an explicit publish action advances it.
  if (previous?.status === 'published' && previousTime && action !== 'publish') return previousTime;
  return previousTime && previousTime <= now ? previousTime : now;
}
