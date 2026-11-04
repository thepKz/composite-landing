import { z } from 'zod';
import { requireAdmin,apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { readJson } from '@/lib/http';
const schema=z.object({name:z.string().trim().min(2).max(120),phone:z.string().max(25).refine(value=>!value||/^\+?[0-9\s().-]{9,25}$/.test(value)&&value.replace(/\D/g,'').length>=9),email:z.union([z.literal(''),z.email()]),address:z.string().max(500),zalo:z.string().max(200).refine(value=>!value||/^https:\/\/zalo\.me\/[0-9]+$/.test(value)),description:z.string().max(500)});
export async function GET(request:Request){try{await requireAdmin(request);return Response.json((await db.query("SELECT value FROM site_settings WHERE key='company'")).rows[0]?.value??{});}catch(error){return apiError(error);}}
export async function PUT(request:Request){try{await requireAdmin(request);const value=schema.parse(await readJson(request));await db.query("INSERT INTO site_settings(key,value) VALUES ('company',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()",[JSON.stringify(value)]);return Response.json(value);}catch(error){return apiError(error);}}
