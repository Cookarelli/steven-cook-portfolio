"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { academyPrograms } from '@/config/ai-academy';
import { marketingConsentText, privacyAgreementText, type RequestType } from '@/lib/academy-crm/model';
import { trackTrainingEvent } from '@/lib/academy-analytics';
const subscribe = () => () => {};
const ready = () => true;
const notReady = () => false;

export function AcademyInquiryForm({ slug, title, earlyAccess=false, group=false, kind, chooseProgram=false }: {slug:string;title:string;earlyAccess?:boolean;group?:boolean;kind?:RequestType;chooseProgram?:boolean}) {
 const hydrated=useSyncExternalStore(subscribe,ready,notReady);
 const [status,setStatus]=useState<'idle'|'pending'|'success'|'error'>('idle');
 const [error,setError]=useState('');
 const [receipt,setReceipt]=useState('');
 const [acknowledged,setAcknowledged]=useState(false);
 const pending=useRef(false);
 const attempt=useRef<{payload:string;key:string}|null>(null);
 const disabled=!hydrated||status==='pending';
 const requestType=kind??(earlyAccess?'waitlist':group?'workshop':'inquiry');
 const payment=requestType==='payment-verification';
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(pending.current)return;
  const data=new FormData(event.currentTarget);const field=(name:string)=>String(data.get(name)??'').trim();
  if(field('company_url'))return;
  const params=new URLSearchParams(window.location.search);
  const campaign=['utm_source','utm_medium','utm_campaign'].map(key=>(params.get(key)??'').slice(0,80)).filter(Boolean).join(' / ');
  const selectedProgram=chooseProgram?field('program'):slug;
  const payload=JSON.stringify({name:field('name'),email:field('email'),phone:field('phone'),program:selectedProgram,requestType,source:campaign||`website:${window.location.pathname}`,contactMethod:field('contactMethod'),notes:payment?'':field('message'),business:payment?'':field('business'),timeZone:payment?'':field('timeZone'),goal:payment?'':field('goal'),privacyAgreement:field('privacyAgreement')==='yes',transactionReference:field('transactionReference'),marketingConsent:field('marketingConsent')==='yes',courseUpdatesConsent:field('consent')==='yes',company_url:''});
  if(!attempt.current||attempt.current.payload!==payload)attempt.current={payload,key:crypto.randomUUID()};
  pending.current=true;setStatus('pending');setError('');
  try {
   const response=await fetch('/api/academy/leads',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':attempt.current.key},body:payload,signal:AbortSignal.timeout(30000)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Unable to save your request.');
   if(result.persisted!==true||typeof result.id!=='string')throw new Error('We could not confirm that your request was saved. Please try again.');
   setReceipt(result.id);setAcknowledged(result.notifications?.some((n:{kind:string;status:string})=>n.kind==='acknowledgment'&&n.status==='accepted')===true);setStatus('success');
   // Analytics must never turn a committed request into a visible submission failure.
   try {trackTrainingEvent('ai_training_inquiry_submit',selectedProgram);} catch { /* Optional analytics only. */ }
  }catch(err){setError(err instanceof Error&&err.name==='TimeoutError'?'Receipt is unknown because the request timed out. Retry with the same details; duplicates are prevented.':err instanceof Error?err.message:'Unable to save your request.');setStatus('error');}finally{pending.current=false;}
 }
 return <div className="academy-form-wrap"><div role="status" aria-live="polite">{status==='success'&&<div className="academy-success"><h3>Your request has been saved.</h3><p>Reference: <strong>{receipt}</strong></p><p>{payment?'Your reference is awaiting manual payment verification. Submitting it does not verify payment.':'We will review your request. No payment, booking, workshop seat or course enrollment has been confirmed.'}</p><p>{acknowledged?'Our email provider accepted your acknowledgment for sending. Inbox delivery is not yet confirmed.':'No acknowledgment email has been confirmed. Please keep this reference for your records.'}</p></div>}</div>
 {status!=='success'&&<form className="ol-form" method="post" onSubmit={submit} aria-label={`${earlyAccess?'Early access':'Inquiry'}: ${title}`} aria-busy={status==='pending'}>
 <h3>{payment?'Request payment verification':earlyAccess?'Be first to hear when it’s ready.':group?'Ask about the next workshop.':requestType==='consultation'?'Request a free consultation':'Tell us what you’d like to learn.'}</h3>
 <p className="academy-form-note">{payment?'Already made an arranged payment? Send only its transaction reference. We will check it independently. Do not send card numbers, account numbers, passwords or screenshots.':earlyAccess?'Free to join. The $79 course is not yet available to purchase.':'Send a request and we will confirm availability and next steps. This form does not take payment or reserve a place.'}</p>
 <noscript><p>This form requires JavaScript. Please <a href="mailto:optimizelocalai@gmail.com">email us</a> instead.</p></noscript>
 <div className="ol-form-two"><label>Your name<input name="name" autoComplete="name" required maxLength={120} disabled={disabled}/></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} disabled={disabled}/></label></div>
 <div className="ol-form-two"><label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={40} disabled={disabled}/></label><label>How should we contact you?<select name="contactMethod" defaultValue="email" disabled={disabled}><option value="email">Email</option><option value="phone">Phone (requires a number)</option></select></label></div>
 {chooseProgram&&<label>Interested program<select name="program" defaultValue={payment?'':'general'} required disabled={disabled} onChange={event=>trackTrainingEvent('ai_training_program_select',event.currentTarget.value)}>{payment?<option value="" disabled>Choose the program you paid for</option>:<option value="general">Help me choose / general training</option>}{academyPrograms.filter(p=>!payment||!p.comingSoon).map(p=><option key={p.slug} value={p.slug}>{p.title}</option>)}</select></label>}
 {!payment&&<><div className="ol-form-two"><label>Business (optional)<input name="business" autoComplete="organization" maxLength={160} disabled={disabled}/></label><label>Preferred time zone (optional)<input name="timeZone" placeholder="For example, Central Time (Chicago)" maxLength={100} disabled={disabled}/></label></div><label>What would you like to be able to do? (optional)<textarea name="goal" rows={3} maxLength={800} disabled={disabled}/></label></>}
 {payment?<label>Transaction reference only<input name="transactionReference" required minLength={4} maxLength={100} pattern="[a-zA-Z0-9][a-zA-Z0-9_\-]{3,99}" autoComplete="off" disabled={disabled}/></label>:<label>{group?'How many people are interested? Any questions? (optional)':'Anything else we should know? (optional)'}<textarea name="message" rows={4} maxLength={2000} disabled={disabled}/></label>}
 <label className="academy-consent"><input name="privacyAgreement" type="checkbox" value="yes" required disabled={disabled}/><span>{privacyAgreementText} <a href="/privacy">Read the notice</a>.</span></label>
 {earlyAccess&&<label className="academy-consent"><input name="consent" type="checkbox" value="yes" required disabled={disabled}/><span>Email me about 21 Days to AI Confidence launch and early-access availability. I can ask to leave the list at any time by emailing Optimize Local.</span></label>}
 <label className="academy-consent"><input name="marketingConsent" type="checkbox" value="yes" disabled={disabled}/><span>{marketingConsentText} (Optional; separate from replies about this request.)</span></label>
 <label className="ol-contact-honeypot" aria-hidden="true">Leave this empty<input name="company_url" tabIndex={-1} autoComplete="off"/></label>
 <button className="ol-button ol-button-primary" type="submit" disabled={disabled}>{status==='pending'?'Saving…':earlyAccess?'Join the Course Interest List':payment?'Submit verification request':'Send my request'}<span aria-hidden="true">↗</span></button>
 <p className="ol-form-fine">We save your request so we can follow up. Do not include sensitive health information or financial credentials. <a href="/privacy">Privacy and inquiries</a>.</p>
 {status==='error'&&<p role="alert" className="ol-form-error">{error} <a href="mailto:optimizelocalai@gmail.com">Email Optimize Local</a>.</p>}
 </form>}</div>;
}
