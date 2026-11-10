import { database } from '@/lib/academy-crm/database';
import { assertOrigin, json, errorResponse } from '@/lib/academy-crm/http';
import { paymentConfig } from '@/lib/payments/config';
import { checkoutSession } from '@/lib/payments/http';
import { PayPal } from '@/lib/payments/paypal';
import { checkoutStatus, paymentRateLimit } from '@/lib/payments/store';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
async function handle(request: Request, context: Context, capture: boolean) {
  try {
    if (capture) assertOrigin(request);
    const config = paymentConfig(), session = await checkoutSession();
    const pool = database();
    await paymentRateLimit(pool, `status:${session}`, process.env.ACADEMY_RATE_LIMIT_SECRET || '', 60);
    return json(await checkoutStatus(pool, new PayPal(config), config, (await context.params).id, session, capture));
  } catch (error) { return errorResponse(error); }
}
export async function GET(request: Request, context: Context) { return handle(request, context, false); }
export async function POST(request: Request, context: Context) { return handle(request, context, true); }
