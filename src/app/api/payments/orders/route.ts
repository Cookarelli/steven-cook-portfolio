import { database } from '@/lib/academy-crm/database';
import { assertOrigin, readJson, json, errorResponse } from '@/lib/academy-crm/http';
import { assertPaymentsEnabled, paymentConfig } from '@/lib/payments/config';
import { checkoutInput } from '@/lib/payments/model';
import { checkoutSession } from '@/lib/payments/http';
import { PayPal } from '@/lib/payments/paypal';
import { beginCheckout, paymentRateLimit } from '@/lib/payments/store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const config = paymentConfig(); assertPaymentsEnabled(config);
    const input = checkoutInput(await readJson(request), config);
    const session = await checkoutSession(true);
    const pool = database();
    await paymentRateLimit(pool, `create:${request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown'}`, process.env.ACADEMY_RATE_LIMIT_SECRET || '');
    return json(await beginCheckout(pool, new PayPal(config), config, input, session));
  } catch (error) { return errorResponse(error); }
}
