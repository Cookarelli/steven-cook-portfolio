# Academy lead capture and CRM

## Existing-service findings

The verified website has no database URL, CRM tables, auth provider or transactional
email sender configured. Its existing business forms use FormSubmit. A read-only
inspection of the Primary Supabase account found unrelated projects, including
Optimize Local Connect; none was used. No remote database was created and no
production environment or deployment was changed.

This implementation adds Next.js route handlers to the existing app and a private
PostgreSQL schema, not a separate CRM service. The database destination must be
explicitly selected before provisioning or applying the migration. A previously
existing business database can host this schema after checking ownership, access
and existing CRM functionality. Do not use Connect or client-project databases.

## Routes and behavior

- `/ai-academy/contact`: general training inquiry, free consultation inquiry,
  payment-verification request. Program detail pages retain course waitlist,
  workshop interest and program-specific inquiries.
- `POST /api/academy/leads`: validates, rate-limits and commits a lead, consent
  record, submission key and notification outbox in one database transaction.
  Only after COMMIT does it return `persisted: true` and a reference UUID.
- `/admin/ai-academy`: protected-data lead view. The static page contains no leads;
  authenticated APIs load the records. Token stays in tab memory, not localStorage
  or URLs. Clear session removes loaded records and credentials from the view.
- `GET /api/admin/academy/leads`: filters by status, program and exact source;
  pagination is 500 rows; `format=csv` exports the current filtered page. `id`
  returns the append-only change history. Exports neutralize spreadsheet formulas.
- `PATCH /api/admin/academy/leads`: saves status, appended notes, next follow-up,
  consent withdrawal and a timestamped audit event. Payment Verified requires an
  explicit operator confirmation of independent provider verification.
- `POST /api/admin/academy/notifications`: processes pending jobs, retries failed
  or previously unconfigured jobs, and marks stale processing jobs unknown.
  Accepted/unknown jobs are never blindly resent.

All eight requested lead statuses are supported. Payment submissions begin at
Payment Pending, never Payment Verified. Store transaction references only: no
files, receipt images, account credentials, or card fields. Input warns against
sensitive health information; common credential/card patterns are rejected.
Free text cannot be guaranteed free of sensitive content: review and remove any
accidental disclosure under the business's retention/access procedures.

Marketing consent is optional and distinct from requested transactional replies.
Course-launch updates require their own checkbox, separate from general offers.
Consent version, choice, initial timestamp, withdrawal timestamp/history are
stored. Withdrawal updates every existing record for the normalized email.
A later explicit opt-in is recorded as a new choice. Before sending promotions,
check the current customer instructions and consent, including any withdrawal.

The existing business-services contact form remains unchanged and uses FormSubmit.
Academy submissions use the new persisted flow. Direct Google Calendar appointments
cannot be imported without a booking webhook/API integration; those links are
labeled accordingly. Academy consultation-request forms are recorded. Do not claim
that external bookings or historical FormSubmit messages have been backfilled.

## Configure the selected environment

Names only; put real values in the environment manager, never Git or browser code:

| Name | Purpose |
| --- | --- |
| `ACADEMY_DATABASE_URL` | Approved PostgreSQL runtime connection, preferably provider pooler; verify TLS certificates |
| `ACADEMY_DATABASE_CA_CERT` | Provider CA certificate PEM; enforces TLS certificate and hostname verification with the configured CA |
| `ACADEMY_SITE_ORIGIN` | Exact allowed origin, e.g. the intended local, preview or production origin; no trailing slash |
| `ACADEMY_RATE_LIMIT_SECRET` | Independent random secret, at least 32 characters, for hashed limiter keys |
| `ACADEMY_ADMIN_TOKEN` | High-entropy random secret, at least 32 characters; temporary single-business-admin access |
| `ACADEMY_NOTIFY_FORMSUBMIT` | Existing authorized inbox notification enabled unless explicitly `false`; disable for automated/local tests |
| `RESEND_API_KEY` | Optional configured transactional sender; no account was provisioned |
| `ACADEMY_EMAIL_FROM` | Optional verified sender address; required with Resend API key |
| `ACADEMY_MIGRATION_CONFIRMED` | Set `true` only for an intentional migration after inspecting the target |

Do not use `NEXT_PUBLIC_` for any of these values. Keep preview and production
separate. An unconfigured database/origin/rate secret yields 503, never fake
success. Admin data access is unavailable without a configured administrator token.
Use HTTPS outside local development; rotate the admin token when access changes.
For multiple staff, replace the single shared token with the organization's
identity provider and named roles before granting access; audit currently identifies
this single principal as `business-admin`.

Migration: inspect the selected database/schema first, then run `npm run db:migrate`
with the approved connection and explicit confirmation in the process environment.
The migration is not executed by application startup or requests. It is additive
and transactional. `academy_crm` is private, with PUBLIC privileges revoked.
Use a separate runtime role with only USAGE on this schema, SELECT/INSERT/UPDATE/
DELETE on these tables and USAGE/SELECT on these sequences; do not expose this
schema through a public Data API. Keep migration credentials separate. Restrict
database network access as supported by the selected provider and configure backups.

## Notification semantics and follow-up

The business recipient is fixed to `optimizelocalai@gmail.com`. If Resend's sender
and key are configured, it handles both the minimal business alert and prospect
acknowledgment. Otherwise the existing FormSubmit endpoint sends business alerts
only; no prospect acknowledgment is claimed. Neither transport sends promotions.

Persisted states: pending, processing, accepted, failed, unknown, unconfigured.
Accepted means provider acceptance, not confirmed delivery. The prospect receives
a truthful saved reference even when notifications fail. A timeout/network error
is unknown and requires a provider-log check before any manual resend. If a worker
stops, the outbox remains; use the protected processing action after two minutes
to surface stale processing. There is no scheduled background worker configured;
review the lead view/outbox regularly and process pending notifications there.

