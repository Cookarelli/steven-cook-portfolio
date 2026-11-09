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
    <p className="cp-small">{count === 0 ? "No samples marked complete yet. After the exercise, check your answers and mark the lesson complete." : count === samples.length ? "You’ve marked all 3 samples complete. Days 4–21 are coming soon." : `${samples.length - count} sample${samples.length - count === 1 ? "" : "s"} left to finish.`}</p>
    <p className="cp-storage-notice" role="status">{snapshot.notice}</p>
    {stale && <p className="cp-storage-notice">A sample has changed since you last marked it complete. Review the current version before marking it again.</p>}
    <button type="button" className="cp-text-button" disabled={!snapshot.hydrated} onClick={() => setConfirmReset(!confirmReset)} aria-expanded={confirmReset} aria-controls={confirmId}>Reset sample progress</button>
    {confirmReset && <div id={confirmId} className="cp-reset-confirm">
      <p>Clear the 3 sample checkmarks in this browser? Your exercise files will stay where you saved them.</p>
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
    <span className="cp-copy-result" role="status">{result === "copied" ? "Copied. Check it before you use it." : result === "manual" ? "Copy didn’t work in this browser. Select the text below and copy it." : ""}</span>
    {result === "manual" && <div className="cp-manual-copy"><label htmlFor={manualId}>Copy this text</label><textarea id={manualId} ref={textarea} readOnly value={text} rows={7} spellCheck={false} /><button type="button" className="cp-text-button" onClick={() => { textarea.current?.focus(); textarea.current?.select(); }}>Select all text</button></div>}
  </div>;
}

export function CourseOverview() {
  const snapshot = useSampleProgress();
  const nextSample = samples.find((sample) => !isCurrentCompletion(snapshot.progress, sample.id, sample.revision)) ?? samples[0];
  return <section className="course-preview cp-overview" id="course-preview" aria-labelledby="course-preview-title">
    <div className="ol-container">
      <header className="cp-overview-header">
        <div><p className="cp-eyebrow">Free sample lessons</p><h2 id="course-preview-title">Try the first 3 lessons.</h2><p className="cp-lead">Choose a task you already need to do, and try the prompts with your own example. Each sample includes a written lesson and an exercise, with a worked example to compare against. Days 4–{coursePreview.overview.length} will follow when the full course is ready.</p><div className="cp-actions">{nextSample && <Link href={lessonPath(nextSample.id)} className="cp-button">{currentCompletions(snapshot).length > 0 ? "Continue the samples" : "Start Day 1"}<span aria-hidden="true">→</span></Link>}<a className="cp-button cp-button-secondary" href={sampleWorkbookPdf} download>Download the sample workbook (PDF)<span aria-hidden="true">↓</span></a></div><p className="cp-small"><a href={`/${coursePreview.preview.workbook_filename}`} target="_blank" rel="noopener noreferrer">Read the accessible HTML workbook (opens in a new tab)</a></p><p className="cp-small">Free written preview · Recordings pending · Author review pending</p></div>
        <ProgressPanel snapshot={snapshot} />
      </header>

      <div className="cp-plan-intro"><p className="cp-eyebrow">All 21 days</p><h3>What you’ll cover</h3><p>The course starts with writing a clear request and checking the answer. Later lessons cover everyday tasks and work you repeat. You can open Days 1–3 now; the rest are listed so you can see what is planned.</p><p className="cp-small">{coursePreview.preview.duration_basis}</p></div>
      {coursePreview.course.phases.map((phase, phaseIndex) => <section key={phase.id} className="cp-phase" aria-labelledby={`phase-${phase.id}`}>
        <header className="cp-phase-header"><span className="cp-phase-number" aria-hidden="true">{phaseIndex + 1}</span><div><p className="cp-eyebrow">Days {phase.first_day}–{phase.last_day}</p><h3 id={`phase-${phase.id}`}>{phase.title}</h3><p>{phase.purpose}</p></div></header>
        <ol className="cp-day-list" start={phase.first_day}>
          {coursePreview.overview.filter((day) => day.order >= phase.first_day && day.order <= phase.last_day).map((day) => {
            const sample = samples.find((candidate) => candidate.id === day.id);
            const complete = sample && isCurrentCompletion(snapshot.progress, sample.id, sample.revision);
            return <li key={day.id} className={`cp-day${sample ? " cp-day-open" : " cp-day-locked"}`}>
              <span className="cp-day-number">Day {day.order}</span>
              <div className="cp-day-main"><div className="cp-day-title"><h4>{sample ? <Link href={lessonPath(day.id)}>{day.title}</Link> : day.title}</h4><span className={`cp-pill${sample ? " cp-pill-open" : ""}`}>{complete ? <><CheckIcon />Marked complete</> : sample ? "Free sample" : <><LockIcon />Coming soon</>}</span></div><p>{day.objective}</p><p className="cp-day-artifact"><strong>You’ll make:</strong> {day.artifact}</p><span className="cp-small">About {day.estimated_minutes} minutes · including the exercise and questions</span></div>
              {sample && <Link href={lessonPath(day.id)} className="cp-day-link" aria-label={`Open Day ${day.order}: ${day.title}`}>Open sample <span aria-hidden="true">→</span></Link>}
            </li>;
          })}
        </ol>
      </section>)}
      <div className="cp-interest"><div><h3>Want an email when the rest is ready?</h3><p>Leave your details if you’d like a course update. Joining the list does not buy the course or create a learner account. You can keep using the free samples in the meantime.</p></div><Link className="cp-button cp-button-secondary" href={`${coursePath}#request`}>Join the interest list<span aria-hidden="true">→</span></Link></div>
    </div>
  </section>;
}

