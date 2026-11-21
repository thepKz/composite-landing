import type { CSSProperties, ReactNode } from 'react';
import type { RichNode } from '@/lib/rich-text';
import { safeLink } from '@/lib/text';
import { headingIds } from '@/components/article/article-utils';

type Props = {
  document: RichNode;
  /** Bật khi hiển thị bài đăng công khai: mã neo cho tiêu đề, ảnh bấm phóng to, bảng cuộn riêng. */
  article?: boolean;
};

const aligns = new Set(['left', 'right', 'center', 'wide', 'full']);

function siteHost(): string {
  try { return new URL(process.env.SITE_URL || 'http://localhost').host; } catch { return ''; }
}

function isExternal(href: string, host: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try { return new URL(href).host !== host; } catch { return false; }
}

function imageWidth(value: unknown): number | null {
  const number = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(number) && number >= 10 && number <= 100 ? Math.round(number) : null;
}

export default function RichContent({ document, article = false }: Props) {
  const host = siteHost();
  const ids = article ? headingIds(document) : [];
  let headingIndex = 0;

  function render(node: RichNode, key: number): ReactNode {
    const children = node.content?.map(render);
    if (node.type === 'text') {
      let text: ReactNode = node.text;
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') text = <strong>{text}</strong>;
        if (mark.type === 'italic') text = <em>{text}</em>;
        if (mark.type === 'strike') text = <s>{text}</s>;
        if (mark.type === 'underline') text = <u>{text}</u>;
        if (mark.type === 'code') text = <code>{text}</code>;
        if (mark.type === 'link' && safeLink(String(mark.attrs?.href))) {
          const href = String(mark.attrs?.href);
          text = isExternal(href, host)
            ? <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>
            : <a href={href} rel="noopener noreferrer">{text}</a>;
        }
      }
      return <span key={key}>{text}</span>;
    }
    switch (node.type) {
      case 'doc': return <div className={article ? 'rich-content art-prose' : 'rich-content'} key={key}>{children}</div>;
      case 'paragraph': return <p key={key}>{children}</p>;
      case 'heading': {
        const level = Number(node.attrs?.level);
        const id = article ? ids[headingIndex] : undefined;
        headingIndex += 1;
        if (level === 3) return <h3 id={id} key={key}>{children}</h3>;
        if (level === 4) return <h4 id={id} key={key}>{children}</h4>;
        return <h2 id={id} key={key}>{children}</h2>;
      }
      case 'bulletList': return <ul key={key}>{children}</ul>;
      case 'orderedList': return <ol key={key} start={Number(node.attrs?.start) || 1}>{children}</ol>;
      case 'listItem': return <li key={key}>{children}</li>;
      case 'blockquote': return <blockquote key={key}>{children}</blockquote>;
      case 'codeBlock': return <pre key={key} tabIndex={0}><code>{children}</code></pre>;
      case 'hardBreak': return <br key={key} />;
      case 'horizontalRule': return <hr key={key} />;
      case 'image': {
        const src = String(node.attrs?.src);
        const alt = String(node.attrs?.alt ?? '');
        // Chú thích chỉ hiện khi người viết nhập riêng. Tiêu đề trùng hệt mô tả ảnh là chữ tự sinh nên bỏ.
        const rawCaption = String(node.attrs?.caption ?? node.attrs?.title ?? '').trim();
        const caption = node.attrs?.caption == null && rawCaption === alt.trim() ? '' : rawCaption;
        const align = aligns.has(String(node.attrs?.align)) ? String(node.attrs?.align) : 'center';
        const width = imageWidth(node.attrs?.width);
        const style = width ? ({ '--art-img-w': `${width}%` } as CSSProperties) : undefined;
        const img = <img src={src} alt={alt} loading="lazy" decoding="async" />;
        return <figure key={key} className={`art-figure art-align-${align}${width ? ' has-width' : ''}`} style={style}>
          {article ? <button type="button" className="art-zoom" data-zoom aria-label={`Xem ảnh lớn${alt ? `: ${alt}` : ''}`}>{img}</button> : img}
          {caption && <figcaption>{caption}</figcaption>}
        </figure>;
      }
      case 'video': {
        const caption = String(node.attrs?.caption ?? node.attrs?.title ?? '');
        return <figure key={key} className="art-figure art-align-wide"><video controls playsInline preload="metadata" src={String(node.attrs?.src)} aria-label={String(node.attrs?.alt || 'Video minh họa')} />{caption && <figcaption>{caption}</figcaption>}</figure>;
      }
      case 'table': {
        const rows = node.content ?? [];
        const headRows = rows.length > 1 && (rows[0].content ?? []).length > 0 && (rows[0].content ?? []).every(cell => cell.type === 'tableHeader') ? 1 : 0;
        const head = rows.slice(0, headRows).map(render);
        const body = rows.slice(headRows).map((row, index) => render(row, index + headRows));
        const scroller = <div className={article ? "table-scroll art-table" : "table-scroll"} data-table={article ? "" : undefined} role="region" aria-label="Bảng nội dung, cuộn ngang để xem thêm" tabIndex={0}>
          <table>{headRows > 0 && <thead>{head}</thead>}<tbody>{headRows > 0 ? body : rows.map(render)}</tbody></table>
        </div>;
        return article ? <div className="art-table-shell" key={key}>{scroller}</div> : <div key={key}>{scroller}</div>;
      }
      case 'tableRow': return <tr key={key}>{children}</tr>;
      case 'tableCell': return <td key={key} colSpan={Number(node.attrs?.colspan) || 1} rowSpan={Number(node.attrs?.rowspan) || 1}>{children}</td>;
      case 'tableHeader': return <th key={key} scope="col" colSpan={Number(node.attrs?.colspan) || 1} rowSpan={Number(node.attrs?.rowspan) || 1}>{children}</th>;
      default: return children ? <div key={key}>{children}</div> : null;
    }
  }
  return render(document, 0);
}
