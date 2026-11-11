'use client';
import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type Order = { id: string; program: string; title: string; cents: number; status: string; fulfillment: string; captureId: string | null; paypalOrderId?: string; approvalUrl?: string | null; environment: string };
type Session = { start(options: { presentationMode: 'auto' }, order: Promise<{ orderId: string }>): Promise<unknown> };
type Callbacks = { onApprove(data: { orderId: string }): Promise<void>; onCancel(): void; onError(): void };
type Instance = { findEligibleMethods(options: { currencyCode: string }): Promise<{ isEligible(method: string): boolean }>; createPayPalOneTimePaymentSession(callbacks: Callbacks): Session | Promise<Session>; createVenmoOneTimePaymentSession(callbacks: Callbacks): Session | Promise<Session> };
declare global { interface Window { paypal?: { createInstance(options: { clientId: string; components: string[]; pageType: string }): Promise<Instance> } } }
async function request(url: string, body?: unknown): Promise<Order> {
  const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(45000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to confirm payment. Check this order before paying again.');
  return data;
}
function stored(key: string) { try { return sessionStorage.getItem(key); } catch { return null; } }
export function Checkout({ program, clientId, environment, termsVersion, enabled = true, returnOrderId = '', returnState = '', returnToken = '' }: { program: string; clientId: string; environment: string; termsVersion: string; enabled?: boolean; returnOrderId?: string; returnState?: string; returnToken?: string }) {
  const [order, setOrder] = useState<Order | null>(null), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [ready, setReady] = useState(false), [restored, setRestored] = useState(false);
  const buttons = useRef<HTMLDivElement>(null), locked = useRef(false), current = useRef<Order | null>(null), attempt = useRef('');
  const storage = `academy-checkout:${environment}:${program}`;
  const orderId = order?.id, orderStatus = order?.status, paypalOrderId = order?.paypalOrderId;
  function remember(value: Order) { current.current = value; setOrder(value); try { sessionStorage.setItem(storage, value.id); } catch { /* Receipt remains visible if browser storage is disabled. */ } }
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        attempt.current = stored(`${storage}:attempt`) || crypto.randomUUID();
        try { sessionStorage.setItem(`${storage}:attempt`, attempt.current); } catch { /* Cookies still protect the order if session storage is unavailable. */ }
        const id = returnOrderId || stored(storage);
        if (id) {
          let value = await request(`/api/payments/orders/${encodeURIComponent(id)}`);
          if (value.program !== program) throw new Error('This order belongs to another session. Contact us before paying again.');
          if (active) { current.current = value; setOrder(value); }
          if (enabled && returnState === 'return' && value.status === 'created') {
            if (!returnToken || returnToken !== value.paypalOrderId) throw new Error('The PayPal return could not be matched. Check payment status before paying again.');
            locked.current = true; if (active) { setBusy(true); setMessage('Confirming your PayPal payment…'); }
            // The server verifies ownership, amount, recipient and PayPal approval before capture.
            value = await request(`/api/payments/orders/${encodeURIComponent(id)}`, {});
          }
          if (active) {
            current.current = value; setOrder(value);
            try { sessionStorage.setItem(storage, value.id); } catch { /* The return URL also identifies the protected receipt. */ }
            if (returnState) setMessage(value.status === 'paid' ? 'PayPal payment confirmed.' : returnState === 'cancel' ? 'Checkout was closed. You can resume this payment below.' : 'Payment status checked.');
          }
        }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : 'If you previously tried payment, contact us with your order reference before starting again.'); }
      finally { locked.current = false; if (!attempt.current) attempt.current = crypto.randomUUID(); if (active) { setBusy(false); setRestored(true); } }
    })();
    return () => { active = false; };
  }, [storage, program, enabled, returnOrderId, returnState, returnToken]);
  async function refresh(capture = false) {
    if (!current.current || locked.current) return;
    locked.current = true; setBusy(true); setMessage('Checking with PayPal…');
    try { remember(await request(`/api/payments/orders/${current.current.id}`, capture ? {} : undefined)); setMessage('Payment status checked.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to check payment. Please do not pay again yet.'); }
    finally { locked.current = false; setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (locked.current) return;
    locked.current = true; setBusy(true); setMessage('Preparing your secure payment…');
    const data = new FormData(event.currentTarget);
    try {
      const value = await request('/api/payments/orders', { attempt: attempt.current, program, name: data.get('name'), email: data.get('email'), preferredTimes: data.get('preferredTimes'), consent: data.get('consent') === 'yes', termsVersion });
      remember(value); setMessage(value.approvalUrl ? 'Continue to PayPal below to complete your payment. You can also use an available wallet button.' : 'Choose an available payment method.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to prepare payment. Retry with the same details.'); }
    finally { locked.current = false; setBusy(false); }
  }
  useEffect(() => {
    if (!enabled || !ready || !orderId || orderStatus !== 'created' || !paypalOrderId || !buttons.current) return;
    let active = true;
    const container = buttons.current;
    const cleanups: (() => void)[] = [];
    void (async () => {
      try {
        const sdk = await window.paypal?.createInstance({ clientId, components: ['paypal-payments', 'venmo-payments'], pageType: 'checkout' });
        if (!sdk || !active) return;
        const eligible = await sdk.findEligibleMethods({ currencyCode: 'USD' });
        let count = 0;
        for (const method of ['paypal', 'venmo']) {
          if (!active || !eligible.isEligible(method)) continue;
          try {
            const callbacks: Callbacks = {
              async onApprove(data) {
                if (!current.current || data.orderId !== current.current.paypalOrderId) { locked.current = false; setBusy(false); setMessage('Payment needs review. Check the order status before paying again.'); return; }
                setMessage('Confirming your payment…');
                try { const value = await request(`/api/payments/orders/${current.current.id}`, {}); if (active) { current.current = value; setOrder(value); setMessage('Payment status checked.'); } }
                catch (error) { if (active) setMessage(error instanceof Error ? error.message : 'Payment outcome is unknown. Check this order before paying again.'); }
                finally { locked.current = false; if (active) setBusy(false); }
              },
              onCancel() { locked.current = false; if (active) { setBusy(false); setMessage('Checkout was closed. You can check the order status or resume this payment.'); } },
              onError() { locked.current = false; if (active) { setBusy(false); setMessage('Payment could not be confirmed. Check the order status before trying again.'); } },
            };
            const session = await (method === 'paypal' ? sdk.createPayPalOneTimePaymentSession(callbacks) : sdk.createVenmoOneTimePaymentSession(callbacks));
            if (!active) return;
            const button = document.createElement(`${method}-button`); button.setAttribute('type', 'pay');
            const click = () => {
              if (locked.current || !current.current?.paypalOrderId) return;
              locked.current = true; setBusy(true); setMessage(`Opening ${method === 'paypal' ? 'PayPal' : 'Venmo'}…`);
              // Start in the click handler, without awaiting first (preserves user activation).
              void session.start({ presentationMode: 'auto' }, Promise.resolve({ orderId: current.current.paypalOrderId })).catch(callbacks.onError);
            };
            button.addEventListener('click', click); container.append(button); count++;
            cleanups.push(() => { button.removeEventListener('click', click); button.remove(); });
          } catch { /* Keep the other eligible method usable if one setup fails. */ }
        }
        if (active && !count) setMessage(current.current?.approvalUrl ? 'Use the secure PayPal link below to complete payment.' : 'No supported wallet is available in this browser. Contact us to arrange payment.');
      } catch { if (active) setMessage(current.current?.approvalUrl ? 'Use the secure PayPal link below. The embedded wallet buttons could not load.' : 'Payment buttons did not load. Check your connection, then reload this checkout.'); }
    })();
    return () => { active = false; cleanups.forEach(cleanup => cleanup()); };
  }, [enabled, ready, orderId, orderStatus, paypalOrderId, clientId]);
  if (!enabled && !order) return <p role="status">{message}</p>;
  return <section className="checkout-panel" aria-label="Payment details">
    {enabled && <Script id="academy-paypal-sdk" src={`https://www.${environment === 'sandbox' ? 'sandbox.' : ''}paypal.com/web-sdk/v6/core`} onReady={() => setReady(true)} onError={() => setMessage('The embedded wallet buttons could not load. Continue below to use secure PayPal checkout.')} />}
    {!order && <form className="ol-form" onSubmit={submit}><h2>Your session details</h2><label>Your name<input name="name" autoComplete="name" required maxLength={120} disabled={busy || !restored} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} disabled={busy || !restored} /></label><label>Preferred days, times and time zone<input name="preferredTimes" required maxLength={500} placeholder="For example, weekday mornings, Central Time" disabled={busy || !restored} /></label><label className="academy-consent"><input type="checkbox" name="consent" value="yes" required disabled={busy || !restored} /><span>I agree to the <Link href="/refund-policy" target="_blank" rel="noopener noreferrer">cancellation and refund policy</Link>, the scheduling terms shown here, and the <Link href="/privacy">privacy notice</Link>. I understand that my appointment time will be confirmed separately.</span></label><button className="ol-button ol-button-primary" disabled={busy || !restored}>Continue to payment ↗</button><noscript>JavaScript is required for online payment. Please email us to arrange your session.</noscript></form>}
    <p role="status" aria-live="polite">{busy ? 'Working… ' : ''}{message}</p>
    {order && <><h2>{order.status === 'paid' ? 'Payment received' : ['refunded', 'partially_refunded', 'reversed'].includes(order.status) ? 'Payment updated' : 'Your payment'}</h2><p>Order reference: <strong className="checkout-reference">{order.id}</strong></p><p>{order.title} · ${(order.cents / 100).toFixed(2)} USD</p><p>Status: <strong>{order.status.replaceAll('_', ' ')}</strong>{order.captureId ? ` · PayPal reference: ${order.captureId}` : ''}</p>{order.status === 'paid' ? <p>Thank you. Keep this receipt. {order.fulfillment === 'booked' ? 'Your session is marked booked.' : order.fulfillment === 'completed' ? 'Your session is marked completed.' : 'Scheduling is pending; we’ll follow up at the email you provided to agree on a time.'} You do not need to submit a separate payment-verification form.</p> : order.status === 'pending' ? <p>PayPal is still processing this payment. Do not pay again. Check back here for confirmation.</p> : order.status === 'created' ? <p>Venmo appears only when PayPal confirms it is eligible for this session.</p> : <p>Contact us with this order reference to confirm the next step. Do not start another payment for this order.</p>}<div className="checkout-payment-methods">{enabled && order.status === 'created' && order.approvalUrl && <a className="ol-button ol-button-primary" href={order.approvalUrl} aria-disabled={busy} onClick={event => { if (busy) event.preventDefault(); }}>Continue to PayPal ↗</a>}<div ref={buttons} className="checkout-buttons" aria-busy={busy} /></div><button className="ol-button" type="button" disabled={busy} onClick={() => void refresh()}>Check payment status</button>{enabled && order.status === 'created' && <button className="ol-button" type="button" disabled={busy} onClick={() => void refresh(true)}>Complete an approved payment</button>}<p>We haven’t confirmed email delivery. Save this page or your order reference for follow-up.</p></>}
  </section>;
}
