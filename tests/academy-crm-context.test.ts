import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import { academyPrograms } from '../src/config/ai-academy';
import { consentVersion, courseUpdatesConsentVersion, privacyAgreementVersion, freeDiscoveryService, getOfferSnapshot, leadNotes, validateLead } from '../src/lib/academy-crm/model';
import { captureLead } from '../src/lib/academy-crm/store';
import { processNotifications } from '../src/lib/academy-crm/notifications';
import { acknowledgment, businessNotification } from '../src/lib/academy-crm/templates';

// No database connection or provider transport is created by this test file.
const input = (extra: Record<string, unknown> = {}) => validateLead({
 name:'Synthetic Learner',email:'learner@example.invalid',program:'ai-made-simple',
 requestType:'inquiry',contactMethod:'email',privacyAgreement:true,...extra,
});

test('privacy agreement is explicit and versioned by the server, independently of marketing', () => {
 for (const privacyAgreement of [undefined,false,'yes',1]) assert.throws(()=>input({privacyAgreement}));
 const saved=input({privacyAgreementVersion:'forged-client-version',marketingConsent:false,courseUpdatesConsent:true});
 assert.equal(saved.privacyAgreement,true);
 assert.equal(saved.privacyAgreementVersion,privacyAgreementVersion);
 assert.equal(saved.marketingConsent,false);
 assert.equal(saved.courseUpdatesConsent,false);
 assert.equal(input({program:'21-day-ai-confidence',requestType:'waitlist',courseUpdatesConsent:true}).marketingConsent,false);
 assert.throws(()=>input({program:'21-day-ai-confidence',requestType:'waitlist',courseUpdatesConsent:false}));
});

test('optional context is trimmed and bounded, and rejects credentials and malformed single-line fields', () => {
 const saved=input({business:'  Synthetic Workshop  ',timeZone:'  Central Time (Chicago)  ',goal:'  Draft a reusable reply for review.  '});
 assert.equal(saved.business,'Synthetic Workshop');
 assert.equal(saved.timeZone,'Central Time (Chicago)');
 assert.equal(saved.goal,'Draft a reusable reply for review.');
 for (const extra of [{business:42},{business:'x'.repeat(161)},{timeZone:'x'.repeat(101)},{goal:'x'.repeat(801)},{business:'One\nTwo'},{timeZone:'Central\rInjected'},{goal:'password: do-not-store'},{business:'api_key=do-not-store'},{goal:'4111 1111 1111 1111'}]) assert.throws(()=>input(extra));
 assert.equal(input().business,'');
 assert.equal(input().timeZone,'');
 assert.equal(input().goal,'');
});

test('payment verification keeps the reference-only boundary and no appended context', () => {
 const payment={requestType:'payment-verification',program:'ai-for-business',transactionReference:'SYNTHETIC-REF-123'};
 const saved=input(payment);
 assert.equal(leadNotes(saved),'');
 for (const extra of [{business:'Synthetic Company'},{timeZone:'America/Chicago'},{goal:'Schedule a session'},{notes:'Extra payment notes'}]) assert.throws(()=>input({...payment,...extra}));
 assert.throws(()=>input({...payment,transactionReference:'4111111111111111'}));
});

test('capture keeps context, separate consent versions and a trusted offer snapshot in the existing transaction', async () => {
 const calls:{sql:string;values:unknown[]}[]=[];
 const client={
  query:async(sql:string,values:unknown[]=[])=>{
   calls.push({sql,values});
   return {rows:sql.includes('RETURNING hits')?[{hits:1}]:[]};
  },
  release:()=>{},
 };
 const pool={connect:async()=>client} as unknown as Pool;
 const saved=input({business:'Synthetic Company',timeZone:'Central Time (Chicago)',goal:'Prepare a reviewed customer reply',notes:'Evenings preferred',offerSnapshot:{title:'Forged offer',price:1}});
 const result=await captureLead(pool,saved,randomUUID(),'synthetic-ip','synthetic-rate-secret');
 assert.equal(result.duplicate,false);
 const lead=calls.find(c=>c.sql.startsWith('INSERT INTO academy_crm.leads'))!;
 assert.match(String(lead.values[9]),/Evenings preferred\nBusiness: Synthetic Company\nPreferred time zone \(not a booking\): Central Time \(Chicago\)\nLearning goal: Prepare a reviewed customer reply/);
 const event=calls.find(c=>c.sql.startsWith('INSERT INTO academy_crm.events'))!;
 const details=JSON.parse(String(event.values[1]));
 assert.deepEqual(details.context,{business:saved.business,timeZone:saved.timeZone,goal:saved.goal});
 assert.equal(details.privacyAgreement,true);
 assert.equal(details.privacyAgreementVersion,privacyAgreementVersion);
 assert.deepEqual(details.consents,{
  privacyNotice:{agreed:true,version:privacyAgreementVersion},
  marketing:{agreed:false,version:consentVersion},
  courseUpdates:{agreed:false,version:courseUpdatesConsentVersion},
 });
 assert.deepEqual(details.offerSnapshot,getOfferSnapshot(saved.program));
 assert.notEqual(details.offerSnapshot.title,'Forged offer');
 assert.equal(calls.filter(c=>c.sql.startsWith('INSERT INTO academy_crm.notifications')).length,2);
 assert.ok(calls.indexOf(event)<calls.findIndex(c=>c.sql==='COMMIT'));
 assert.equal(calls.at(-1)?.sql,'COMMIT');
 assert.doesNotMatch(lead.sql,/business|time_zone|privacy_agreement|goal/);
});

