import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAcademyProgram, formatPrice } from '@/config/ai-academy';
import { paymentConfig } from '@/lib/payments/config';
import { Checkout } from '@/components/academy/checkout';
import { PurchasePolicy } from '@/components/purchase-policy';
import './checkout.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Secure checkout | Optimize Local AI', robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const program = getAcademyProgram((await params).slug);
  if (!program || program.comingSoon || !['private', 'team', 'audit'].includes(program.format)) notFound();
  const config = paymentConfig();
  const query = await searchParams;
  const returnProps = { returnOrderId: typeof query.order === 'string' ? query.order : '', returnState: query.paypal === 'return' || query.paypal === 'cancel' ? query.paypal : '', returnToken: typeof query.token === 'string' ? query.token : '' };
  return <main id="academy-main" className="ol-container checkout-page">
    <Link href={`/ai-academy/${program.slug}`}>← {program.title}</Link>
    <p className="ol-eyebrow">{config.environment === 'sandbox' && config.enabled ? 'SANDBOX — TEST PAYMENTS ONLY' : 'SECURE CHECKOUT'}</p>
    <h1>{program.title}</h1>
    <div className="checkout-grid"><section className="checkout-summary"><h2>{formatPrice(program)} USD</h2><p>{program.priceBasis} · {program.duration}</p><p>{program.delivery}</p><ul>{program.included.map(item => <li key={item}>{item}</li>)}</ul>
      <p><strong>Payment does not reserve an appointment.</strong> We’ll contact you at the email you provide to agree on a time. Third-party AI subscriptions are not included.</p>
      <details className="checkout-terms"><summary>Cancellation & refund policy</summary><PurchasePolicy /></details><p><Link href="/refund-policy">Read the full policy on its own page ↗</Link></p>
      <p>Questions? <a href="mailto:optimizelocalai@gmail.com">Email Optimize Local</a>.</p>
    </section>{config.enabled ? <Checkout program={program.slug} clientId={config.clientId} environment={config.environment} termsVersion={config.policyVersion} {...returnProps} /> : <section className="checkout-summary"><h2>Request your session</h2><p>Online checkout is being prepared. Send a request and we’ll confirm availability and payment arrangements.</p><Link className="ol-button ol-button-primary" href={`/ai-academy/${program.slug}#request`}>Request this session ↗</Link><Checkout program={program.slug} clientId="" environment={config.environment} termsVersion="" enabled={false} {...returnProps} /></section>}</div>
  </main>;
}
