// Owner-approved wording, supplied November 10, 2026. Keep website and checkout in sync.
export const purchasePolicyVersion = 'optimize-local-refunds-2026-11-10';
export const purchasePolicyIntro = 'This policy applies to purchases at optimizelocalai.com, unless different terms are agreed to in writing before purchase.';
export const purchasePolicySections = [
  { heading: 'Custom websites, apps, and automation services', text: 'You may cancel before work begins for a full refund, less any nonrecoverable third-party expenses you approved in advance. Once work begins, we will refund any unused balance after deducting completed work at the agreed rates or milestone prices and approved nonrecoverable expenses. Completed work is not refundable for a change of mind.' },
  { heading: 'Training and appointments', text: 'Cancel or reschedule at least 24 hours before your appointment for a full refund or free rescheduling. Cancellations within 24 hours and missed appointments are nonrefundable, although we may offer rescheduling at our discretion.' },
  { heading: 'Digital products and self-paced courses', text: 'Purchases are nonrefundable once downloaded or accessed, except where required by law. If you cannot access your purchase or it materially differs from its description, contact us so we can correct the issue or provide an appropriate refund.' },
  { heading: 'Delivery problems', text: 'If we cancel a service or cannot deliver the agreed work, we will refund the undelivered portion. Please report issues promptly so we can work toward a correction or refund.' },
  { heading: 'Requesting a refund', text: 'Email optimizelocalai@gmail.com with your name, purchase details, and reason for the request. Approved refunds will be issued to the original payment method within 5–10 business days. Your payment provider may require additional processing time.' },
] as const;
export const purchasePolicyRights = 'Nothing in this policy limits rights available under applicable law or your payment provider’s dispute and buyer-protection rules.';
export const purchasePolicyText = [purchasePolicyIntro, ...purchasePolicySections.map(section => `${section.heading}: ${section.text}`), purchasePolicyRights].join('\n\n');
