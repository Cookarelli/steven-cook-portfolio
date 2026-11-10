import { createHash } from 'node:crypto';
import { CrmError } from '../academy-crm/model';
import type { PaymentConfig } from './config';
import type { ProviderOrder } from './paypal';

export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export interface CheckoutInput { attempt: string; program: string; name: string; email: string; preferredTimes: string; termsVersion: string }
export function checkoutInput(raw: unknown, config: PaymentConfig): CheckoutInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new CrmError(400, 'Invalid checkout.');
  const data = raw as Record<string, unknown>;
  if (Object.keys(data).some(key => !['attempt', 'program', 'name', 'email', 'preferredTimes', 'termsVersion', 'consent'].includes(key))) throw new CrmError(400, 'Unexpected checkout fields.');
  const str = (key: string, max: number) => {
    const value = data[key];
    if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f]/.test(value)) throw new CrmError(400, `Please check ${key}.`);
    return value.trim();
  };
  const input = { attempt: str('attempt', 36), program: str('program', 80), name: str('name', 120), email: str('email', 200).toLowerCase(), preferredTimes: str('preferredTimes', 500), termsVersion: str('termsVersion', 100) };
  if (!uuid(input.attempt) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || data.consent !== true || input.termsVersion !== config.policyVersion) throw new CrmError(400, 'Check your email and accept the current checkout terms.');
  return input;
}
export function verifiedCapture(order: ProviderOrder, expected: { id: string; provider_order_id: string; cents: number; merchant_id: string }) {
  const unit = order.purchase_units?.[0];
  const moneyMatches = (money: { currency_code: string; value: string } | undefined) => money?.currency_code === 'USD' && money.value === (expected.cents / 100).toFixed(2);
  if (order.id !== expected.provider_order_id || order.purchase_units?.length !== 1 || unit?.custom_id !== expected.id || unit.payee?.merchant_id !== expected.merchant_id || !moneyMatches(unit.amount)) throw new CrmError(409, 'Payment details need review. Do not pay again; contact Optimize Local.');
  const captures = unit.payments?.captures || [];
  if (!captures.length) return null;
  if (captures.length !== 1 || !moneyMatches(captures[0].amount) || !captures[0].id) throw new CrmError(409, 'Payment details need review. Do not pay again; contact Optimize Local.');
  return captures[0];
}
export function nextStatus(previous: string, providerStatus: string) {
  const mapped: Record<string, string> = { COMPLETED: 'paid', PENDING: 'pending', DECLINED: 'denied', FAILED: 'denied', REFUNDED: 'refunded', PARTIALLY_REFUNDED: 'partially_refunded' };
  const next = mapped[providerStatus] || 'review';
  if (previous === 'reversed' || previous === 'refunded') return previous;
  if (previous === 'partially_refunded' && next !== 'refunded') return previous;
  if (previous === 'paid' && !['partially_refunded', 'refunded', 'reversed'].includes(next)) return previous;
  return next;
}
