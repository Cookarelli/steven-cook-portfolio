import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='http://127.0.0.1:3107';
const get=(path,options={})=>fetch(base+path,{...options,signal:AbortSignal.timeout(10000)});
const data=JSON.parse(await readFile(new URL('../src/data/course-preview.json',import.meta.url),'utf8'));
for(const sample of data.samples) test(`${sample.id}: public sample renders complete lesson and explicit local progress`,async()=>{
 const path=`/ai-academy/21-day-ai-confidence/lessons/${sample.id}`;
 const r=await get(path);assert.equal(r.status,200);const html=await r.text();
 const visibleHtml=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<template\b[^>]*>[\s\S]*?<\/template>/g,'');
 assert.equal((visibleHtml.match(/<h1[ >]/g)??[]).length,1);
 assert.ok(html.includes(sample.title));assert.ok(html.includes(sample.exercise.artifact_name));
 assert.match(html,/Copy template/);assert.match(html,/Mark Day/);assert.match(html,/Recordings? pending/i);
 assert.match(html,/saved locally|saved only|this browser/i);assert.match(html,/ai-confidence-sample-workbook.pdf/);
 assert.match(html,/no paid account or enrollment/i);
});
for(const id of ['day-04','day-21','not-a-day']) test(`${id}: unavailable content is not served`,async()=>{assert.equal((await get(`/ai-academy/21-day-ai-confidence/lessons/${id}`)).status,404);});
test('sample PDF download is exactly the inspected file with the correct content type',async()=>{
 const r=await get('/ai-confidence-sample-workbook.pdf');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/application\/pdf/);
 const bytes=Buffer.from(await r.arrayBuffer());const manifest=JSON.parse(await readFile(new URL('../public/ai-confidence-sample-workbook.manifest.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.pdf_sha256);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
});
test('sample HTML is downloadable and contains no full-course materials',async()=>{
 const r=await get('/ai-confidence-sample-workbook.html');assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/html/);
 const html=await r.text();assert.ok(html.includes(data.content_revision));assert.match(html,/Sample workbook/);assert.ok(!html.includes(data.overview[20].artifact));
});
test('full manuscript and full course workbooks are not public downloads',async()=>{
 for(const path of ['/21_Days_to_AI_Confidence_Participant_Workbook.pdf','/academy/course/generated/curriculum.json','/sources/originals/'])assert.equal((await get(path)).status,404);
});
test('admin records and public lead reads fail closed',async()=>{
 const r=await get('/api/admin/academy/leads');assert.ok([401,503].includes(r.status));const body=await r.json();assert.ok(!Array.isArray(body));assert.ok(!('leads'in body));
 assert.equal((await get('/api/academy/leads')).status,405);
});
test('unconfigured preview cannot fabricate a saved inquiry or enrollment',async()=>{
 const r=await get('/api/academy/leads',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','Idempotency-Key':'b21b7af7-672b-4a3d-a635-a7494bc95753'},body:JSON.stringify({name:'Synthetic Preview Learner',email:'preview-verification@example.invalid',program:'21-day-ai-confidence',requestType:'waitlist',contactMethod:'email',privacyAgreement:true,courseUpdatesConsent:true,marketingConsent:false,notes:'Synthetic local preview test; no database or notifications configured.'})});
 assert.equal(r.status,503);const result=await r.json();assert.ok(!result.persisted);assert.ok(!result.id);assert.ok(result.error);
});
test('existing app-sales packages, demos and free discovery destination remain present',async()=>{
 const home=await(await get('/')).text();for(const value of ['$500','$1,500','$2,500','/demos','#services','calendar.app.google/FcGwkANYvFkbsy349','/ai-training'])assert.ok(home.includes(value),value);
 for(const path of ['/demos','/demos/booking','/demos/detailing','/portfolio'])assert.equal((await get(path)).status,200);
 const services=await get('/services',{redirect:'manual'});assert.equal(services.status,308);assert.equal(services.headers.get('location'),'/#services');
});
