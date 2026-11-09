"use client";

import type { ReactNode } from 'react';
import { trackTrainingEvent } from '@/lib/academy-analytics';

export function ProgramLink({ href, program, className, children, target, rel }: {
  href: string; program: string; className?: string; children: ReactNode; target?: '_blank'; rel?: string;
}) {
  return <a href={href} className={className} target={target} rel={rel} onClick={() => trackTrainingEvent('ai_training_program_select', program)}>{children}</a>;
}
