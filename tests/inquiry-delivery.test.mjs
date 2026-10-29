import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverInquiry, InquiryTimeoutError } from '../src/lib/inquiry-delivery.ts';

// Every transport is mocked: these tests never send an inquiry.
for (const success of [true, 'true']) {
  test(`accepts provider success ${JSON.stringify(success)} and keeps data in POST body`, async () => {
    await deliverInquiry({ email: 'sample@example.com', message: 'Sample only' }, {
      fetchImpl: async (url, options) => {
        assert.equal(new URL(url).search, '');
        assert.equal(options.method, 'POST');
        assert.equal(JSON.parse(options.body).email, 'sample@example.com');
        assert.ok(options.signal instanceof AbortSignal);
        return Response.json({ success });
      },
    });
  });
}
for (const [name, response] of [
  ['HTTP failure', () => Response.json({ success: true }, { status: 500 })],
  ['provider rejection', () => Response.json({ success: false })],
  ['missing acceptance', () => Response.json({})],
  ['invalid response', () => new Response('not JSON')],
]) {
  test(`rejects ${name}`, async () => {
    await assert.rejects(deliverInquiry({}, { fetchImpl: async () => response() }));
  });
}
test('aborts a stalled request and allows a subsequent retry', async () => {
  await assert.rejects(deliverInquiry({}, {
    timeoutMs: 10,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }),
  }), InquiryTimeoutError);
  await deliverInquiry({}, { fetchImpl: async () => Response.json({ success: true }) });
});
test('preserves network errors', async () => {
  const failure = new TypeError('Network failed');
  await assert.rejects(deliverInquiry({}, { fetchImpl: async () => { throw failure; } }), error => error === failure);
});
test('timeout also covers reading the response body', async () => {
  await assert.rejects(deliverInquiry({}, {
    timeoutMs: 10,
    fetchImpl: async (_url, { signal }) => ({ ok: true, json: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }) }),
  }), InquiryTimeoutError);
});
