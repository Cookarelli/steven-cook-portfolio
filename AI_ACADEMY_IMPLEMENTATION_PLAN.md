# Optimize Local AI Academy: audit and implementation plan

Audit date: November 6, 2026 (America/Chicago). Status: planning only. No application code, environment settings, domains, payments, bookings, or deployments changed. No commits or pushes made.

## Verified project identity

| Item | Verified value |
| --- | --- |
| Repository | https://github.com/Cookarelli/steven-cook-portfolio |
| Local project root | `/Users/stevencook/dev/steve-cook-portfolio` |
| Vercel project | `steven-cook-portfolio` |
| Project ID | `prj_kdbrE2yyITioKHBur9saPJHWRnsG` |
| Team | Steve's projects / `steves-projects-e37a4ef4` |
| Team ID | `team_iPL9ti94DMgRhfyzvbgjzZdG` |
| Vercel root directory | `.` (repository root) |
| Preferred public URL | https://www.optimizelocalai.com/ |
| Other production domain | https://optimizelocalai.com/ (redirects to www) |
| Production deployment | `dpl_BUtnWo4YHEKsnGKfrvAzC8NC35VJ` — READY, production, Git source |
| Deployment URL | https://steven-cook-portfolio-4wpaqc03g-steves-projects-e37a4ef4.vercel.app |
| Production branch / commit | `main` / `df6f4ab02da761a108c25c177901e06dbb9b6574` |
| Local HEAD | Same commit; working tree clean before audit |
| Runtime | Next.js 16.3.3, React 19.2.8, TypeScript, Tailwind 4; Vercel Node 24.x |

Evidence: Vercel alias lookup, project/deployment inspection, explicitly scoped CLI project inspection, local Git remote and HEAD, and direct production HTML/browser inspection. The search crawler initially returned an older homepage; direct production HTML and the browser show the current “Make it easier to do business with you” homepage matching local source.

The directory name omits the final “n” in `steven`; the GitHub and Vercel project names include it. There is no local `.vercel/project.json`. Future commands must use the verified project and team explicitly; do not inherit the workspace parent's Vercel context. Dashboard framework preset reports Other/null, while committed `vercel.json` explicitly sets `framework: nextjs`. Preserve the working configuration; verify effective framework on any future preview build.

Optimize Local Connect is a separate product linked in the footer. Its repository, deployments, domains, and data are outside this implementation. No Connect source was audited or edited.

## Existing site audit

| Area | Current implementation and implication |
| --- | --- |
| Navigation | `src/components/marketing-navigation.tsx` supplies desktop and mobile links: Services, Pricing, How it works, Portfolio, Try the demos. Used by homepage and portfolio. Native details/summary mobile menu supports Escape and focus restoration. Add AI Training here for both views. Current `home=false` logic incorrectly assumes Portfolio is the current page; replace with explicit pathname/active-section handling before using on Academy pages. |
| Homepage | `src/app/page.tsx`: business-app hero, services, demos, three pricing packages, project examples, process, founder introduction, consultation and contact form. Preserve these sections and their anchors. Add a secondary Academy introduction and link; do not replace the primary app/automation positioning. |
| Service pages | Services currently live at `/#services`, with pricing at `/#pricing` and process at `/#process`; no separate `/services` or individual service routes exist. Portfolio is `/portfolio`. Preserve the anchors and existing package links. |
| App-business pricing | QuickStart from $500; Business App from $1,500; App + Loyalty from $2,500. These are scoped starting estimates, not Academy prices. Existing pricing cards are inline homepage markup, not reusable components. |
| Booking | `src/lib/consultation.ts` centralizes the free 20-minute business-app consultation. Existing public destination: `https://calendar.app.google/FcGwkANYvFkbsy349`. Optional environment override; invalid URLs fall back to `/#contact`. Homepage advertises weekdays 10 AM–5 PM Central. Link presence was verified; live availability and booking completion were not tested. |
| Forms | `src/components/contact-form.tsx` collects name, business, email, optional phone, service and message. Browser validation, length limits, honeypot, disabled controls before hydration, duplicate-submit protection, errors, and no-JavaScript email fallback are already present. Fields and headings currently target app-service inquiries. |
| Email delivery | `src/lib/inquiry-delivery.ts` sends browser-side JSON POSTs to FormSubmit's AJAX endpoint for `optimizelocalai@gmail.com`; 15-second abort, response acceptance checks, distinct timeout handling. This is not a Gmail API, SMTP, Resend, CRM, or newsletter integration. Mailbox receipt and FormSubmit activation are not independently verified by provider acceptance. |
| Success/privacy | `/thank-you` says inquiry submitted and is noindex. `/privacy` describes inquiry information, FormSubmit and email handling, and excludes separate third-party booking pages. Reuse the delivery mechanics; Academy success must say inquiry received, never paid/enrolled/booked. Revise privacy copy to match any new data collection and external checkout links. |
| Payments | No PayPal, Venmo, Stripe SDK, checkout component, payment webhook, enrollment database, or payment verification was found in application source/dependencies. Payment-related portfolio descriptions describe client projects, not working integrations on this site. |
| Demos | `/demos`, `/demos/detailing`, `/demos/booking` are fictional browser-session demos. `sessionStorage` and in-memory state provide sample intake/appointments. They send no messages or real bookings and cannot serve as Academy enrollment infrastructure. |
| Analytics | Form captures UTM labels and optionally pushes `optimize_local_inquiry_accepted` to an existing `dataLayer`. No GA/GTM installation or analytics SDK was found in source. Preserve attribution; do not describe tracking as operational without verifying a consumer. |
| SEO | Root metadata, preferred www canonical base, ProfessionalService JSON-LD, per-page canonicals for public subpages, robots and sitemap are present. Six URLs are currently in sitemap. Root Open Graph URL/title remain business-wide; Academy pages need their own metadata overrides. No Open Graph image is configured although Twitter requests a large-image card. |

