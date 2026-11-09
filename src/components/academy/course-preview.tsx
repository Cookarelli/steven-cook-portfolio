"use client";

import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import coursePreview from "@/data/course-preview.json";
import {
  courseProgressStore,
  isCurrentCompletion,
  subscribeToCourseProgress,
  type ProgressSnapshot,
} from "@/lib/course-progress";
import "./course-preview.css";

const coursePath = "/ai-academy/21-day-ai-confidence";
const lessonPath = (id: string) => `${coursePath}/lessons/${id}`;
const sampleWorkbookPdf = "/ai-confidence-sample-workbook.pdf";
type PublicReference = { title: string; url: string; accessed_date?: string; supports?: string };
type SampleLesson = Omit<(typeof coursePreview.samples)[number], "official_references"> & { official_references: PublicReference[] };
const samples: SampleLesson[] = coursePreview.samples;

function useSampleProgress() {
  return useSyncExternalStore(subscribeToCourseProgress, courseProgressStore.getSnapshot, courseProgressStore.getServerSnapshot);
}

function currentCompletions(snapshot: ProgressSnapshot) {
  return samples.filter((sample) => isCurrentCompletion(snapshot.progress, sample.id, sample.revision));
}

function CheckIcon() {
  return <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 8V5a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function Prose({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</>;
}

function ProgressPanel({ snapshot, compact = false }: { snapshot: ProgressSnapshot; compact?: boolean }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const confirmId = useId();
  const count = currentCompletions(snapshot).length;
  const stale = snapshot.progress.completed.length > count;
  return <section className={`cp-progress${compact ? " cp-progress-compact" : ""}`} aria-label="Free sample lesson progress">
    <div className="cp-progress-heading"><strong>Your sample progress</strong><span>{snapshot.hydrated ? `${count} of ${samples.length}` : "—"}</span></div>
    <progress value={count} max={Math.max(samples.length, 1)} aria-label={`${count} of ${samples.length} free sample lessons marked complete`} />
    <p className="cp-small">{count === 0 ? "Start with one small task. Mark a sample complete when you have practiced and checked it." : count === samples.length ? "You have marked all three written samples complete. The remaining course is coming soon." : `${samples.length - count} written sample${samples.length - count === 1 ? "" : "s"} left to practice and check.`}</p>
    <p className="cp-storage-notice" role="status">{snapshot.notice}</p>
    {stale && <p className="cp-storage-notice">A sample has changed since you last marked it complete. Review the current version before marking it again.</p>}
    <button type="button" className="cp-text-button" disabled={!snapshot.hydrated} onClick={() => setConfirmReset(!confirmReset)} aria-expanded={confirmReset} aria-controls={confirmId}>Reset sample progress</button>
    {confirmReset && <div id={confirmId} className="cp-reset-confirm">
      <p>Clear the three sample checkmarks in this browser? This does not delete your own exercise files.</p>
      <div className="cp-actions"><button type="button" className="cp-button cp-button-secondary" onClick={() => { courseProgressStore.reset(); setConfirmReset(false); }}>Clear sample checkmarks</button><button type="button" className="cp-text-button" onClick={() => setConfirmReset(false)}>Keep my progress</button></div>
    </div>}
  </section>;
}

function CopyBlock({ title, text, action, preview = true }: { title: string; text: string; action: string; preview?: boolean }) {
  const [result, setResult] = useState<"idle" | "copied" | "manual">("idle");
  const manualId = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setResult("copied");
    } catch {
      setResult("manual");
    }
  }
  return <div className="cp-copy-block">
    <div className="cp-copy-heading"><h4>{title}</h4><button type="button" className="cp-copy-button" onClick={copy} aria-label={`${action}: ${title}`}>{action}<span aria-hidden="true"> ↗</span></button></div>
    {preview && <pre>{text}</pre>}
    <span className="cp-copy-result" role="status">{result === "copied" ? "Copied. Review the text before using it." : result === "manual" ? "Clipboard access is unavailable. Select the text below and copy it yourself." : ""}</span>
    {result === "manual" && <div className="cp-manual-copy"><label htmlFor={manualId}>Text for manual copying</label><textarea id={manualId} ref={textarea} readOnly value={text} rows={7} spellCheck={false} /><button type="button" className="cp-text-button" onClick={() => { textarea.current?.focus(); textarea.current?.select(); }}>Select all text</button></div>}
  </div>;
}

