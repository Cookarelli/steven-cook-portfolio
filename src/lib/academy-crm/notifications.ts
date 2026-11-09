import type { Pool } from 'pg';
import { acknowledgment, businessNotification } from './templates';
import { getOfferSnapshot } from './model';
export interface MailConfig { resendKey?:string; from?:string; formsubmit:boolean }
export function mailConfig():MailConfig { return {resendKey:process.env.RESEND_API_KEY,from:process.env.ACADEMY_EMAIL_FROM,formsubmit:process.env.ACADEMY_NOTIFY_FORMSUBMIT!=='false'}; }
// Outbox is created in the same transaction as the lead. Provider acceptance is not delivery.
export async function processNotifications(pool:Pool,leadId:string,config:MailConfig,fetchImpl:typeof fetch=fetch) {
 const {rows}=await pool.query(`UPDATE academy_crm.notifications SET status='processing',attempts=attempts+1,updated_at=now()
 WHERE id IN (SELECT id FROM academy_crm.notifications WHERE lead_id=$1 AND status='pending' FOR UPDATE SKIP LOCKED)
 RETURNING *`,[leadId]);
 for(const job of rows) {
  let status='unconfigured', provider:string|null=null, providerId:string|null=null, error:string|null=null;
  try {
   const lead=(await pool.query('SELECT * FROM academy_crm.leads WHERE id=$1',[leadId])).rows[0];
   const business=job.kind==='business';
   const subject=business?`New Academy request: ${getOfferSnapshot(lead.program).title} (${lead.request_type})`:'Your Optimize Local AI Academy request';
   // Keep business alerts minimal: private lead details stay in the authenticated view.
   const text=business?businessNotification(lead.program,lead.request_type,lead.id):acknowledgment(lead.name,lead.program,lead.request_type,lead.id);
   let response:Response|undefined;
   if(config.resendKey && config.from) {
    provider='resend';
    response=await fetchImpl('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${config.resendKey}`,'Content-Type':'application/json','Idempotency-Key':`academy-${job.id}`},body:JSON.stringify({from:config.from,to:business?'optimizelocalai@gmail.com':lead.email,subject,text})});
    const data=await response.json();
    if(!response.ok || typeof data.id!=='string') throw new Error('Provider rejected notification');
    providerId=data.id;status='accepted';
   } else if(business && config.formsubmit) {
    provider='formsubmit';
    response=await fetchImpl('https://formsubmit.co/ajax/optimizelocalai@gmail.com',{method:'POST',signal:AbortSignal.timeout(10000),headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:subject,message:text,lead_id:lead.id})});
    const data=await response.json();
    if(!response.ok || ![true,'true'].includes(data.success)) throw new Error('Provider rejected notification');
    status='accepted';
   }
  } catch(e) {
   // Ambiguous network outcomes require review; never blindly retry and double-send.
   status=e instanceof Error && e.message==='Provider rejected notification'?'failed':'unknown';
   error=status==='failed'?'Provider rejected the request.':'Delivery outcome unknown; check provider before retrying.';
  }
  await pool.query('UPDATE academy_crm.notifications SET status=$2,provider=$3,provider_id=$4,error=$5,updated_at=now() WHERE id=$1',[job.id,status,provider,providerId,error]);
 }
 return (await pool.query('SELECT kind,status FROM academy_crm.notifications WHERE lead_id=$1',[leadId])).rows;
}
