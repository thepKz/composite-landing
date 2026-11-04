import { randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
import { catalogue } from '../src/lib/catalogue';

try {
  for (const [index, product] of catalogue.entries()) {
    await db.query(`INSERT INTO products(id,slug,name,category,description,specifications,applications,is_published,sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,true,$8) ON CONFLICT(slug) DO NOTHING`,
      [randomUUID(), product.slug, product.name, product.category, product.description, JSON.stringify(product.specifications), JSON.stringify(product.applications), index]);
  }
  await db.query(`INSERT INTO site_settings(key,value) VALUES ('company',$1) ON CONFLICT(key) DO NOTHING`, [JSON.stringify({ name:'Thành Lợi Composite', phone:'', email:'', address:'Phú Thọ', zalo:'', description:'Bồn bể composite cho dân dụng, chăn nuôi, thủy sản và công nghiệp.' })]);
  console.log('Catalogue seeded without overwriting existing content.');
} finally { await db.end(); }
