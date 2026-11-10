import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
const reservation = createServer(); await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port; await new Promise(resolve => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { env: { ...process.env, PAYMENTS_ENABLED: 'false', PAYPAL_ENV: 'sandbox', ACADEMY_SITE_ORIGIN: origin, ACADEMY_ADMIN_TOKEN: 'synthetic-admin-token-32-characters-long', PAYPAL_CLIENT_SECRET: 'synthetic-private-secret-never-in-html' }, stdio: ['ignore', 'pipe', 'pipe'] });
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 20000);
    server.stdout.on('data', data => { if (String(data).includes('Ready')) { clearTimeout(timeout); resolve(); } });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
  });
  for (const slug of ['ai-made-simple', 'ai-for-business', 'team-training', 'business-ai-audit']) {
    const response = await fetch(`${origin}/ai-academy/checkout/${slug}`); assert.equal(response.status, 200);
    const html = await response.text(); assert.ok(html.includes('Online checkout is being prepared.'));
    assert.ok(!html.includes('synthetic-private-secret-never-in-html'));
    assert.ok(!html.includes('paypal.com/web-sdk/v6/core'));
  }
  for (const slug of ['everyday-ai-workshop', '21-day-ai-confidence', 'arbitrary']) assert.equal((await fetch(`${origin}/ai-academy/checkout/${slug}`)).status, 404);
  assert.equal((await fetch(`${origin}/api/payments/orders`, { method: 'POST', headers: { Origin: 'https://foreign.invalid', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  assert.equal((await fetch(`${origin}/api/payments/orders`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' })).status, 503);
  assert.equal((await fetch(`${origin}/api/payments/orders/00000000-0000-4000-8000-000000000000`)).status, 404);
  assert.equal((await fetch(`${origin}/api/admin/academy/payments`)).status, 401);
  console.log('Checkout routes verified: four offers, unavailable-offer 404s, disabled payments, foreign-origin rejection, protected receipts/admin and no secret in HTML.');
} finally { server.kill('SIGTERM'); }
