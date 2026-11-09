#!/usr/bin/env node
/**
 * Deterministic, dependency-free public preview importer. Canonical source stays
 * outside the public site repository. No network, timestamps, UI, account data,
 * deployment, PDF generation, or full-course source copying occurs here.
 *
 * Usage:
 *   node build-course-preview.mjs --source /absolute/academy/course \
 *     --output /absolute/repo/src/data/course-preview.json
 * Optional: --workbook-output /absolute/repo/public/ai-confidence-sample-workbook.html
 * Optional: --dry-run (validate and report without writing either artifact)
 *
 * Public shape contract (all objects are constructed by explicit allowlists):
 * {
 *   schema_version: '1.0',
 *   course: {id,title,academy,author,price_usd,format,audience,clear,phases,status},
 *   preview: {sample_ids,duration_basis,progress_scope,workbook_filename},
 *   overview: [{id,order,phase,title,objective,artifact,estimated_minutes,status}],
 *   samples: [{id,order,phase,title,objective,estimated_minutes,status,
 *     introduction,lesson_sections,prompts,exercise,check,troubleshooting,
 *     reflection,next_step,official_references,revision}],
 *   source_manifest: {algorithm:'sha256',files:[{path,sha256}]},
 *   content_revision: '<sha256 of public content, excluding source manifest>'
 * }
 * Samples are only day-01/02/03. No raw prerequisites, instructor demonstration,
 * recording notes, internal book provenance or non-sample lesson bodies escape.
 * A sample revision hashes its public fields before adding revision. Overview
 * and sample estimated_minutes are total_minutes minus demo_minutes; planned
 * demonstration time must not be presented as available recorded media.
 * The stdout JSON report names both artifacts, hashes, counts and line totals.
 */

import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_IDS = Object.freeze(['day-01', 'day-02', 'day-03']);
const DAY_IDS = Object.freeze(Array.from({ length: 21 }, (_, i) => `day-${String(i + 1).padStart(2, '0')}`));
const CLEAR = Object.freeze(['Context', 'Lead with goal', 'Examples', 'Add constraints', 'Refine']);
const WORKBOOK_NAME = 'ai-confidence-sample-workbook.html';
const DURATION_BASIS = 'Estimated reading, practice and checks; excludes the planned demonstration. Recordings are pending.';
const FORBIDDEN_PUBLIC_KEYS = new Set(['demonstration', 'recording_notes', 'source_references', 'prerequisites']);
const SCHEMA_KEYWORDS = new Set(['$schema', '$comment', '$ref', '$defs', 'title', 'description', 'type', 'required', 'properties', 'additionalProperties', 'items', 'minItems', 'maxItems', 'uniqueItems', 'minLength', 'pattern', 'const', 'enum', 'minimum', 'maximum', 'allOf', 'if', 'then', 'format']);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function text(value, where) {
  invariant(typeof value === 'string' && /\S/u.test(value), `${where}: expected nonempty text`);
  return value;
}

function object(value, where) {
  invariant(value !== null && typeof value === 'object' && !Array.isArray(value), `${where}: expected object`);
  return value;
}

function exactKeys(value, keys, where) {
  object(value, where);
  invariant(stable(Object.keys(value).sort()) === stable([...keys].sort()), `${where}: missing or extra fields`);
}

function stringArray(value, where) {
  invariant(Array.isArray(value) && value.length > 0, `${where}: expected nonempty array`);
  return value.map((item, i) => text(item, `${where}[${i}]`));
}

