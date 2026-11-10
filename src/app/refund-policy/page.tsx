import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { PurchasePolicy } from '@/components/purchase-policy';
export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy',
  description: 'Cancellation, rescheduling and refund terms for Optimize Local AI services, training and digital products.',
  alternates: { canonical: '/refund-policy' },
};
export default function RefundPolicyPage() {
  return <main className="ol-site ol-message-page"><div className="ol-container ol-message-card ol-privacy-content">
    <BrandLogo href="/" className="ol-footer-logo" />
    <p className="ol-eyebrow">PURCHASE TERMS</p><h1>Cancellation & refund policy</h1>
    <PurchasePolicy />
    <p><Link href="/privacy">Privacy & contact inquiries</Link></p>
    <Link className="ol-button ol-button-primary" href="/">Back to Optimize Local ↗</Link>
  </div></main>;
}
