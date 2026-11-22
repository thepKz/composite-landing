'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Search } from 'lucide-react';

type Kind = { value: string; label: string; count: number };
type Suggestion = { label: string; q: string };

function newsUrl(q: string, kind: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (kind) params.set('kind', kind);
  return `/tin-tuc${params.size ? `?${params}` : ''}`;
}

/**
 * Thanh lọc và tìm. Gõ là tìm (chờ 300 ms sau phím cuối), bấm thẻ loại là đổi ngay, có vạch chờ khi đang tải kết quả.
 * Không có JavaScript thì biểu mẫu vẫn gửi bằng nút Tìm như trang thường.
 */
export default function NewsToolbar({ q, kind, kinds, suggestions }: { q: string; kind: string; kinds: Kind[]; suggestions: Suggestion[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(q);
  const timer = useRef<number | undefined>(undefined);
  const first = useRef(true);

  useEffect(() => { setValue(q); }, [q]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const go = (next: string) => start(() => router.replace(newsUrl(next.trim(), kind), { scroll: false }));
  const onChange = (next: string) => {
    setValue(next);
    window.clearTimeout(timer.current);
    if (first.current) first.current = false;
    timer.current = window.setTimeout(() => { if (next.trim() !== q) go(next); }, 300);
  };

  return <section className="nl-toolbar" aria-label="Tìm và lọc bài viết" aria-busy={pending}>
    <nav className="nl-chips" aria-label="Loại nội dung">
      {kinds.map(item => {
        const active = kind === item.value;
        return <Link key={item.value || 'all'} href={newsUrl(q, item.value)} className={`nl-chip pressable${active ? ' is-active' : ''}`} aria-current={active ? 'true' : undefined}>{item.label}<span className="nl-chip-count">{item.count}</span></Link>;
      })}
    </nav>
    <form action="/tin-tuc" method="get" className="nl-search" role="search" onSubmit={event => { event.preventDefault(); window.clearTimeout(timer.current); go(value); }}>
      <label htmlFor="nl-q" className="nl-sr">Tìm bài viết</label>
      <Search size={20} aria-hidden="true" className="nl-search-icon" />
      <input id="nl-q" type="search" name="q" value={value} onChange={event => onChange(event.target.value)} maxLength={200} placeholder="Tìm bài viết" autoComplete="off" />
      {kind && <input type="hidden" name="kind" value={kind} />}
      <button type="submit" className="nl-btn pressable">Tìm</button>
    </form>
    <div className="nl-suggest" role="group" aria-label="Gợi ý tìm">{suggestions.map(item => <Link key={item.q} href={newsUrl(item.q, kind)} className={`nl-tag pressable${q === item.q ? ' is-active' : ''}`}>{item.label}</Link>)}</div>
    <span className="nl-busy" data-on={pending ? 'true' : 'false'} aria-hidden="true" />
  </section>;
}
