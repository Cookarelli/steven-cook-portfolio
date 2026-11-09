-- One-time setup for Supabase project pqjooyzoiatwtlfjbzrz only.
-- Creates a restricted server login; does not alter existing passwords.
-- Run only after confirming this access grant. The result is a SECRET URL.
-- Transfer that result privately to Vercel ACADEMY_DATABASE_URL, Production only.
-- Never save the result in source control, screenshots, or chat.
CREATE OR REPLACE FUNCTION pg_temp.create_academy_runtime()
RETURNS text LANGUAGE plpgsql SECURITY INVOKER AS $setup$
DECLARE
  secret text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  table_name text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'academy_app') THEN
    RAISE EXCEPTION 'academy_app already exists; refusing to replace credentials';
  END IF;
  EXECUTE format('CREATE ROLE academy_app LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 10', secret);
  GRANT CONNECT ON DATABASE postgres TO academy_app;
  GRANT USAGE ON SCHEMA academy_crm TO academy_app;
  GRANT SELECT, INSERT, UPDATE ON academy_crm.leads, academy_crm.notifications TO academy_app;
  GRANT SELECT, INSERT ON academy_crm.events, academy_crm.submissions TO academy_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON academy_crm.rate_limits TO academy_app;
  GRANT USAGE ON SEQUENCE academy_crm.events_id_seq TO academy_app;
  FOREACH table_name IN ARRAY ARRAY['leads','notifications','events','submissions','rate_limits'] LOOP
    EXECUTE format('ALTER TABLE academy_crm.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY academy_server_access ON academy_crm.%I FOR ALL TO academy_app USING (true) WITH CHECK (true)', table_name);
  END LOOP;
  RETURN 'postgresql://academy_app.pqjooyzoiatwtlfjbzrz:' || secret || '@aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=verify-full';
END;
$setup$;
SELECT pg_temp.create_academy_runtime() AS academy_database_url;
