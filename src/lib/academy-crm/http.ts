import { createHash, timingSafeEqual } from 'node:crypto';
import { CrmError } from './model';
export function assertAdmin(request:Request) {
 const expected=process.env.ACADEMY_ADMIN_TOKEN;
 if(!expected || expected.length<32) throw new CrmError(503,'Admin access is not configured.');
 const actual=request.headers.get('authorization')??'';
 if(!timingSafeEqual(createHash('sha256').update(actual).digest(),createHash('sha256').update(`Bearer ${expected}`).digest())) throw new CrmError(401,'Authentication required.');
}
export function assertOrigin(request:Request) {
 const origin=request.headers.get('origin');
 const expected=process.env.ACADEMY_SITE_ORIGIN;
 if(!expected) throw new CrmError(503,'Lead capture is not configured.');
 if(origin!==expected) throw new CrmError(403,'Request origin not allowed.');
}
export async function readJson(request:Request) {
 if(!request.headers.get('content-type')?.startsWith('application/json')) throw new CrmError(415,'JSON is required.');
 if(Number(request.headers.get('content-length')||0)>16000) throw new CrmError(413,'Request too large.');
 const reader=request.body?.getReader();if(!reader) throw new CrmError(400,'Request body required.');
 let size=0;const chunks:Uint8Array[]=[];
 while(true) { const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>16000){await reader.cancel();throw new CrmError(413,'Request too large.');}chunks.push(value); }
 try {return JSON.parse(Buffer.concat(chunks).toString('utf8'));} catch {throw new CrmError(400,'Invalid JSON.');}
}
export function json(value:unknown,status=200) {return Response.json(value,{status,headers:{'Cache-Control':'no-store'}});}
export function errorResponse(error:unknown) {
 const status=error instanceof CrmError?error.status:503;
 return Response.json({error:error instanceof CrmError?error.message:'Unable to save or load this request. Please try again later.'},{status,headers:{'Cache-Control':'no-store',...(status===429?{'Retry-After':'900'}:{})}});
}
