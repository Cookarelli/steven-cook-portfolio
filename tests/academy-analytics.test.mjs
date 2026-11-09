import test from 'node:test';
import assert from 'node:assert/strict';
import { trackTrainingEvent } from '../src/lib/academy-analytics.ts';

test('training analytics allow only known events and programs with no learner data', () => {
 const original = globalThis.window;
 const events = [];
 globalThis.window = { dataLayer: events };
 try {
  trackTrainingEvent('ai_training_view');
  trackTrainingEvent('ai_training_program_select', 'ai-made-simple');
  trackTrainingEvent('ai_training_inquiry_submit', '21-day-ai-confidence');
  trackTrainingEvent('ai_training_booking_confirmed', 'ai-made-simple');
  trackTrainingEvent('ai_training_view', 'person@example.invalid');
  assert.deepEqual(events, [{event:'ai_training_view'}, {event:'ai_training_program_select',program:'ai-made-simple'}, {event:'ai_training_inquiry_submit',program:'21-day-ai-confidence'}]);
 } finally { globalThis.window = original; }
});
test('missing or broken optional analytics cannot interrupt a saved request', () => {
 const original = globalThis.window;
 try {
  delete globalThis.window;
  assert.doesNotThrow(() => trackTrainingEvent('ai_training_view'));
  globalThis.window = {dataLayer:{push(){throw new Error('analytics unavailable');}}};
  assert.doesNotThrow(() => trackTrainingEvent('ai_training_inquiry_submit','general'));
 } finally { globalThis.window = original; }
});