// Validate the exact supported schema vocabulary; never silently skip a newly
// introduced assertion keyword. Schema maps have arbitrary user-defined names.
function inspectSchema(schema, where = '$') {
  invariant(typeof schema === 'boolean' || (schema && typeof schema === 'object' && !Array.isArray(schema)), `${where}: invalid schema`);
  if (typeof schema === 'boolean') return;
  for (const key of Object.keys(schema)) invariant(SCHEMA_KEYWORDS.has(key), `${where}: unsupported JSON Schema keyword ${key}`);
  for (const key of ['properties', '$defs']) {
    if (schema[key]) for (const [name, child] of Object.entries(schema[key])) inspectSchema(child, `${where}.${key}.${name}`);
  }
  if (schema.items) inspectSchema(schema.items, `${where}.items`);
  if (schema.allOf) schema.allOf.forEach((child, i) => inspectSchema(child, `${where}.allOf[${i}]`));
  for (const key of ['if', 'then']) if (schema[key]) inspectSchema(schema[key], `${where}.${key}`);
}

// Dependency-free validator for every assertion used by lesson.schema.json.
// This is deliberately a bounded implementation, not a claim of general JSON
// Schema 2020-12 support. Source schema changes outside this subset fail closed.
function schemaErrors(value, schema, root, where = '$') {
  if (schema === true) return [];
  if (schema === false) return [`${where}: rejected by schema`];
  let errors = [];
  if (schema.$ref) {
    invariant(schema.$ref.startsWith('#/'), `${where}: nonlocal schema reference not supported`);
    const resolved = schema.$ref.slice(2).split('/').reduce((node, key) => node?.[key.replace(/~1/g, '/').replace(/~0/g, '~')], root);
    invariant(resolved !== undefined, `${where}: missing schema reference ${schema.$ref}`);
    errors.push(...schemaErrors(value, resolved, root, where));
  }
  if ('const' in schema && stable(value) !== stable(schema.const)) errors.push(`${where}: incorrect constant`);
  if (schema.enum && !schema.enum.some(item => stable(item) === stable(value))) errors.push(`${where}: value outside allowed enum`);
  if (schema.type) {
    const matches = {
      object: value !== null && typeof value === 'object' && !Array.isArray(value),
      array: Array.isArray(value),
      string: typeof value === 'string',
      integer: Number.isInteger(value),
      number: typeof value === 'number' && Number.isFinite(value),
      boolean: typeof value === 'boolean',
      null: value === null,
    }[schema.type];
    invariant(matches !== undefined, `${where}: unsupported schema type ${schema.type}`);
    if (!matches) return [...errors, `${where}: expected ${schema.type}`];
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && [...value].length < schema.minLength) errors.push(`${where}: text too short`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${where}: text pattern failed`);
    if (schema.format === 'date') {
      const parsed = new Date(`${value}T00:00:00.000Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) errors.push(`${where}: invalid date`);
    } else if (schema.format === 'uri') {
      try { new URL(value); } catch { errors.push(`${where}: invalid URI`); }
    } else if (schema.format) throw new Error(`${where}: unsupported schema format ${schema.format}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${where}: below minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${where}: above maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${where}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${where}: too many items`);
    if (schema.uniqueItems && new Set(value.map(stable)).size !== value.length) errors.push(`${where}: duplicate items`);
    if (schema.items) value.forEach((item, i) => errors.push(...schemaErrors(item, schema.items, root, `${where}[${i}]`)));
  } else if (value !== null && typeof value === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${where}.${key}: required field missing`);
    for (const [key, item] of Object.entries(value)) {
      if (schema.properties?.[key]) errors.push(...schemaErrors(item, schema.properties[key], root, `${where}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${where}.${key}: unexpected field`);
    }
  }
  for (const child of schema.allOf ?? []) errors.push(...schemaErrors(value, child, root, where));
  if (schema.if && schemaErrors(value, schema.if, root, where).length === 0 && schema.then) errors.push(...schemaErrors(value, schema.then, root, where));
  return errors;
}

function validateCourse(course) {
  exactKeys(course, ['schema_version', 'id', 'title', 'academy', 'author', 'price_usd', 'format', 'audience', 'clear', 'introduction', 'phases', 'status', 'lesson_ids'], 'course');
  invariant(course.schema_version === '1.0' && course.id === '21-days-to-ai-confidence', 'Unexpected canonical course identity/version');
  invariant(course.title === '21 Days to AI Confidence' && course.price_usd === 79, 'Course title or recovered price changed');
  for (const key of ['academy', 'author', 'format', 'introduction']) text(course[key], `course.${key}`);
  stringArray(course.audience, 'course.audience');
  invariant(stable(course.clear) === stable(CLEAR), 'CLEAR must be Context; Lead with goal; Examples; Add constraints; Refine');
  invariant(stable(course.lesson_ids) === stable(DAY_IDS), 'Course must contain exactly day-01 through day-21 in order');
  invariant(Array.isArray(course.phases) && course.phases.length === 3, 'Course must have exactly three phases');
  course.phases.forEach((phase, i) => {
    exactKeys(phase, ['id', 'title', 'first_day', 'last_day', 'purpose'], `course.phases[${i}]`);
    for (const key of ['id', 'title', 'purpose']) text(phase[key], `course.phases[${i}].${key}`);
    invariant(phase.first_day === i * 7 + 1 && phase.last_day === (i + 1) * 7, `Phase ${i + 1} must cover its exact seven days`);
  });
  exactKeys(course.status, ['content', 'recording', 'author_review', 'delivery', 'availability', 'editorial_review'], 'course.status');
  validatePendingStatus(course.status, 'course.status');
  invariant(course.status.delivery === 'not-deployed' && course.status.availability === 'coming-soon', 'Full-course delivery must remain not-deployed and coming-soon');
  invariant(course.status.editorial_review === 'passed', 'Expected independent editorial review passed');
}

function validatePendingStatus(status, where) {
  invariant(status.content === 'content-complete', `${where}: written content must be complete`);
  invariant(status.recording === 'recording-pending', `${where}: recordings must remain pending`);
  invariant(status.author_review === 'review-pending', `${where}: author review must remain pending`);
}

function seconds(time) {
  const [minutes, remainder] = time.split(':').map(Number);
  return minutes * 60 + remainder;
}

function validateLesson(lesson, index, schema) {
  const errors = schemaErrors(lesson, schema, schema);
  invariant(errors.length === 0, `${DAY_IDS[index]} schema validation failed:\n${errors.join('\n')}`);
  invariant(lesson.id === DAY_IDS[index] && lesson.order === index + 1, `Missing, extra or misordered lesson at ${index + 1}`);
  invariant(lesson.phase === Math.floor(index / 7) + 1, `${lesson.id}: incorrect phase`);
  text(lesson.objective, `${lesson.id}.objective`);
  validatePendingStatus(lesson.status, `${lesson.id}.status`);
  invariant(lesson.status.editorial_review === 'passed', `${lesson.id}: editorial review is not passed`);
  const duration = lesson.duration_estimate;
  invariant(duration.total_minutes === duration.lesson_minutes + duration.demo_minutes + duration.practice_minutes + duration.check_reflect_minutes, `${lesson.id}: duration components do not sum`);
  invariant(duration.total_minutes - duration.demo_minutes > 0, `${lesson.id}: nonpositive public estimate`);
  let end = 0;
  for (const beat of lesson.demonstration.beats) {
    const [startTime, endTime] = beat.time.split(/[–-]/u);
    const start = seconds(startTime), next = seconds(endTime);
    invariant(start === end && next > start, `${lesson.id}: demonstration timing gap, overlap or reversed interval`);
    end = next;
  }
  invariant(end === duration.demo_minutes * 60, `${lesson.id}: demonstration length does not match estimate`);
  invariant(new Set(lesson.prompts.map(prompt => prompt.id)).size === lesson.prompts.length, `${lesson.id}: duplicate prompt IDs`);
  invariant(lesson.prompts.some(prompt => prompt.id === lesson.demonstration.prompt_id), `${lesson.id}: unknown demonstration prompt reference`);
  for (const prerequisite of lesson.prerequisites) invariant(DAY_IDS.indexOf(prerequisite) >= 0 && DAY_IDS.indexOf(prerequisite) < index, `${lesson.id}: prerequisite is not earlier`);
}

function projectStatus(status) {
  return { content: status.content, recording: status.recording, author_review: status.author_review };
}

function projectPrompt(prompt) {
  return {
    id: prompt.id, title: prompt.title, when_to_use: prompt.when_to_use,
    template: prompt.template, filled_example: prompt.filled_example,
    illustrative_output: prompt.illustrative_output,
    review_checklist: [...prompt.review_checklist], tags: [...prompt.tags],
  };
}

function projectLesson(lesson) {
  const sample = {
    id: lesson.id, order: lesson.order, phase: lesson.phase, title: lesson.title,
    objective: lesson.objective,
    estimated_minutes: lesson.duration_estimate.total_minutes - lesson.duration_estimate.demo_minutes,
    status: projectStatus(lesson.status), introduction: lesson.introduction,
    lesson_sections: lesson.lesson_sections.map(section => ({ heading: section.heading, body: section.body })),
    prompts: lesson.prompts.map(projectPrompt),
    exercise: {
      artifact_name: lesson.exercise.artifact_name,
      instructions: [...lesson.exercise.instructions],
      success_criteria: [...lesson.exercise.success_criteria],
      writing_fields: lesson.exercise.writing_fields.map(field => ({ label: field.label, hint: field.hint, lines: field.lines })),
      transfer_option: lesson.exercise.transfer_option,
    },
    check: {
      type: lesson.check.type,
      items: lesson.check.items.map(item => ({ question: item.question, answer: item.answer, explanation: item.explanation })),
      pass_rule: lesson.check.pass_rule,
    },
    troubleshooting: lesson.troubleshooting, reflection: lesson.reflection,
    next_step: lesson.next_step,
    official_references: lesson.official_references.map(reference => ({ title: reference.title, url: reference.url })),
  };
  return { ...sample, revision: sha256(stable(sample)) };
}

function ensureNoDeniedKeys(value, where = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) return value.forEach((item, i) => ensureNoDeniedKeys(item, `${where}[${i}]`));
  for (const [key, item] of Object.entries(value)) {
    invariant(!FORBIDDEN_PUBLIC_KEYS.has(key), `${where}.${key}: private/instructor field leaked`);
    ensureNoDeniedKeys(item, `${where}.${key}`);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function paragraphs(value) {
  return value.split(/\n\s*\n/u).map(part => `<p>${escapeHTML(part).replace(/\n/g, '<br>')}</p>`).join('\n');
}

function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</${tag}>`;
}

