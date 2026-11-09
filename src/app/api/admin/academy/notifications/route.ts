import { database } from '@/lib/academy-crm/database';
import { assertAdmin, errorResponse, json, readJson } from '@/lib/academy-crm/http';
import { CrmError } from '@/lib/academy-crm/model';
import { mailConfig, processNotifications } from '@/lib/academy-crm/notifications';
export const runtime='nodejs';
export async function POST(request:Request){
 try {
  assertAdmin(request);const raw=await readJson(request);
  if(!raw||typeof raw.leadId!=='string'||!/^[\da-f-]{36}$/i.test(raw.leadId))throw new CrmError(400,'Invalid lead ID.');
  const pool=database();
  await pool.query("UPDATE academy_crm.notifications SET status='pending',updated_at=now() WHERE lead_id=$1 AND status IN ('failed','unconfigured')",[raw.leadId]);
  // Interrupted processing becomes visibly unknown; an operator must inspect provider logs.
  await pool.query("UPDATE academy_crm.notifications SET status='unknown',error='Worker interrupted; check provider before resending.',updated_at=now() WHERE lead_id=$1 AND status='processing' AND updated_at<now()-interval '2 minutes'",[raw.leadId]);
  return json({notifications:await processNotifications(pool,raw.leadId,mailConfig())});
 }catch(error){return errorResponse(error);}
}
