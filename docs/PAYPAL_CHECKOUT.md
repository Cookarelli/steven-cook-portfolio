# Academy PayPal and Venmo checkout

This implements one-time purchases of the existing $49, $99, $299 and $149 private/team/audit offers. Group workshops, the coming-soon course, and custom app quotes cannot be purchased. A payment does not reserve a time. The private operator queue is `/admin/ai-academy/payments`, using the existing Academy administrator token.

## Release status

Implementation and mocked-provider PostgreSQL tests are complete. Production payments are **disabled by default**. Actual sandbox buyer approval, production credentials, webhook delivery, approved cancellation/refund terms, and the tax treatment of these offers must be verified before enabling checkout. No real payment has been made by the agent. Transactional payment emails are not configured by this implementation; the customer gets an on-site receipt and the owner gets a durable scheduling queue. Review that queue for follow-up.

## Confirmed target

- Repository: `Cookarelli/steven-cook-portfolio`
- Production origin: `https://www.optimizelocalai.com`
- Vercel team: `steves-projects-e37a4ef4`
- Vercel project: `steven-cook-portfolio` (`prj_kdbrE2yyITioKHBur9saPJHWRnsG`)
- Existing dedicated database: Supabase `pqjooyzoiatwtlfjbzrz`, private `academy_crm` schema, restricted `academy_app` server role.
- Live PayPal application: **Optimize Local Checkout**. Merchant ID must still be verified against the receiving business account. Website contact address remains its existing `optimizelocalai@gmail.com`.

## Environment configuration

Use Vercel's environment settings, with credentials scoped separately to Production and a dedicated sandbox Preview branch. Never commit credentials or print them. Client ID is public in the PayPal SDK; client secret, access tokens, database URL, and administrator token stay server-side.

```dotenv
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MERCHANT_ID=
PAYPAL_WEBHOOK_ID=
PAYMENTS_ENABLED=false
PAYMENT_CUSTOMER_TERMS=
PAYMENT_TERMS_VERSION=
PAYMENT_TAX_REVIEWED=false
# Reuse the current production values; use isolated sandbox/test values on Preview.
ACADEMY_DATABASE_URL=
ACADEMY_DATABASE_CA_CERT=
ACADEMY_SITE_ORIGIN=
ACADEMY_RATE_LIMIT_SECRET=
ACADEMY_ADMIN_TOKEN=
```

The enablement flag is checked on the server. The four offer-page links are generated during the build, so redeploy after changes. Live API access is rejected outside `VERCEL_ENV=production`. The SDK, REST endpoints, webhook ID and order environment must agree. No secrets are included in client props. Existing transactions can be reconciled by the status endpoint and verified webhooks when new checkout is disabled.

`PAYMENT_CUSTOMER_TERMS` is owner-approved text displayed before payment and saved with each order. It needs to cover how scheduling is agreed, what happens if no suitable time is available, and cancellation, rescheduling, refunds and no-shows. Do not invent these terms. `PAYMENT_TERMS_VERSION` identifies that approved text. `PAYMENT_TAX_REVIEWED=true` means the owner has verified that the exact listed total is appropriate for this configuration. There is no automatic tax calculator or invented exemption/rate. If additional tax must be calculated, keep checkout disabled and implement that before launch.

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

Before enabling live checkout, complete actual sandbox buyer approval/capture, cancel and declined/pending cases, verify webhook receipts and the admin scheduling queue, and inspect desktop/mobile UI. PayPal determines Venmo eligibility; a missing Venmo button must leave eligible PayPal usable. Sandbox desktop login does not prove production Venmo QR/app-switch behavior.

For the first live purchase, the account owner or intended buyer must initiate their own authorized payment. Confirm the offer/total, completed capture in PayPal, matching local receipt, one scheduling record and no duplicate capture. A real wallet test has not been performed by this change.

## Rollback

Set `PAYMENTS_ENABLED=false` in Production and redeploy. Stop new payments while keeping the ledger and webhook available for reconciliation. Do not drop the tables or delete payment events. The prior production commit was `383f5558c1d81634872e2955f0c84330875224a7`; retaining the new disabled build is preferable to rolling back away from reconciliation endpoints once real transactions exist.

## References

- https://developer.paypal.com/checkout/integrate
- https://developer.paypal.com/sdk/js/set-up
- https://developer.paypal.com/venmo/
- https://developer.paypal.com/api/rest/webhooks/
