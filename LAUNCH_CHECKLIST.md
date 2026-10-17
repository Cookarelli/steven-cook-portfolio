# Optimize Local - launch checklist

This is the custom apps and small-business services site built from the Steven Cook portfolio repository.

## What is implemented
- Optimize Local brand and conversion-focused landing page
- Services, three starting-price packages ($500, $1,500, $2,500)
- Four examples: Northside Collectibles, Jaz It Up Beauty Lounge, Transporter 17, Step Outside
- 20-minute consultation call to action, with email fallback until booking is configured
- Contact form deliberately opens the visitor's email app; **it does not silently collect messages or claim to send them**
- Previous full professional portfolio preserved at /portfolio
- Responsive styles, SEO metadata, structured data, and sitemap

## Google Calendar (required to enable instant online booking)
1. Sign into https://calendar.google.com as optimizelocalai@gmail.com, NOT the separate personal Calendar account.
2. Click Create > Appointment schedule.
3. Name it "Optimize Local - Free Business App Consultation".
4. Set duration to **Custom > 20 minutes**.
5. Choose your actual available days/hours, meeting method (Google Meet recommended), buffer and minimum notice.
6. Save. Under Booking pages, copy the link for this exact schedule.
7. In Vercel's project Environment Variables, set NEXT_PUBLIC_GOOGLE_BOOKING_URL to that https://calendar.app.google/... (or https://calendar.google.com/...) public booking page link.
8. Redeploy the project so the new link is included in the build.
9. From a logged-out browser, click Book your free 20-minute call, and make a test booking. Confirm it appears on the correct calendar and confirmation email is delivered.

The ChatGPT-connected Google Calendar account is a different owner and has only reader access to the Optimize Local calendar. Appointment schedules cannot be created by that access.

## Contact form limitation
The contact form prepares a structured email addressed to optimizelocalai@gmail.com and opens the visitor's mail client; the visitor must press Send. This avoids silently failing submissions without a configured backend. For a fully in-page lead capture form, connect a real mail provider or verified form endpoint and test successful delivery before changing the button label to "Send inquiry".

## Domain - do not skip
**optimizelocalai.com and www.optimizelocalai.com are currently serving Optimize Local Connect from the separate Vercel optimize-local-connect project.** Moving them without relocating Connect would break its existing public URL and potentially sign-ins/integrations.
Safe cutover:
1. Determine and verify a new URL for Connect (suggest connect.optimizelocalai.com) on the existing Vercel Connect project; check DNS, authentication callbacks, webhooks, email links and user bookmarks.
2. Deploy and test this new services site on its own existing Vercel project (steven-cook-portfolio), ideally at services.optimizelocalai.com while Connect remains uninterrupted.
3. Only after testing Connect at its new URL, move apex + www domain mappings from Connect to the services project and adjust external DNS/redirects as needed.
4. Verify TLS, public access, booking links, contact delivery, robots and sitemap on both custom domains.
5. Re-check Vercel Authentication: the project currently protects *.vercel.app URLs. Custom domains are excluded from that policy. Never disable production protection for Connect unless intended.

Avoid placing either domain at risk just to speed the landing page launch.
