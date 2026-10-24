import type { ChapterStage } from './chapter';

export interface DayProgress {
  readonly day: number;
  readonly label: string;
  readonly status: 'completed' | 'current' | 'upcoming';
}

const stages: readonly (readonly ChapterStage[])[] = [
  ['miller', 'mara', 'evening', 'complete'],
  ['iris', 'anna', 'leo', 'day2-complete'],
  ['eleanor', 'thomas', 'nora', 'book-club', 'day3-complete'],
  ['day4-iris', 'day4-mara', 'day4-leo', 'day4-complete'],
  ['day5-reading', 'season-complete'],
];
const labels = ['Перший день', 'Другий день', 'Третій день', 'Четвертий день', 'П’ятий день'];

export function storyProgress(stage: ChapterStage): readonly DayProgress[] {
  const current = stages.findIndex((day) => day.includes(stage));
  if (current === -1) throw new Error('Unknown story stage');
  return labels.map((label, index) => ({
    day: index + 1,
    label,
    status:
      index < current || (stage === 'season-complete' && index === current)
        ? 'completed'
        : index === current
          ? 'current'
          : 'upcoming',
  }));
}
