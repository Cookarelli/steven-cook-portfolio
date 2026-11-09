import test from 'node:test';
import assert from 'node:assert/strict';
import { academyPrograms, bookingDestination } from '../src/config/ai-academy.ts';

test('group workshop never uses private calendar appointments, even if configured', () => {
  const group = academyPrograms.find(p => p.format === 'group');
  assert.equal(bookingDestination({ ...group, googleCalendarBookingUrl: 'https://calendar.app.google/example' }), null);
});
test('coming-soon and self-paced programs never expose appointment checkout', () => {
  const course = academyPrograms.find(p => p.format === 'self-paced');
  assert.equal(course.comingSoon, true);
  assert.equal(bookingDestination({ ...course, googleCalendarBookingUrl: 'https://calendar.app.google/example' }), null);
  assert.equal(bookingDestination({ ...course, comingSoon: false, googleCalendarBookingUrl: 'https://calendar.app.google/example' }), null);
});
test('booking destinations fail closed for unsafe URLs and unconfigured links', () => {
  const program = academyPrograms[0];
  for (const url of [null, '', 'javascript:alert(1)', 'http://calendar.app.google/example', 'https://calendar.app.google.evil.test/example', 'https://user:password@calendar.app.google/example', 'not-a-url']) {
    assert.equal(bookingDestination({ ...program, googleCalendarBookingUrl: url }), null);
  }
  assert.equal(bookingDestination({ ...program, googleCalendarBookingUrl: 'https://calendar.app.google/example' }), 'https://calendar.app.google/example');
});
test('all actual payment, group registration and booking links remain explicitly unconfigured', () => {
  assert.equal(new Set(academyPrograms.map(p => p.slug)).size, 6);
  for (const p of academyPrograms) {
    assert.equal(p.paypalUrl, null);
    assert.equal(p.venmo, null);
    assert.equal(p.googleCalendarBookingUrl, null);
    assert.equal(p.groupRegistrationUrl, null);
  }
});
