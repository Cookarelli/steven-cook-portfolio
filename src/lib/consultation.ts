// One destination for the homepage, demos, thank-you page, and inquiry fallback.
// Optimize Local - Free Business App Consultation: 20 minutes, no payment required.
const bookingUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL?.trim() || "https://calendar.app.google/FcGwkANYvFkbsy349";
export const consultationReady = /^https:\/\/(calendar\.app\.google|calendar\.google\.com)\//i.test(bookingUrl);
export const consultationHref = consultationReady ? bookingUrl : "/#contact";
