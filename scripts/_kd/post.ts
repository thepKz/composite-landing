import { chromium } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { db } from '../../src/lib/db';
import { hashPassword } from '../../src/lib/security';
const origin='http://127.0.0.1:3002', out='docs/nang-cap-2026-11/vong-6/kiem-doc-lap';
const userId=randomUUID(), email=`kd6p-${userId}@example.test`, password=randomBytes(24).toString('hex');
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)',[userId,email,'Kiểm độc lập 6',await hashPassword(password)]);
 const ctx=await b.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}); const page=ctx.newPage? await ctx.newPage():null as any;
 const errs:string[]=[]; page.on('console',(m:any)=>{if(m.type()==='error')errs.push(m.text().slice(0,200));});
 await page.goto(origin+'/admin/login',{waitUntil:'networkidle'});
 await page.getByLabel('Email quản trị').fill(email); await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click(); await page.waitForURL(origin+'/admin');
 await page.goto(origin+'/admin/bai-viet/moi',{waitUntil:'networkidle'}); await page.waitForTimeout(800);
 console.log('acc buttons',await page.getByRole('button').evaluateAll((els:any[])=>els.map(e=>e.textContent.trim()).filter(t=>/bìa/i.test(t))));
 await page.screenshot({path:join(out,'r04-bai-viet-bia-mo.png')});
 console.log('after open',await page.getByRole('button').evaluateAll((els:any[])=>els.map(e=>e.textContent.trim()).filter(t=>/bìa|ảnh/i.test(t))));
 await page.getByRole('button',{name:'Chọn ảnh bìa',exact:true}).click(); await page.waitForTimeout(1000);
 await page.screenshot({path:join(out,'r05-bai-viet-hop-chon-bia.png')});
 console.log('tiles',await page.locator('[role=dialog] .adm-media-tile').count(),'title',await page.locator('[role=dialog] h2').allInnerTexts());
 await page.locator('[role=dialog] .adm-media-tile').first().click(); await page.waitForTimeout(300);
 console.log('bar',await page.locator('[role=dialog] .adm-pick-bar').allInnerTexts());
 console.log('multi-bar-present',await page.locator('[role=dialog] .is-multi').count());
 await page.screenshot({path:join(out,'r06-bai-viet-da-chon-1.png')});
 await page.getByRole('button',{name:'Chọn làm ảnh bìa',exact:true}).click(); await page.waitForTimeout(800);
 console.log('dialog',await page.locator('[role=dialog]').count(),'coverimgs',await page.locator('img[src*="/api/media/"]').count());
 await page.screenshot({path:join(out,'r07-bai-viet-co-bia.png')});
 // đổi ảnh: chọn ảnh khác, chọn 2 lần đổi ý
 await page.getByRole('button',{name:'Đổi ảnh',exact:true}).click(); await page.waitForTimeout(900);
 await page.locator('[role=dialog] .adm-media-tile').nth(1).click(); await page.locator('[role=dialog] .adm-media-tile').nth(2).click(); await page.waitForTimeout(200);
 console.log('single-select aria-pressed',await page.locator('[role=dialog] .adm-media-tile[aria-pressed=true]').count());
 await page.screenshot({path:join(out,'r08-bai-viet-doi-anh.png')});
 console.log('posts',(await db.query('select count(*)::int c from posts')).rows[0].c,'errs',errs);
}catch(e){console.log('LOI',String(e).slice(0,500));}
finally{await db.query('DELETE FROM users WHERE id=$1',[userId]);console.log('users',(await db.query('select count(*)::int c from users')).rows[0].c);await b.close();await db.end();}
