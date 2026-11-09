import { academyPrograms } from '@/config/ai-academy';
export type TrainingEvent = 'ai_training_view' | 'ai_training_program_select' | 'ai_training_inquiry_submit';
const events = new Set(['ai_training_view', 'ai_training_program_select', 'ai_training_inquiry_submit']);
const programs = new Set<string>(['general', ...academyPrograms.map(program => program.slug)]);

// Public interaction metadata only. Never send form values, learner work or identifiers.
export function trackTrainingEvent(event: TrainingEvent, program?: string) {
  if (typeof window === 'undefined') return;
  if (!events.has(event) || (program !== undefined && !programs.has(program))) return;
  try {
    const analytics = window as Window & { dataLayer?: Array<Record<string, string>> };
    analytics.dataLayer?.push({ event, ...(program ? { program } : {}) });
  } catch { /* Optional analytics must never interrupt a request or navigation. */ }
}
