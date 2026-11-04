export function siteUrl(path='/'){return new URL(path,process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:'http://localhost:3000')).toString();}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
