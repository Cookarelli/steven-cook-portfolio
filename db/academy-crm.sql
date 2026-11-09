-- Apply only to the explicitly approved database. Never run from a request handler.
BEGIN;
CREATE SCHEMA IF NOT EXISTS academy_crm;
REVOKE ALL ON SCHEMA academy_crm FROM PUBLIC;
CREATE TABLE IF NOT EXISTS academy_crm.leads (
 id uuid PRIMARY KEY,
 name text NOT NULL, email text NOT NULL, phone text,
 program text NOT NULL, request_type text NOT NULL CHECK(request_type IN ('inquiry','consultation','waitlist','workshop','payment-verification')),
 source text NOT NULL, contact_method text NOT NULL CHECK(contact_method IN ('email','phone')),
 status text NOT NULL CHECK(status IN ('New','Contacted','Payment Pending','Payment Verified','Booked','Completed','Follow-Up','Closed')),
 notes text NOT NULL DEFAULT '', transaction_reference text,
 marketing_consent boolean NOT NULL DEFAULT false,
 marketing_consent_at timestamptz NOT NULL,
 marketing_consent_version text NOT NULL,
 course_updates_consent boolean NOT NULL DEFAULT false,
 next_follow_up_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 fingerprint text NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_filter ON academy_crm.leads(status, next_follow_up_at);
CREATE INDEX IF NOT EXISTS leads_dedup ON academy_crm.leads(fingerprint, created_at DESC);
CREATE TABLE IF NOT EXISTS academy_crm.submissions (
 key uuid PRIMARY KEY, fingerprint text NOT NULL, lead_id uuid NOT NULL REFERENCES academy_crm.leads(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_crm.events (
 id bigserial PRIMARY KEY, lead_id uuid NOT NULL REFERENCES academy_crm.leads(id), actor text NOT NULL, event text NOT NULL,
 details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS academy_crm.rate_limits (
 bucket text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS academy_crm.notifications (
 id uuid PRIMARY KEY, lead_id uuid NOT NULL REFERENCES academy_crm.leads(id), kind text NOT NULL CHECK(kind IN ('business','acknowledgment')),
 status text NOT NULL CHECK(status IN ('pending','processing','accepted','failed','unknown','unconfigured')),
 attempts integer NOT NULL DEFAULT 0, provider text, provider_id text, error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(lead_id,kind)
);
REVOKE ALL ON ALL TABLES IN SCHEMA academy_crm FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA academy_crm FROM PUBLIC;
-- Defense in depth for hosted Supabase. A dedicated server role needs explicit
-- policies; browser roles must never receive access to this private schema.
ALTER TABLE academy_crm.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_crm.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_crm.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_crm.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_crm.notifications ENABLE ROW LEVEL SECURITY;
COMMIT;
