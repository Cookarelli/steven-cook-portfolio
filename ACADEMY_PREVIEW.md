# Academy and written course preview

This implementation extends the existing Optimize Local AI Academy in the verified OptimizeLocalAI.com application. The canonical Academy entry is `/ai-training`, and `/ai-academy` redirects there rather than becoming a second competing Academy. Existing program URLs, lead APIs, protected administration, app packages, demos and the free discovery-call destination remain in the same application.

## Source and deployment identity

The production domain was verified through Vercel's alias and domain records: `www.optimizelocalai.com` belongs to project `steven-cook-portfolio`, ID `prj_kdbrE2yyITioKHBur9saPJHWRnsG`, in team `steves-projects-e37a4ef4`. Its source repository is `Cookarelli/steven-cook-portfolio`, and its production branch setting is `main`. The inspected production deployment was `dpl_Gi1V59BwbwBCRJF9TdbwYd9AqjhJ`; its CLI metadata named local branch `codex/ai-academy` and commit `df6f4ab02da761a108c25c177901e06dbb9b6574`.

That commit alone did not contain the deployed Academy and CRM. All 87 non-generated deployed source files were recovered and checksummed before implementation, preserving the actual deployed system as local recovery commit `472704f`. New work is on `codex/academy-course-preview-20261108`; this branch is for review and preview, with production publishing kept separate.

## One content pipeline

Prompt 4's private editable lesson JSON remains outside this public Git repository. `scripts/build-course-preview.mjs` validates that source, then generates only the 21-day outline and the three selected learner samples in `src/data/course-preview.json`. The explicit public projection excludes later lesson bodies, demonstrations, recording notes, internal book provenance and learner records; its source manifest stores relative filenames and hashes only.

The importer also builds the sample HTML workbook from those same three projected days. `scripts/build-sample-workbook.py` creates the companion PDF and a freshness manifest from the public JSON, and `npm run build` verifies the JSON, HTML and PDF revisions before compiling. Rebuild generated artifacts from the private source rather than maintaining separate lesson wording in page components.

From this repository root:

```sh
node scripts/build-course-preview.mjs --source /absolute/path/to/private/academy/course --output "$PWD/src/data/course-preview.json"
python3 scripts/build-sample-workbook.py
node scripts/verify-course-assets.mjs
npm run build
```

The PDF authoring step needs Python and ReportLab; it is a content-production tool, not a website runtime dependency. The committed generated JSON, HTML and PDF let the normal deployment build run without the private source or Python. Review PDF layout after changing it, and keep the original complete curriculum and workbook out of public assets.

The connected editorial review aligned the phase names with the latest course map: Foundations; Everyday Creation and Organization; Workflows and Independent Practice. All 21 canonical lesson bodies and sample revision hashes remain unchanged. The public projection, sample HTML and PDF freshness manifest were regenerated from that updated course metadata; the sample PDF remains byte-identical.

## Learner behavior and access

Days 1 through 3 are complete written samples with teaching, reusable prompts, synthetic examples, named exercises, answer checks and reflection. The 21-day outline shows later topics as coming soon, and server route generation permits only the three selected sample IDs. The full $79 course remains coming soon while author review, recorded media, learner access and delivery are incomplete.

Sample completion requires explicit practice and checking acknowledgments and can be undone. A versioned localStorage record contains only allowed sample IDs and public lesson revisions; it is local to the browser and is not a paid account or course enrollment. If storage is unavailable, progress works in memory with a notice, while exercise notes stay in the open page's memory and must be copied before leaving.

No student identity provider or paid enrollment system was added. Existing private CRM APIs retain their server authentication and do not expose records to this preview. Future paid delivery requires verified enrollment enforced on the server and private material storage; neither a client flag nor an arranged-payment reference can grant access.

## Six offers and inquiry flow

The six recovered prices remain $49, $99, $39 per attendee, $299 for up to five participants, $79 and $149. Live sessions retain their 60-, 90-, 90-, 120- and 90-minute durations and Zoom delivery, with the exact take-home deliverables restored in the existing offer configuration. The team offer keeps in-person arrangements, extra participants and customization separately quoted.

Paid scheduling, checkout and group registrations remain explicitly unconfigured. Each offer leads to its existing program-specific inquiry or interest form; course signup is free and does not enroll anyone. The existing free 20-minute Google Calendar discovery call stays separate from paid appointments, including the request's saved context and notification wording.

Academy inquiries use the existing commit-before-success CRM path. Optional business, preferred time zone and learning goal are saved with the request, together with the versioned privacy agreement, separate marketing/course-update consents and server-derived program terms. Metadata is added to the existing event JSON and notes without a schema migration; payment-verification requests still accept a transaction reference rather than financial credentials or enrollment proof.

Only an actual persisted response creates a saved-request state, and provider acceptance remains distinct from inbox delivery. The optional analytics hooks are `ai_training_view`, `ai_training_program_select` and persisted-success-only `ai_training_inquiry_submit`; no booking-confirmed event is emitted without provider verification. Analytics accepts known public event/program identifiers only and cannot interrupt a request.

## Verification and remaining dependencies

Run `npm run lint`, `npm run typecheck`, `npm run test:forms`, `npm run test:demos`, `npm run test:academy`, `npm run test:course`, `npm run test:training` and `npm run build`. Start the built app on loopback port 3107 with production database access and external notifications disabled, then run `npm run test:routes`. These route checks inspect public samples, downloads, redirects, metadata, unavailable materials, app-sales regressions and honest unconfigured inquiry failures.

The existing `npm run test:crm` requires local PostgreSQL binaries and opens a temporary isolated test database. This runtime lacks `initdb` and `pg_ctl`, so that integration suite cannot complete here; mock-only persistence/notification tests do not replace a real database or inbox-delivery check. No production records or provider messages are used for these tests.

Production-only Academy environment variables were found on the verified Vercel project. No preview database credentials, preview origin, email activation or learner delivery system were configured by this change, so the preview's inquiry API fails honestly when unconfigured and offers the existing public email fallback. Before a production release, validate the intended environment, actual database persistence and notification delivery, and complete the course's separate media and access work before opening paid enrollment.
