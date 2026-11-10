import type { Metadata } from 'next';
import { LeadDashboard } from './view';
import Link from 'next/link';
export const metadata:Metadata={title:'Academy lead management',robots:{index:false,follow:false}};
export default function Page(){return <><nav className="crm"><Link href="/admin/ai-academy/payments">Open PayPal payment records →</Link></nav><LeadDashboard/></>;}
