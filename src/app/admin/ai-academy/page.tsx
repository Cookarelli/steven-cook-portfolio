import type { Metadata } from 'next';
import { LeadDashboard } from './view';
export const metadata:Metadata={title:'Academy lead management',robots:{index:false,follow:false}};
export default function Page(){return <LeadDashboard/>;}
