'use client';
import Link from 'next/link';
import { useState } from 'react';
import '../view.css';
type Payment = { id: string; title: string; name: string; email: string; preferred_times: string; cents: number; status: string; fulfillment: string; capture_id: string | null; created_at: string; financials: unknown };
export function PaymentDashboard() {
  const [token, setToken] = useState(''), [environment, setEnvironment] = useState('live'), [orders, setOrders] = useState<Payment[]>([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true); setMessage(''); setOrders([]);
    try {
      const response = await fetch(`/api/admin/academy/payments?environment=${environment}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to load payments.');
      setOrders(data.orders);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load payments.'); } finally { setBusy(false); }
  }
  async function update(id: string, fulfillment: string) {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/academy/payments', { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, fulfillment }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Unable to update.');
      await load(); setMessage('Fulfillment updated with an audit record.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update.'); } finally { setBusy(false); }
  }
  return <main className="crm"><header><Link href="/admin/ai-academy">← Academy leads</Link><h1>Academy payments</h1><p>Payment status comes from PayPal. Scheduling and delivery are managed separately. No emails are sent by this screen.</p></header><form className="crm-access" onSubmit={event => { event.preventDefault(); void load(); }}><label>Business administrator token<input type="password" autoComplete="off" minLength={32} required value={token} onChange={event => { setToken(event.target.value); setOrders([]); }} /></label><label>Environment<select value={environment} onChange={event => { setEnvironment(event.target.value); setOrders([]); }}><option value="live">Live payments</option><option value="sandbox">Sandbox test payments</option></select></label><button disabled={busy}>Load payments</button><button type="button" onClick={() => { setToken(''); setOrders([]); }}>Clear session</button></form><p role="status">{busy ? 'Working…' : message}</p><p>{orders.length} orders shown (newest 200). Open PayPal for transaction support, disputes or refunds.</p>{orders.map(order => <article className="crm-lead" key={order.id}><h2>{order.title} · ${(order.cents / 100).toFixed(2)} USD</h2><p>{order.name} · {order.email}<br />Preferred times: {order.preferred_times}</p><p>Order: {order.id}<br />PayPal capture: {order.capture_id || 'Not captured'}<br />Payment: <strong>{order.status}</strong> · Fulfillment: <strong>{order.fulfillment}</strong></p>{order.status === 'paid' && <form onSubmit={event => { event.preventDefault(); void update(order.id, String(new FormData(event.currentTarget).get('fulfillment'))); }}><label>Fulfillment<select name="fulfillment" defaultValue={order.fulfillment}><option value="scheduling_pending">Scheduling pending</option><option value="booked">Booked (time agreed separately)</option><option value="completed">Completed</option></select></label><button disabled={busy}>Save fulfillment</button></form>}<details><summary>Provider-reported gross, fee and net</summary><pre>{order.financials ? JSON.stringify(order.financials, null, 2) : 'Not supplied by PayPal.'}</pre></details></article>)}</main>;
}
