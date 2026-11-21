'use client';
import { useState, type ReactNode } from 'react';
import { ChevronDown, ImagePlus, Wand2, X, CheckCircle2, Circle, RefreshCw, History, LayoutTemplate, Globe, Link2, Image as ImageIcon, Send, CalendarClock, ClipboardCheck, Layers } from 'lucide-react';
import { formatVietnamDateTime, vietnamInputToUtc, type PublicationState } from '@/lib/post-time';
import type { PublicationAction } from '@/lib/publication';
import type { RichNode } from '@/lib/rich-text';
import { slugify } from '@/lib/text';
import { checklist, lengthTone, seoLimits, templates, topicGroups, type Template } from './guidance';
import type { Post } from './types';

function Section({ title, icon, open: initial = false, badge, children }: { title: string; icon: ReactNode; open?: boolean; badge?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(initial);
  return <section className="ed-section" data-open={open}>
    <button type="button" className="ed-section-head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span className="ed-section-icon">{icon}</span><span className="ed-section-title">{title}</span>{badge}<ChevronDown size={18} className="ed-chevron" aria-hidden="true" />
    </button>
    {open && <div className="ed-section-body">{children}</div>}
  </section>;
}

function Counter({ length, range, noun }: { length: number; range: { min: number; max: number }; noun: string }) {
  const tone = lengthTone(length, range);
  const percent = Math.min(100, Math.round(length / (range.max * 1.25) * 100));
  const text = tone === 'empty' ? `Để trống sẽ dùng ${noun} của bài` : tone === 'short' ? `${length} ký tự, nên từ ${range.min} đến ${range.max}` : tone === 'long' ? `${length} ký tự, dài hơn ${range.max} sẽ bị cắt bớt` : `${length} ký tự, độ dài tốt`;
  return <div className="ed-counter" data-tone={tone}>
    <div className="ed-counter-bar" aria-hidden="true"><i style={{ width: `${percent}%` }} /><b style={{ left: `${range.min / (range.max * 1.25) * 100}%` }} /><b style={{ left: `${range.max / (range.max * 1.25) * 100}%` }} /></div>
    <span>{text}</span>
  </div>;
}

export type SidePanelProps = {
  post: Post; state: PublicationState; busy: boolean; scheduleInput: string; scheduleMin: string; doc: RichNode;
  onScheduleInput: (value: string) => void;
  onChange: <K extends keyof Post>(key: K, value: Post[K]) => void;
  onSlug: (value: string) => void;
  onSave: (status: 'draft' | 'published', action?: PublicationAction) => void;
  onPickCover: () => void; onEditCover: () => void;
  onTemplate: (template: Template) => void; onTopic: (topic: string) => void;
  onRestore: (revision: NonNullable<Post['revisions']>[number]) => void;
};

export default function SidePanel(props: SidePanelProps) {
  const { post, state, busy, doc } = props;
  const slugOk = !post.slug || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug);
  const checks = checklist({ title: post.title, excerpt: post.excerpt, cover: Boolean(post.cover_id), content: doc, seoTitle: post.seo_title, seoDescription: post.seo_description });
  const todo = checks.filter(item => !item.ok).length;
  const shownTitle = (post.seo_title || post.title || 'Tiêu đề bài viết').slice(0, 60);
  const shownDescription = (post.seo_description || post.excerpt || 'Tóm tắt của bài sẽ hiện ở đây.').slice(0, 160);
  const path = `${post.kind === 'project' ? 'du-an' : 'tin-tuc'}/${post.slug || 'duong-dan-bai-viet'}`;

  return <div className="ed-panel">
    <Section open title="Xuất bản" icon={<Send size={18} />} badge={<span className={`status-badge ${state}`}>{state === 'scheduled' ? 'Đã hẹn đăng' : state === 'published' ? 'Đang đăng' : 'Bản nháp'}</span>}>
      {state === 'draft' && <p className="field-help">Bản nháp chỉ quản trị viên xem được. Bấm Xuất bản ở góc trên khi bài sẵn sàng.</p>}
      {state === 'published' && <p className="field-help">Bài đang hiện trên website. Sửa xong bấm Cập nhật bài để thay đổi hiện ra với khách.</p>}
      {state === 'scheduled' && post.published_at && <p className="field-help">Bài sẽ tự đăng lúc {formatVietnamDateTime(post.published_at)}. Trước giờ đó khách chưa thấy.</p>}
      <label>Hẹn giờ đăng
        <input type="datetime-local" suppressHydrationWarning value={props.scheduleInput} min={props.scheduleMin} onChange={event => props.onScheduleInput(event.target.value)} />
      </label>
      <p className="field-help">{props.scheduleInput && vietnamInputToUtc(props.scheduleInput) ? `Sẽ đăng lúc ${formatVietnamDateTime(vietnamInputToUtc(props.scheduleInput)!)}, giờ Việt Nam.` : 'Chọn ngày và giờ theo múi giờ Việt Nam (ngày, tháng, năm, giờ, phút).'}</p>
      <div className="ed-stack">
        <button type="button" className="button button-outline" disabled={busy || !props.scheduleInput} onClick={() => props.onSave('published', 'schedule')}><CalendarClock size={17} />{state === 'scheduled' ? 'Đổi lịch đăng' : 'Đặt lịch đăng'}</button>
        {state === 'scheduled' && <button type="button" className="button button-outline" disabled={busy} onClick={() => props.onSave('published', 'publish')}>Đăng ngay</button>}
        {state !== 'draft' && <button type="button" className="button button-outline" disabled={busy} onClick={() => props.onSave('draft')}>{state === 'scheduled' ? 'Hủy lịch, về nháp' : 'Chuyển về nháp'}</button>}
      </div>
    </Section>

    <Section title="Loại nội dung" icon={<Layers size={18} />}>
      <label>Bài này thuộc mục nào
        <select value={post.kind} onChange={event => props.onChange('kind', event.target.value as Post['kind'])}><option value="article">Kiến thức (mục Tin tức)</option><option value="project">Công trình (mục Dự án)</option></select>
      </label>
    </Section>

    <Section title="Đường dẫn" icon={<Link2 size={18} />}>
      <label>Địa chỉ của bài
        <input value={post.slug} maxLength={120} aria-invalid={!slugOk} onChange={event => props.onSlug(event.target.value)} />
      </label>
      {!slugOk && <p className="error-message" role="alert">Chỉ dùng chữ không dấu viết thường, số và dấu gạch nối.</p>}
      <p className="field-help">Bài sẽ có địa chỉ thanhloicomposite.com/{path}</p>
      <p className="field-help">Địa chỉ tự tạo từ tiêu đề, anh chị có thể sửa. Nếu đổi sau khi đã đăng, liên kết cũ vẫn tự chuyển tới địa chỉ mới.</p>
      <button type="button" className="link-button" onClick={() => props.onSlug(slugify(post.title))} disabled={!post.title}><RefreshCw size={16} />Tạo lại từ tiêu đề</button>
    </Section>

    <Section open title="Ảnh bìa" icon={<ImageIcon size={18} />}>
      {post.cover_id ? <div className="ed-cover"><img src={`/api/media/${post.cover_id}`} alt="Ảnh bìa đã chọn" /></div> : <div className="ed-cover ed-cover-empty"><ImagePlus size={28} /><span>Chưa có ảnh bìa</span></div>}
      <div className="ed-stack">
        <button type="button" className="button button-outline" onClick={props.onPickCover}><ImagePlus size={17} />{post.cover_id ? 'Đổi ảnh' : 'Chọn ảnh bìa'}</button>
        {post.cover_id && <button type="button" className="button button-outline" onClick={props.onEditCover}><Wand2 size={17} />Cắt đúng tỉ lệ bìa</button>}
        {post.cover_id && <button type="button" className="link-button" onClick={() => props.onChange('cover_id', null)}><X size={16} />Bỏ ảnh bìa</button>}
      </div>
      <p className="field-help">Ảnh bìa hiện đầu bài và trong danh sách tin. Nên chọn ảnh ngang, thấy rõ sản phẩm.</p>
    </Section>

    <Section title="Hiển thị trên Google" icon={<Globe size={18} />}>
      <p className="field-help">Để trống thì dùng tiêu đề và tóm tắt của bài. Google có thể hiển thị khác và không có cam kết thứ hạng.</p>
      <div className="ed-google" aria-label="Xem trước kết quả tìm kiếm">
        <span className="ed-google-site">Thành Lợi Composite</span>
        <span className="ed-google-url">thanhloicomposite.com/{path}</span>
        <strong>{shownTitle}</strong>
        <p>{shownDescription}</p>
      </div>
      <label>Tiêu đề trên Google<input maxLength={200} value={post.seo_title} onChange={event => props.onChange('seo_title', event.target.value)} /></label>
      <Counter length={post.seo_title.length} range={seoLimits.title} noun="tiêu đề" />
      <label>Mô tả trên Google<textarea maxLength={400} rows={3} value={post.seo_description} onChange={event => props.onChange('seo_description', event.target.value)} /></label>
      <Counter length={post.seo_description.length} range={seoLimits.description} noun="tóm tắt" />
    </Section>

    <Section title="Kiểm tra trước khi đăng" icon={<ClipboardCheck size={18} />} badge={<span className="ed-pill" data-ok={todo === 0}>{todo === 0 ? 'Đủ' : `${todo} gợi ý`}</span>}>
      <ul className="adm-checklist">{checks.map(item => <li key={item.id} data-todo={!item.ok}>{item.ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{item.text}</span></li>)}</ul>
      <p className="field-help">Đây chỉ là gợi ý, anh chị vẫn đăng được bất cứ lúc nào.</p>
    </Section>

    <Section title="Khung nội dung gợi ý" icon={<LayoutTemplate size={18} />}>
      <p className="field-help">Chọn một dàn ý để bắt đầu. Khung chỉ có tiêu đề các mục, anh chị tự điền nội dung đã xác nhận.</p>
      <div className="ed-stack">{templates.map(template => <button type="button" key={template.id} className="button button-outline" onClick={() => props.onTemplate(template)}>{template.label}</button>)}</div>
      <p className="adm-side-title">Chủ đề nên viết</p>
      {topicGroups.map(group => <div key={group.group} className="ed-topics"><p className="field-help"><strong>{group.group}</strong></p>{group.topics.map(topic => <button type="button" key={topic} className="ed-topic" onClick={() => props.onTopic(topic)}>{topic}</button>)}</div>)}
    </Section>

    {Boolean(post.revisions?.length) && <Section title="Lịch sử đã lưu" icon={<History size={18} />} badge={<span className="ed-pill">{post.revisions?.length}</span>}>
      <p className="field-help">Chọn một bản cũ để nạp vào trình soạn. Website chỉ đổi khi anh chị bấm lưu.</p>
      <div className="ed-stack">{post.revisions?.map(revision => <button type="button" key={revision.id} className="button button-outline button-small" onClick={() => props.onRestore(revision)}>{formatVietnamDateTime(revision.created_at)}</button>)}</div>
    </Section>}
  </div>;
}

