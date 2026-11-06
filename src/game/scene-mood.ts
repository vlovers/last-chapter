import type { ChapterStage } from './chapter';

/** Presentation-only chapter lighting, intentionally not persisted in save files. */
export function sceneMood(stage: ChapterStage): 'morning' | 'day' | 'evening' {
  if (
    stage === 'evening' ||
    stage === 'day4-complete' ||
    stage === 'day5-reading' ||
    stage === 'season-complete'
  )
    return 'evening';
  if (stage === 'miller' || stage === 'eleanor' || stage === 'day4-iris') return 'morning';
  return 'day';
}
