import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { bookshopTomorrowNodes, bookshopTomorrowOption } from '../src/content/bookshop-tomorrow';
import { validateDialogue } from '../src/game/dialogue';

describe('Five optional bookshop epilogue activities', () => {
  const groups = [
    { id: 'window', choices: ['letters', 'questions', 'quiet'] },
    { id: 'miller', choices: ['soft', 'fun', 'privacy'] },
    { id: 'iris', choices: ['choose', 'tea', 'leave'] },
    { id: 'frank', choices: ['box', 'pillow', 'chair'] },
    { id: 'neighbors', choices: ['anonymous', 'swap', 'notes'] },
  ] as const;
  it('keeps the final-day dialogue graph valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    expect(bookshopTomorrowOption.requires).toContain('final_manuscript_provenance_decided');
  });
  for (const group of groups) {
    for (const choice of group.choices) {
      it(`links ${group.id}/${choice} to a distinct conclusion and completion flag`, () => {
        const start = bookshopTomorrowNodes.find((node) => node.id === 'bookshop-tomorrow');
        const option = start?.options.find((item) => item.id === `tomorrow-${group.id}-new`);
        expect(option?.next).toBe(`bookshop-tomorrow-${group.id}-new`);
        const scene = bookshopTomorrowNodes.find((node) => node.id === option?.next);
        const answer = scene?.options.find(
          (item) => item.id === `tomorrow-${group.id}-${choice}-new`,
        );
        expect(answer).toBeDefined();
        const ending = bookshopTomorrowNodes.find((node) => node.id === answer?.next);
        expect(ending?.options[0]?.next).toBe('gathering');
        expect(ending?.options[0]?.grants).toContain(`final_tomorrow_${group.id}_done`);
        expect(ending?.options[0]?.suspend).toBe(true);
      });
    }
  }
});
