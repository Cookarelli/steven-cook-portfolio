// Shared with the existing app-services landing page.
const bookingUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL?.trim() || "https://calendar.app.google/FcGwkANYvFkbsy349";
export const consultationReady = /^https:\/\/(calendar\.app\.google|calendar\.google\.com)\//i.test(bookingUrl);
export const consultationHref = consultationReady ? bookingUrl : "/#contact";
