import { Pool } from 'pg';
import { CrmError } from './model';
let pool: Pool | undefined;
export function database() {
 if (!process.env.ACADEMY_DATABASE_URL) throw new CrmError(503,'Lead capture is temporarily unavailable. Please email optimizelocalai@gmail.com.');
 // Never fall back to filesystem or memory on Vercel. Keep TLS verification enabled.
 if (!pool) {
  const url = new URL(process.env.ACADEMY_DATABASE_URL);
  const ca = process.env.ACADEMY_DATABASE_CA_CERT;
  // pg URL SSL options override the explicit SSL object. With a provider CA,
  // use that CA and enforce certificate + hostname verification explicitly.
  if (ca) for (const key of ['sslmode','sslrootcert','sslcert','sslkey']) url.searchParams.delete(key);
  pool = new Pool({connectionString:url.toString(),...(ca ? {ssl:{ca,rejectUnauthorized:true}} : {}),max:3,connectionTimeoutMillis:5000,idleTimeoutMillis:10000,statement_timeout:10000});
 }
 return pool;
}
