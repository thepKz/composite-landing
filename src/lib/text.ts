export function slugify(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,120).replace(/-$/,'');}
export function safeLink(value:string){if(/[\u0000-\u0020\\]/.test(value))return false;if(value.startsWith('/')&&!value.startsWith('//'))return true;try{return ['https:','http:','mailto:','tel:'].includes(new URL(value).protocol);}catch{return false;}}
export function searchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim().replace(/\s+/g, ' ');
}
