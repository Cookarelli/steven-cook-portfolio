import { CrmError } from '../academy-crm/model';
import type { PaymentConfig } from './config';

export interface Money { currency_code: string; value: string }
export interface Capture {
  id: string; status: string; amount: Money; final_capture?: boolean;
  seller_receivable_breakdown?: { gross_amount?: Money; paypal_fee?: Money; net_amount?: Money };
}
export interface ProviderOrder {
  id: string; status: string;
  purchase_units?: { custom_id?: string; amount?: Money; payee?: { merchant_id?: string }; payments?: { captures?: Capture[] } }[];
}
export interface PayPalProvider {
  create(id: string, title: string, cents: number): Promise<ProviderOrder>;
  order(id: string): Promise<ProviderOrder>;
  capture(id: string, requestId: string): Promise<ProviderOrder>;
  verifyWebhook(headers: Headers, event: unknown): Promise<boolean>;
}
export class PayPal implements PayPalProvider {
  private token = '';
  constructor(private config: PaymentConfig, private fetchImpl: typeof fetch = fetch) {
    if (config.environment === 'live' && process.env.VERCEL_ENV !== 'production') throw new CrmError(503, 'Live payment access is disabled outside production.');
  }
  private get base() { return this.config.environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }
  private async request(path: string, method = 'GET', body?: unknown, requestId?: string) {
    if (!this.token) {
      const response = await this.fetchImpl(`${this.base}/v1/oauth2/token`, { method: 'POST', signal: AbortSignal.timeout(10000), headers: { Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || typeof data.access_token !== 'string') throw new CrmError(503, 'Payment service is unavailable. Please try later.');
      this.token = data.access_token;
    }
    const response = await this.fetchImpl(this.base + path, { method, signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(requestId ? { 'PayPal-Request-Id': requestId } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), cache: 'no-store' });
    const data = await response.json();
    // Never relay provider bodies, headers, or credentials to public logs/errors.
    if (!response.ok) throw new CrmError(502, 'We could not confirm the payment outcome. Check this order again before trying another payment.');
    return data;
  }
  create(id: string, title: string, cents: number): Promise<ProviderOrder> {
    return this.request('/v2/checkout/orders', 'POST', {
      intent: 'CAPTURE', purchase_units: [{ custom_id: id, description: title, payee: { merchant_id: this.config.merchantId }, amount: { currency_code: 'USD', value: (cents / 100).toFixed(2) } }],
      application_context: { brand_name: 'Optimize Local AI', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
    }, `create-${id}`);
  }
  order(id: string): Promise<ProviderOrder> { return this.request(`/v2/checkout/orders/${encodeURIComponent(id)}`); }
  capture(id: string, requestId: string): Promise<ProviderOrder> { return this.request(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, 'POST', {}, requestId); }
  async verifyWebhook(headers: Headers, event: unknown) {
    const names = ['paypal-auth-algo', 'paypal-cert-url', 'paypal-transmission-id', 'paypal-transmission-sig', 'paypal-transmission-time'];
    if (!this.config.webhookId || names.some(name => !headers.get(name))) return false;
    const data = await this.request('/v1/notifications/verify-webhook-signature', 'POST', {
      auth_algo: headers.get(names[0]), cert_url: headers.get(names[1]), transmission_id: headers.get(names[2]), transmission_sig: headers.get(names[3]), transmission_time: headers.get(names[4]), webhook_id: this.config.webhookId, webhook_event: event,
    });
    return data.verification_status === 'SUCCESS';
  }
}
