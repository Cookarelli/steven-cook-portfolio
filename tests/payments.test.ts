import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test, after } from 'node:test';
import { Pool } from 'pg';
import { checkoutInput, nextStatus } from '../src/lib/payments/model';
import { paymentConfig, payableProgram, type PaymentConfig } from '../src/lib/payments/config';
import { beginCheckout, checkoutStatus, acceptWebhook, paymentRateLimit } from '../src/lib/payments/store';
import { PayPal, type PayPalProvider, type ProviderOrder } from '../src/lib/payments/paypal';

const pool = new Pool({ connectionString: process.env.ACADEMY_TEST_DATABASE_URL });
after(() => pool.end());
const config: PaymentConfig = { environment: 'sandbox', clientId: 'test', secret: 'not-real', merchantId: 'TESTMERCHANT', webhookId: 'test-webhook', origin: 'http://localhost:3107', policy: 'Test terms only', policyVersion: 'test-v1', enabled: true };
const input = () => ({ attempt: randomUUID(), program: 'ai-made-simple', name: 'Checkout Test', email: 'synthetic@example.invalid', preferredTimes: 'Monday morning Central', termsVersion: config.policyVersion });
class MockPayPal implements PayPalProvider {
  orders = new Map<string, ProviderOrder>(); creates = 0; captures = 0; valid = true; captureState = 'COMPLETED'; lostResponse = false;
  async create(id: string, title: string, cents: number) {
    if (!this.orders.has(id)) { this.creates++; this.orders.set(id, { id, status: 'APPROVED', purchase_units: [{ custom_id: id, amount: { currency_code: 'USD', value: (cents / 100).toFixed(2) }, payee: { merchant_id: config.merchantId } }] }); }
    return structuredClone(this.orders.get(id)!);
  }
  async order(id: string) { return structuredClone(this.orders.get(id)!); }
  async capture(id: string, requestId: string) {
    assert.equal(requestId, `capture-${id}`); this.captures++;
    const order = this.orders.get(id)!; order.status = 'COMPLETED';
    order.purchase_units![0].payments = { captures: [{ id: `CAPTURE${id}`, status: this.captureState, amount: order.purchase_units![0].amount!, final_capture: true }] };
    if (this.lostResponse) throw new Error('Simulated disconnect after capture');
    return structuredClone(order);
  }
  async verifyWebhook() { return this.valid; }
}
test('catalog prices and request validation reject tampering and unavailable offers', () => {
  for (const [slug, cents] of [['ai-made-simple',4900],['ai-for-business',9900],['team-training',29900],['business-ai-audit',14900]] as const) assert.equal(payableProgram(slug).cents,cents);
  for (const slug of ['everyday-ai-workshop','21-day-ai-confidence','made-up']) assert.throws(() => payableProgram(slug));
  const raw = { ...input(), consent: true };
  assert.equal(checkoutInput(raw, config).program, 'ai-made-simple');
  for (const extra of [{ amount: 1 }, { currency: 'EUR' }, { quantity: 10 }, { consent: false }, { termsVersion: 'old' }]) assert.throws(() => checkoutInput({ ...raw, ...extra }, config));
});
test('live checkout fails closed on preview and missing terms/tax configuration', () => {
  const before = { ...process.env };
  try {
    Object.assign(process.env, { PAYPAL_ENV:'live', VERCEL_ENV:'preview', PAYMENTS_ENABLED:'true', PAYPAL_CLIENT_ID:'id',PAYPAL_CLIENT_SECRET:'secret',PAYPAL_MERCHANT_ID:'merchant',PAYPAL_WEBHOOK_ID:'webhook',ACADEMY_SITE_ORIGIN:'https://example.invalid',PAYMENT_CUSTOMER_TERMS:'approved',PAYMENT_TERMS_VERSION:'v1',PAYMENT_TAX_REVIEWED:'true' });
    assert.equal(paymentConfig().enabled,false); process.env.VERCEL_ENV='production'; assert.equal(paymentConfig().enabled,true);
    delete process.env.PAYMENT_TAX_REVIEWED; assert.equal(paymentConfig().enabled,false);
  } finally { for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key]; Object.assign(process.env,before); }
});
test('concurrent duplicate create and capture perform one provider operation', async () => {
  const provider = new MockPayPal(), data = input(), session = randomUUID();
  const results = await Promise.all(Array.from({length:5}, () => beginCheckout(pool,provider,config,data,session)));
  assert.equal(new Set(results.map(row=>row.id)).size,1); assert.equal(provider.creates,1);
  const id = results[0].id;
  const otherTab = await beginCheckout(pool,provider,config,{...data,attempt:randomUUID()},session);
  assert.equal(otherTab.id,id); assert.equal(provider.creates,1);
  await assert.rejects(() => checkoutStatus(pool,provider,config,id,'foreign-session',true));
  await assert.rejects(() => checkoutStatus(pool,provider,{...config,environment:'live'},id,session,true));
  await assert.rejects(() => beginCheckout(pool,provider,config,{...data,name:'Different buyer'},session));
  const captured = await Promise.all(Array.from({length:5},()=>checkoutStatus(pool,provider,config,id,session,true)));
  assert.equal(provider.captures,1); assert.ok(captured.every(row=>row.status==='paid' && row.fulfillment==='scheduling_pending'));
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM academy_crm.payment_events WHERE order_id=$1 AND kind='provider-status'",[id])).rows[0].n,1);
});
test('pending remains unfulfilled; lost capture response recovers without a second charge', async () => {
  const provider = new MockPayPal(), session = randomUUID();
  provider.captureState = 'PENDING';
  const pending = await beginCheckout(pool,provider,config,input(),session);
  const status = await checkoutStatus(pool,provider,config,pending.id,session,true);
  assert.equal(status.status,'pending'); assert.equal(status.fulfillment,'not_ready');
  provider.captureState='COMPLETED'; provider.lostResponse=true;
  const lost = await beginCheckout(pool,provider,config,{...input(), program:'ai-for-business'},session);
  await assert.rejects(()=>checkoutStatus(pool,provider,config,lost.id,session,true));
  const recovered = await checkoutStatus(pool,provider,config,lost.id,session,true);
  assert.equal(recovered.status,'paid'); assert.equal(provider.captures,2);
});
test('amount, currency, recipient and identity mismatches never mark paid', async () => {
  for (const change of ['amount','currency','merchant','custom','provider']) {
    const provider = new MockPayPal(), session = randomUUID();
    const order = await beginCheckout(pool,provider,config,input(),session);
    const remote = provider.orders.get(order.id)!;
    if(change==='amount')remote.purchase_units![0].amount!.value='0.01';
    if(change==='currency')remote.purchase_units![0].amount!.currency_code='EUR';
    if(change==='merchant')remote.purchase_units![0].payee!.merchant_id='OTHER';
    if(change==='custom')remote.purchase_units![0].custom_id='OTHER';
    if(change==='provider')remote.id='OTHER';
    await assert.rejects(()=>checkoutStatus(pool,provider,config,order.id,session,true));
    assert.equal(provider.captures,0);
    assert.equal((await pool.query('SELECT status FROM academy_crm.payment_orders WHERE id=$1',[order.id])).rows[0].status,'created');
  }
});
test('signed webhooks recover capture, deduplicate, track refunds and never regress', async () => {
  const provider = new MockPayPal(), session = randomUUID();
  const order = await beginCheckout(pool,provider,config,input(),session);
  await provider.capture(order.id,`capture-${order.id}`);
  const event = {id:randomUUID(),event_type:'PAYMENT.CAPTURE.COMPLETED',resource:{id:`CAPTURE${order.id}`,supplementary_data:{related_ids:{order_id:order.id}}}};
  provider.valid=false; await assert.rejects(()=>acceptWebhook(pool,provider,config,new Headers(),event));
  assert.equal((await pool.query('SELECT status FROM academy_crm.payment_orders WHERE id=$1',[order.id])).rows[0].status,'created');
  provider.valid=true;
  await Promise.all([acceptWebhook(pool,provider,config,new Headers(),event),acceptWebhook(pool,provider,config,new Headers(),event)]);
  assert.equal((await checkoutStatus(pool,provider,config,order.id,session)).status,'paid');
  provider.orders.get(order.id)!.purchase_units![0].payments!.captures![0].status='PARTIALLY_REFUNDED';
  await acceptWebhook(pool,provider,config,new Headers(),{...event,id:randomUUID(),event_type:'PAYMENT.CAPTURE.REFUNDED'});
  assert.equal((await checkoutStatus(pool,provider,config,order.id,session)).status,'partially_refunded');
  provider.orders.get(order.id)!.purchase_units![0].payments!.captures![0].status='COMPLETED';
  await acceptWebhook(pool,provider,config,new Headers(),{...event,id:randomUUID()});
  assert.equal((await checkoutStatus(pool,provider,config,order.id,session)).status,'partially_refunded');
  await acceptWebhook(pool,provider,config,new Headers(),{...event,id:randomUUID(),event_type:'PAYMENT.CAPTURE.REVERSED'});
  const reversed=await checkoutStatus(pool,provider,config,order.id,session);assert.equal(reversed.status,'reversed');assert.equal(reversed.fulfillment,'hold');
  assert.equal(nextStatus('refunded','COMPLETED'),'refunded');
});
test('disabled creation, unapproved capture, expired attempts and rate limiting fail closed', async () => {
  const provider = new MockPayPal(), session=randomUUID();
  await assert.rejects(()=>beginCheckout(pool,provider,{...config,enabled:false},input(),session));
  const order=await beginCheckout(pool,provider,config,input(),session);provider.orders.get(order.id)!.status='CREATED';
  await assert.rejects(()=>checkoutStatus(pool,provider,config,order.id,session,true));assert.equal(provider.captures,0);
  provider.orders.get(order.id)!.status='APPROVED';await pool.query("UPDATE academy_crm.payment_orders SET created_at=now()-interval '4 hours' WHERE id=$1",[order.id]);
  await assert.rejects(()=>checkoutStatus(pool,provider,config,order.id,session,true));assert.equal(provider.captures,0);
  const bucket=randomUUID(), secret='test-rate-secret-at-least-32-characters';
  await paymentRateLimit(pool,bucket,secret,1);await assert.rejects(()=>paymentRateLimit(pool,bucket,secret,1));
});
test('provider transport uses correct host, stable IDs and verification endpoint', async () => {
  const seen: {url:string; options:RequestInit}[]=[];
  const transport:typeof fetch=async(url, options)=>{
    seen.push({url:String(url),options:options!});
    return Response.json(String(url).endsWith('/token')?{access_token:'test-access'}:String(url).includes('verify-webhook-signature')?{verification_status:'SUCCESS'}:{id:'ORDER',status:'CREATED'});
  };
  const provider=new PayPal(config,transport);await provider.create('test-id','Test',4900);
  const sent=JSON.parse(String(seen[1].options.body));assert.equal(sent.purchase_units[0].amount.value,'49.00');
  assert.equal((seen[1].options.headers as Record<string,string>)['PayPal-Request-Id'],'create-test-id');
  assert.ok(seen.every(call=>call.url.startsWith('https://api-m.sandbox.paypal.com/')));
  assert.equal(await provider.verifyWebhook(new Headers(),{}),false);
  const headers=new Headers(Object.fromEntries(['paypal-auth-algo','paypal-cert-url','paypal-transmission-id','paypal-transmission-sig','paypal-transmission-time'].map(name=>[name,'test'])));
  assert.equal(await provider.verifyWebhook(headers,{id:'TEST'}),true);
  assert.equal(JSON.parse(String(seen.at(-1)!.options.body)).webhook_id,config.webhookId);
});
