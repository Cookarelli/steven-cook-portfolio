import { createHash, createHmac, randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { consentVersion, courseUpdatesConsentVersion, privacyAgreementVersion, freeDiscoveryService, getOfferSnapshot, leadNotes, CrmError, type LeadInput, type LeadStatus, statuses } from './model';
export async function captureLead(pool: Pool, input: LeadInput, key: string, ip: string, rateSecret: string) {
 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) throw new CrmError(400,'Invalid submission identifier. Reload the form.');
 const fingerprint=createHash('sha256').update(JSON.stringify(input)).digest('hex');
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  // Serialize same-key retries and same-content concurrent submissions across instances.
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[key]);
  const previous=await client.query('SELECT * FROM academy_crm.submissions WHERE key=$1',[key]);
  if(previous.rows.length) {
   if(previous.rows[0].fingerprint!==fingerprint) throw new CrmError(409,'This submission identifier was already used. Start a new request.');
   await client.query('COMMIT'); return {id:previous.rows[0].lead_id as string,duplicate:true};
  }
  for(const value of [`ip:${ip}`,`email:${input.email}`]) {
   const bucket=createHmac('sha256',rateSecret).update(value).digest('hex');
   const rate=await client.query(`INSERT INTO academy_crm.rate_limits(bucket,hits,expires_at) VALUES($1,1,now()+interval '15 minutes')
    ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN academy_crm.rate_limits.expires_at<now() THEN 1 ELSE academy_crm.rate_limits.hits+1 END,
    expires_at=CASE WHEN academy_crm.rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE academy_crm.rate_limits.expires_at END RETURNING hits`,[bucket]);
   if(rate.rows[0].hits>5) { await client.query('COMMIT'); throw new CrmError(429,'Too many requests. Please try again in 15 minutes.'); }
  }
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,1))',[fingerprint]);
  const duplicate=await client.query("SELECT id FROM academy_crm.leads WHERE fingerprint=$1 AND created_at>now()-interval '10 minutes' ORDER BY created_at DESC LIMIT 1",[fingerprint]);
  const id=duplicate.rows[0]?.id??randomUUID();
  if(!duplicate.rows.length) {
   await client.query(`INSERT INTO academy_crm.leads(id,name,email,phone,program,request_type,source,contact_method,status,notes,transaction_reference,marketing_consent,marketing_consent_at,marketing_consent_version,course_updates_consent,fingerprint)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now(),$13,$14,$15)`,[id,input.name,input.email,input.phone||null,input.program,input.requestType,input.source,input.contactMethod,input.requestType==='payment-verification'?'Payment Pending':'New',leadNotes(input),input.transactionReference||null,input.marketingConsent,consentVersion,input.courseUpdatesConsent,fingerprint]);
   await client.query(`INSERT INTO academy_crm.events(lead_id,actor,event,details) VALUES($1,'prospect','created',$2)`,[id,JSON.stringify({
    marketingConsent:input.marketingConsent,courseUpdatesConsent:input.courseUpdatesConsent,consentVersion,
    context:{business:input.business,timeZone:input.timeZone,goal:input.goal},
    privacyAgreement:true,privacyAgreementVersion,
    consents:{privacyNotice:{agreed:true,version:privacyAgreementVersion},marketing:{agreed:input.marketingConsent,version:consentVersion},courseUpdates:{agreed:input.courseUpdatesConsent,version:courseUpdatesConsentVersion}},
    offerSnapshot:getOfferSnapshot(input.program),
    ...(input.requestType==='consultation'?{requestedService:{...freeDiscoveryService}}:{}),
   })]);
   for(const kind of ['business','acknowledgment']) await client.query(`INSERT INTO academy_crm.notifications(id,lead_id,kind,status) VALUES($1,$2,$3,'pending')`,[randomUUID(),id,kind]);
  }
  await client.query('INSERT INTO academy_crm.submissions(key,fingerprint,lead_id) VALUES($1,$2,$3)',[key,fingerprint,id]);
  await client.query("DELETE FROM academy_crm.rate_limits WHERE expires_at<now()-interval '1 day'");
  await client.query('COMMIT'); return {id:id as string,duplicate:duplicate.rows.length>0};
 } catch(error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function listLeads(pool:Pool, filters:{status?:string;program?:string;source?:string;offset?:number}={}) {
 const result=await pool.query(`SELECT l.*, COALESCE((SELECT jsonb_agg(jsonb_build_object('id',n.id,'kind',n.kind,'status',n.status,'attempts',n.attempts,'error',n.error)) FROM academy_crm.notifications n WHERE n.lead_id=l.id),'[]') AS notifications
 FROM academy_crm.leads l WHERE ($1::text IS NULL OR status=$1) AND ($2::text IS NULL OR program=$2) AND ($3::text IS NULL OR source=$3)
 ORDER BY created_at DESC,id LIMIT 500 OFFSET $4`,[filters.status||null,filters.program||null,filters.source||null,filters.offset??0]);
 return result.rows;
}
export async function updateLead(pool:Pool,id:string,raw:Record<string,unknown>) {
 if(!statuses.includes(raw.status as LeadStatus)) throw new CrmError(400,'Invalid status.');
 if(typeof raw.note!=='string'||raw.note.length>2000||/\b(?:\d[ -]?){12,19}\b/.test(raw.note)||/(?:password|api[_ -]?key|secret|cvv|routing number|account number)\s*[:=]/i.test(raw.note)) throw new CrmError(400,'Use a brief note without financial credentials or secrets.');
 const follow=raw.nextFollowUpAt;
 if(follow!==null && (typeof follow!=='string'||!Number.isFinite(Date.parse(follow)))) throw new CrmError(400,'Invalid follow-up date.');
 if(raw.status==='Payment Verified' && raw.confirmPaymentVerified!==true) throw new CrmError(400,'Confirm that payment was independently verified with the payment provider.');
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  const before=await client.query('SELECT status,email FROM academy_crm.leads WHERE id=$1 FOR UPDATE',[id]);
  if(!before.rows.length) throw new CrmError(404,'Lead not found.');
  await client.query(`UPDATE academy_crm.leads SET status=$2,next_follow_up_at=$3,notes=CASE WHEN $4='' THEN notes ELSE notes || E'\\n' || $4 END, marketing_consent=CASE WHEN $5 THEN false ELSE marketing_consent END, updated_at=now() WHERE id=$1`,[id,raw.status,follow,raw.note,raw.withdrawMarketingConsent===true]);
  await client.query(`INSERT INTO academy_crm.events(lead_id,actor,event,details) VALUES($1,'business-admin','updated',$2)`,[id,JSON.stringify({previousStatus:before.rows[0].status,status:raw.status,note:raw.note,nextFollowUpAt:follow,paymentIndependentlyVerified:raw.confirmPaymentVerified===true,marketingConsentWithdrawn:raw.withdrawMarketingConsent===true})]);
  if(raw.withdrawMarketingConsent===true || raw.withdrawCourseUpdates===true) {
   await client.query(`WITH withdrawn AS (UPDATE academy_crm.leads SET marketing_consent=CASE WHEN $2 THEN false ELSE marketing_consent END, marketing_consent_at=CASE WHEN $2 THEN now() ELSE marketing_consent_at END,course_updates_consent=CASE WHEN $3 THEN false ELSE course_updates_consent END,updated_at=now() WHERE email=$1 RETURNING id) INSERT INTO academy_crm.events(lead_id,actor,event,details) SELECT id,'business-admin','consent-withdrawn',$4::jsonb FROM withdrawn`,[before.rows[0].email,raw.withdrawMarketingConsent===true,raw.withdrawCourseUpdates===true,JSON.stringify({marketing:raw.withdrawMarketingConsent===true,courseUpdates:raw.withdrawCourseUpdates===true})]);
  }
  await client.query('COMMIT');
 } catch(e) { await client.query('ROLLBACK');throw e; } finally {client.release();}
}
