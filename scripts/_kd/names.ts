import { db } from '../../src/lib/db';
console.log(JSON.stringify((await db.query("select name,slug from products where slug='bon-chua-hoa-chat'")).rows));
await db.end();
