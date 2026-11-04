import type { ReactNode } from 'react';
import type { RichNode } from '@/lib/rich-text';
import { safeLink } from '@/lib/text';

export default function RichContent({document}:{document:RichNode}){
  function render(node:RichNode,key:number):ReactNode{
    const children=node.content?.map(render);
    if(node.type==='text'){
      let text:ReactNode=node.text;
      for(const mark of node.marks??[]){if(mark.type==='bold')text=<strong>{text}</strong>;if(mark.type==='italic')text=<em>{text}</em>;if(mark.type==='strike')text=<s>{text}</s>;if(mark.type==='underline')text=<u>{text}</u>;if(mark.type==='code')text=<code>{text}</code>;if(mark.type==='link'&&safeLink(String(mark.attrs?.href)))text=<a href={String(mark.attrs?.href)} rel="noopener noreferrer">{text}</a>;}
      return <span key={key}>{text}</span>;
    }
    switch(node.type){
      case 'doc':return <div className="rich-content" key={key}>{children}</div>;
      case 'paragraph':return <p key={key}>{children}</p>;
      case 'heading':return node.attrs?.level===3?<h3 key={key}>{children}</h3>:node.attrs?.level===4?<h4 key={key}>{children}</h4>:<h2 key={key}>{children}</h2>;
      case 'bulletList':return <ul key={key}>{children}</ul>;
      case 'orderedList':return <ol key={key} start={Number(node.attrs?.start)||1}>{children}</ol>;
      case 'listItem':return <li key={key}>{children}</li>;
      case 'blockquote':return <blockquote key={key}>{children}</blockquote>;
      case 'codeBlock':return <pre key={key}><code>{children}</code></pre>;
      case 'hardBreak':return <br key={key}/>;
      case 'horizontalRule':return <hr key={key}/>;
      case 'image':return <figure key={key}><img src={String(node.attrs?.src)} alt={String(node.attrs?.alt??'')} loading="lazy"/>{Boolean(node.attrs?.title)&&<figcaption>{String(node.attrs?.title)}</figcaption>}</figure>;
      case 'video':return <figure key={key}><video controls preload="metadata" src={String(node.attrs?.src)} aria-label={String(node.attrs?.alt||'Video minh họa')}/>{Boolean(node.attrs?.title)&&<figcaption>{String(node.attrs?.title)}</figcaption>}</figure>;
      case 'table':return <div className="table-scroll" key={key} role="region" aria-label="Bảng nội dung, cuộn ngang để xem thêm" tabIndex={0}><table><tbody>{children}</tbody></table></div>;
      case 'tableRow':return <tr key={key}>{children}</tr>;
      case 'tableCell':return <td key={key} colSpan={Number(node.attrs?.colspan)||1} rowSpan={Number(node.attrs?.rowspan)||1}>{children}</td>;
      case 'tableHeader':return <th key={key} colSpan={Number(node.attrs?.colspan)||1} rowSpan={Number(node.attrs?.rowspan)||1}>{children}</th>;
      default:return null;
    }
  }
  return render(document,0);
}
