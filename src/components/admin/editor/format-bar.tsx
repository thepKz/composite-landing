'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Link2, ImagePlus, Film, Table2, Minus, Undo2, Redo2, MoreHorizontal, Rows3, Columns3, Trash2, TableProperties, ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { useEditorTick } from './use-tick';

type ToolProps = { label: string; shortcut?: string; active?: boolean; disabled?: boolean; onRun: () => void; children: React.ReactNode; text?: boolean };

/** Nút công cụ có chú giải khi rê chuột (kèm phím tắt). Giữ nguyên vùng chọn khi bấm. */
export function Tool({ label, shortcut, active, disabled, onRun, children, text }: ToolProps) {
  return <button type="button" className={text ? 'tool tool-text' : 'tool'} data-tip={shortcut ? `${label} (${shortcut})` : label} aria-label={label} aria-pressed={active === undefined ? undefined : active} disabled={disabled}
    onMouseDown={event => event.preventDefault()} onClick={onRun}>{children}</button>;
}

type MenuItem = { label: string; icon: ReactNode; onRun: () => void; active?: boolean; danger?: boolean };

/** Điện thoại hoặc khung thấp: ít nút hiện sẵn, phần còn lại gom vào menu "Thêm". */
function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 800px), (max-height: 520px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return compact;
}

/** Menu gom nút. Dùng vị trí cố định để không bị thanh công cụ cuộn ngang cắt mất. Esc đóng và tiêu điểm về nút. */
function MoreMenu({ label, items, icon }: { label: string; items: MenuItem[]; icon: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ top: number; left: number; max: number }>({ top: 0, left: 0, max: 300 });
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  function toggle() {
    if (!open && button.current) {
      const rect = button.current.getBoundingClientRect();
      const width = 248;
      setPlace({ top: rect.bottom + 4, left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), max: window.innerHeight - rect.bottom - 12 });
    }
    setOpen(value => !value);
  }
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => menu.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }), 30);
    const onDown = (event: MouseEvent | TouchEvent) => { if (!menu.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); button.current?.focus({ preventScroll: true }); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const list = [...(menu.current?.querySelectorAll<HTMLElement>('button') ?? [])];
        const at = list.indexOf(document.activeElement as HTMLElement);
        list[(at + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
        event.preventDefault();
      }
    };
    const close = () => setOpen(false);
    document.addEventListener('mousedown', onDown); document.addEventListener('touchstart', onDown); document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', close);
    return () => { window.clearTimeout(timer); document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', close); };
  }, [open]);
  return <>
    <button ref={button} type="button" className="tool tool-text" aria-haspopup="menu" aria-expanded={open} onMouseDown={event => event.preventDefault()} onClick={toggle}>{icon}{label}</button>
    {open && <div ref={menu} className="ed-more-menu" role="menu" aria-label={label} style={{ top: place.top, left: place.left, maxHeight: Math.max(160, place.max) }}>
      {items.map(item => <button type="button" role="menuitem" key={item.label} data-danger={item.danger || undefined} aria-pressed={item.active} onMouseDown={event => event.preventDefault()} onClick={() => { setOpen(false); item.onRun(); }}>{item.icon}<span>{item.label}</span></button>)}
    </div>}
  </>;
}

