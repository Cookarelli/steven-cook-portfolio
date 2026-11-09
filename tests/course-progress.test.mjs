import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSE_PROGRESS_KEY, createCourseProgressStore, isCurrentCompletion, readCourseProgress } from '../src/lib/course-progress.ts';

const revision = 'a'.repeat(64);
const empty = { version: 1, completed: [], revisions: {} };
const saved = (...ids) => JSON.stringify({ version: 1, completed: ids, revisions: Object.fromEntries(ids.map(id => [id, revision])) });

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem(key) { assert.equal(key, COURSE_PROGRESS_KEY); return value; },
    setItem(key, next) { assert.equal(key, COURSE_PROGRESS_KEY); value = next; },
    removeItem(key) { assert.equal(key, COURSE_PROGRESS_KEY); value = null; },
    value: () => value,
  };
}

test('missing progress starts empty while corrupt or future-version data recovers safely', () => {
  assert.deepEqual(readCourseProgress(null), { progress: empty, recovered: false });
  for (const raw of ['broken', 'null', '[]', '{"version":2,"completed":["day-01"]}', '{"version":1,"completed":"day-01"}']) {
    assert.deepEqual(readCourseProgress(raw), { progress: empty, recovered: true });
  }
});
test('only three public sample IDs can survive persisted data and duplicates are removed', () => {
  const raw = JSON.stringify({version: 1, completed: ['day-03','day-21','day-01','day-01',4], revisions: {'day-01':revision,'day-03':revision,'day-21':revision}});
  assert.deepEqual(readCourseProgress(raw), {
    progress: { version: 1, completed: ['day-01', 'day-03'], revisions: {'day-01':revision,'day-03':revision} }, recovered: true,
  });
});
test('server snapshot is stable, empty, and does not access browser storage', () => {
  let reads = 0;
  const store = createCourseProgressStore(() => { reads++; return null; });
  assert.equal(store.getServerSnapshot(), store.getServerSnapshot());
  assert.equal(store.getSnapshot().hydrated, false);
  assert.equal(reads, 0);
});
test('an explicit completion persists, survives a new store, and can be undone', () => {
  const storage = memoryStorage();
  const store = createCourseProgressStore(() => storage);
  assert.equal(store.setComplete('day-01', true, revision), true);
  assert.deepEqual(JSON.parse(storage.value()), JSON.parse(saved('day-01')));
  const restored = createCourseProgressStore(() => storage);
  restored.subscribe(() => {});
  assert.deepEqual(restored.getSnapshot().progress.completed, ['day-01']);
  restored.setComplete('day-01', false);
  assert.deepEqual(restored.getSnapshot().progress.completed, []);
});
test('locked and invented lesson IDs never mutate completion or storage', () => {
  const storage = memoryStorage();
  const store = createCourseProgressStore(() => storage);
  for (const id of ['day-04', 'day-21', 'day-99', '__proto__', '']) assert.equal(store.setComplete(id, true, revision), false);
  assert.equal(storage.value(), null);
  assert.deepEqual(store.getSnapshot().progress.completed, []);
});
test('storage access and quota failures retain an honest memory-only result', () => {
  const blocked = createCourseProgressStore(() => { throw new Error('Denied'); });
  blocked.setComplete('day-02', true, revision);
  assert.equal(blocked.getSnapshot().storage, 'memory');
  assert.deepEqual(blocked.getSnapshot().progress.completed, ['day-02']);
  const full = createCourseProgressStore(() => ({ getItem: () => null, setItem: () => { throw new Error('Full'); }, removeItem() {} }));
  full.setComplete('day-03', true, revision);
  assert.equal(full.getSnapshot().storage, 'memory');
  assert.deepEqual(full.getSnapshot().progress.completed, ['day-03']);
  assert.match(full.getSnapshot().notice, /will not survive a reload/);
});
test('reset removes only this preview key and failed removal warns that progress may return', () => {
  const storage = memoryStorage(saved('day-01'));
  const store = createCourseProgressStore(() => storage);
  store.reset();
  assert.equal(storage.value(), null);
  assert.deepEqual(store.getSnapshot().progress.completed, []);
  const blocked = createCourseProgressStore(() => ({ getItem: () => saved('day-01'), setItem() {}, removeItem() { throw new Error('Denied'); } }));
  blocked.reset();
  assert.deepEqual(blocked.getSnapshot().progress.completed, []);
  assert.match(blocked.getSnapshot().notice, /may return after a reload/);
});
test('cross-tab updates notify subscribers, validate input, and unsubscribe cleanly', () => {
  const store = createCourseProgressStore(() => memoryStorage());
  let updates = 0;
  const stop = store.subscribe(() => { updates++; });
  store.receiveStorageValue(saved('day-02'));
  assert.deepEqual(store.getSnapshot().progress.completed, ['day-02']);
  assert.match(store.getSnapshot().notice, /another tab/);
  stop(); const before = updates;
  store.receiveStorageValue('corrupt');
  assert.equal(updates, before);
  assert.equal(store.getSnapshot().storage, 'recovered');
});

test('a changed sample revision cannot silently retain a completion mark', () => {
  const store = createCourseProgressStore(() => memoryStorage(saved('day-01')));
  store.subscribe(() => {});
  assert.equal(isCurrentCompletion(store.getSnapshot().progress, 'day-01', revision), true);
  assert.equal(isCurrentCompletion(store.getSnapshot().progress, 'day-01', 'b'.repeat(64)), false);
  assert.equal(store.setComplete('day-02', true), false);
  assert.equal(store.setComplete('day-02', true, 'private practice text'), false);
  store.setComplete('day-01', true, 'b'.repeat(64));
  assert.equal(isCurrentCompletion(store.getSnapshot().progress, 'day-01', 'b'.repeat(64)), true);
});
