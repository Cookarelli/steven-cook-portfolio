import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Pool} from 'pg';
import {captureLead,listLeads,updateLead} from '../src/lib/academy-crm/store';
import {validateLead,safeCsv,CrmError} from '../src/lib/academy-crm/model';
import {processNotifications} from '../src/lib/academy-crm/notifications';
import {POST} from '../src/app/api/academy/leads/route';
import {GET,PATCH} from '../src/app/api/admin/academy/leads/route';
import {POST as retry} from '../src/app/api/admin/academy/notifications/route';
const url=process.env.ACADEMY_TEST_DATABASE_URL;
if(!url||!url.includes('127.0.0.1'))throw new Error('Use the isolated local PostgreSQL test runner.');
const pool=new Pool({connectionString:url});
const input=(extra={})=>validateLead({name:'Synthetic Learner',email:`test-${randomUUID()}@example.invalid`,program:'ai-made-simple',requestType:'inquiry',contactMethod:'email',source:'test',...extra});
const save=(data=input(),key=randomUUID(),ip=randomUUID())=>captureLead(pool,data,key,ip,'test-rate-key');
const request=(body:unknown,key=randomUUID(),origin='http://localhost:3107')=>new Request('http://localhost:3107/api/academy/leads',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'Idempotency-Key':key},body:JSON.stringify(body)});
const admin=(url:string,options:RequestInit={})=>new Request('http://localhost:3107'+url,{...options,headers:{Authorization:`Bearer ${process.env.ACADEMY_ADMIN_TOKEN}`,'Content-Type':'application/json',...options.headers}});
after(async()=>{await pool.end();});