export default function FormatBar({ editor, onLink, onMedia }: { editor: Editor | null; onLink: () => void; onMedia: (kind: 'image' | 'video') => void }) {
  useEditorTick(editor);
  const compact = useCompact();
  if (!editor) return <div className="ed-toolbar" role="toolbar" aria-label="Công cụ soạn bài" />;
  const run = () => editor.chain().focus();
  const style = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p';
  const inTable = editor.isActive('table');
  const styleSelect = <select aria-label="Kiểu đoạn văn" value={style} onChange={event => { const value = event.target.value; if (value === 'p') run().setParagraph().run(); else run().setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run(); }}>
    <option value="p">Đoạn văn</option><option value="h2">Tiêu đề lớn</option><option value="h3">Tiêu đề vừa</option><option value="h4">Tiêu đề nhỏ</option>
  </select>;
  if (compact) {
    const more: MenuItem[] = [
      { label: 'In nghiêng', icon: <Italic size={18} />, active: editor.isActive('italic'), onRun: () => run().toggleItalic().run() },
      { label: 'Gạch chân', icon: <Underline size={18} />, active: editor.isActive('underline'), onRun: () => run().toggleUnderline().run() },
      { label: 'Gạch ngang chữ', icon: <Strikethrough size={18} />, active: editor.isActive('strike'), onRun: () => run().toggleStrike().run() },
      { label: 'Danh sách đánh số', icon: <ListOrdered size={18} />, active: editor.isActive('orderedList'), onRun: () => run().toggleOrderedList().run() },
      { label: 'Trích dẫn', icon: <Quote size={18} />, active: editor.isActive('blockquote'), onRun: () => run().toggleBlockquote().run() },
      { label: 'Liên kết', icon: <Link2 size={18} />, active: editor.isActive('link'), onRun: onLink },
      { label: 'Video', icon: <Film size={18} />, onRun: () => onMedia('video') },
      { label: 'Bảng', icon: <Table2 size={18} />, onRun: () => run().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
      { label: 'Đường kẻ ngang', icon: <Minus size={18} />, onRun: () => run().setHorizontalRule().run() },
      { label: 'Làm lại', icon: <Redo2 size={18} />, onRun: () => run().redo().run() },
    ];
    const tableMenu: MenuItem[] = [
      { label: 'Thêm hàng trên', icon: <ArrowUpToLine size={18} />, onRun: () => run().addRowBefore().run() },
      { label: 'Thêm cột trái', icon: <ArrowLeftToLine size={18} />, onRun: () => run().addColumnBefore().run() },
      { label: 'Bật tắt hàng tiêu đề', icon: <TableProperties size={18} />, active: editor.isActive('tableHeader'), onRun: () => run().toggleHeaderRow().run() },
      { label: 'Xóa hàng', icon: <Rows3 size={18} />, danger: true, onRun: () => run().deleteRow().run() },
      { label: 'Xóa cột', icon: <Columns3 size={18} />, danger: true, onRun: () => run().deleteColumn().run() },
      { label: 'Xóa bảng', icon: <Trash2 size={18} />, danger: true, onRun: () => run().deleteTable().run() },
    ];
    return <div className="ed-toolbar-wrap" data-compact="">
      <div className="ed-toolbar" role="toolbar" aria-label="Công cụ soạn bài">
        <Tool label="Hoàn tác" disabled={!editor.can().undo()} onRun={() => run().undo().run()}><Undo2 size={18} /></Tool>
        {styleSelect}
        <Tool label="In đậm" active={editor.isActive('bold')} onRun={() => run().toggleBold().run()}><Bold size={18} /></Tool>
        <Tool label="Danh sách" active={editor.isActive('bulletList')} onRun={() => run().toggleBulletList().run()}><List size={18} /></Tool>
        <Tool label="Chèn ảnh" onRun={() => onMedia('image')}><ImagePlus size={18} /></Tool>
        <MoreMenu label="Thêm" icon={<MoreHorizontal size={18} />} items={more} />
      </div>
      {inTable && <div className="ed-toolbar ed-table-tools" role="toolbar" aria-label="Công cụ bảng">
        <span className="ed-table-label"><Table2 size={16} /><span className="adm-sr">Bảng</span></span>
        <Tool text label="Thêm hàng dưới" onRun={() => run().addRowAfter().run()}><ArrowDownToLine size={16} />Thêm hàng</Tool>
        <Tool text label="Thêm cột phải" onRun={() => run().addColumnAfter().run()}><ArrowRightToLine size={16} />Thêm cột</Tool>
        <MoreMenu label="Sửa bảng" icon={<MoreHorizontal size={16} />} items={tableMenu} />
      </div>}
    </div>;
  }
  return <div className="ed-toolbar-wrap">
    <div className="ed-toolbar" role="toolbar" aria-label="Công cụ soạn bài">
      <div className="ed-group" role="group" aria-label="Hoàn tác">
        <Tool label="Hoàn tác" shortcut="Ctrl+Z" disabled={!editor.can().undo()} onRun={() => run().undo().run()}><Undo2 size={18} /></Tool>
        <Tool label="Làm lại" shortcut="Ctrl+Shift+Z" disabled={!editor.can().redo()} onRun={() => run().redo().run()}><Redo2 size={18} /></Tool>
      </div>
      <div className="ed-group" role="group" aria-label="Kiểu đoạn">
        {styleSelect}
      </div>
      <div className="ed-group" role="group" aria-label="Định dạng chữ">
        <Tool label="In đậm" shortcut="Ctrl+B" active={editor.isActive('bold')} onRun={() => run().toggleBold().run()}><Bold size={18} /></Tool>
        <Tool label="In nghiêng" shortcut="Ctrl+I" active={editor.isActive('italic')} onRun={() => run().toggleItalic().run()}><Italic size={18} /></Tool>
        <Tool label="Gạch chân" shortcut="Ctrl+U" active={editor.isActive('underline')} onRun={() => run().toggleUnderline().run()}><Underline size={18} /></Tool>
        <Tool label="Gạch ngang" shortcut="Ctrl+Shift+S" active={editor.isActive('strike')} onRun={() => run().toggleStrike().run()}><Strikethrough size={18} /></Tool>
      </div>
      <div className="ed-group" role="group" aria-label="Danh sách và trích dẫn">
        <Tool label="Danh sách" shortcut="Ctrl+Shift+8" active={editor.isActive('bulletList')} onRun={() => run().toggleBulletList().run()}><List size={18} /></Tool>
        <Tool label="Danh sách đánh số" shortcut="Ctrl+Shift+7" active={editor.isActive('orderedList')} onRun={() => run().toggleOrderedList().run()}><ListOrdered size={18} /></Tool>
        <Tool label="Trích dẫn" shortcut="Ctrl+Shift+B" active={editor.isActive('blockquote')} onRun={() => run().toggleBlockquote().run()}><Quote size={18} /></Tool>
      </div>
      <div className="ed-group" role="group" aria-label="Chèn">
        <Tool label="Liên kết" shortcut="Ctrl+K" active={editor.isActive('link')} onRun={onLink}><Link2 size={18} /></Tool>
        <Tool label="Chèn ảnh" onRun={() => onMedia('image')}><ImagePlus size={18} /></Tool>
        <Tool label="Chèn video" onRun={() => onMedia('video')}><Film size={18} /></Tool>
        <Tool label="Chèn bảng" active={inTable} onRun={() => run().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={18} /></Tool>
        <Tool label="Đường kẻ ngang" onRun={() => run().setHorizontalRule().run()}><Minus size={18} /></Tool>
      </div>
    </div>
    {inTable && <div className="ed-toolbar ed-table-tools" role="toolbar" aria-label="Công cụ bảng">
      <span className="ed-table-label"><Table2 size={16} />Bảng</span>
      <Tool text label="Thêm hàng trên" onRun={() => run().addRowBefore().run()}><ArrowUpToLine size={16} />Hàng trên</Tool>
      <Tool text label="Thêm hàng dưới" onRun={() => run().addRowAfter().run()}><ArrowDownToLine size={16} />Hàng dưới</Tool>
      <Tool text label="Thêm cột trái" onRun={() => run().addColumnBefore().run()}><ArrowLeftToLine size={16} />Cột trái</Tool>
      <Tool text label="Thêm cột phải" onRun={() => run().addColumnAfter().run()}><ArrowRightToLine size={16} />Cột phải</Tool>
      <Tool text label="Bật tắt hàng tiêu đề" active={editor.isActive('tableHeader')} onRun={() => run().toggleHeaderRow().run()}><TableProperties size={16} />Hàng tiêu đề</Tool>
      <Tool text label="Xóa hàng" onRun={() => run().deleteRow().run()}><Rows3 size={16} />Xóa hàng</Tool>
      <Tool text label="Xóa cột" onRun={() => run().deleteColumn().run()}><Columns3 size={16} />Xóa cột</Tool>
      <Tool text label="Xóa bảng" onRun={() => run().deleteTable().run()}><Trash2 size={16} />Xóa bảng</Tool>
    </div>}
  </div>;
}
