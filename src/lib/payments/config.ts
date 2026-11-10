import { getAcademyProgram } from '../../config/ai-academy';
import { purchasePolicyText, purchasePolicyVersion } from '../../config/purchase-policy';
import { CrmError } from '../academy-crm/model';

export type PaymentEnvironment = 'sandbox' | 'live';
export interface PaymentConfig {
  environment: PaymentEnvironment; clientId: string; secret: string; merchantId: string;
  webhookId: string; origin: string; policy: string; policyVersion: string; enabled: boolean;
}
// Only server modules import this function. Never serialize this entire object.
export function paymentConfig(): PaymentConfig {
  const environment = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  const config = {
    environment, clientId: process.env.PAYPAL_CLIENT_ID || '', secret: process.env.PAYPAL_CLIENT_SECRET || '',
    merchantId: process.env.PAYPAL_MERCHANT_ID || '', webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    origin: process.env.ACADEMY_SITE_ORIGIN || '', policy: purchasePolicyText,
    policyVersion: purchasePolicyVersion, enabled: process.env.PAYMENTS_ENABLED === 'true',
  };
  if (environment === 'live' && process.env.VERCEL_ENV !== 'production') config.enabled = false;
  if (!config.clientId || !config.secret || !config.merchantId || !config.webhookId || !config.origin || !config.policy || !config.policyVersion || process.env.PAYMENT_TOTALS_CONFIRMED !== 'true') config.enabled = false;
  return config as PaymentConfig;
}
export function assertPaymentsEnabled(config: PaymentConfig) {
  if (!config.enabled) throw new CrmError(503, 'Online payment is not available yet. Please request a session.');
}
export function payableProgram(slug: string) {
  const program = getAcademyProgram(slug);
  if (!program || program.comingSoon || !['private', 'team', 'audit'].includes(program.format)) throw new CrmError(400, 'This offer is not available for checkout.');
  const cents = Math.round(program.price * 100);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new CrmError(503, 'Offer price is unavailable.');
  return { ...program, cents };
}
