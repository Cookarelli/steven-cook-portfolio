import { database } from '@/lib/academy-crm/database';
import { assertOrigin, errorResponse, json, readJson } from '@/lib/academy-crm/http';
import { CrmError, validateLead } from '@/lib/academy-crm/model';
import { captureLead } from '@/lib/academy-crm/store';
import { mailConfig, processNotifications } from '@/lib/academy-crm/notifications';
export const runtime='nodejs';
export async function POST(request:Request) {
 try {
  assertOrigin(request);
  const secret=process.env.ACADEMY_RATE_LIMIT_SECRET;
  if(!secret || secret.length<32) throw new CrmError(503,'Lead capture is not configured.');
  const input=validateLead(await readJson(request));
  // Vercel supplies this header; local/custom hosts deliberately share one fallback bucket.
  const ip=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||'unknown':'local';
  const pool=database();
  const saved=await captureLead(pool,input,request.headers.get('idempotency-key')??'',ip,secret);
  let notifications: {kind:string;status:string}[]=[];
  try {notifications=await processNotifications(pool,saved.id,mailConfig());} catch { /* Saved lead and durable outbox survive notification failure. */ }
  return json({id:saved.id,persisted:true,duplicate:saved.duplicate,notifications},saved.duplicate?200:201);
 } catch(error) {return errorResponse(error);}
}
