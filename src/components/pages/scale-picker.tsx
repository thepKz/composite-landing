'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Check, MoveHorizontal as SwipeIcon } from 'lucide-react';
import type { ScaleTable } from '@/lib/product-guidance';
import { QUOTE_SCALE_EVENT } from '@/components/inquiry-form';

type Ctx = { table?: ScaleTable; selected: number | null; select: (index: number | null) => void; productName: string };
const ScaleContext = createContext<Ctx>({ selected: null, select: () => {}, productName: '' });

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
}

// Báo cho biểu mẫu báo giá biết khách đã chọn quy mô nào (sự kiện cửa sổ, không tải lại trang).
function announceScale(productName: string, chip?: string, suggest?: string) {
  window.dispatchEvent(new CustomEvent(QUOTE_SCALE_EVENT, { detail: { product: productName, label: chip ?? '', hint: suggest ? 'Gợi ý ' + suggest.charAt(0).toLowerCase() + suggest.slice(1) : '' } }));
}

export function quoteFor(ctx: Pick<Ctx, 'table' | 'selected' | 'productName'>) {
  const row = ctx.table && ctx.selected !== null ? ctx.table.rows[ctx.selected] : undefined;
  announceScale(ctx.productName, row?.chip, row?.suggest);
  scrollToId('tu-van');
}

export function ScaleProvider({ table, productName, children }: { table?: ScaleTable; productName: string; children: ReactNode }) {
  const [selected, setSelected] = useState<number | null>(null);
  const value = useMemo<Ctx>(() => ({ table, selected, select: setSelected, productName }), [table, selected, productName]);
  // Khách bấm quy mô là biểu mẫu báo giá chọn sẵn quy mô đó, kể cả khi họ tự cuộn xuống biểu mẫu.
  useEffect(() => {
    if (!table) return;
    const row = selected !== null ? table.rows[selected] : undefined;
    announceScale(productName, row?.chip, row?.suggest);
  }, [selected, table, productName]);
  return <ScaleContext.Provider value={value}>{children}</ScaleContext.Provider>;
}

// Nút chọn nhanh quy mô, kiểu chọn cấu hình điện thoại: bấm một nút thì dòng bảng sáng lên và hiện gợi ý.
export function ScaleChips() {
  const ctx = useContext(ScaleContext);
  const { table, selected, select } = ctx;
  if (!table) return null;
  const row = selected !== null ? table.rows[selected] : null;
  return <div className="tp-scale">
    <p className="tp-scale-question" id="tp-scale-question">{table.question}</p>
    <div className="tp-scale-chips" role="group" aria-labelledby="tp-scale-question">
      {table.rows.map((item, index) => <button type="button" key={item.chip} className="tp-scale-chip pressable" aria-pressed={selected === index} onClick={() => select(selected === index ? null : index)}>
        {selected === index && <Check size={16} aria-hidden="true"/>}{item.chip}
      </button>)}
    </div>
    <div className={`tp-scale-result${row ? ' is-set' : ''}`} role="status" aria-live="polite">
      {row ? <div key={selected} className="tp-scale-answer">
        <div><span className="tp-scale-label">Gợi ý cho bạn</span><strong>{row.suggest}</strong></div>
        <button type="button" className="tp-text-link tp-link-button" onClick={() => scrollToId('tp-scale-table')}>Xem trong bảng <ArrowDown size={16} aria-hidden="true"/></button>
      </div> : <span className="tp-scale-hint">Bấm một quy mô để xem gợi ý dung tích.</span>}
    </div>
  </div>;
}

// Nút báo giá: cuộn tới biểu mẫu và ghi sẵn quy mô đã chọn.
export function QuoteButton({ className = 'tp-btn tp-btn-cta', label = 'Nhận báo giá' }: { className?: string; label?: string }) {
  const ctx = useContext(ScaleContext);
  return <button type="button" className={className} onClick={() => quoteFor(ctx)}>{label} <ArrowUpRight size={18} aria-hidden="true"/></button>;
}

// Bảng chọn dung tích. Máy bàn là bảng, cỡ trung cuộn ngang có cột đầu dính, điện thoại đổi thành thẻ từng dòng.
export function ScaleTableView() {
  const { table, selected, select } = useContext(ScaleContext);
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [table]);
  if (!table) return null;
  const [leadHead, ...restHeads] = table.columns;
  return <div className="tp-table-wrap" id="tp-scale-table">
    <div className={`tp-table-frame${edges.left ? ' edge-left' : ''}${edges.right ? ' edge-right' : ''}`}>
      <div className="tp-table-scroll" ref={scroller} role="region" aria-label={table.title} tabIndex={0}>
        <table className="tp-table">
          <thead><tr><th scope="col">{leadHead}</th>{restHeads.map(head => <th scope="col" key={head}>{head}</th>)}</tr></thead>
          <tbody>
            {table.rows.map((row, index) => <tr key={row.lead} className={selected === index ? 'is-active' : ''} onClick={() => select(selected === index ? null : index)}>
              <th scope="row"><button type="button" className="tp-row-pick" aria-pressed={selected === index} onClick={event => { event.stopPropagation(); select(selected === index ? null : index); }}>{row.lead}</button></th>
              {row.cells.map((cell, cellIndex) => <td key={cellIndex} data-label={restHeads[cellIndex]}>{cell}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    <p className="tp-table-hint"><SwipeIcon size={16} aria-hidden="true"/>Vuốt ngang để xem đủ các cột</p>
    {table.note && <p className="tp-table-note">{table.note}</p>}
  </div>;
}

// Thanh mua dính ở máy bàn kèm mục lục trang. Hiện khi phần đầu trang đã cuộn qua, ẩn khi tới biểu mẫu.
export function StickyBuyBar({ anchors }: { anchors: { id: string; label: string }[] }) {
  const ctx = useContext(ScaleContext);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const top = document.getElementById('tp-top');
    const form = document.getElementById('tu-van');
    if (!top) return;
    let topOut = false;
    let formIn = false;
    const apply = () => setVisible(topOut && !formIn);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === top) topOut = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (entry.target === form) formIn = entry.isIntersecting;
      });
      apply();
    }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
    observer.observe(top);
    if (form) observer.observe(form);
    const sections = anchors.map(anchor => document.getElementById(anchor.id)).filter((el): el is HTMLElement => !!el);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setCurrent(entry.target.id); });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => spy.observe(section));
    return () => { observer.disconnect(); spy.disconnect(); };
  }, [anchors]);
  const row = ctx.table && ctx.selected !== null ? ctx.table.rows[ctx.selected] : null;
  return <div className={`tp-sticky${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
    <div className="tp-wrap tp-sticky-inner">
      <div className="tp-sticky-name"><strong>{ctx.productName}</strong>{row && <span>{row.suggest}</span>}</div>
      <nav className="tp-sticky-nav" aria-label="Mục lục trang">
        {anchors.map(anchor => <a key={anchor.id} href={`#${anchor.id}`} tabIndex={visible ? 0 : -1} aria-current={current === anchor.id ? 'location' : undefined} onClick={event => { event.preventDefault(); scrollToId(anchor.id); }}>{anchor.label}</a>)}
      </nav>
      <button type="button" tabIndex={visible ? 0 : -1} className="tp-btn tp-btn-cta tp-btn-sm" onClick={() => quoteFor(ctx)}>Nhận báo giá <ArrowUpRight size={16} aria-hidden="true"/></button>
    </div>
  </div>;
}