export function CourseOverview() {
  const snapshot = useSampleProgress();
  const nextSample = samples.find((sample) => !isCurrentCompletion(snapshot.progress, sample.id, sample.revision)) ?? samples[0];
  return <section className="course-preview cp-overview" id="course-preview" aria-labelledby="course-preview-title">
    <div className="ol-container">
      <header className="cp-overview-header">
        <div><p className="cp-eyebrow">A practical first look</p><h2 id="course-preview-title">Try the first three days.</h2><p className="cp-lead">Start with a task you actually recognize, then learn to explain it and check the answer. These free written samples include the teaching, reusable prompts, worked examples, and exercises. The full {coursePreview.overview.length}-day course is coming soon, so there is no need to clear three weeks of your calendar today.</p><div className="cp-actions">{nextSample && <Link href={lessonPath(nextSample.id)} className="cp-button">{currentCompletions(snapshot).length > 0 ? "Continue the samples" : "Start Day 1"}<span aria-hidden="true">→</span></Link>}<a className="cp-button cp-button-secondary" href={sampleWorkbookPdf} download>Download the sample workbook (PDF)<span aria-hidden="true">↓</span></a></div><p className="cp-small"><a href={`/${coursePreview.preview.workbook_filename}`} target="_blank" rel="noopener noreferrer">Read the accessible HTML workbook (opens in a new tab)</a></p><p className="cp-small">Free written preview · Recordings pending · Author review pending</p></div>
        <ProgressPanel snapshot={snapshot} />
      </header>

      <div className="cp-plan-intro"><p className="cp-eyebrow">The course at a glance</p><h3>Small skills, put to useful work.</h3><p>Each day ends with something you can keep: a clearer prompt, a checked plan, or a reusable way to handle a task. The first three lessons are open below, and the rest of the plan shows where those skills lead. Later lessons are listed as a preview of the curriculum; their full content and course access are still coming soon.</p><p className="cp-small">{coursePreview.preview.duration_basis}</p></div>
      {coursePreview.course.phases.map((phase, phaseIndex) => <section key={phase.id} className="cp-phase" aria-labelledby={`phase-${phase.id}`}>
        <header className="cp-phase-header"><span className="cp-phase-number" aria-hidden="true">0{phaseIndex + 1}</span><div><p className="cp-eyebrow">Days {phase.first_day}–{phase.last_day}</p><h3 id={`phase-${phase.id}`}>{phase.title}</h3><p>{phase.purpose}</p></div></header>
        <ol className="cp-day-list" start={phase.first_day}>
          {coursePreview.overview.filter((day) => day.order >= phase.first_day && day.order <= phase.last_day).map((day) => {
            const sample = samples.find((candidate) => candidate.id === day.id);
            const complete = sample && isCurrentCompletion(snapshot.progress, sample.id, sample.revision);
            return <li key={day.id} className={`cp-day${sample ? " cp-day-open" : " cp-day-locked"}`}>
              <span className="cp-day-number">Day {String(day.order).padStart(2, "0")}</span>
              <div className="cp-day-main"><div className="cp-day-title"><h4>{sample ? <Link href={lessonPath(day.id)}>{day.title}</Link> : day.title}</h4><span className={`cp-pill${sample ? " cp-pill-open" : ""}`}>{complete ? <><CheckIcon />Marked complete</> : sample ? "Free sample" : <><LockIcon />Coming soon</>}</span></div><p>{day.objective}</p><p className="cp-day-artifact"><strong>You’ll make:</strong> {day.artifact}</p><span className="cp-small">About {day.estimated_minutes} minutes · written lesson, practice and checks</span></div>
              {sample && <Link href={lessonPath(day.id)} className="cp-day-link" aria-label={`Open Day ${day.order}: ${day.title}`}>Open sample <span aria-hidden="true">→</span></Link>}
            </li>;
          })}
        </ol>
      </section>)}
      <div className="cp-interest"><div><h3>Want to hear when the full course is ready?</h3><p>Join the interest list for course updates. The three samples remain useful on their own, and joining the list does not purchase the course or create an account. We will confirm the launch and access arrangements before asking you to commit.</p></div><Link className="cp-button cp-button-secondary" href={`${coursePath}#request`}>Join the interest list<span aria-hidden="true">→</span></Link></div>
    </div>
  </section>;
}