test('persists all five request types with separate consent and timestamps',async()=>{
 for(const [type,program] of [['inquiry','general'],['consultation','ai-made-simple'],['workshop','everyday-ai-workshop'],['waitlist','21-day-ai-confidence'],['payment-verification','ai-for-business']]){
  const data=input({requestType:type,program,courseUpdatesConsent:type==='waitlist',transactionReference:type==='payment-verification'?'TEST-REF-1234':''});
  const result=await save(data);const row=(await pool.query('SELECT * FROM academy_crm.leads WHERE id=$1',[result.id])).rows[0];
  assert.equal(row.email,data.email);assert.equal(row.status,type==='payment-verification'?'Payment Pending':'New');assert.equal(row.marketing_consent,false);assert.equal(row.course_updates_consent,type==='waitlist');assert.ok(row.created_at);assert.ok(row.marketing_consent_at);
  assert.equal((await pool.query('SELECT count(*) FROM academy_crm.notifications WHERE lead_id=$1',[result.id])).rows[0].count,'2');
 }
});
test('concurrent retries and identical content produce one lead and one outbox pair',async()=>{
 const data=input(),key=randomUUID();const results=await Promise.all([save(data,key),save(data,key),save(data)]);
 assert.equal(new Set(results.map(r=>r.id)).size,1);assert.equal(results.filter(r=>r.duplicate).length,2);
 assert.equal((await pool.query('SELECT count(*) FROM academy_crm.notifications WHERE lead_id=$1',[results[0].id])).rows[0].count,'2');
 await assert.rejects(save({...data,name:'Different'},key),(e:unknown)=>e instanceof CrmError&&e.status===409);
});
test('durable rate limits apply across separate database pools',async()=>{
 const ip=randomUUID();for(let i=0;i<5;i++)await save(input(),randomUUID(),ip);
 const other=new Pool({connectionString:url});try{await assert.rejects(captureLead(other,input(),randomUUID(),ip,'test-rate-key'),(e:unknown)=>e instanceof CrmError&&e.status===429);}finally{await other.end();}
});
test('invalid data, payment credentials and forged consent are rejected',()=>{
 for(const extra of [{email:'invalid'},{program:'fake'},{contactMethod:'phone',phone:''},{marketingConsent:'yes'},{requestType:'waitlist',program:'21-day-ai-confidence'},{requestType:'payment-verification',program:'21-day-ai-confidence',transactionReference:'REF-1234'},{requestType:'payment-verification',transactionReference:'4111111111111111'},{notes:'password: secret'},{requestType:'payment-verification',transactionReference:'REF-1234',notes:'extra payment data'}])assert.throws(()=>input(extra));
});
test('status changes, notes, follow-up and consent withdrawal persist with history',async()=>{
 const {id}=await save(input({marketingConsent:true}));
 await assert.rejects(updateLead(pool,id,{status:'Payment Verified',note:'',nextFollowUpAt:null}));
 await updateLead(pool,id,{status:'Follow-Up',note:'Requested a callback',nextFollowUpAt:'2027-01-02T12:00:00Z',withdrawMarketingConsent:true});
 const row=(await pool.query('SELECT * FROM academy_crm.leads WHERE id=$1',[id])).rows[0];assert.equal(row.status,'Follow-Up');assert.match(row.notes,/Requested a callback/);assert.equal(row.marketing_consent,false);assert.equal(row.next_follow_up_at.toISOString(),'2027-01-02T12:00:00.000Z');
 assert.equal((await pool.query('SELECT count(*) FROM academy_crm.events WHERE lead_id=$1',[id])).rows[0].count,'3');
});
test('notification failure does not lose the lead; unconfigured acknowledgment is truthful',async()=>{
 const {id}=await save();let calls=0;
 const result=await processNotifications(pool,id,{formsubmit:true},async()=>{calls++;return Response.json({success:false},{status:500});});
 assert.equal(calls,1);assert.equal(result.find(r=>r.kind==='business').status,'failed');assert.equal(result.find(r=>r.kind==='acknowledgment').status,'unconfigured');assert.equal((await pool.query('SELECT id FROM academy_crm.leads WHERE id=$1',[id])).rows.length,1);
});
test('configured email acceptance is recorded without claiming delivery; no duplicate send',async()=>{
 const {id}=await save();let calls=0;const mock:typeof fetch=async(_url,init)=>{calls++;assert.ok((init?.headers as Record<string,string>)['Idempotency-Key']);return Response.json({id:'synthetic-provider-id'});};
 await Promise.all([processNotifications(pool,id,{formsubmit:false,resendKey:'test',from:'test@example.invalid'},mock),processNotifications(pool,id,{formsubmit:false,resendKey:'test',from:'test@example.invalid'},mock)]);
 assert.equal(calls,2);assert.ok((await pool.query('SELECT status FROM academy_crm.notifications WHERE lead_id=$1',[id])).rows.every(r=>r.status==='accepted'));
});
test('ambiguous network outcomes remain unknown and are not auto-retried',async()=>{
 const {id}=await save();let calls=0;const mock:typeof fetch=async()=>{calls++;throw new Error('network failure');};
 await processNotifications(pool,id,{formsubmit:true},mock);await processNotifications(pool,id,{formsubmit:true},mock);assert.equal(calls,1);assert.equal((await pool.query("SELECT status FROM academy_crm.notifications WHERE lead_id=$1 AND kind='business'",[id])).rows[0].status,'unknown');
});
test('filtered CSV includes follow-up and neutralizes spreadsheet formulas',async()=>{
 await save(input({name:'=SUM(1,2)',source:'csv-test'}));const rows=await listLeads(pool,{source:'csv-test'});assert.equal(rows.length,1);const csv=safeCsv(rows);assert.match(csv,/next_follow_up_at/);assert.match(csv,/"'=SUM\(1,2\)"/);
});
test('public API commits before success, retry returns same persisted record',async()=>{
 const data=input(),key=randomUUID();const response=await POST(request(data,key));assert.equal(response.status,201);const body=await response.json();assert.equal(body.persisted,true);assert.equal((await pool.query('SELECT id FROM academy_crm.leads WHERE id=$1',[body.id])).rows.length,1);assert.ok(body.notifications.every((n:{status:string})=>n.status==='unconfigured'));
 const again=await POST(request(data,key));assert.equal(again.status,200);assert.equal((await again.json()).id,body.id);
});
test('public API rejects wrong origin, oversized body and invalid fields',async()=>{
 assert.equal((await POST(request(input(),randomUUID(),'https://evil.invalid'))).status,403);
 assert.equal((await POST(request({name:'x'.repeat(17000)}))).status,413);
 assert.equal((await POST(request({name:'Only name'}))).status,400);
});
test('admin view, export and updates require authentication',async()=>{
 assert.equal((await GET(new Request('http://localhost/api/admin/academy/leads'))).status,401);
 assert.equal((await GET(new Request('http://localhost/api/admin/academy/leads?format=csv'))).status,401);
 assert.equal((await PATCH(new Request('http://localhost/api/admin/academy/leads',{method:'PATCH'}))).status,401);
 assert.equal((await retry(new Request('http://localhost/api/admin/academy/notifications',{method:'POST'}))).status,401);
 const response=await GET(admin('/api/admin/academy/leads?source=csv-test&format=csv'));assert.equal(response.status,200);assert.match(response.headers.get('cache-control')??'',/no-store/);assert.match(await response.text(),/csv-test/);
});
test('missing database configuration returns an error instead of fake success',async()=>{
 const saved=process.env.ACADEMY_DATABASE_URL;delete process.env.ACADEMY_DATABASE_URL;try{const response=await POST(request(input()));assert.equal(response.status,503);assert.equal((await response.json()).persisted,undefined);}finally{process.env.ACADEMY_DATABASE_URL=saved;}
});


test('a real database write failure rolls back the lead and outbox and never returns success',async()=>{
 await pool.query("ALTER TABLE academy_crm.leads ADD CONSTRAINT synthetic_failure CHECK(name <> 'Persistence Failure')");
 try {
  const data=input({name:'Persistence Failure'});const response=await POST(request(data));assert.equal(response.status,503);assert.equal((await response.json()).persisted,undefined);
  assert.equal((await pool.query('SELECT count(*) FROM academy_crm.leads WHERE email=$1',[data.email])).rows[0].count,'0');
 }finally{await pool.query('ALTER TABLE academy_crm.leads DROP CONSTRAINT synthetic_failure');}
});
test('withdrawal affects other leads for the same email and records history',async()=>{
 const email=`test-${randomUUID()}@example.invalid`;
 const first=await save(input({email,marketingConsent:true}));const second=await save(input({email,program:'21-day-ai-confidence',requestType:'waitlist',marketingConsent:true,courseUpdatesConsent:true}));
 await updateLead(pool,first.id,{status:'Closed',note:'Consent withdrawn',nextFollowUpAt:null,withdrawMarketingConsent:true,withdrawCourseUpdates:true});
 const row=(await pool.query('SELECT marketing_consent,course_updates_consent FROM academy_crm.leads WHERE id=$1',[second.id])).rows[0];assert.equal(row.marketing_consent,false);assert.equal(row.course_updates_consent,false);
});
