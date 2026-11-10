# Academy PayPal and Venmo checkout

This implements one-time purchases of the existing $49, $99, $299 and $149 private/team/audit offers. Group workshops, the coming-soon course, and custom app quotes cannot be purchased. A payment does not reserve a time. The private operator queue is `/admin/ai-academy/payments`, using the existing Academy administrator token.

## Release status

Implementation and mocked-provider PostgreSQL tests are complete. Production payments are **disabled**. The owner chose to perform the first purchase test on the website and waived an agent-run sandbox purchase. Credential operation and webhook delivery remain to be checked before reporting a fully verified payment flow. No real payment has been made by the agent. Transactional payment emails are not configured by this implementation; the customer gets an on-site receipt and the owner gets a durable scheduling queue. Review that queue for follow-up.

## Confirmed target

- Repository: `Cookarelli/steven-cook-portfolio`
- Production origin: `https://www.optimizelocalai.com`
- Vercel team: `steves-projects-e37a4ef4`
- Vercel project: `steven-cook-portfolio` (`prj_kdbrE2yyITioKHBur9saPJHWRnsG`)
- Existing dedicated database: Supabase `pqjooyzoiatwtlfjbzrz`, private `academy_crm` schema, restricted `academy_app` server role.
- Live PayPal application: **Optimize Local Checkout**. The receiving business account and merchant ID were verified in PayPal's authenticated business settings. Website contact address remains its existing `optimizelocalai@gmail.com`.

## Configuration checkpoint — November 10, 2026

- With the owner's explicit approval, the live client ID, client secret, and verified merchant ID were stored as Vercel Secrets scoped only to Production. `PAYPAL_ENV=live`, `PAYMENTS_ENABLED=false`, and `PAYMENT_TAX_REVIEWED=false` are saved Production configuration. No secret values are recorded here.
- The existing PayPal **Default Application** sandbox client ID, secret, and sandbox business account ID were stored separately as Vercel Secrets scoped only to Preview branch `codex/paypal-venmo-checkout-20261110`. Its configuration uses `PAYPAL_ENV=sandbox`, `PAYMENTS_ENABLED=false`, `PAYMENT_TAX_REVIEWED=false`, and the branch preview origin below.
- Preview origin: `https://steven-cook-portfolio-git-codex-eb66a1-steves-projects-e37a4ef4.vercel.app`.
- A separate **Optimize Local Checkout Sandbox** Supabase project was created in the existing Optimize Local AI organization at a quoted **$0/month**: `gwwfvdihmtzwlznacswc`, region `us-west-1`. The existing `db/academy-crm.sql` schema was applied; all five base tables are empty. No production data was copied.
- The sandbox pooler address was confirmed in Supabase's Connect panel: `aws-0-us-west-1.pooler.supabase.com:6543`, database `postgres`. TLS must remain verified.
- Automatic approval review rejected creation of the sandbox runtime login because the prior authorization did not specify the new persistent database access grant. A follow-up read confirmed that **no `academy_app` role exists in the sandbox**. Do not retry the access change without the owner's specific approval. Prefer a restricted checkout-only login with access to payment orders, payment events, and rate-limit records; do not grant access to leads or notification tables for checkout testing.
- Sandbox payment tables, database credential, CA certificate, administrator/rate-limit secrets, both PayPal webhooks, deployed webhook delivery, and actual buyer testing remain incomplete. Production checkout code is still in draft PR #3; only the approved refund policy is live. No production checkout deployment or payment enablement was performed.

## Environment configuration

Use Vercel's environment settings, with credentials scoped separately to Production and a dedicated sandbox Preview branch. Never commit credentials or print them. Client ID is public in the PayPal SDK; client secret, access tokens, database URL, and administrator token stay server-side.

```dotenv
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MERCHANT_ID=
PAYPAL_WEBHOOK_ID=
PAYMENTS_ENABLED=false
PAYMENT_TOTALS_CONFIRMED=false
# Reuse the current production values; use isolated sandbox/test values on Preview.
ACADEMY_DATABASE_URL=
ACADEMY_DATABASE_CA_CERT=
ACADEMY_SITE_ORIGIN=
ACADEMY_RATE_LIMIT_SECRET=
ACADEMY_ADMIN_TOKEN=
```

The enablement flag is checked on the server. The four offer-page links are generated during the build, so redeploy after changes. Live API access is rejected outside `VERCEL_ENV=production`. The SDK, REST endpoints, webhook ID and order environment must agree. No secrets are included in client props. Existing transactions can be reconciled by the status endpoint and verified webhooks when new checkout is disabled.

