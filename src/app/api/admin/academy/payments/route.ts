import { randomUUID } from 'node:crypto';
import { database } from '@/lib/academy-crm/database';
import { assertAdmin, assertOrigin, readJson, json, errorResponse } from '@/lib/academy-crm/http';
import { CrmError } from '@/lib/academy-crm/model';
import { uuid } from '@/lib/payments/model';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    assertAdmin(request);
    const environment = new URL(request.url).searchParams.get('environment') === 'sandbox' ? 'sandbox' : 'live';
    const orders = await database().query(`SELECT id,program,title,name,email,preferred_times,cents,currency,status,fulfillment,provider_order_id,capture_id,financials,created_at,paid_at FROM academy_crm.payment_orders WHERE environment=$1 ORDER BY created_at DESC LIMIT 200`, [environment]);
    return json({ environment, orders: orders.rows });
  } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try {
    assertAdmin(request); assertOrigin(request);
    const body = await readJson(request);
    if (!uuid(body.id) || !['scheduling_pending', 'booked', 'completed'].includes(body.fulfillment)) throw new CrmError(400, 'Invalid fulfillment update.');
    const client = await database().connect();
    try {
      await client.query('BEGIN');
      const changed = await client.query("UPDATE academy_crm.payment_orders SET fulfillment=$2,updated_at=now() WHERE id=$1 AND status='paid' RETURNING environment", [body.id, body.fulfillment]);
      if (!changed.rows.length) throw new CrmError(409, 'Only a verified paid order can be scheduled or completed.');
      await client.query("INSERT INTO academy_crm.payment_events(id,environment,order_id,kind,details) VALUES($1,$2,$3,'fulfillment-updated',$4)", [randomUUID(), changed.rows[0].environment, body.id, JSON.stringify({ actor: 'business-admin', fulfillment: body.fulfillment })]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    return json({ saved: true });
  } catch (error) { return errorResponse(error); }
}