`src/components/site-header.tsx` and parts of `globals.css` belong to the older personal-portfolio design. Do not use the SC header or older serif styles as the Academy brand reference. README's starter Geist-font description is stale; active marketing styles use Arial/Helvetica/sans-serif.

## Brand and layout to preserve

Direct browser review confirms a dark forest header, lime brand accent, warm light hero, dark green text, rounded white cards, generous spacing, and bold sans-serif headings.

- Active shared stylesheet: `src/app/optimize-local.css`, scoped under `.ol-site`.
- Shared tokens: background `#0b1215`, text `#f5f8f5`, muted `#a8b6b6`, border `#294045`, accent `#b8ef67`, light `#eef4ed`.
- Current homepage stylesheet: `src/app/home.css`; paper `#f7f7f0`, ink `#203c32`, muted `#53685d`, header `#10251f`.
- Typography: Arial, Helvetica, sans-serif; compact heading tracking; responsive `clamp()` sizes. Keep the existing Optimize Local wordmark and introduce “Optimize Local AI Academy” as a division name.
- Reuse `.ol-container` (maximum 1160px), button styles, form states, visible focus outlines, and mobile-menu behavior. Use Academy-scoped CSS for new cards/sections rather than changing global selectors.
- Existing responsive rules include 1050px and 760px layout transitions, with narrower rules in shared styles. Extra navigation width requires checking intermediate tablet sizes, not just phone/desktop endpoints.
- Desktop homepage visually reviewed. Mobile styles inspected in source; full mobile visual and keyboard regression remains an implementation acceptance check.

## Environment inventory — names only

| Source | Names / result |
| --- | --- |
| `.env.example` | `NEXT_PUBLIC_GOOGLE_BOOKING_URL` |
| Application environment references | `NEXT_PUBLIC_GOOGLE_BOOKING_URL` only |
| Other local root `.env*` files | None found |
| Vercel project environment list | No environment variables configured, per explicitly scoped CLI listing |

The connector's environment endpoint returned project-not-found despite successful project/deployment inspection. The authenticated CLI fallback succeeded using the same project/team IDs. No environment values were printed, pulled, decrypted, or copied. Platform-generated runtime variables are not part of this project-configured inventory. The current booking link works from its committed public fallback.

## Proposed Academy architecture

Keep the homepage and app-development business intact. Add **AI Training** linking to `/ai-academy` in shared desktop/mobile navigation, plus an Academy footer link and a modest homepage teaser. Preserve the existing business consultation CTA and package inquiry destinations.

| Route | Page purpose / proposed CTA |
| --- | --- |
| `/ai-academy` | Division introduction, audience paths, six program cards, pricing overview, FAQ, Academy inquiry |
| `/ai-academy/ai-made-simple` | Beginner fundamentals; “Ask about AI Made Simple” |
| `/ai-academy/ai-for-business` | Practical business workflows; “Ask about AI for Business” |
| `/ai-academy/everyday-ai-workshop` | Guided everyday-use workshop; “Ask about the workshop” |
| `/ai-academy/team-training` | Organization/team instruction; “Discuss team training” |
| `/ai-academy/21-day-ai-confidence` | Confidence-building program; “Ask about the 21-day program” |
| `/ai-academy/business-ai-audit` | Business workflow assessment; “Discuss a business AI audit” |

