import { readFile } from 'node:fs/promises';
import pg from 'pg';
if(!process.env.ACADEMY_DATABASE_URL) throw new Error('Set ACADEMY_DATABASE_URL for the explicitly approved database.');
if(process.env.ACADEMY_MIGRATION_CONFIRMED!=='true') throw new Error('Inspect the intended database first, then set ACADEMY_MIGRATION_CONFIRMED=true.');
const client=new pg.Client({connectionString:process.env.ACADEMY_DATABASE_URL});
try{await client.connect();await client.query(await readFile(new URL('../db/academy-crm.sql',import.meta.url),'utf8'));console.log('Academy schema applied.');}finally{await client.end();}
