import { describe, expect, it } from 'vitest';
import { sceneMood } from '../src/game/scene-mood';
import type { ChapterStage } from '../src/game/chapter';

describe('Bookshop ambient lighting', () => {
  it('changes with story time while remaining deterministic', () => {
    expect(sceneMood('miller')).toBe('morning');
    expect(sceneMood('iris')).toBe('day');
    expect(sceneMood('evening')).toBe('evening');
    expect(sceneMood('day5-reading')).toBe('evening');
  });
  it('has a defined mood for every playable and completion stage', () => {
    const stages: ChapterStage[] = [
      'miller',
      'mara',
      'evening',
      'complete',
      'iris',
      'anna',
      'leo',
      'day2-complete',
      'eleanor',
      'thomas',
      'nora',
      'book-club',
      'day3-complete',
      'day4-iris',
      'day4-mara',
      'day4-leo',
      'day4-complete',
      'day5-reading',
      'season-complete',
    ];
    for (const stage of stages) expect(['morning', 'day', 'evening']).toContain(sceneMood(stage));
  });
});
