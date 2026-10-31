import { describe, expect, it } from 'vitest';
import type { ChapterStage } from '../src/game/chapter';
import { discoveredPeopleAtStage } from '../src/phaser/discovered-people';

const expectedByStage: readonly (readonly [ChapterStage, number])[] = [
  ['miller', 1],
  ['mara', 2],
  ['evening', 2],
  ['complete', 2],
  ['iris', 3],
  ['anna', 4],
  ['leo', 5],
  ['day2-complete', 5],
  ['eleanor', 6],
  ['thomas', 7],
  ['nora', 8],
  ['book-club', 8],
  ['quiet-evening', 8],
  ['day3-complete', 8],
  ['day4-iris', 8],
  ['day4-mara', 8],
  ['day4-leo', 8],
  ['day4-complete', 8],
  ['day5-reading', 8],
  ['season-complete', 8],
];

describe('journal cast continuity', () => {
  it.each(expectedByStage)('keeps %i discovered visitors at %s', (stage, count) => {
    expect(discoveredPeopleAtStage(stage)).toHaveLength(count);
  });

  it('does not reveal people before the bookseller meets them', () => {
    expect(discoveredPeopleAtStage('miller')).toEqual([['miller', 'Пані Міллер']]);
    expect(discoveredPeopleAtStage('anna').map(([id]) => id)).toEqual([
      'miller',
      'mara',
      'iris',
      'anna',
    ]);
  });

  it('preserves the full cast on both Day 3 evening routes and after restoring checkpoints', () => {
    const expected = discoveredPeopleAtStage('nora');
    for (const stage of [
      'book-club',
      'quiet-evening',
      'day3-complete',
      'day4-iris',
      'day5-reading',
      'season-complete',
    ] as const) {
      expect(discoveredPeopleAtStage(stage)).toEqual(expected);
    }
    expect(expected.map(([id]) => id)).toEqual([
      'miller',
      'mara',
      'iris',
      'anna',
      'leo',
      'eleanor',
      'thomas',
      'nora',
    ]);
  });
});