Descriptions and CTA labels above are proposed copy, not confirmed curriculum or commercial terms. Prices and delivery/session durations were not supplied. “21-day” is supplied in the program name; retain it without inventing session length, frequency, or delivery method.

Proposed file responsibilities:

- `src/config/ai-academy.ts`: single typed source of truth for all six definitions, slugs, proposed descriptions, prices, durations, CTA labels, PayPal URLs, Venmo details, Google Calendar URLs, and publication readiness.
- `src/components/academy/course-card.tsx`: title, audience, summary, duration status and internal Learn more link; data passed from configuration.
- `src/components/academy/pricing-card.tsx`: configured price and billing basis, inclusions, readiness messaging, and eligible actions; no inline commercial values or external URLs.
- `src/components/academy/program-detail.tsx`: shared detail layout for audience, outcomes, delivery, pricing, FAQ and inquiry. No invented testimonials, certifications, guarantees or schedules.
- `src/components/academy/program-actions.tsx`: centralized gating for configured payment/booking destinations; distinguish inquiry, payment and scheduling.
- `src/app/ai-academy/layout.tsx` and `academy.css`: consistent brand wrapper/navigation and isolated responsive styles.
- `src/app/ai-academy/page.tsx`: hub.
- `src/app/ai-academy/[slug]/page.tsx`: statically enumerate only the six configured slugs; return not-found for unknown slugs. All six requested URLs resolve independently, with unique metadata. Follow the installed Next.js documentation for current async route APIs before coding.
- Update `marketing-navigation.tsx`, homepage teaser/footer, `sitemap.ts`, and Academy-aware form/success copy; preserve existing business behavior by default.

## Typed configuration contract

The following is a design specification, not installed application code. Each of the six records must contain every commercial/integration field, even when unconfigured.

```ts
type ProgramSlug =
  | "ai-made-simple" | "ai-for-business" | "everyday-ai-workshop"
  | "team-training" | "21-day-ai-confidence" | "business-ai-audit";

type Setting<T> =
  | { status: "unconfigured"; value: null }
  | { status: "configured"; value: T };

type Price =
  | { kind: "fixed" | "starting-at"; amountCents: number;
      currency: "USD"; basis: "person" | "team" | "program" }
  | { kind: "quote"; label: string };

interface AcademyProgram {
  slug: ProgramSlug;
  title: string;
  description: string; // Proposed until content approval.
  audience: string;
  price: Setting<Price>;
  duration: Setting<{ label: string; sessionMinutes: number | null }>;
  ctaLabels: { details: string; inquiry: string;
    paypal: string; venmo: string; booking: string };
  paypalUrl: Setting<string>;
  venmo: Setting<{ handle: string; profileUrl: string | null;
    instructions: string | null }>;
  googleCalendarBookingUrl: Setting<string>;
  publicationStatus: "draft" | "inquiry-only" | "enrollment-ready";
}

// Export six explicit records with:
// satisfies Record<ProgramSlug, AcademyProgram>
// Initial price, duration, paypalUrl, venmo, googleCalendarBookingUrl:
// { status: "unconfigured", value: null }
// Initial publicationStatus: "draft"
```

All six programs start with unconfigured price/duration/payment/booking fields. Do not convert unknown price to zero, “free,” or “contact for pricing” as a presumed pricing model. A quote-based model requires confirmation. Proposed inquiry CTA labels may be populated; use neutral provider labels such as “Pay with PayPal,” “Pay with Venmo,” and “Book a session” only when the matching action becomes enabled.

Unknown values render plainly, e.g. “Pricing to be announced” and “Schedule to be confirmed.” Missing payment or booking configuration produces a visible unavailable state with no anchor/href. Never use `#`, empty URLs, fabricated provider URLs, or the existing free business consultation as a disguised paid-session booking link. Provide a separately labeled Academy inquiry action only after that inquiry flow is implemented.

Validate configured destinations as HTTPS and against the intended provider hosts; validate slugs, price amounts/basis, required Venmo identity, and completeness before enrollment-ready publication. TypeScript types alone do not validate URLs. Reject dangerous or malformed URLs rather than silently redirecting. Keep payment/account secrets out of this public configuration. Do not place personal information in checkout query parameters.

## Integration reuse and limits

