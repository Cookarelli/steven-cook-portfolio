"use client";

import { useEffect, useRef } from 'react';
import { trackTrainingEvent } from '@/lib/academy-analytics';

export function AcademyAnalytics({ program }: { program?: string }) {
  const viewed = useRef(false);
  useEffect(() => {
    if (!viewed.current) {
      viewed.current = true;
      trackTrainingEvent('ai_training_view', program);
    }
  }, [program]);
  return null;
}