function CompletionControls({ sample, snapshot }: { sample: SampleLesson; snapshot: ProgressSnapshot }) {
  const [exerciseDone, setExerciseDone] = useState(false);
  const [checksDone, setChecksDone] = useState(false);
  const completed = isCurrentCompletion(snapshot.progress, sample.id, sample.revision);
  return <section className="cp-completion" aria-labelledby="sample-completion-title">
    <p className="cp-eyebrow">A useful stopping point</p><h2 id="sample-completion-title">Finish the practice, then mark it.</h2>
    <p>Reading a prompt is a start; using it and checking the result is the useful part. Keep your own practice artifact before ticking these boxes, and repair any failed checks first. This is a personal sample checklist, so you can undo a mark whenever you need another pass.</p>
    {completed ? <div className="cp-completed-state"><p><CheckIcon />Day {sample.order} sample is marked complete in this browser.</p><button type="button" className="cp-button cp-button-secondary" onClick={() => { courseProgressStore.setComplete(sample.id, false); setExerciseDone(false); setChecksDone(false); }}>Undo completion</button></div> : <>
      <label className="cp-checkbox"><input type="checkbox" checked={exerciseDone} onChange={(event) => setExerciseDone(event.target.checked)} /><span>I saved the practice artifact and checked its success criteria.</span></label>
      <label className="cp-checkbox"><input type="checkbox" checked={checksDone} onChange={(event) => setChecksDone(event.target.checked)} /><span>I answered the checks, compared the answers, and corrected any gaps.</span></label>
      <button type="button" className="cp-button" disabled={!snapshot.hydrated || !exerciseDone || !checksDone} onClick={() => courseProgressStore.setComplete(sample.id, true, sample.revision)}>Mark Day {sample.order} sample complete<CheckIcon /></button>
      <p className="cp-small">Both checks are required to enable the button. Completion is saved only in this browser when storage is available.</p>
    </>}
  </section>;
}