function CompletionControls({ sample, snapshot }: { sample: SampleLesson; snapshot: ProgressSnapshot }) {
  const [exerciseDone, setExerciseDone] = useState(false);
  const [checksDone, setChecksDone] = useState(false);
  const completed = isCurrentCompletion(snapshot.progress, sample.id, sample.revision);
  return <section className="cp-completion" aria-labelledby="sample-completion-title">
    <p className="cp-eyebrow">Lesson checklist</p><h2 id="sample-completion-title">Ready to mark this lesson complete?</h2>
    <p>Save your exercise in your own document before you leave this page. Answer the questions and fix anything that doesn’t match the lesson’s checks. You can remove the completion mark later if you want to revisit it.</p>
    {completed ? <div className="cp-completed-state"><p><CheckIcon />Day {sample.order} sample is marked complete in this browser.</p><button type="button" className="cp-button cp-button-secondary" onClick={() => { courseProgressStore.setComplete(sample.id, false); setExerciseDone(false); setChecksDone(false); }}>Undo completion</button></div> : <>
      <label className="cp-checkbox"><input type="checkbox" checked={exerciseDone} onChange={(event) => setExerciseDone(event.target.checked)} /><span>I saved my exercise and checked the success criteria.</span></label>
      <label className="cp-checkbox"><input type="checkbox" checked={checksDone} onChange={(event) => setChecksDone(event.target.checked)} /><span>I checked my answers and corrected any mistakes.</span></label>
      <button type="button" className="cp-button" disabled={!snapshot.hydrated || !exerciseDone || !checksDone} onClick={() => courseProgressStore.setComplete(sample.id, true, sample.revision)}>Mark Day {sample.order} sample complete<CheckIcon /></button>
      <p className="cp-small">Tick both boxes to enable the button. The checkmark is saved only in this browser when storage is available.</p>
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

    <section className="cp-lesson-section" id="lesson-prompts" aria-labelledby="lesson-prompts-title"><p className="cp-eyebrow">Prompts</p><h2 id="lesson-prompts-title">Copy a prompt and try the example</h2>
      {sample.prompts.map((prompt) => <div key={prompt.id} className="cp-prompt-set"><h3>{prompt.title}</h3><p>{prompt.when_to_use}</p><CopyBlock title="Reusable prompt" text={prompt.template} action="Copy template" /><CopyBlock title="Practice example" text={prompt.filled_example} action="Copy filled example" /><div className="cp-example-output"><h4>Example answer</h4><p className="cp-small">This answer was prepared for the lesson. Yours may be worded differently.</p><pre>{prompt.illustrative_output}</pre></div><div className="cp-review-list"><h4>Before you use the answer</h4><ul>{prompt.review_checklist.map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>)}
    </section>

    <section className="cp-lesson-section" id="lesson-practice" aria-labelledby="lesson-practice-title"><p className="cp-eyebrow">Exercise</p><h2 id="lesson-practice-title">Try it yourself</h2><div className="cp-artifact"><span className="cp-small">Save as</span><h3>{sample.exercise.artifact_name}</h3></div><ol className="cp-steps">{sample.exercise.instructions.map((item, index) => <li key={index}>{item}</li>)}</ol><h3>What to check</h3><ul className="cp-criteria">{sample.exercise.success_criteria.map((item, index) => <li key={index}>{item}</li>)}</ul><details className="cp-transfer"><summary>Need an example to work with?<span aria-hidden="true">+</span></summary><Prose text={sample.exercise.transfer_option} /></details>
      <div className="cp-practice-notes"><h3>Your notes</h3><p className="cp-small">Use made-up or harmless details. Notes aren’t sent or saved; copy them into your own document before you leave this page.</p>{sample.exercise.writing_fields.map((field, index) => <div key={index} className="cp-writing-field"><label htmlFor={`${exerciseId}-${index}`}>{field.label}</label><p id={`${exerciseId}-${index}-hint`} className="cp-small">{field.hint}</p><textarea id={`${exerciseId}-${index}`} aria-describedby={`${exerciseId}-${index}-hint`} rows={Math.max(3, Math.min(field.lines, 8))} value={notes[String(index)] ?? ""} onChange={(event) => setNotes({ ...notes, [String(index)]: event.target.value })} maxLength={12000} /></div>)}<CopyBlock title="My practice notes" text={noteText} action="Copy practice notes" preview={false} /></div>
    </section>

    <section className="cp-lesson-section" id="lesson-checks" aria-labelledby="lesson-checks-title"><p className="cp-eyebrow">Questions</p><h2 id="lesson-checks-title">Check your work</h2><p>Try each question before opening the answer. Compare it with what you wrote, and fix any mistakes you find. Use the completion rule below to decide whether you’re ready to move on.</p><div className="cp-checks">{sample.check.items.map((item, index) => <details key={index}><summary><span><span className="cp-check-number">{index + 1}</span>{item.question}</span><span className="cp-reveal" aria-hidden="true">+</span></summary><div className="cp-answer"><h3>Answer</h3><Prose text={item.answer} /><Prose text={item.explanation} /></div></details>)}</div><div className="cp-pass-rule"><h3>{sample.check.type === "rubric" ? "Scoring" : "When you’re finished"}</h3><Prose text={sample.check.pass_rule} /></div></section>

    <section className="cp-lesson-section"><h2>If you get stuck</h2><Prose text={sample.troubleshooting} /></section>
    <section className="cp-lesson-section cp-reflection"><p className="cp-eyebrow">Before the next lesson</p><h2>Reflection</h2><Prose text={sample.reflection} /><h3>Next step</h3><Prose text={sample.next_step} /></section>
    {sample.official_references.length > 0 && <section className="cp-lesson-section"><h2>Sources</h2><ul>{sample.official_references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}<span className="cp-small"> (opens in a new tab)</span></a></li>)}</ul></section>}
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
    return <section className="course-preview cp-empty"><div className="ol-container"><p className="cp-eyebrow">Course preview</p><h1>{metadata ? `Day ${metadata.order}: ${metadata.title}` : "Choose a sample lesson"}</h1><p>{metadata ? "This lesson is coming soon. It isn’t included in the free preview yet. You can start with Days 1–3." : "We couldn’t find that lesson. The first 3 lessons are available now. Choose one from the course outline to continue."}</p>{metadata && <p><strong>You’ll work on:</strong> {metadata.artifact}</p>}<Link className="cp-button" href={`${coursePath}#course-preview`}>See the course outline<span aria-hidden="true">→</span></Link></div></section>;
  }
  const index = samples.findIndex((candidate) => candidate.id === sample.id);
  const previous = samples[index - 1];
  const next = samples[index + 1];
  return <div className="course-preview cp-lesson">
    <header className="cp-lesson-hero"><div className="ol-container"><nav className="cp-breadcrumb" aria-label="Course breadcrumb"><Link href="/ai-training">AI Training</Link><span aria-hidden="true">/</span><Link href={coursePath}>{coursePreview.course.title}</Link><span aria-hidden="true">/</span><span>Day {sample.order}</span></nav><div className="cp-lesson-header"><div><p className="cp-eyebrow">Day {sample.order} · Free written sample</p><h1>{sample.title}</h1><p className="cp-lead">{sample.objective}</p><div className="cp-lesson-meta"><span>About {sample.estimated_minutes} minutes</span><span>Recording pending</span><span>Author review pending</span></div><p className="cp-small">{coursePreview.preview.duration_basis}</p><div className="cp-actions"><a href="#lesson-prompts" className="cp-text-button">Jump to the prompts ↓</a><a href="#lesson-practice" className="cp-text-button">Go to the exercise ↓</a></div></div><div className="cp-lesson-marker" aria-hidden="true"><span>DAY</span><strong>{sample.order}</strong><span>FREE SAMPLE</span></div></div></div></header>
    <div className="ol-container cp-lesson-grid"><aside className="cp-sidebar"><button type="button" className="cp-mobile-nav-toggle" aria-expanded={mobileNavOpen} aria-controls={navId} onClick={() => setMobileNavOpen(!mobileNavOpen)}>Choose a sample lesson<span aria-hidden="true">{mobileNavOpen ? "−" : "+"}</span></button><div id={navId} className={`cp-sidebar-body${mobileNavOpen ? " is-open" : ""}`}><nav className="cp-lesson-nav" aria-label="Free sample lessons"><p className="cp-eyebrow">Free lessons</p><ol>{samples.map((item) => <li key={item.id}><Link href={lessonPath(item.id)} aria-current={item.id === sample.id ? "page" : undefined}><span className="cp-nav-number">{item.order}</span><span>{item.title}</span>{isCurrentCompletion(snapshot.progress, item.id, item.revision) && <span className="cp-nav-done"><CheckIcon /><span className="cp-sr-only">Marked complete</span></span>}</Link></li>)}</ol><p className="cp-small"><LockIcon />Days 4–21 are coming soon.</p><Link className="cp-text-button" href={`${coursePath}#course-preview`}>View the course outline →</Link></nav><ProgressPanel snapshot={snapshot} compact /><a className="cp-workbook-link" href={sampleWorkbookPdf} download><span>Sample workbook</span><strong>Download the sample workbook ↓</strong><span>Days 1–3 · PDF</span></a><p className="cp-small"><a href={`/${coursePreview.preview.workbook_filename}`} target="_blank" rel="noopener noreferrer">Accessible HTML workbook (new tab)</a></p><p className="cp-small cp-account-note">There’s no paid account or enrollment in this preview. Checkmarks stay in this browser. Copy your notes before you leave; they aren’t saved.</p></div></aside>
      <div className="cp-lesson-content"><SampleLessonBody key={sample.id} sample={sample} snapshot={snapshot} /><nav className="cp-next-prev" aria-label="Previous and next sample lesson">{previous ? <Link href={lessonPath(previous.id)}><span>← Previous sample</span><strong>Day {previous.order}: {previous.title}</strong></Link> : <Link href={coursePath}><span>← Course overview</span><strong>{coursePreview.course.title}</strong></Link>}{next ? <Link href={lessonPath(next.id)} className="cp-next"><span>Next sample →</span><strong>Day {next.order}: {next.title}</strong></Link> : <Link href={`${coursePath}#request`} className="cp-next"><span>The full course is coming soon →</span><strong>Join the interest list</strong></Link>}</nav></div>
    </div>
  </div>;
}

export function CoursePreview({ selectedDayId, mode = "overview" }: { selectedDayId?: string; mode?: "overview" | "lesson" }) {
  return mode === "lesson" || selectedDayId ? <LessonExperience selectedDayId={selectedDayId} /> : <CourseOverview />;
}