function lines(count) {
  invariant(Number.isInteger(count) && count >= 1 && count <= 3, 'Invalid workbook writing-line count');
  return `<div class="writing-lines" aria-label="${count} ruled writing lines">${'<div class="write-line" aria-hidden="true">&nbsp;</div>'.repeat(count)}</div>`;
}

// Receives only the public projection; it cannot consult canonical source files.
function workbookHTML(payload) {
  invariant(stable(payload.samples.map(sample => sample.id)) === stable(SAMPLE_IDS), 'Workbook must contain exactly the three selected public samples');
  const course = payload.course;
  const dayTitle = sample => `Day ${sample.order} ${sample.title}`;
  const tasks = payload.samples.map(sample => {
    const task = `<section class="task-page" aria-labelledby="${sample.id}">
      <h1 id="${sample.id}">${escapeHTML(dayTitle(sample))}</h1>
      <p><strong>Learning objective:</strong> ${escapeHTML(sample.objective)}</p>
      <p><strong>Written preview estimate:</strong> ${sample.estimated_minutes} minutes for reading, practice and checks; planned demonstration excluded.</p>
      <p><strong>Save as:</strong> ${escapeHTML(sample.exercise.artifact_name)}</p>
      <h2>Your task</h2>${list(sample.exercise.instructions, true)}
      <h2>Success criteria</h2>${list(sample.exercise.success_criteria)}
      <p><strong>Another way to practice:</strong> ${escapeHTML(sample.exercise.transfer_option)}</p>
      ${sample.prompts.map(prompt => `<h2>${escapeHTML(prompt.title)}</h2><p>${escapeHTML(prompt.when_to_use)}</p><pre class="prompt">${escapeHTML(prompt.template)}</pre>`).join('\n')}
    </section>`;
    const work = `<section class="work-page" aria-labelledby="${sample.id}-working">
      <h1 id="${sample.id}-working">Day ${sample.order} Working space</h1>
      ${sample.exercise.writing_fields.map(field => `<div class="writing-field"><h2>${escapeHTML(field.label)}</h2><p>${escapeHTML(field.hint)}</p>${lines(field.lines)}</div>`).join('\n')}
      <h2>Check and reflect</h2>${list(sample.check.items.map(item => item.question), true)}
      ${paragraphs(sample.reflection)}${lines(2)}
    </section>`;
    return `${task}\n${work}`;
  }).join('\n');
  const answers = payload.samples.map(sample => `<section class="answer-day">
    <h2>${escapeHTML(dayTitle(sample))}</h2>
    ${sample.check.items.map((item, i) => `<div class="answer-item"><h3>${i + 1}. ${escapeHTML(item.question)}</h3><p><strong>Answer or scoring:</strong> ${escapeHTML(item.answer)}</p><p>${escapeHTML(item.explanation)}</p></div>`).join('\n')}
    <p><strong>Completion rule:</strong> ${escapeHTML(sample.check.pass_rule)}</p>
  </section>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Printable sample workbook for Days 1–3 of 21 Days to AI Confidence. Written content prepared for author review; recordings pending.">
  <title>${escapeHTML(course.title)} — Sample workbook Days 1–3</title>
  <style>
    @page { size: Letter portrait; margin: .65in .7in; }
    * { box-sizing: border-box; }
    body { max-width: 8.5in; margin: 0 auto; padding: .65in .7in; color: #181818; background: #fff; font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.22; overflow-wrap: anywhere; }
    h1,h2,h3 { font-family: Arial, Helvetica, sans-serif; line-height: 1.15; break-after: avoid; }
    h1 { font-size: 20pt; margin: 0 0 12pt; }
    h2 { font-size: 12pt; margin: 12pt 0 5pt; }
    h3 { font-size: 11pt; margin: 8pt 0 4pt; }
    p { margin: 5pt 0 8pt; orphans: 2; widows: 2; }
    ul,ol { padding-left: 20pt; margin: 6pt 0 10pt; }
    li { padding-left: 2pt; margin-bottom: 4pt; }
    a { color: inherit; text-decoration: underline; }
    .cover { min-height: 7.8in; padding-top: .6in; }
    .cover .status { border: 1px solid #777; padding: 10pt; margin-top: 18pt; }
    .subtitle { font-family: Arial, Helvetica, sans-serif; font-size: 15pt; }
    .task-page,.work-page,.answer-key { break-before: page; page-break-before: always; }
    .prompt { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.18; white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid #777; padding: 9pt; margin: 8pt 0 12pt; break-inside: avoid; }
    .writing-field { break-inside: avoid; }
    .writing-field h2 { margin-top: 9pt; }
    .writing-field p { margin: 3pt 0 0; }
    .writing-lines { margin: 0 0 5pt; }
    .write-line { height: .25in; border-bottom: .6pt solid #777; }
    .answer-item { break-inside: avoid; }
    .answer-day { margin-bottom: 16pt; }
    .small { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; }
    @media screen and (max-width: 640px) { body { padding: 22px 18px; } h1 { font-size: 25px; } .cover { min-height: auto; padding: 14px 0 32px; } .task-page,.work-page,.answer-key { margin-top: 36px; } }
    @media print { body { max-width: none; margin: 0; padding: 0; } a { text-decoration: none; } .screen-only { display: none; } .write-line { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
<main>
  <header class="cover">
    <h1>${escapeHTML(course.title)}</h1>
    <p class="subtitle">Sample workbook — Days 1–3</p>
    <p>${escapeHTML(course.academy)}<br>${escapeHTML(course.author)}</p>
    <p>This workbook goes with the first three written lessons. Use a simple task of your own or try the sample exercise. Keep your notes and the answer you checked so you can use them in the next lesson.</p>
    <p><strong>CLEAR:</strong> ${escapeHTML(course.clear.join('; '))}.</p>
    <div class="status"><strong>Written samples. Author review and recordings are still pending.</strong><p>The full 21-day course will cost $79 when it opens. It is still coming soon. This free workbook does not enroll you or create an account.</p></div>
    <nav aria-label="Sample workbook contents"><h2>Contents</h2><ul>${payload.samples.map(sample => `<li><a href="#${sample.id}">${escapeHTML(dayTitle(sample))}</a></li>`).join('')}<li><a href="#sample-answers">Check answers and completion rules</a></li></ul></nav>
    <p class="screen-only">Use your browser's print command and select Letter paper to print or save this workbook. Write your answers in your own copy. This page has no form and does not upload your work.</p>
    <p class="small">Public content revision: ${payload.content_revision}</p>
  </header>
  ${tasks}
  <section class="answer-key" aria-labelledby="sample-answers"><h1 id="sample-answers">Check answers and completion rules</h1>${answers}</section>
</main>
</body>
</html>
`;
}

function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--help') return { help: true };
    invariant(['--source', '--output', '--workbook-output', '--dry-run'].includes(key), `Unknown argument: ${key}`);
    invariant(!(key in flags), `Repeated argument: ${key}`);
    if (key === '--dry-run') flags[key] = true;
    else {
      invariant(argv[i + 1] && !argv[i + 1].startsWith('--'), `Missing value for ${key}`);
      flags[key] = argv[++i];
      invariant(path.isAbsolute(flags[key]), `${key} must be an absolute path`);
    }
  }
  invariant(flags['--source'] && flags['--output'], 'Required: --source /absolute/academy/course --output /absolute/repo/src/data/course-preview.json');
  invariant(path.basename(flags['--output']) === 'course-preview.json', '--output must name course-preview.json');
  const output = path.resolve(flags['--output']);
  const workbookOutput = path.resolve(flags['--workbook-output'] ?? path.join(path.dirname(output), '../../public', WORKBOOK_NAME));
  invariant(path.basename(workbookOutput) === WORKBOOK_NAME, `Workbook must be named ${WORKBOOK_NAME}`);
  const source = path.resolve(flags['--source']);
  for (const destination of [output, workbookOutput]) {
    const relative = path.relative(source, destination);
    invariant(relative.startsWith('..' + path.sep) || path.isAbsolute(relative), 'Output must not overwrite or sit inside canonical source');
  }
  return { source, output, workbookOutput, dryRun: Boolean(flags['--dry-run']) };
}

