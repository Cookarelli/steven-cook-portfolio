import { database } from '@/lib/academy-crm/database';
import { readJson, json, errorResponse } from '@/lib/academy-crm/http';
import { paymentConfig } from '@/lib/payments/config';
import { PayPal } from '@/lib/payments/paypal';
import { acceptWebhook } from '@/lib/payments/store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const config = paymentConfig();
    const event = await readJson(request,128000);
    await acceptWebhook(database(), new PayPal(config), config, request.headers, event);
    return json({ received: true });
  } catch (error) { return errorResponse(error); }
}
