BEGIN;
CREATE TABLE academy_crm.payment_orders (
 id uuid PRIMARY KEY, attempt uuid NOT NULL, session_hash text NOT NULL,
 environment text NOT NULL CHECK(environment IN ('sandbox','live')),
 program text NOT NULL, title text NOT NULL, cents integer NOT NULL CHECK(cents>0), currency text NOT NULL DEFAULT 'USD' CHECK(currency='USD'),
 merchant_id text NOT NULL, name text NOT NULL, email text NOT NULL, preferred_times text NOT NULL,
 terms_version text NOT NULL, terms_text text NOT NULL, fingerprint text NOT NULL,
 provider_order_id text, capture_id text,
 status text NOT NULL DEFAULT 'created' CHECK(status IN ('created','pending','paid','denied','review','partially_refunded','refunded','reversed')),
 fulfillment text NOT NULL DEFAULT 'not_ready' CHECK(fulfillment IN ('not_ready','scheduling_pending','booked','completed','hold')),
 financials jsonb, paid_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(environment,session_hash,attempt), UNIQUE(environment,provider_order_id), UNIQUE(environment,capture_id)
);
CREATE INDEX payment_orders_queue ON academy_crm.payment_orders(environment,fulfillment,created_at DESC);
CREATE INDEX payment_orders_session ON academy_crm.payment_orders(session_hash,created_at DESC);
CREATE TABLE academy_crm.payment_events (
 id text PRIMARY KEY, environment text NOT NULL, order_id uuid NOT NULL REFERENCES academy_crm.payment_orders(id),
 kind text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payment_events_order ON academy_crm.payment_events(order_id,created_at DESC);
REVOKE ALL ON academy_crm.payment_orders,academy_crm.payment_events FROM PUBLIC;
ALTER TABLE academy_crm.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_crm.payment_events ENABLE ROW LEVEL SECURITY;
-- Existing restricted server role; no browser/anon/authenticated grants.
GRANT SELECT,INSERT,UPDATE ON academy_crm.payment_orders TO academy_app;
GRANT SELECT,INSERT ON academy_crm.payment_events TO academy_app;
CREATE POLICY payment_orders_server ON academy_crm.payment_orders FOR ALL TO academy_app USING(true) WITH CHECK(true);
CREATE POLICY payment_events_server ON academy_crm.payment_events FOR ALL TO academy_app USING(true) WITH CHECK(true);
COMMIT;
