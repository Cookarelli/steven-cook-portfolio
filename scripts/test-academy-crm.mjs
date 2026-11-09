import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import pg from 'pg';
const root=await mkdtemp(join(tmpdir(),'academy-crm-test-'));
const data=join(root,'data');
const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;await new Promise(resolve=>server.close(resolve));
const url=`postgresql://academy_test@127.0.0.1:${port}/postgres`;
const run=(cmd,args,env=process.env)=>{const r=spawnSync(cmd,args,{env,encoding:'utf8',maxBuffer:4*1024*1024});if(r.status!==0)throw new Error(`${cmd} failed: ${r.stderr||r.stdout}`);return r.stdout;};
let started=false;
try{
 run('initdb',['-D',data,'-A','trust','-U','academy_test','--no-locale']);
 run('pg_ctl',['-D',data,'-l',join(root,'postgres.log'),'-o',`-h 127.0.0.1 -p ${port} -k ${root}`,'-w','start']);started=true;
 const client=new pg.Client({connectionString:url});await client.connect();await client.query(await readFile(new URL('../db/academy-crm.sql',import.meta.url),'utf8'));await client.end();
 const result=spawnSync(process.execPath,['--import','tsx','--test','tests/academy-crm.test.ts'],{env:{...process.env,ACADEMY_TEST_DATABASE_URL:url,ACADEMY_DATABASE_URL:url,ACADEMY_SITE_ORIGIN:'http://localhost:3107',ACADEMY_RATE_LIMIT_SECRET:'test-rate-secret-only-not-for-production-12345',ACADEMY_ADMIN_TOKEN:'test-admin-token-only-not-for-production-12345',ACADEMY_NOTIFY_FORMSUBMIT:'false',RESEND_API_KEY:'',ACADEMY_EMAIL_FROM:''},stdio:'inherit'});
 if(result.status!==0)throw new Error('CRM tests failed.');
 run('pg_ctl',['-D',data,'-l',join(root,'postgres.log'),'-w','restart']);
 const verify=new pg.Client({connectionString:url});await verify.connect();const rows=await verify.query('SELECT count(*)::int AS count FROM academy_crm.leads');await verify.end();
 if(rows.rows[0].count<1)throw new Error('Persistence check failed after database restart.');
 console.log(`Persistence verified after PostgreSQL restart: ${rows.rows[0].count} synthetic leads still stored.`);
}finally{if(started){try{run('pg_ctl',['-D',data,'-m','fast','-w','stop']);}catch{ /* Already stopped after a failed startup/restart. */ }}await rm(root,{recursive:true,force:true});}
