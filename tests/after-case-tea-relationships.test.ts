import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { afterCaseTeaNodes } from '../src/content/after-case-tea';
import { validateDialogue } from '../src/game/dialogue';

describe('Five after-case conversations and fifteen endings', () => {
  const groups = {
    anna: ['story', 'books', 'rest'],
    leo: ['music', 'walk', 'schedule'],
    eleanor: ['stock', 'story', 'change'],
    miller: ['apology', 'cups', 'cake'],
    iris: ['weather', 'book', 'silence'],
  } as const;
  it('keeps the complete final-day graph valid', () =>
    expect(validateDialogue(finalReading)).toEqual([]));
  for (const [character, endings] of Object.entries(groups)) {
    for (const ending of endings) {
      it(`links ${character}/${ending} back into the existing tea conclusion`, () => {
        const hub = afterCaseTeaNodes.find((node) => node.id === 'after-case-tea');
        const option = hub?.options.find((item) => item.id === `after-tea-${character}-new`);
        expect(option).toBeDefined();
        const scene = afterCaseTeaNodes.find((node) => node.id === option?.next);
        const choice = scene?.options.find(
          (item) => item.id === `after-${character}-${ending}-new`,
        );
        expect(choice).toBeDefined();
        const outcome = afterCaseTeaNodes.find((node) => node.id === choice?.next);
        expect(outcome?.options[0]?.next).toBe('after-case-finish');
        expect(outcome?.options[0]?.grants?.[0]).toMatch(/^final_after_/);
      });
    }
  }
});