test('program messages use exact configured offer terms and keep general and coming-soon states honest', () => {
 for (const program of academyPrograms) {
  const offer=getOfferSnapshot(program.slug);
  for (const text of [acknowledgment('Synthetic Learner',program.slug,'inquiry','SYNTHETIC-ID'),businessNotification(program.slug,'inquiry','SYNTHETIC-ID')]) {
   assert.ok(text.includes(program.title));
   assert.ok(text.includes(`$${program.price} USD`));
   assert.ok(text.includes(program.duration));
   assert.ok(text.includes(`Delivery: ${offer.delivery}`));
   assert.match(text,/No (?:appointment|payment)/);
  }
 }
 const general=acknowledgment('Synthetic Learner','general','inquiry','SYNTHETIC-ID');
 assert.match(general,/Price: To be confirmed after choosing a program/);
 assert.doesNotMatch(general,/\$0/);
 const waitlist=acknowledgment('Synthetic Learner','21-day-ai-confidence','waitlist','SYNTHETIC-ID');
 assert.match(waitlist,/Planned price: \$79 USD/);
 assert.match(waitlist,/Joining the update list is free/);
 assert.match(waitlist,/not yet available to purchase or access/);
 const payment=acknowledgment('Synthetic Learner','ai-for-business','payment-verification','SYNTHETIC-ID');
 assert.match(payment,/awaiting independent manual review/);
 assert.match(payment,/does not verify payment/);
});

test('a paid program chosen for a consultation is only interest; the requested service stays free and 20 minutes', async () => {
 const saved=input({program:'ai-for-business',requestType:'consultation',requestedService:{kind:'paid-session',price:99,durationMinutes:90}});
 const details:Record<string,unknown>[]=[];
 const client={query:async(sql:string,values:unknown[]=[])=>{
  if(sql.startsWith('INSERT INTO academy_crm.events'))details.push(JSON.parse(String(values[1])));
  return {rows:sql.includes('RETURNING hits')?[{hits:1}]:[]};
 },release:()=>{}};
 await captureLead({connect:async()=>client} as unknown as Pool,saved,randomUUID(),'synthetic-ip','synthetic-rate-secret');
 assert.deepEqual(details[0].requestedService,freeDiscoveryService);
 assert.deepEqual(details[0].offerSnapshot,getOfferSnapshot('ai-for-business'));
 assert.equal((details[0].offerSnapshot as {price:number}).price,99);
 for(const text of [acknowledgment(saved.name,saved.program,saved.requestType,'SYNTHETIC-ID'),businessNotification(saved.program,saved.requestType,'SYNTHETIC-ID')]) {
  assert.match(text,/Requested appointment: FREE 20-minute discovery consultation/);
  assert.match(text,/Requested price: \$0 USD/);
  assert.match(text,/Requested duration: 20 minutes/);
  assert.match(text,/Selected program — interest only; no paid slot is reserved/);
  assert.match(text,/AI for Small Business Owners/);
  assert.match(text,/Price: \$99 USD/);
  assert.match(text,/No appointment time is confirmed/);
 }
});

test('notification transport is mocked and ignores client-like offer fields without leaking context in business alerts', async () => {
 const jobs=[{id:'synthetic-business-job',kind:'business'},{id:'synthetic-ack-job',kind:'acknowledgment'}];
 const statuses=new Map<string,string>();
 const sent:{url:string;body:{to:string;subject:string;text:string};key:string}[]=[];
 const lead={id:'SYNTHETIC-ID',name:'Synthetic Learner',email:'learner@example.invalid',program:'ai-for-business',request_type:'inquiry',notes:'PRIVATE-SYNTHETIC-CONTEXT',title:'FORGED',price:1,duration:'FORGED',delivery:'FORGED'};
 const pool={query:async(sql:string,values:unknown[]=[])=>{
  if (sql.includes("SET status='processing'")) return {rows:jobs};
  if (sql.startsWith('SELECT * FROM academy_crm.leads')) return {rows:[lead]};
  if (sql.startsWith('UPDATE academy_crm.notifications SET status=$2')) {statuses.set(String(values[0]),String(values[1]));return {rows:[]};}
  if (sql.startsWith('SELECT kind,status')) return {rows:jobs.map(j=>({kind:j.kind,status:statuses.get(j.id)}))};
  throw new Error('Unexpected mock query');
 }} as unknown as Pool;
 const fetchMock:typeof fetch=async(url,init)=>{
  sent.push({url:String(url),body:JSON.parse(String(init?.body)),key:(init?.headers as Record<string,string>)['Idempotency-Key']});
  return Response.json({id:`synthetic-provider-${sent.length}`});
 };
 const result=await processNotifications(pool,'SYNTHETIC-ID',{formsubmit:false,resendKey:'synthetic-key',from:'sender@example.invalid'},fetchMock);
 assert.equal(sent.length,2);
 const program=academyPrograms.find(p=>p.slug==='ai-for-business')!;
 for (const message of sent) {
  assert.equal(message.url,'https://api.resend.com/emails');
  assert.ok(message.key.startsWith('academy-synthetic-'));
  assert.ok(message.body.text.includes(program.title));
  assert.ok(message.body.text.includes(`$${program.price} USD`));
  assert.ok(message.body.text.includes(program.duration));
  assert.ok(message.body.text.includes(getOfferSnapshot(program.slug).delivery));
  assert.doesNotMatch(message.body.text,/FORGED|PRIVATE-SYNTHETIC-CONTEXT/);
 }
 const business=sent.find(s=>s.body.to==='optimizelocalai@gmail.com')!;
 assert.doesNotMatch(business.body.text,/Synthetic Learner|learner@example.invalid/);
 assert.ok(business.body.subject.includes(program.title));
 assert.ok(result.every(n=>n.status==='accepted'));
 assert.ok([...statuses.values()].every(status=>status!=='delivered'));
});
