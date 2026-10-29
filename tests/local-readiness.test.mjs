import test from 'node:test';
import assert from 'node:assert/strict';

// Run against the locally built server only; never submits a form.
const base = 'http://127.0.0.1:3107';
for (const path of ['/', '/portfolio']) {
  test(`${path}: non-JavaScript HTML cannot submit customer information`, async () => {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    const form = html.match(/<form\b[^>]*class="ol-form"[\s\S]*?<\/form>/)?.[0];
    assert.ok(form);
    assert.match(form, /method="post"/);
    assert.match(form, /<noscript>[\s\S]*mailto:optimizelocalai@gmail.com/);
    for (const control of form.matchAll(/<(?:input|select|textarea|button)\b[^>]*>/g)) {
      if (!control[0].includes('name="company_url"')) assert.match(control[0], /disabled=""/);
    }
  });
}
for (const path of ['/', '/portfolio', '/privacy', '/demos', '/demos/booking', '/demos/detailing']) {
  test(`${path}: canonical uses preferred host and page path`, async () => {
    const html = await (await fetch(base + path)).text();
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.ok(canonical);
    assert.equal(new URL(canonical).href, `https://www.optimizelocalai.com${path}`);
  });
}
test('crawler files use absolute preferred-host URLs and omit thank-you', async () => {
  const robots = await (await fetch(base + '/robots.txt')).text();
  assert.match(robots, /Sitemap: https:\/\/www\.optimizelocalai\.com\/sitemap.xml/);
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 6);
  assert.ok(urls.every(url => url.startsWith('https://www.optimizelocalai.com/')));
  assert.ok(urls.includes('https://www.optimizelocalai.com/privacy'));
  assert.ok(!urls.some(url => url.includes('thank-you')));
});
