'use client';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Link2, ImagePlus, Film, Table2, Minus, Undo2, Redo2, Rows3, Columns3, Trash2, TableProperties, ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine } from 'lucide-react';
import { useEditorTick } from './use-tick';

type ToolProps = { label: string; shortcut?: string; active?: boolean; disabled?: boolean; onRun: () => void; children: React.ReactNode; text?: boolean };

/** Nút công cụ có chú giải khi rê chuột (kèm phím tắt). Giữ nguyên vùng chọn khi bấm. */
export function Tool({ label, shortcut, active, disabled, onRun, children, text }: ToolProps) {
  return <button type="button" className={text ? 'tool tool-text' : 'tool'} data-tip={shortcut ? `${label} (${shortcut})` : label} aria-label={label} aria-pressed={active === undefined ? undefined : active} disabled={disabled}
    onMouseDown={event => event.preventDefault()} onClick={onRun}>{children}</button>;
}

export default function FormatBar({ editor, onLink, onMedia }: { editor: Editor | null; onLink: () => void; onMedia: (kind: 'image' | 'video') => void }) {
  useEditorTick(editor);
  if (!editor) return <div className="ed-toolbar" role="toolbar" aria-label="Công cụ soạn bài" />;
  const run = () => editor.chain().focus();
  const style = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p';
  const inTable = editor.isActive('table');
  return <div className="ed-toolbar-wrap">
    <div className="ed-toolbar" role="toolbar" aria-label="Công cụ soạn bài">
      <div className="ed-group" role="group" aria-label="Hoàn tác">
        <Tool label="Hoàn tác" shortcut="Ctrl+Z" disabled={!editor.can().undo()} onRun={() => run().undo().run()}><Undo2 size={18} /></Tool>
        <Tool label="Làm lại" shortcut="Ctrl+Shift+Z" disabled={!editor.can().redo()} onRun={() => run().redo().run()}><Redo2 size={18} /></Tool>
      </div>
      <div className="ed-group" role="group" aria-label="Kiểu đoạn">
        <select aria-label="Kiểu đoạn văn" value={style} onChange={event => { const value = event.target.value; if (value === 'p') run().setParagraph().run(); else run().setHeading({ level: Number(value.slice(1)) as 2 | 3 | 4 }).run(); }}>
          <option value="p">Đoạn văn</option><option value="h2">Tiêu đề lớn</option><option value="h3">Tiêu đề vừa</option><option value="h4">Tiêu đề nhỏ</option>
        </select>
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