1. **FormSubmit delivery:** reuse `deliverInquiry`, its timeout/error handling, UTM collection and email fallback. Add an explicit Academy mode/program identifier to the form; keep existing service choices and defaults intact. Include division/program in the subject and payload. Make business name optional for individuals and replace business-only prompts in Academy mode.
2. **Google Calendar:** reuse the external-link presentation and destination validation approach. Preserve the existing free business-app consultation. Each Academy program's booking destination remains unconfigured until the owner supplies and verifies the correct schedule. No automatic calendar API integration is currently available.
3. **Payment links:** add optional outbound PayPal/Venmo actions only after owner-provided details are verified. There is no existing payment integration to reuse. A clicked link or return visit is not payment verification; manual reconciliation and enrollment confirmation would be required for a simple external-link launch. Automatic paid enrollment needs a separately scoped backend/webhook design.
4. **Confirmation:** reuse the thank-you visual pattern and delivery status semantics; make Academy inquiry confirmation distinct from course enrollment. The existing business form must continue to reach its existing confirmation experience.
5. **Design and SEO:** reuse shared marketing tokens/navigation/container/buttons and the canonical helper. Generate unique Academy titles, descriptions, canonicals, Open Graph URLs and breadcrumbs from config. Retain ProfessionalService identity; add accurate program schema only when supported by approved content, with no invented offers/prices. Add all seven published Academy URLs to sitemap while preserving the six existing URLs and excluding thank-you.

No new database, authentication provider, LMS, calendar credentials, email SDK, or payment SDK is necessary for an initial informational/inquiry-only Academy. A 21-day automated email course is not provided by the present FormSubmit inquiry integration; confirm that delivery requirement before adding email automation.

## Implementation checklist

- [ ] Confirm six program descriptions, intended audiences, outcomes, prerequisites, format, capacity, prices/billing basis, durations and delivery schedule.
- [ ] Obtain actual PayPal URLs, Venmo identity/instructions and program-specific Google Calendar URLs; leave each missing value unconfigured.
- [ ] Confirm fulfillment, payment reconciliation, cancellation/refund terms and enrollment confirmation process before enabling paid actions.
- [ ] Begin future code work from the verified production commit on an isolated `codex/` branch; do not push to `main` or deploy production during preparation.
- [ ] Read applicable `AGENTS.md` and installed Next.js guides; implement the typed six-record configuration and shared course/pricing/action/detail components.
- [ ] Build hub and six program URLs with approved content and explicit missing-data states.
- [ ] Add AI Training to desktop/mobile navigation; use explicit route-based active state and home-qualified service anchors. Preserve Portfolio's correct active state.
- [ ] Add homepage teaser/footer link without removing app, automation, service pricing, demos, portfolio, or business consultation content.
- [ ] Extend inquiry form for Academy attribution and individual learners while preserving existing business behavior; update confirmation/privacy copy to describe actual handling.
- [ ] Add page-specific SEO, seven sitemap entries and appropriate social imagery; retain existing URLs and business schema.
- [ ] Verify all seven routes return 200 and unknown program slugs return 404. Verify canonical paths and unique metadata, including Open Graph URLs.
- [ ] Test all-unconfigured, partially configured and fully configured program actions. Unknown links must never create active payment/booking anchors; unknown prices must never display as free.
- [ ] Test contact validation, pending state, provider rejection, timeout, retry, program attribution and success using mocked delivery. Do not submit production forms during automated QA.
- [ ] Run lint, TypeScript, existing form/demo tests and production build. Update `tests/local-readiness.test.mjs`, which currently expects exactly six sitemap URLs; expect thirteen only when all seven Academy routes are published.
- [ ] Check 360/390px phones, 760/1050px breakpoints and desktop; keyboard navigation, Escape/focus behavior, contrast, heading hierarchy, long titles/prices and no horizontal overflow.
- [ ] Regression-check homepage/portfolio service anchors, three app-business prices, existing consultation link, form fallback, privacy, thank-you and both demos.
- [ ] Review a local build first. If a hosted preview is later requested, target this exact Vercel project; preserve its existing preview SSO protection.
- [ ] Complete real inbox delivery/booking destination validation only with an intentional test authorized by the owner. No production payments or appointments are needed for normal UI QA.
- [ ] Obtain separate production-release authorization after implementation review. Recheck production SHA/domain bindings before any release.

## Verification completed and remaining limits

- Confirmed Git/Vercel/domain identity, repository root and matching production/local commit.
- Inspected application routes, forms, delivery module, consultation helper, metadata, crawler files, responsive CSS, dependencies and environment variable names.
- Direct production HTML and desktop browser review confirmed current navigation, homepage, consultation link, form and brand; crawler result was stale and not used as current layout evidence.
- Existing mocked inquiry-delivery tests: **9/9 passed**. Existing demo-model tests: **20/20 passed**. Node emitted a module-type warning; tests succeeded.
- No new runtime code was added, so no new build or implementation test results are claimed. Full responsive/browser regression, live inbox receipt, booking availability, and payment/enrollment validation remain future checks.
- This document is the only repository change from the audit. No production modifications, external messages, bookings or transactions were made.