export async function buildPreview(options) {
  const manifest = [];
  async function sourceJSON(relative) {
    const bytes = await readFile(path.join(options.source, relative));
    manifest.push({ path: relative, sha256: sha256(bytes) });
    try { return JSON.parse(bytes.toString('utf8')); }
    catch { throw new Error(`${relative}: invalid JSON`); }
  }
  const course = await sourceJSON('course.json');
  validateCourse(course);
  const schema = await sourceJSON('lesson.schema.json');
  inspectSchema(schema);
  const files = (await readdir(path.join(options.source, 'lessons'))).filter(name => name.endsWith('.json')).sort();
  invariant(stable(files) === stable(DAY_IDS.map(id => `${id}.json`)), 'Expected exactly 21 lesson JSON files; missing or extra lesson file');
  const lessons = [];
  for (let i = 0; i < DAY_IDS.length; i++) {
    const lesson = await sourceJSON(`lessons/${DAY_IDS[i]}.json`);
    validateLesson(lesson, i, schema);
    lessons.push(lesson);
  }
  const publicCourse = {
    id: course.id, title: course.title, academy: course.academy, author: course.author,
    price_usd: course.price_usd, format: course.format, audience: [...course.audience], clear: [...course.clear],
    phases: course.phases.map(phase => ({ id: phase.id, title: phase.title, first_day: phase.first_day, last_day: phase.last_day, purpose: phase.purpose })),
    status: { ...projectStatus(course.status), delivery: course.status.delivery, availability: course.status.availability },
  };
  const preview = {
    sample_ids: [...SAMPLE_IDS], duration_basis: DURATION_BASIS,
    progress_scope: 'browser-local-preview', workbook_filename: WORKBOOK_NAME,
  };
  const overview = lessons.map(lesson => ({
    id: lesson.id, order: lesson.order, phase: lesson.phase, title: lesson.title,
    objective: lesson.objective, artifact: lesson.exercise.artifact_name,
    estimated_minutes: lesson.duration_estimate.total_minutes - lesson.duration_estimate.demo_minutes,
    status: projectStatus(lesson.status),
  }));
  const samples = lessons.filter(lesson => SAMPLE_IDS.includes(lesson.id)).map(projectLesson);
  invariant(stable(samples.map(sample => sample.id)) === stable(SAMPLE_IDS), 'Incorrect selected sample set/order');
  invariant(samples.every(sample => sample.official_references.every(reference => new URL(reference.url).protocol === 'https:')), 'Unsafe official reference URL');
  const publicContent = { course: publicCourse, preview, overview, samples };
  const payload = {
    schema_version: '1.0', ...publicContent,
    source_manifest: { algorithm: 'sha256', files: manifest },
    content_revision: sha256(stable(publicContent)),
  };
  ensureNoDeniedKeys(payload);
  invariant(payload.overview.length === 21 && payload.samples.length === 3, 'Projection cardinality failed');
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const html = workbookHTML(payload);
  const writingLines = samples.map(sample => ({ id: sample.id, field_lines: sample.exercise.writing_fields.reduce((sum, field) => sum + field.lines, 0), reflection_lines: 2 }));
  const expectedLineCount = writingLines.reduce((sum, day) => sum + day.field_lines + day.reflection_lines, 0);
  invariant((html.match(/class="write-line"/g) ?? []).length === expectedLineCount, 'Workbook lost ruled writing lines');
  if (!options.dryRun) {
    await mkdir(path.dirname(options.output), { recursive: true });
    await mkdir(path.dirname(options.workbookOutput), { recursive: true });
    await writeFile(options.output, json, 'utf8');
    await writeFile(options.workbookOutput, html, 'utf8');
  }
  return {
    status: options.dryRun ? 'validated-dry-run' : 'generated',
    output: options.output, workbook_output: options.workbookOutput,
    overview_days: overview.length, sample_ids: [...SAMPLE_IDS],
    sample_prompts: samples.reduce((sum, sample) => sum + sample.prompts.length, 0),
    answered_sample_checks: samples.reduce((sum, sample) => sum + sample.check.items.length, 0),
    sample_estimated_minutes: samples.map(sample => ({ id: sample.id, estimated_minutes: sample.estimated_minutes })),
    writing_lines: writingLines, total_workbook_ruled_lines: expectedLineCount,
    source_files_hashed: manifest.length,
    projection_sha256: sha256(json), workbook_sha256: sha256(html), content_revision: payload.content_revision,
    excluded_fields: [...FORBIDDEN_PUBLIC_KEYS],
    validation: 'All source lesson-schema assertions, exact 21-day order/phases, objectives, duration sums, demo coverage, prompt references, exact CLEAR, pending statuses and public allowlists checked.',
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Usage: node build-course-preview.mjs --source /absolute/academy/course --output /absolute/repo/src/data/course-preview.json [--workbook-output /absolute/repo/public/ai-confidence-sample-workbook.html] [--dry-run]\n');
    return;
  }
  const report = await buildPreview(options);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write(`Course preview generation failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
