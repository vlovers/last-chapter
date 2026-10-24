import { describe, expect, it } from 'vitest';
import { storyProgress } from '../src/game/progress';
import type { ChapterStage } from '../src/game/chapter';

describe('Five-day chapter navigation', () => {
  it('maps every supported stage to exactly one day', () => {
    const all: ChapterStage[] = [
      'miller', 'mara', 'evening', 'complete', 'iris', 'anna', 'leo', 'day2-complete',
      'eleanor', 'thomas', 'nora', 'book-club', 'day3-complete',
      'day4-iris', 'day4-mara', 'day4-leo', 'day4-complete',
      'day5-reading', 'season-complete',
    ];
    for (const stage of all) {
      const days = storyProgress(stage);
      expect(days).toHaveLength(5);
      expect(days.filter((day) => day.status === 'current')).toHaveLength(stage === 'season-complete' ? 0 : 1);
      const currentDay = days.find((day) => day.status === 'current')?.day ?? 5;
      expect(days.filter((day) => day.status === 'upcoming').every((day) => day.day > currentDay)).toBe(true);
    }
  });
  it('never marks an unfinished day as completed', () => {
    expect(storyProgress('day3-complete').map((day) => day.status)).toEqual(['completed', 'completed', 'current', 'upcoming', 'upcoming']);
    expect(storyProgress('day4-leo').map((day) => day.status)).toEqual(['completed', 'completed', 'completed', 'current', 'upcoming']);
    expect(storyProgress('season-complete').every((day) => day.status === 'completed')).toBe(true);
  });
});
