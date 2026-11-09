import test from 'node:test';
import assert from 'node:assert/strict';
import { academyPrograms, programPath } from '../src/config/ai-academy.ts';
const base = 'http://127.0.0.1:3107';
for (const path of ['/ai-academy', ...academyPrograms.map(programPath)]) {
  test(`${path}: renders with independent SEO and Academy navigation`, async () => {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(`rel="canonical" href="https://www.optimizelocalai.com${path}"`));
    assert.match(html, /AI Training/);
    assert.match(html, /calendar.app.google/);
    assert.match(html, /<meta name="description"/);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.doesNotMatch(html, /href="https?:\/\/(?:www\.)?(?:paypal|venmo)\./);
  });
}
test('unknown program returns 404', async () => {
  assert.equal((await fetch(base + '/ai-academy/not-a-program')).status, 404);
});
test('early access requires explicit consent and has no purchase link', async () => {
  const html = await (await fetch(base + '/ai-academy/21-day-ai-confidence')).text();
  assert.match(html, /COMING SOON/);
  assert.match(html, /type="checkbox"[^>]*required=""/);
  assert.match(html, /Join the Early Access List/);
  assert.match(html, /No payment collected/);
  assert.doesNotMatch(html, /href="[^"]*(?:paypal|venmo|checkout)/);
});
test('group CTA leads to interest form, never calendar seat inventory', async () => {
  const html = await (await fetch(base + '/ai-academy/everyday-ai-workshop')).text();
  assert.match(html, /href="#request">Reserve Your \$39 Workshop Seat/);
  assert.match(html, /Interest requests only/);
  assert.match(html, /not a ticket or confirmed seat/);
});
