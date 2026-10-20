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

## Google Calendar (public booking link configured in code)
- Confirmed booking link supplied by project owner: https://calendar.app.google/FcGwkANYvFkbsy349
- This URL is included in the site as the fallback for `NEXT_PUBLIC_GOOGLE_BOOKING_URL`, so booking buttons work without an environment variable.
- Verified on October 19, 2026: **Optimize Local - Free Business App Consultation**, **20 minutes**, **no payment required**, **Monday through Friday, 10 AM–5 PM America/Chicago**, with Google Meet. The old 90-minute OptAImal schedule was updated in the owner account; existing appointments were preserved.
- The homepage, demos, thank-you page, and inquiry-error fallback all use the shared destination in `src/lib/consultation.ts`. Google availability must be managed in Calendar; website copy alone cannot configure it.

## Google Calendar (how to manage or replace the schedule)
1. Sign into https://calendar.google.com as optimizelocalai@gmail.com, NOT the separate personal Calendar account.
2. Open the existing schedule under Bookable pages and click Edit appointment schedule. The current account allows one schedule; do not delete it or upgrade just to correct its settings.
3. Name it "Optimize Local - Free Business App Consultation".
4. Set duration to **Custom > 20 minutes**.
5. Set weekly availability to **Monday through Friday, 10:00 AM–5:00 PM America/Chicago**. This timezone automatically observes CST/CDT daylight saving changes. Meetings last 20 minutes, with the last possible start at 4:40 PM when no buffer is used. Choose a meeting method (Google Meet recommended), buffer, and minimum notice. Do not enable Saturdays or Sundays.
6. Save. Under Booking pages, copy the link for this exact schedule.
7. The supplied Google booking URL is already integrated as a code fallback. Optionally set NEXT_PUBLIC_GOOGLE_BOOKING_URL in Vercel to override it later.
8. Redeploy the project so the new link is included in the build.
9. Open the public link, verify the title and 20-minute duration, and open an available time to review the booking form. Cancel without submitting unless a real test appointment is explicitly requested. Verification on October 19 reached a 10:00–10:20 AM booking form with no payment step; no test appointment was created.

The ChatGPT-connected Google Calendar account is a different owner and has only reader access to the Optimize Local calendar. Appointment schedules cannot be created by that access.

## Confirmed consultation availability
- Monday through Friday, 10 AM to 5 PM Central (America/Chicago)
- Session duration: 20 minutes
- Saturdays and Sundays: unavailable
- The Google booking page must enforce these hours and calendar conflicts; displaying hours on the website does not configure Google's appointment schedule.

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
