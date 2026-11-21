'use client';
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/react';
import { Plus, Bold, Italic, Link2, Heading2, Heading3, ImagePlus, Film, Table2, Minus, List, ListOrdered, Quote, AlignLeft, AlignCenter, Maximize2, Replace, Wand2, Trash2, Heading1 } from 'lucide-react';
import { searchText } from '@/lib/text';
import { imageWidths } from '@/lib/rich-text';
import { Tool } from './format-bar';
import { useEditorTick } from './use-tick';

type Range = { from: number; to: number };
type Overlay =
  | { kind: 'none' }
  | { kind: 'text'; x: number; y: number }
  | { kind: 'image'; x: number; y: number; pos: number }
  | { kind: 'slash'; x: number; y: number; query: string; range: Range }
  | { kind: 'plus'; x: number; y: number };

type SlashItem = { id: string; label: string; hint: string; keywords: string; icon: typeof Plus; run: (editor: Editor, range: Range) => void };

export type OverlayActions = {
  pickMedia: (kind: 'image' | 'video') => void;
  replaceImage: () => void;
  editImage: () => void;
  openLink: () => void;
};

/** Phím gõ do trình soạn chuyển cho lớp phủ (menu gõ dấu /) xử lý trước. */
export type KeyHandlerRef = MutableRefObject<((event: KeyboardEvent) => boolean) | null>;