`src/lib/academy-crm/templates.ts` supplies new inquiry, payment confirmation,
appointment preparation, post-training follow-up and app-development offer drafts.
They are visible in the lead view and are not sent automatically. Promotional
drafts are hidden without marketing consent. Replace every placeholder before
sending; payment-confirmation drafts require independent verification.

## Data and abuse controls

- Server validation of program/type/contact/consent and maximum field lengths.
- 16KB streaming request-body limit and exact origin check; origin is not treated
  as a bot-proof authentication mechanism.
- Shared PostgreSQL rate counters: five new requests per 15-minute IP/email
  bucket. Vercel's platform-provided forwarded IP header is used on Vercel; local
  and other hosts share a conservative fallback bucket until trusted proxy
  handling is explicitly configured. No raw IP is stored.
- UUID idempotency keys survive client retries within the current form attempt;
  same-content submissions are also deduplicated for ten minutes across tabs.
  Same key with changed data is a conflict. Advisory locks handle concurrency.
- SQL parameters, authenticated admin endpoints, no-store responses, no public
  read endpoint, no PII in application logs, minimal email alerts.
- Follow-up notes and changes are timestamped. No automated status advancement
  based on a prospect's payment reference.
- Rate counters expire; inactive buckets older than a day are pruned during
  capture. Define and operate the business's lead, event and submission retention
  policy before production; export/delete on customer request as appropriate.

## Validation

`npm run test:crm` creates an isolated temporary PostgreSQL instance on a random
loopback port, applies the real schema, runs integration tests, restarts PostgreSQL,
and verifies records still exist. It uses synthetic `.invalid` emails and mocked
notification transports only. It stops/removes its test database afterward. Needs
local PostgreSQL binaries (`initdb`, `pg_ctl`) and permission to open loopback ports.
It never uses the configured production database or sends live mail.

Also run `npm run lint`, `npm run typecheck`, `npm run test:forms`,
`npm run test:demos`, `npm run test:academy`, and `npm run build`.
For existing rendered-page tests start the built app on port 3107 and run
`npm run test:routes`. Notification provider acceptance, verified sender setup,
production database selection/migration and real inbox delivery remain deployment
checks; unit mocks do not prove mailbox delivery.

## Verified in this implementation

- Lint, TypeScript and Next.js production build pass.
- 15 database integration tests pass against real PostgreSQL; 19 synthetic records
  survived a database restart before the test database was removed.
- 33 existing unit tests and 19 rendered-route/regression tests pass.
- Browser submission saved a synthetic lead, returned its UUID, and displayed it
  in the authenticated CRM. A browser status/note update was independently read
  back from PostgreSQL. External notifications were disabled during browser QA.
- Next.js and its lint configuration were updated to 16.4.5 to resolve reported
  critical advisories; compatible transitive fixes were also applied. Eight
  moderate development-tooling advisories remain in the TypeScript ESLint /
  minimatch dependency chain; no forced framework downgrade was applied.
- No remote database, email account, production configuration or deployment was
  created or changed. Database selection and production activation remain pending.

Reference documentation: [node-postgres transactions](https://node-postgres.com/features/transactions),
[Resend send API](https://resend.com/docs/api-reference/emails/send-email),
[Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys),
[Vercel request headers](https://vercel.com/docs/headers/request-headers).
# Supabase setup status — November 6, 2026

- Dedicated project: `pqjooyzoiatwtlfjbzrz`, organization **Optimize Local AI** (`imetpuiojnffgvfumvyb`), account `optimize815@gmail.com`, region `us-west-2`.
- Applied `db/academy-crm.sql` through the authenticated Supabase SQL Editor. Verified all five tables exist, RLS is enabled, and `anon`/`authenticated` have no schema access.
- Verified transaction pooler: `aws-1-us-west-2.pooler.supabase.com:6543`, database `postgres`. No password or database URL is stored in this document.
- Vercel project: `steven-cook-portfolio` (`prj_kdbrE2yyITioKHBur9saPJHWRnsG`), team `team_iPL9ti94DMgRhfyzvbgjzZdG`.
- Configured Production-only `ACADEMY_SITE_ORIGIN`, `ACADEMY_RATE_LIMIT_SECRET`, and `ACADEMY_ADMIN_TOKEN`. Secrets are sensitive variables; a private, gitignored `.env.academy-setup.local` holds setup credentials locally (mode 0600).
- Created restricted `academy_app` server login and role-specific RLS policies using `db/academy-runtime-role.sql`. No superuser, database creation, role creation, or RLS bypass privileges. Lead/event/submission deletion is not granted; expired rate-limit cleanup is allowed.
- Configured Production-only sensitive `ACADEMY_DATABASE_URL` and `ACADEMY_DATABASE_CA_CERT` in Vercel. The CA came from the authenticated Supabase dashboard's certificate link. Runtime TLS verifies both the certificate chain and hostname; never disable verification.
- Verified the actual CRM connection module against hosted Supabase as `academy_app`, then captured a synthetic lead, verified deduplication, updated status/history, and confirmed persistence through a fresh connection. The synthetic `supabase-connection-verification` lead is Closed, with marketing consent false; its notifications are explicitly suppressed (`unknown`, provider `setup-verification`). No emails were sent.
- Vercel environment configuration is ready for a future deployment. The updated CA-aware application code remains local and undeployed; testing a Vercel-hosted runtime awaits an authorized deployment.
- No preview/development database credentials configured; no deployment, push, or production promotion performed. Existing notification address remains `optimizelocalai@gmail.com`; the new Supabase login address does not change the business notification destination.

