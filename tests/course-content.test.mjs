import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const content = JSON.parse(await readFile(new URL('../src/data/course-preview.json', import.meta.url), 'utf8'));
const workbook = await readFile(new URL('../public/ai-confidence-sample-workbook.html', import.meta.url), 'utf8');
const ids = ['day-01', 'day-02', 'day-03'];

test('public projection contains exactly three samples and the ordered 21-day outline', () => {
 assert.deepEqual(content.samples.map(d => d.id), ids);
 assert.equal(content.overview.length, 21);
 assert.deepEqual(content.overview.map(d => d.order), Array.from({ length:21 }, (_,i) => i+1));
 assert.equal(content.course.price_usd, 79);
 assert.deepEqual(content.course.clear, ['Context','Lead with goal','Examples','Add constraints','Refine']);
 assert.equal(content.course.status.recording, 'recording-pending');
 assert.equal(content.course.status.availability, 'coming-soon');
 assert.deepEqual(content.course.phases.map(p => p.title), ['Foundations','Everyday Creation and Organization','Workflows and Independent Practice']);
 assert.deepEqual(content.course.phases.map(p => [p.first_day,p.last_day]), [[1,7],[8,14],[15,21]]);
});
test('non-sample summaries have no teaching, prompts, answers or instructor content', () => {
 const allowed = ['id','order','phase','title','objective','artifact','estimated_minutes','status'].sort();
 for (const day of content.overview) assert.deepEqual(Object.keys(day).sort(), allowed);
 const forbidden = new Set(['demonstration','recording_notes','source_references','prerequisites']);
 function inspect(value) {
  if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
   assert.equal(forbidden.has(key), false, key); inspect(child);
  }
 }
 inspect(content);
 assert.equal(content.source_manifest.files.length, 23);
 assert.ok(content.source_manifest.files.every(f => /^[a-f\d]{64}$/.test(f.sha256)));
});
test('sample workbook contains each exact artifact, template and check but no unavailable lessons', () => {
 const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 for (const day of content.samples) {
  assert.ok(workbook.includes(escape(day.exercise.artifact_name)));
  for (const prompt of day.prompts) assert.ok(workbook.includes(escape(prompt.template)));
  for (const q of day.check.items) assert.ok(workbook.includes(escape(q.question)));
 }
 for (const day of content.overview.slice(3)) assert.ok(!workbook.includes(`Day ${String(day.order).padStart(2,'0')} ${escape(day.title)}`));
 assert.equal((workbook.match(/class="write-line"/g) ?? []).length, 48);
 assert.ok(!workbook.includes('type="password"'));
 assert.ok(!workbook.includes('<form'));
});
