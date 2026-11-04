import { safeLink } from './text';
import { RequestError } from './http';

export type RichNode={type:string;text?:string;attrs?:Record<string,unknown>;marks?:{type:string;attrs?:Record<string,unknown>}[];content?:RichNode[]};
export const mediaPath=/^\/api\/media\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
const allowed=new Set(['doc','paragraph','heading','text','bulletList','orderedList','listItem','blockquote','codeBlock','hardBreak','horizontalRule','image','video','table','tableRow','tableCell','tableHeader']);

export function cleanDocument(input:unknown):RichNode{
  let count=0;
  function clean(value:unknown,depth:number):RichNode{
    if(depth>30 || ++count>15000 || !value || typeof value!=='object')throw new RequestError('Nội dung quá phức tạp hoặc chưa hợp lệ.',400);
    const node=value as RichNode;
    if(!allowed.has(node.type))throw new RequestError('Nội dung có định dạng không được hỗ trợ.',400);
    const result:RichNode={type:node.type};
    if(node.type==='text'){
      if(typeof node.text!=='string' || node.text.length>100000)throw new RequestError('Đoạn văn chưa hợp lệ.',400);
      result.text=node.text;
      if(node.marks){
        if(!Array.isArray(node.marks)||node.marks.length>8)throw new RequestError('Định dạng chữ chưa hợp lệ.',400);
        result.marks=node.marks.map(mark=>{
          if(['bold','italic','strike','underline','code'].includes(mark.type))return {type:mark.type};
          if(mark.type==='link' && typeof mark.attrs?.href==='string' && mark.attrs.href.length<=2000 && safeLink(mark.attrs.href))return {type:'link',attrs:{href:mark.attrs.href}};
          throw new RequestError('Liên kết hoặc định dạng chữ chưa hợp lệ.',400);
        });
      }
    }
    if(node.type==='heading')result.attrs={level:[2,3,4].includes(Number(node.attrs?.level))?Number(node.attrs?.level):2};
    if(node.type==='orderedList')result.attrs={start:Math.max(1,Math.min(10000,Number(node.attrs?.start)||1))};
    if(['tableCell','tableHeader'].includes(node.type))result.attrs={colspan:Math.max(1,Math.min(20,Number(node.attrs?.colspan)||1)),rowspan:Math.max(1,Math.min(100,Number(node.attrs?.rowspan)||1))};
    if(['image','video'].includes(node.type)){
      if(typeof node.attrs?.src!=='string'||!mediaPath.test(node.attrs.src))throw new RequestError('Vui lòng chọn ảnh/video từ thư viện.',400);
      result.attrs={src:node.attrs.src,alt:String(node.attrs.alt??'').slice(0,500),title:String(node.attrs.title??'').slice(0,500)};
    }
    if(node.content){
      if(!Array.isArray(node.content))throw new RequestError('Nội dung chưa hợp lệ.',400);
      result.content=node.content.map(child=>clean(child,depth+1));
    }
    return result;
  }
  const result=clean(input,0);
  if(result.type!=='doc')throw new RequestError('Nội dung cần bắt đầu bằng một bài viết.',400);
  return result;
}
export function documentText(node:RichNode):string{return node.type==='text'?node.text??'':(node.content??[]).map(documentText).join(node.type==='paragraph'||node.type==='heading'?'':' ').trim();}
export function documentMedia(node:RichNode):string[]{
  const ids=new Set<string>();
  function visit(n:RichNode){if(['image','video'].includes(n.type)){const match=String(n.attrs?.src).match(mediaPath);if(match)ids.add(match[1]);}n.content?.forEach(visit);}
  visit(node);return [...ids];
}
