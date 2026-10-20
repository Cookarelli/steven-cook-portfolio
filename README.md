This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Interactive sales demos

The Optimize Local services landing page links to two browser-only demonstrations:

- `/demos`: choose a demo.
- `/demos/detailing`: fictional Shine & Co. quote intake and owner request workspace.
- `/demos/booking`: fictional Willow Studio appointment intake, owner list, and sample calendar.

Each demo stores its draft and requests in `sessionStorage`, scoped to the current tab. Reset restores sample data for that demo. Photos are decoded and resized locally, previewed in an accessible dialog, and stored as browser data URLs. Nothing in either demo posts to an API, sends messages, takes payments, or creates real appointments. If session storage is blocked or full, the demo stays usable in memory and explains that reload persistence is unavailable.

The consultation CTA shares `src/lib/consultation.ts` with the homepage, preserving the existing Google booking URL and optional `NEXT_PUBLIC_GOOGLE_BOOKING_URL` override. No credentials are required for demo flows. No dependencies or backend infrastructure were added.

Appointment availability uses sample dates and 9 AM–5 PM hours. Confirmation and rescheduling reject overlapping **confirmed** appointments for the same staff member, account for each service’s duration, and allow adjacent times. Pending requests do not reserve a slot. “No preference” chooses an available staff member. Owner changes update the current customer confirmation without sending a notification.

Verification:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run test:demos
npm run build
npm run start -- --hostname 0.0.0.0 --port 3100
```

`test:demos` uses Node’s built-in test runner and TypeScript stripping (Node 22.18+). No browser automation dependency is included. Browser QA covers both customer and owner flows, photos, form errors, session reloads, resets, sample-calendar conflicts, and narrow-phone/desktop layouts.

Production publishing is intentionally separate from this implementation. The root and `www` domains already serve this repository’s app-services landing page; Connect remains separate at `connect.optimizelocalai.com`. No Connect source, domain assignments, or database configuration are changed here.