function items(actions: OverlayActions): SlashItem[] {
  const clean = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range);
  return [
    { id: 'h2', label: 'Tiêu đề lớn', hint: 'Mở một phần mới của bài', keywords: 'tieu de heading h2 muc', icon: Heading2, run: (e, r) => clean(e, r).setHeading({ level: 2 }).run() },
    { id: 'h3', label: 'Tiêu đề vừa', hint: 'Chia nhỏ một phần', keywords: 'tieu de heading h3 muc nho', icon: Heading3, run: (e, r) => clean(e, r).setHeading({ level: 3 }).run() },
    { id: 'ul', label: 'Danh sách', hint: 'Các ý ngang hàng', keywords: 'danh sach gach dau dong bullet', icon: List, run: (e, r) => clean(e, r).toggleBulletList().run() },
    { id: 'ol', label: 'Danh sách đánh số', hint: 'Các bước theo thứ tự', keywords: 'danh sach so thu tu buoc number', icon: ListOrdered, run: (e, r) => clean(e, r).toggleOrderedList().run() },
    { id: 'quote', label: 'Trích dẫn', hint: 'Nhấn mạnh một câu', keywords: 'trich dan quote', icon: Quote, run: (e, r) => clean(e, r).toggleBlockquote().run() },
    { id: 'image', label: 'Ảnh', hint: 'Chọn từ thư viện hoặc tải mới', keywords: 'anh hinh image picture', icon: ImagePlus, run: (e, r) => { clean(e, r).run(); actions.pickMedia('image'); } },
    { id: 'video', label: 'Video', hint: 'Chọn video từ thư viện', keywords: 'video phim clip', icon: Film, run: (e, r) => { clean(e, r).run(); actions.pickMedia('video'); } },
    { id: 'table', label: 'Bảng', hint: 'Bảng ba hàng ba cột', keywords: 'bang table', icon: Table2, run: (e, r) => clean(e, r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { id: 'hr', label: 'Đường kẻ ngang', hint: 'Ngăn cách các phần', keywords: 'duong ke ngang hr', icon: Minus, run: (e, r) => clean(e, r).setHorizontalRule().run() },
  ];
}

export default function EditorOverlays({ editor, container, actions, keyHandler }: { editor: Editor | null; container: RefObject<HTMLDivElement | null>; actions: OverlayActions; keyHandler: KeyHandlerRef }) {
  useEditorTick(editor);
  const [plusOpen, setPlusOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const list = useMemo(() => items(actions), [actions]);

  let overlay: Overlay = { kind: 'none' };
  const host = container.current?.getBoundingClientRect();
  if (editor && host && editor.view) {
    const { state, view } = editor;
    const { selection } = state;
    if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
      const dom = view.nodeDOM(selection.from) as HTMLElement | null;
      const rect = dom?.getBoundingClientRect();
      if (rect) overlay = { kind: 'image', x: rect.left - host.left, y: rect.bottom - host.top + 8, pos: selection.from };
    } else if (selection instanceof TextSelection && view.hasFocus()) {
      const { $from } = selection;
      const text = $from.parent.textContent;
      const slash = selection.empty && $from.parent.type.name === 'paragraph' && /^\/[^\s]{0,20}$/.test(text) && $from.parentOffset === text.length;
      if (slash) {
        const coords = view.coordsAtPos(selection.from);
        overlay = { kind: 'slash', x: coords.left - host.left, y: coords.bottom - host.top + 6, query: text.slice(1), range: { from: $from.start(), to: selection.from } };
      } else if (!selection.empty) {
        const a = view.coordsAtPos(selection.from), b = view.coordsAtPos(selection.to);
        const middle = (a.left + b.right) / 2 - host.left;
        overlay = { kind: 'text', x: Math.min(Math.max(middle, 120), Math.max(120, host.width - 120)), y: Math.min(a.top, b.top) - host.top - 8 };
      } else if ($from.parent.type.name === 'paragraph' && text === '' && $from.depth === 1) {
        const coords = view.coordsAtPos(selection.from);
        overlay = { kind: 'plus', x: 0, y: coords.top - host.top };
        if (plusOpen) overlay = { kind: 'slash', x: 36, y: coords.bottom - host.top + 6, query: '', range: { from: selection.from, to: selection.from } };
      }
    } else if (plusOpen && selection instanceof TextSelection) {
      overlay = { kind: 'none' };
    }
  }

  const query = overlay.kind === 'slash' ? searchText(overlay.query) : '';
  const matches = overlay.kind === 'slash' ? list.filter(item => !query || searchText(`${item.label} ${item.keywords}`).split(' ').some(word => word.startsWith(query)) || searchText(item.label).startsWith(query)) : [];
  const safeIndex = Math.min(index, Math.max(0, matches.length - 1));

  useEffect(() => { setIndex(0); }, [overlay.kind === 'slash' ? overlay.query : '', overlay.kind]);
  useEffect(() => { if (overlay.kind !== 'slash' && overlay.kind !== 'plus') setPlusOpen(false); });

  const panelRef = useRef<HTMLDivElement>(null);
  const imagePos = overlay.kind === 'image' ? overlay.pos : -1;
  // Ảnh cao thì thanh ảnh nằm dưới màn hình: cuộn nhẹ để thấy đủ.
  useEffect(() => { if (imagePos >= 0) panelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [imagePos]);

  const slashRef = useRef({ overlay, matches, safeIndex });
  slashRef.current = { overlay, matches, safeIndex };
  keyHandler.current = event => {
    const { overlay: current, matches: found, safeIndex: at } = slashRef.current;
    if (current.kind !== 'slash') return false;
    if (event.key === 'ArrowDown') { setIndex((at + 1) % Math.max(1, found.length)); return true; }
    if (event.key === 'ArrowUp') { setIndex((at - 1 + found.length) % Math.max(1, found.length)); return true; }
    if (event.key === 'Escape') { setPlusOpen(false); if (current.query || !plusOpen) editor?.chain().focus().deleteRange(current.range).run(); return true; }
    if (event.key === 'Enter' || event.key === 'Tab') {
      const item = found[at];
      if (!item || !editor) return false;
      item.run(editor, current.range); setPlusOpen(false);
      return true;
    }
    return false;
  };

  if (!editor || overlay.kind === 'none') return null;

  if (overlay.kind === 'plus') {
    return <button type="button" className="ed-plus" style={{ top: overlay.y + 2 }} aria-label="Chèn khối" data-tip="Chèn khối (hoặc gõ dấu /)" onMouseDown={event => event.preventDefault()} onClick={() => setPlusOpen(true)}><Plus size={18} /></button>;
  }

  if (overlay.kind === 'slash') {
    return <div className="ed-slash" role="listbox" aria-label="Chèn khối" style={{ left: Math.max(0, overlay.x), top: overlay.y }} onMouseDown={event => event.preventDefault()}>
      {matches.length ? matches.map((item, position) => <button type="button" role="option" aria-selected={position === safeIndex} key={item.id} onMouseEnter={() => setIndex(position)} onClick={() => { item.run(editor, (overlay as { range: Range }).range); setPlusOpen(false); }}>
        <item.icon size={20} /><span><strong>{item.label}</strong><small>{item.hint}</small></span>
      </button>) : <p className="ed-slash-empty">Không có khối phù hợp. Nhấn Esc để thoát.</p>}
    </div>;
  }

  if (overlay.kind === 'text') {
    return <div className="ed-bubble" role="toolbar" aria-label="Định dạng chữ đã chọn" style={{ left: overlay.x, top: overlay.y }}>
      <Tool label="In đậm" shortcut="Ctrl+B" active={editor.isActive('bold')} onRun={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></Tool>
      <Tool label="In nghiêng" shortcut="Ctrl+I" active={editor.isActive('italic')} onRun={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></Tool>
      <Tool label="Liên kết" shortcut="Ctrl+K" active={editor.isActive('link')} onRun={actions.openLink}><Link2 size={17} /></Tool>
      <span className="ed-bubble-sep" aria-hidden="true" />
      <Tool label="Tiêu đề lớn" active={editor.isActive('heading', { level: 2 })} onRun={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading1 size={17} /></Tool>
      <Tool label="Tiêu đề vừa" active={editor.isActive('heading', { level: 3 })} onRun={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></Tool>
    </div>;
  }

  // Ảnh đang chọn: thanh công cụ ảnh
  const attrs = editor.getAttributes('image') as { alt?: string; align?: string; width?: number };
  const align = attrs.align || 'center';
  const width = Number(attrs.width) || 100;
  const missing = !String(attrs.alt ?? '').trim();
  const set = (patch: Record<string, unknown>) => editor.chain().updateAttributes('image', patch).run();
  return <div ref={panelRef} className="ed-image-panel" role="toolbar" aria-label="Chỉnh ảnh trong bài" style={{ left: Math.max(0, overlay.x), top: overlay.y }}>
    <label className="ed-alt-field" data-missing={missing}>Mô tả ảnh
      <input value={attrs.alt ?? ''} maxLength={500} placeholder="Ví dụ: Bể biogas composite đang hạ xuống hố" onChange={event => set({ alt: event.target.value })} />
    </label>
    {missing && <p className="ed-alt-hint" role="status">Hãy mô tả ảnh cho người khiếm thị và Google.</p>}
    <div className="ed-image-row">
      <div className="ed-group" role="group" aria-label="Căn ảnh">
        <Tool label="Căn trái" active={align === 'left'} onRun={() => set({ align: 'left' })}><AlignLeft size={18} /></Tool>
        <Tool label="Căn giữa" active={align === 'center'} onRun={() => set({ align: 'center' })}><AlignCenter size={18} /></Tool>
        <Tool label="Tràn rộng" active={align === 'wide'} onRun={() => set({ align: 'wide' })}><Maximize2 size={18} /></Tool>
      </div>
      <div className="ed-group" role="group" aria-label="Bề rộng ảnh">
        {imageWidths.map(value => <Tool text key={value} label={`Bề rộng ${value} phần trăm`} active={align !== 'wide' && width === value} disabled={align === 'wide'} onRun={() => set({ width: value })}>{value}%</Tool>)}
      </div>
    </div>
    <div className="ed-image-row">
      <Tool text label="Thay ảnh khác" onRun={actions.replaceImage}><Replace size={16} />Thay ảnh</Tool>
      <Tool text label="Cắt, xoay, lật ảnh" onRun={actions.editImage}><Wand2 size={16} />Chỉnh ảnh</Tool>
      <Tool text label="Xóa ảnh khỏi bài" onRun={() => editor.chain().focus().deleteSelection().run()}><Trash2 size={16} />Xóa</Tool>
    </div>
  </div>;
}
