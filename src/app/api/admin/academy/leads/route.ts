import { database } from '@/lib/academy-crm/database';
import { assertAdmin, errorResponse, json, readJson } from '@/lib/academy-crm/http';
import { CrmError, safeCsv } from '@/lib/academy-crm/model';
import { listLeads, updateLead } from '@/lib/academy-crm/store';
export const runtime='nodejs';
export async function GET(request:Request) {
 try {
  assertAdmin(request);const url=new URL(request.url),pool=database();
  const id=url.searchParams.get('id');
  if(id){ if(!/^[\da-f-]{36}$/i.test(id))throw new CrmError(400,'Invalid lead ID.');return json({events:(await pool.query('SELECT actor,event,details,created_at FROM academy_crm.events WHERE lead_id=$1 ORDER BY id',[id])).rows}); }
  const offset=Number(url.searchParams.get('offset')||0);
  if(!Number.isInteger(offset)||offset<0)throw new CrmError(400,'Invalid offset.');
  const filters={status:url.searchParams.get('status')??undefined,program:url.searchParams.get('program')??undefined,source:url.searchParams.get('source')??undefined,offset};
  const rows=await listLeads(pool,filters);
  if(url.searchParams.get('format')==='csv')return new Response(safeCsv(rows),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="academy-leads.csv"','Cache-Control':'no-store'}});
  return json({leads:rows,offset,nextOffset:rows.length===500?offset+500:null});
 } catch(error){return errorResponse(error);}
}
export async function PATCH(request:Request){
 try {assertAdmin(request);const raw=await readJson(request);if(!raw||typeof raw.id!=='string'||!/^[\da-f-]{36}$/i.test(raw.id))throw new CrmError(400,'Invalid lead ID.');await updateLead(database(),raw.id,raw);return json({saved:true});}catch(error){return errorResponse(error);}
}
