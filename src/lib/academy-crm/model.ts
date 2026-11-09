import { academyPrograms } from '../../config/ai-academy';
export const statuses = ['New','Contacted','Payment Pending','Payment Verified','Booked','Completed','Follow-Up','Closed'] as const;
export type LeadStatus = typeof statuses[number];
export const requestTypes = ['inquiry','consultation','waitlist','workshop','payment-verification'] as const;
export type RequestType = typeof requestTypes[number];
export const consentVersion = 'academy-marketing-v1';
export const courseUpdatesConsentVersion = 'academy-course-updates-v1';
export const privacyAgreementVersion = 'academy-privacy-v1';
export const freeDiscoveryService = {kind:'free-discovery',price:0,currency:'USD',durationMinutes:20} as const;
export const marketingConsentText = 'Email me optional AI training offers and app-development promotions. I can withdraw this consent at any time.';
export const privacyAgreementText = 'I have read the Privacy and inquiries notice and agree that Optimize Local may use the details I submit to respond to this request.';
export interface LeadInput {
 name: string; email: string; phone: string; program: string; requestType: RequestType;
 source: string; contactMethod: 'email' | 'phone'; notes: string; transactionReference: string;
 marketingConsent: boolean; courseUpdatesConsent: boolean;
 business: string; timeZone: string; goal: string;
 privacyAgreement: true; privacyAgreementVersion: string;
}
export interface OfferSnapshot {
 slug: string; title: string; price: number | null; currency: 'USD'; priceBasis: string;
 duration: string; delivery: string; comingSoon: boolean;
}
// Call with the validated program slug. Offer terms never come from form fields.
export function getOfferSnapshot(slug: string): OfferSnapshot {
 const program = academyPrograms.find(p=>p.slug===slug);
 if (!program) return {slug:'general',title:'General AI training inquiry',price:null,currency:'USD',priceBasis:'To be confirmed after choosing a program',duration:'To be confirmed',delivery:'To be confirmed',comingSoon:false};
 const delivery = 'delivery' in program && typeof program.delivery === 'string' ? program.delivery : 'Delivery arrangements to be confirmed';
 return {slug:program.slug,title:program.title,price:program.price,currency:'USD',priceBasis:program.priceBasis,duration:program.duration,delivery,comingSoon:program.comingSoon};
}
export function leadNotes(input: LeadInput): string {
 if (input.requestType === 'payment-verification') return '';
 return [input.notes,input.business && `Business: ${input.business}`,input.timeZone && `Preferred time zone (not a booking): ${input.timeZone}`,input.goal && `Learning goal: ${input.goal}`].filter(Boolean).join('\n');
}
export class CrmError extends Error { constructor(public status: number, message: string) { super(message); } }
export function validateLead(raw: unknown): LeadInput {
 if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new CrmError(400,'Invalid request.');
 const r = raw as Record<string, unknown>;
 const str = (key: string, max: number, required = false) => {
  if (r[key] !== undefined && typeof r[key] !== 'string') throw new CrmError(400,`Invalid ${key}.`);
  const value = ((r[key] as string) ?? '').trim();
  if ((required && !value) || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new CrmError(400,`Please check ${key}.`);
  return value;
 };
 if (str('company_url',200)) throw new CrmError(400,'Unable to accept this request.');
 const name = str('name',120,true), email = str('email',200,true).toLowerCase(), phone = str('phone',40);
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(name)) throw new CrmError(400,'Enter a valid name and email.');
 if (phone && !/^[+\d() .-]{7,40}$/.test(phone)) throw new CrmError(400,'Enter a valid phone number.');
 const program = str('program',80,true);
 if (program !== 'general' && !academyPrograms.some(p=>p.slug===program)) throw new CrmError(400,'Choose a valid program.');
 const requestType = str('requestType',30,true) as RequestType;
 if (!requestTypes.includes(requestType)) throw new CrmError(400,'Choose a request type.');
 if (requestType === 'waitlist' && program !== '21-day-ai-confidence') throw new CrmError(400,'Choose the course waitlist.');
 if (requestType === 'workshop' && program !== 'everyday-ai-workshop') throw new CrmError(400,'Choose the group workshop.');
 if (requestType === 'payment-verification' && ['general','21-day-ai-confidence'].includes(program)) throw new CrmError(400,'Payment verification is unavailable for this program.');
 const contactMethod = str('contactMethod',10,true) as 'email'|'phone';
 if (!['email','phone'].includes(contactMethod) || (contactMethod === 'phone' && !phone)) throw new CrmError(400,'Provide a phone number or choose email.');
 const notes = str('notes',2000), transactionReference = str('transactionReference',100);
 const business = str('business',160), timeZone = str('timeZone',100), goal = str('goal',800);
 if (/[\r\n]/.test(business+' '+timeZone)) throw new CrmError(400,'Keep business and time zone on one line each.');
 if (requestType === 'payment-verification' && !/^[a-zA-Z0-9][a-zA-Z0-9_-]{3,99}$/.test(transactionReference)) throw new CrmError(400,'Enter only the transaction reference (letters, numbers, hyphens or underscores).');
 if (requestType === 'payment-verification' && notes) throw new CrmError(400,'Submit the transaction reference only; no payment notes or credentials.');
 if (requestType === 'payment-verification' && (business || timeZone || goal)) throw new CrmError(400,'Submit the transaction reference only. Use a separate training inquiry for business details or learning goals.');
 if (requestType !== 'payment-verification' && transactionReference) throw new CrmError(400,'Transaction references belong in payment verification requests.');
 const requestText = [notes,transactionReference,business,timeZone,goal].join(' ');
 if (/\b(?:\d[ -]?){12,19}\b/.test(requestText) || /(?:password|api[_ -]?key|secret|cvv|routing number|account number)\s*[:=]/i.test(requestText)) throw new CrmError(400,'Remove financial credentials, card numbers or secrets. Submit a transaction reference only for payment verification.');
 if (r.privacyAgreement !== true) throw new CrmError(400,'Read and agree to the Privacy and inquiries notice before sending your request.');
 for (const key of ['marketingConsent','courseUpdatesConsent']) if (r[key] !== undefined && typeof r[key] !== 'boolean') throw new CrmError(400,'Consent must be explicitly selected.');
 if (requestType === 'waitlist' && r.courseUpdatesConsent !== true) throw new CrmError(400,'Consent to course availability updates is required to join the list.');
 return {name,email,phone,program,requestType,contactMethod,notes,transactionReference,business,timeZone,goal,privacyAgreement:true,privacyAgreementVersion,source:str('source',300)||'direct',marketingConsent:r.marketingConsent===true,courseUpdatesConsent:requestType==='waitlist' && r.courseUpdatesConsent===true};
}
export function safeCsv(rows: Record<string, unknown>[]) {
 const columns=['id','name','email','phone','program','request_type','status','source','contact_method','next_follow_up_at','marketing_consent','marketing_consent_at','course_updates_consent','created_at','updated_at','notes'];
 const cell=(v:unknown)=> { let s=v instanceof Date?v.toISOString():String(v??''); if (/^[\s]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; };
 return [columns.join(','),...rows.map(r=>columns.map(c=>cell(r[c])).join(','))].join('\r\n');
}
