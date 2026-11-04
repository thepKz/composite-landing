export function siteUrl(path='/'){return new URL(path,process.env.SITE_URL||'http://localhost:3000').toString();}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