function SampleLessonBody({ sample, snapshot }: { sample: SampleLesson; snapshot: ProgressSnapshot }) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const exerciseId = useId();
  const noteText = `${sample.exercise.artifact_name}\n\n${sample.exercise.writing_fields.map((field, index) => `${field.label}\n${notes[String(index)] || "[Add your practice notes]"}`).join("\n\n")}`;
  return <article className="cp-lesson-body">
    <section className="cp-lesson-section cp-introduction" aria-label="Lesson introduction"><Prose text={sample.introduction} /></section>
    {sample.lesson_sections.map((section, index) => <section key={index} className="cp-lesson-section"><h2>{section.heading}</h2><Prose text={section.body} /></section>)}

    <section className="cp-lesson-section" id="lesson-prompts" aria-labelledby="lesson-prompts-title"><p className="cp-eyebrow">Try the method</p><h2 id="lesson-prompts-title">Prompts and a worked example</h2>
      {sample.prompts.map((prompt) => <div key={prompt.id} className="cp-prompt-set"><h3>{prompt.title}</h3><p>{prompt.when_to_use}</p><CopyBlock title="Reusable prompt" text={prompt.template} action="Copy template" /><CopyBlock title="Filled synthetic example" text={prompt.filled_example} action="Copy filled example" /><div className="cp-example-output"><h4>Illustrative output</h4><p className="cp-small">Prepared practice example; your assistant’s wording may differ.</p><pre>{prompt.illustrative_output}</pre></div><div className="cp-review-list"><h4>Review before use</h4><ul>{prompt.review_checklist.map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>)}
    </section>

    <section className="cp-lesson-section" id="lesson-practice" aria-labelledby="lesson-practice-title"><p className="cp-eyebrow">Make something you can keep</p><h2 id="lesson-practice-title">Your practice artifact</h2><div className="cp-artifact"><span className="cp-small">Save as</span><h3>{sample.exercise.artifact_name}</h3></div><ol className="cp-steps">{sample.exercise.instructions.map((item, index) => <li key={index}>{item}</li>)}</ol><h3>Success criteria</h3><ul className="cp-criteria">{sample.exercise.success_criteria.map((item, index) => <li key={index}>{item}</li>)}</ul><details className="cp-transfer"><summary>Another way to practice<span aria-hidden="true">+</span></summary><Prose text={sample.exercise.transfer_option} /></details>
      <div className="cp-practice-notes"><h3>Space to think it through</h3><p className="cp-small">Use synthetic or harmless practice details. These notes stay in this open page’s memory and are not sent or saved; copy them into your own document before leaving.</p>{sample.exercise.writing_fields.map((field, index) => <div key={index} className="cp-writing-field"><label htmlFor={`${exerciseId}-${index}`}>{field.label}</label><p id={`${exerciseId}-${index}-hint`} className="cp-small">{field.hint}</p><textarea id={`${exerciseId}-${index}`} aria-describedby={`${exerciseId}-${index}-hint`} rows={Math.max(3, Math.min(field.lines, 8))} value={notes[String(index)] ?? ""} onChange={(event) => setNotes({ ...notes, [String(index)]: event.target.value })} maxLength={12000} /></div>)}<CopyBlock title="My practice notes" text={noteText} action="Copy practice notes" preview={false} /></div>
    </section>

    <section className="cp-lesson-section" id="lesson-checks" aria-labelledby="lesson-checks-title"><p className="cp-eyebrow">Inspect the result</p><h2 id="lesson-checks-title">Check your work</h2><p>Answer each question before opening its answer. Compare the reasoning with your own artifact, then correct any unsupported fact or missing requirement. The completion rule below gives you a stopping point that is more useful than simply reaching the bottom of the page.</p><div className="cp-checks">{sample.check.items.map((item, index) => <details key={index}><summary><span><span className="cp-check-number">{String(index + 1).padStart(2, "0")}</span>{item.question}</span><span className="cp-reveal" aria-hidden="true">+</span></summary><div className="cp-answer"><h3>Answer and reasoning</h3><Prose text={item.answer} /><Prose text={item.explanation} /></div></details>)}</div><div className="cp-pass-rule"><h3>{sample.check.type === "rubric" ? "Scoring and completion rule" : "Completion rule"}</h3><Prose text={sample.check.pass_rule} /></div></section>

    <section className="cp-lesson-section"><h2>If you get stuck</h2><Prose text={sample.troubleshooting} /></section>
    <section className="cp-lesson-section cp-reflection"><p className="cp-eyebrow">Before you move on</p><h2>Reflection</h2><Prose text={sample.reflection} /><h3>Next step</h3><Prose text={sample.next_step} /></section>
    {sample.official_references.length > 0 && <section className="cp-lesson-section"><h2>Useful references</h2><ul>{sample.official_references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}<span className="cp-small"> (opens in a new tab)</span></a></li>)}</ul></section>}
    <CompletionControls sample={sample} snapshot={snapshot} />
  </article>;
}

