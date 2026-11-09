import { freeDiscoveryService, getOfferSnapshot } from './model';

export const followUpTemplates = {
 inquiry: { promotional:false, subject:'Your Optimize Local AI Academy inquiry', body:'Hi {{name}},\n\nThanks for your interest in {{program}}. What would you most like help with? We will confirm availability, price and arrangements before any commitment.\n\nSteve\nOptimize Local AI Academy' },
 payment: { promotional:false, subject:'Payment confirmed for {{program}}', body:'Hi {{name}},\n\nWe have independently verified your payment for {{program}}. Your next step is {{next_step}}. Appointment details or workshop seats are confirmed separately.\n\nSteve\nOptimize Local AI Academy', prerequisite:'Send only after status is Payment Verified and the payment provider has been checked.' },
 preparation: { promotional:false, subject:'Getting ready for {{program}}', body:'Hi {{name}},\n\nYour confirmed session is {{date_time_timezone}} at {{meeting_link}}. Bring a device with internet access and a task you would like to explore. Use fictional or anonymized examples; do not bring financial credentials or sensitive health information.\n\nSteve\nOptimize Local AI Academy' },
 followUp: { promotional:false, subject:'Following up on your {{program}} training', body:'Hi {{name}},\n\nThanks for joining us. How did your practice go? Your agreed follow-up is {{agreed_follow_up}}. Reply with questions about the training.\n\nSteve\nOptimize Local AI Academy' },
 appDevelopment: { promotional:true, subject:'Want help putting your workflow into practice?', body:'Hi {{name}},\n\nYou opted in to updates and offers from Optimize Local. If you would like help turning an idea into a business app or automation, we can discuss a separately scoped project. There is no obligation and outcomes are not guaranteed.\n\nReply “unsubscribe” to stop promotional emails.\n\nSteve\nOptimize Local', prerequisite:'Use only with current, separately recorded marketing consent. Confirm any withdrawal before sending.' },
};
export function acknowledgment(name:string,program:string,requestType:string,id:string) {
 const offer=getOfferSnapshot(program);
 const kind=requestType==='waitlist'?'course-update':requestType==='workshop'?'workshop interest':requestType==='payment-verification'?'payment verification':requestType;
 const next=requestType==='payment-verification'?'Your transaction reference is awaiting independent manual review; this receipt does not verify payment.':requestType==='waitlist'?'Joining the update list is free. The course is not yet available to purchase or access.':'We will review your request and follow up using your requested contact method.';
 const receipt=requestType==='consultation'?`Your free ${freeDiscoveryService.durationMinutes}-minute discovery consultation request has been saved.`:`Your ${kind} request for ${offer.title} has been saved.`;
 return `Hi ${name},\n\n${receipt} Reference: ${id}.\n\n${requestOfferSummary(program,requestType)}\n\nThese are program details, not a charge or request for payment. ${next} No appointment, workshop seat or course enrollment has been confirmed.\n\nOptimize Local AI Academy`;
}
export function offerSummary(program:string):string {
 const offer=getOfferSnapshot(program);
 const amount=offer.price===null?offer.priceBasis:`${new Intl.NumberFormat('en-US',{style:'currency',currency:offer.currency,maximumFractionDigits:0}).format(offer.price)} USD (${offer.priceBasis})`;
 return `Program: ${offer.title}\n${offer.comingSoon?'Planned price':'Price'}: ${amount}\nDuration: ${offer.duration}\nDelivery: ${offer.delivery}`;
}

export function businessNotification(program:string,requestType:string,id:string):string {
 return `A new ${requestType} request has been saved.\n${requestOfferSummary(program,requestType)}\nReference: ${id}\nReview it in the protected Academy lead view. No payment, booking, workshop seat or course enrollment is confirmed by this request.`;
}

function requestOfferSummary(program:string,requestType:string):string {
 if(requestType!=='consultation')return offerSummary(program);
 return `Requested appointment: FREE ${freeDiscoveryService.durationMinutes}-minute discovery consultation\nRequested price: $${freeDiscoveryService.price} ${freeDiscoveryService.currency}\nRequested duration: ${freeDiscoveryService.durationMinutes} minutes\nNo appointment time is confirmed.\n\nSelected program — interest only; no paid slot is reserved:\n${offerSummary(program)}`;
}