The owner-approved cancellation/refund policy is versioned in `src/config/purchase-policy.ts`, published at `/refund-policy`, displayed and linked before checkout, and saved verbatim with each order. Version: `optimize-local-refunds-2026-11-10`. The November 10, 2026 wording was supplied and approved by the owner. Policy edits must update the version; environment overrides cannot silently replace the published policy. `PAYMENT_TOTALS_CONFIRMED=true` selects the published catalog amounts as final USD totals ($49, $99, $149, $299), with no separate tax calculation. This operational setting is not a representation that a tax review occurred. If the owner needs an additional tax calculation, disable new payments and implement it before collecting those amounts. The earlier `PAYMENT_TAX_REVIEWED` variable is no longer used.

## Database and PayPal webhooks

Migration `supabase/migrations/20261110172007_academy_paypal_checkout.sql` was applied to the confirmed existing database on November 10, 2026. Both new tables have RLS and server-role policies; Supabase security advisors returned no findings after application. This is an additive migration: no existing leads were rewritten. Do not rerun the original runtime-role creation script or reapply this migration. The new tables have no PUBLIC grants and no browser-role grants.

Register the appropriate app/environment webhook at:

`https://www.optimizelocalai.com/api/payments/paypal/webhook`

Sandbox must use its own deployed HTTPS preview origin and webhook registration. Subscribe to:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.PENDING`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`

Save the resulting webhook ID to the matching Vercel environment, redeploy, and test delivery. The endpoint verifies PayPal's signature using PayPal's verification API before processing, deduplicates event IDs and reads authoritative orders. No browser approval callback or query parameter is payment proof. Webhook events for other orders are ignored.

## Behavior and recovery

Prices and availability come from `src/config/ai-academy.ts`; checkout rejects amount, currency and quantity fields. Customer contact and preferred times are saved before the provider create operation. Secure session cookies restrict reads/captures to the browser that started the order. The database serializes simultaneous creates/captures, preserves stable PayPal request IDs, and prevents same-session/same-offer duplicate attempts for three hours. Unresolved operations older than three hours require review rather than a new provider operation.

Captures must match the provider order, internal reference, merchant, USD amount and single full capture. Only `COMPLETED` becomes paid. Pending, denied or unknown outcomes never trigger scheduling fulfillment. Partial/full refunds and reversals place fulfillment on hold; late completed events cannot restore paid status. Signed webhooks and the protected status endpoint recover a capture that succeeded before a browser or database response failed.

Customers can select **Check payment status** after a connection problem. **Complete an approved payment** checks PayPal and captures only an already-approved, uncaptured order in the original session. It does not create another order. If browser cookies are lost, the business administrator must use the saved reference and PayPal record; do not ask a customer to pay again merely because the receipt is inaccessible.

The admin queue separates sandbox/live records, shows only provider-reported fee/net data, and allows a verified paid order to be marked booked/completed with an audit event. It cannot fake payment status, issue refunds, or send messages. Use PayPal directly for financial support actions. Payment emails remain unverified; receipts do not claim an email was delivered.

## Verification

```sh
npm ci
npm run typecheck
npm run lint
npm run test:payments # PostgreSQL initdb/pg_ctl must be on PATH
npm run test:training
npm run build
```

Payment tests start an isolated PostgreSQL instance over loopback TCP, use a synthetic PayPal provider, exercise concurrency, ownership, unavailable offers, tampering, pending/unknown outcomes, duplicate webhooks, refunds/reversals, provider-host selection, and durable records after database restart. They make no PayPal charges and send no messages. Mocked tests are not a real sandbox transaction.

The recommended provider validation covers actual sandbox buyer approval/capture, cancel and declined/pending cases, webhook receipts and the admin scheduling queue, and desktop/mobile UI. On November 10 the owner waived the agent-run sandbox purchase and elected to test from the live website; do not claim these provider checks passed. PayPal determines Venmo eligibility; a missing Venmo button must leave eligible PayPal usable. Sandbox desktop login does not prove production Venmo QR/app-switch behavior.

For the first live purchase, the account owner or intended buyer must initiate their own authorized payment. Confirm the offer/total, completed capture in PayPal, matching local receipt, one scheduling record and no duplicate capture. A real wallet test has not been performed by this change.

## Rollback

Set `PAYMENTS_ENABLED=false` in Production and redeploy. Stop new payments while keeping the ledger and webhook available for reconciliation. Do not drop the tables or delete payment events. The prior production commit was `383f5558c1d81634872e2955f0c84330875224a7`; retaining the new disabled build is preferable to rolling back away from reconciliation endpoints once real transactions exist.

## References

- https://developer.paypal.com/checkout/integrate
- https://developer.paypal.com/sdk/js/set-up
- https://developer.paypal.com/venmo/
- https://developer.paypal.com/api/rest/webhooks/

## Owner-directed release plan

On November 10 the owner approved the restricted sandbox database login, then stated that an agent-run sandbox purchase was unnecessary and that they would test on the website or use a manual invoice. Do not create unused sandbox credentials solely to satisfy the earlier plan. Complete the live integration using the existing published offer prices, preserve the payment enablement switch, and clearly report that no real payment, refund, or wallet app-switch test was performed by the agent.
