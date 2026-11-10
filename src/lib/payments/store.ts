import { createHmac, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { CrmError } from '../academy-crm/model';
import { assertPaymentsEnabled, payableProgram, type PaymentConfig } from './config';
import { hash, nextStatus, uuid, verifiedCapture, type CheckoutInput } from './model';
import type { PayPalProvider, ProviderOrder } from './paypal';

export interface PaymentOrder {
  id: string; environment: string; session_hash: string; provider_order_id: string; capture_id: string | null;
  cents: number; merchant_id: string; title: string; program: string; status: string; fulfillment: string;
  created_at: Date; updated_at: Date; fingerprint: string;
}
export function publicOrder(order: PaymentOrder) {
  return { id: order.id, program: order.program, title: order.title, cents: order.cents, currency: 'USD', environment: order.environment, status: order.status, fulfillment: order.fulfillment, captureId: order.capture_id, paypalOrderId: order.provider_order_id };
}
export async function paymentRateLimit(pool: Pool, value: string, secret: string, limit = 20) {
  if (secret.length < 32) throw new CrmError(503, 'Checkout is temporarily unavailable.');
  const bucket = createHmac('sha256', secret).update(`checkout:${value}`).digest('hex');
  const result = await pool.query(`INSERT INTO academy_crm.rate_limits(bucket,hits,expires_at) VALUES($1,1,now()+interval '15 minutes')
    ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN academy_crm.rate_limits.expires_at<now() THEN 1 ELSE academy_crm.rate_limits.hits+1 END,
    expires_at=CASE WHEN academy_crm.rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE academy_crm.rate_limits.expires_at END RETURNING hits`, [bucket]);
  if (result.rows[0].hits > limit) throw new CrmError(429, 'Too many checkout requests. Please try again in 15 minutes.');
}
async function locked<T>(pool: Pool, id: string, action: (client: PoolClient, order: PaymentOrder) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM academy_crm.payment_orders WHERE id=$1 FOR UPDATE', [id]);
    if (!result.rows.length) throw new CrmError(404, 'Order not found.');
    const value = await action(client, result.rows[0]);
    await client.query('COMMIT');
    return value;
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
export async function beginCheckout(pool: Pool, provider: PayPalProvider, config: PaymentConfig, input: CheckoutInput, session: string) {
  assertPaymentsEnabled(config);
  const program = payableProgram(input.program);
  const fingerprint = hash(JSON.stringify({ ...input, attempt: undefined }));
  // Serialize across tabs as well as retries. Commit BEFORE contacting PayPal.
  const client = await pool.connect();
  let order: PaymentOrder;
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,4))', [config.environment + hash(session) + program.slug]);
    const existing = await client.query(`SELECT * FROM academy_crm.payment_orders WHERE environment=$1 AND session_hash=$2
      AND (attempt=$3 OR (program=$4 AND created_at>now()-interval '3 hours' AND status IN ('created','pending','paid','review')))
      ORDER BY created_at DESC LIMIT 1`, [config.environment, hash(session), input.attempt, program.slug]);
    const result = existing.rows.length ? existing : await client.query(`INSERT INTO academy_crm.payment_orders(id,attempt,session_hash,environment,program,title,cents,merchant_id,name,email,preferred_times,terms_version,terms_text,fingerprint)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT(environment,session_hash,attempt) DO UPDATE SET attempt=EXCLUDED.attempt RETURNING *`,
    [randomUUID(), input.attempt, hash(session), config.environment, program.slug, program.title, program.cents, config.merchantId, input.name, input.email, input.preferredTimes, config.policyVersion, config.policy, fingerprint]);
    order = result.rows[0] as PaymentOrder;
    if (order.fingerprint !== fingerprint) throw new CrmError(409, `There is already a checkout for this session. Contact us with reference ${order.id} before starting another payment.`);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  return locked(pool, order.id, async (client, current) => {
    if (!current.provider_order_id) {
      if (Date.now() - new Date(current.created_at).getTime() > 3 * 60 * 60 * 1000) throw new CrmError(409, 'This checkout needs review. Contact Optimize Local before starting another payment.');
      const created = await provider.create(current.id, current.title, current.cents);
      if (!/^[A-Za-z0-9_-]{1,100}$/.test(created.id || '')) throw new CrmError(502, 'Unable to prepare payment. Retry this checkout.');
      current.provider_order_id = created.id;
      verifiedCapture(created, current);
      await client.query('UPDATE academy_crm.payment_orders SET provider_order_id=$2,updated_at=now() WHERE id=$1', [current.id, created.id]);
    }
    return { ...publicOrder(current), paypalOrderId: current.provider_order_id };
  });
}
function assertOwner(order: PaymentOrder, config: PaymentConfig, session: string) {
  if (!session || order.session_hash !== hash(session) || order.environment !== config.environment) throw new CrmError(404, 'Order not found in this browser session.');
}
async function applyProviderOrder(client: PoolClient, order: PaymentOrder, providerOrder: ProviderOrder) {
  const capture = verifiedCapture(providerOrder, order);
  if (!capture) return order;
  if (order.capture_id && order.capture_id !== capture.id) throw new CrmError(409, 'Payment needs review. Do not pay again.');
  const status = nextStatus(order.status, capture.status);
  const fulfillment = ['partially_refunded', 'refunded', 'reversed', 'review'].includes(status) ? 'hold' : status === 'paid' && order.fulfillment === 'not_ready' ? 'scheduling_pending' : order.fulfillment;
  const result = await client.query(`UPDATE academy_crm.payment_orders SET status=$2,fulfillment=$3,capture_id=$4,financials=COALESCE($5,financials),paid_at=CASE WHEN $2='paid' THEN COALESCE(paid_at,now()) ELSE paid_at END,updated_at=now() WHERE id=$1 RETURNING *`, [order.id, status, fulfillment, capture.id, capture.seller_receivable_breakdown ? JSON.stringify(capture.seller_receivable_breakdown) : null]);
  await client.query(`INSERT INTO academy_crm.payment_events(id,environment,order_id,kind,details) VALUES($1,$2,$3,'provider-status',$4) ON CONFLICT DO NOTHING`, [`${order.environment}:${capture.id}:${status}`, order.environment, order.id, JSON.stringify({ status, captureId: capture.id })]);
  return result.rows[0] as PaymentOrder;
}
export async function checkoutStatus(pool: Pool, provider: PayPalProvider, config: PaymentConfig, id: string, session: string, capture = false) {
  if (!uuid(id)) throw new CrmError(404, 'Order not found.');
  return locked(pool, id, async (client, order) => {
    assertOwner(order, config, session);
    if (!order.provider_order_id) return publicOrder(order);
    let remote = await provider.order(order.provider_order_id);
    const existing = verifiedCapture(remote, order);
    if (capture && !existing) {
      assertPaymentsEnabled(config);
      if (Date.now() - new Date(order.created_at).getTime() > 3 * 60 * 60 * 1000) throw new CrmError(409, 'This checkout has expired. Contact Optimize Local before starting another payment.');
      if (remote.status !== 'APPROVED') throw new CrmError(409, 'Payment has not been approved.');
      await provider.capture(order.provider_order_id, `capture-${order.id}`);
      // A fresh authenticated read recovers successful captures even after a lost browser response.
      remote = await provider.order(order.provider_order_id);
    }
    return publicOrder(await applyProviderOrder(client, order, remote));
  });
}
export async function acceptWebhook(pool: Pool, provider: PayPalProvider, config: PaymentConfig, headers: Headers, raw: unknown) {
  if (!await provider.verifyWebhook(headers, raw)) throw new CrmError(401, 'Invalid webhook signature.');
  const event = raw as { id?: string; event_type?: string; resource?: { id?: string; custom_id?: string; supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } }; links?: { rel?: string; href?: string }[] } };
  if (!event.id || event.id.length > 200 || !event.event_type) throw new CrmError(400, 'Invalid webhook.');
  if (!['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.PENDING', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED'].includes(event.event_type)) return;
  const resource = event.resource || {};
  const providerOrderId = resource.supplementary_data?.related_ids?.order_id || null;
  const captureFromLink = resource.links?.find(link => link.rel === 'up')?.href?.match(/^https:\/\/api(?:-m)?\.(?:sandbox\.)?paypal\.com\/v2\/payments\/captures\/([A-Za-z0-9]+)$/)?.[1];
  const captureId = event.event_type === 'PAYMENT.CAPTURE.REFUNDED' ? resource.supplementary_data?.related_ids?.capture_id || captureFromLink || null : resource.id || null;
  const result = await pool.query('SELECT id FROM academy_crm.payment_orders WHERE environment=$1 AND (provider_order_id=$2 OR capture_id=$3 OR id=$4::uuid) LIMIT 1', [config.environment, providerOrderId, captureId, uuid(resource.custom_id) ? resource.custom_id : null]);
  // Ignore events for unrelated apps/orders. A known custom_id also recovers a create write failure.
  if (!result.rows.length) return;
  await locked(pool, result.rows[0].id, async (client, order) => {
    const duplicate = await client.query('SELECT id FROM academy_crm.payment_events WHERE id=$1', [`${config.environment}:webhook:${event.id}`]);
    if (duplicate.rows.length) return;
    if (!order.provider_order_id && providerOrderId) {
      order.provider_order_id = providerOrderId;
      await client.query('UPDATE academy_crm.payment_orders SET provider_order_id=$2 WHERE id=$1', [order.id, providerOrderId]);
    }
    if (!order.provider_order_id) throw new CrmError(503, 'Order reconciliation is pending.');
    const remote = await provider.order(order.provider_order_id);
    const capture = verifiedCapture(remote, order);
    await applyProviderOrder(client, order, remote);
    // Signed reversal events are authoritative even if the order read still reports COMPLETED.
    if (event.event_type === 'PAYMENT.CAPTURE.REVERSED' && capture?.id === captureId) {
      await client.query("UPDATE academy_crm.payment_orders SET status='reversed',fulfillment='hold',updated_at=now() WHERE id=$1", [order.id]);
    }
    if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED' && !['REFUNDED', 'PARTIALLY_REFUNDED'].includes(capture?.status || '')) throw new CrmError(503, 'Refund reconciliation is pending.');
    await client.query('INSERT INTO academy_crm.payment_events(id,environment,order_id,kind) VALUES($1,$2,$3,$4)', [`${config.environment}:webhook:${event.id}`, config.environment, order.id, event.event_type]);
  });
}
