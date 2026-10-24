import { describe, expect, it } from 'vitest';
import { cast, castMember } from '../src/game/cast';
import { stageStory, type ChapterStage } from '../src/game/chapter';

const stages: ChapterStage[] = [
  'miller',
  'mara',
  'evening',
  'iris',
  'anna',
  'leo',
  'eleanor',
  'thomas',
  'nora',
  'book-club',
  'day4-iris',
  'day4-mara',
  'day4-leo',
  'day5-reading',
];

describe('Cast identities across five days', () => {
  it('provides eight unique recurring character identities', () => {
    expect(cast).toHaveLength(8);
    expect(new Set(cast.map((member) => member.id)).size).toBe(8);
    expect(new Set(cast.map((member) => member.name)).size).toBe(8);
  });
  it('covers recurring speakers without confusing the narrator for a character', () => {
    expect(castMember('Оповідач')).toBeUndefined();
    expect(castMember('Пані Міллер')?.id).toBe('miller');
    for (const stage of stages) {
      for (const node of stageStory(stage).nodes) {
        if (cast.some((member) => member.name === node.speaker)) {
          expect(castMember(node.speaker)?.monogram).toBeTruthy();
        }
      }
    }
  });
});
