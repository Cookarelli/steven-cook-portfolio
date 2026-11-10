import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import pg from 'pg';
const root = await mkdtemp(join(tmpdir(), 'academy-payments-test-'));
const server = createServer(); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port; await new Promise(resolve => server.close(resolve));
const url = `postgresql://academy_test@127.0.0.1:${port}/postgres`;
const run = (cmd, args) => { const result = spawnSync(cmd, args, { encoding:'utf8' }); if(result.status!==0) throw new Error(`${cmd}: ${result.stderr || result.stdout || result.error}`); };
let started=false;
try {
  run('initdb',['-D',join(root,'data'),'-A','trust','-U','academy_test','--no-locale']);
  run('pg_ctl',['-D',join(root,'data'),'-l',join(root,'postgres.log'),'-o',`-h 127.0.0.1 -p ${port} -c unix_socket_directories=''`,'-w','start']);started=true;
  const client=new pg.Client({connectionString:url});await client.connect();
  await client.query(await readFile(new URL('../db/academy-crm.sql',import.meta.url),'utf8'));
  await client.query('CREATE ROLE academy_app NOLOGIN; GRANT USAGE ON SCHEMA academy_crm TO academy_app;');
  await client.query(await readFile(new URL('../supabase/migrations/20261110172007_academy_paypal_checkout.sql',import.meta.url),'utf8'));await client.end();
  const tests=spawnSync(process.execPath,['--import','tsx','--test','tests/payments.test.ts'],{stdio:'inherit',env:{...process.env,ACADEMY_TEST_DATABASE_URL:url}});
  if(tests.status!==0)throw new Error('Payment tests failed.');
  run('pg_ctl',['-D',join(root,'data'),'-l',join(root,'postgres.log'),'-w','restart']);
  const verify=new pg.Client({connectionString:url});await verify.connect();
  const rows=await verify.query("SELECT count(*)::int AS n FROM academy_crm.payment_orders WHERE capture_id IS NOT NULL");
  if(rows.rows[0].n<1)throw new Error('Payment persistence failed.');
  await verify.query('SET ROLE academy_app');await verify.query('SELECT id FROM academy_crm.payment_orders LIMIT 1');
  const privileges=await verify.query("SELECT 1 FROM information_schema.role_table_grants WHERE grantee='PUBLIC' AND table_schema='academy_crm' AND table_name='payment_orders'");
  if(privileges.rows.length)throw new Error('Public payment data exposed.');await verify.end();
  console.log(`Payment persistence and restricted-role access verified after database restart (${rows.rows[0].n} captures).`);
} catch(error) { console.error(await readFile(join(root,'postgres.log'),'utf8').catch(()=>''));throw error; }
finally { if(started)run('pg_ctl',['-D',join(root,'data'),'-m','fast','-w','stop']);await rm(root,{recursive:true,force:true}); }
