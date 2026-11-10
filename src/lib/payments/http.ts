import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { CrmError } from '../academy-crm/model';
import { paymentConfig } from './config';

export const sessionCookie = 'academy_checkout';
export async function checkoutSession(create = false) {
  const jar = await cookies();
  const existing = jar.get(sessionCookie)?.value;
  if (existing && /^[a-f0-9]{64}$/.test(existing)) return existing;
  if (!create) throw new CrmError(404, 'Order not found in this browser session.');
  const session = randomBytes(32).toString('hex');
  jar.set(sessionCookie, session, { httpOnly: true, secure: paymentConfig().origin.startsWith('https://'), sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 });
  return session;
}