export function LessonExperience({ dayId, selectedDayId }: { dayId?: string; selectedDayId?: string }) {
  const snapshot = useSampleProgress();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const selectedId = selectedDayId ?? dayId ?? samples[0]?.id;
  const sample = samples.find((candidate) => candidate.id === selectedId);
  const navId = useId();
  if (!sample) {
    const metadata = coursePreview.overview.find((day) => day.id === selectedId);
    return <section className="course-preview cp-empty"><div className="ol-container"><p className="cp-eyebrow">Written course preview</p><h1>{metadata ? `Day ${metadata.order}: ${metadata.title}` : "Choose a sample lesson"}</h1><p>{metadata ? "This lesson is part of the planned course and is coming soon. Its full content is not included in the public preview. You can practice with the first three written samples now." : "This sample could not be found. The first three written lessons are available from the course plan. Choose one there to continue your practice."}</p>{metadata && <p><strong>Planned artifact:</strong> {metadata.artifact}</p>}<Link className="cp-button" href={`${coursePath}#course-preview`}>See the course and free samples<span aria-hidden="true">→</span></Link></div></section>;
  }
  const index = samples.findIndex((candidate) => candidate.id === sample.id);
  const previous = samples[index - 1];
  const next = samples[index + 1];
  return <div className="course-preview cp-lesson">
    <header className="cp-lesson-hero"><div className="ol-container"><nav className="cp-breadcrumb" aria-label="Course breadcrumb"><Link href="/ai-training">AI Training</Link><span aria-hidden="true">/</span><Link href={coursePath}>{coursePreview.course.title}</Link><span aria-hidden="true">/</span><span>Day {sample.order}</span></nav><div className="cp-lesson-header"><div><p className="cp-eyebrow">Day {String(sample.order).padStart(2, "0")} · Free written sample</p><h1>{sample.title}</h1><p className="cp-lead">{sample.objective}</p><div className="cp-lesson-meta"><span>About {sample.estimated_minutes} minutes</span><span>Recording pending</span><span>Author review pending</span></div><p className="cp-small">{coursePreview.preview.duration_basis}</p><div className="cp-actions"><a href="#lesson-prompts" className="cp-text-button">Jump to the prompts ↓</a><a href="#lesson-practice" className="cp-text-button">Go to the exercise ↓</a></div></div><div className="cp-lesson-marker" aria-hidden="true"><span>DAY</span><strong>{String(sample.order).padStart(2, "0")}</strong><span>ONE USEFUL SKILL</span></div></div></div></header>
    <div className="ol-container cp-lesson-grid"><aside className="cp-sidebar"><button type="button" className="cp-mobile-nav-toggle" aria-expanded={mobileNavOpen} aria-controls={navId} onClick={() => setMobileNavOpen(!mobileNavOpen)}>Sample lesson navigation<span aria-hidden="true">{mobileNavOpen ? "−" : "+"}</span></button><div id={navId} className={`cp-sidebar-body${mobileNavOpen ? " is-open" : ""}`}><nav className="cp-lesson-nav" aria-label="Free sample lessons"><p className="cp-eyebrow">Your first three days</p><ol>{samples.map((item) => <li key={item.id}><Link href={lessonPath(item.id)} aria-current={item.id === sample.id ? "page" : undefined}><span className="cp-nav-number">{String(item.order).padStart(2, "0")}</span><span>{item.title}</span>{isCurrentCompletion(snapshot.progress, item.id, item.revision) && <span className="cp-nav-done"><CheckIcon /><span className="cp-sr-only">Marked complete</span></span>}</Link></li>)}</ol><p className="cp-small"><LockIcon />Days 4–21 are coming soon.</p><Link className="cp-text-button" href={`${coursePath}#course-preview`}>View the complete course plan →</Link></nav><ProgressPanel snapshot={snapshot} compact /><a className="cp-workbook-link" href={sampleWorkbookPdf} download><span>Take the samples with you</span><strong>Download the sample workbook ↓</strong><span>Three written lessons · PDF</span></a><p className="cp-small"><a href={`/${coursePreview.preview.workbook_filename}`} target="_blank" rel="noopener noreferrer">Accessible HTML workbook (new tab)</a></p><p className="cp-small cp-account-note">This preview has no paid account or enrollment. Only sample checkmarks are saved locally; practice notes are not saved.</p></div></aside>
      <div className="cp-lesson-content"><SampleLessonBody key={sample.id} sample={sample} snapshot={snapshot} /><nav className="cp-next-prev" aria-label="Previous and next sample lesson">{previous ? <Link href={lessonPath(previous.id)}><span>← Previous sample</span><strong>Day {previous.order}: {previous.title}</strong></Link> : <Link href={coursePath}><span>← Course overview</span><strong>{coursePreview.course.title}</strong></Link>}{next ? <Link href={lessonPath(next.id)} className="cp-next"><span>Next sample →</span><strong>Day {next.order}: {next.title}</strong></Link> : <Link href={`${coursePath}#request`} className="cp-next"><span>The full course is coming soon →</span><strong>Join the interest list</strong></Link>}</nav></div>
    </div>
  </div>;
}

export function CoursePreview({ selectedDayId, mode = "overview" }: { selectedDayId?: string; mode?: "overview" | "lesson" }) {
  return mode === "lesson" || selectedDayId ? <LessonExperience selectedDayId={selectedDayId} /> : <CourseOverview />;
}
