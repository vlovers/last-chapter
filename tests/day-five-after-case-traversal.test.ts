import type { DialogueState } from '../src/game/dialogue';
import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

describe('Day five: after-case relationship choices are playable', () => {
  const conversations = {
    anna: ['story', 'books', 'rest'],
    leo: ['music', 'walk', 'schedule'],
    eleanor: ['stock', 'story', 'change'],
    miller: ['apology', 'cups', 'cake'],
    iris: ['weather', 'book', 'silence'],
  } as const;
  for (const [person, endings] of Object.entries(conversations)) {
    for (const ending of endings) {
      it(`plays ${person} / ${ending} and records its consequence`, () => {
        let state: DialogueState = {
          ...startDialogue(finalReading),
          node: 'after-case-tea',
          flags: ['final_case_closure_complete'],
        };
        const entry = `after-tea-${person}-new`;
        expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(entry);
        state = selectOption(finalReading, state, entry);
        state = selectOption(finalReading, state, `after-${person}-${ending}-new`);
        const finish = availableOptions(finalReading, state)[0];
        expect(finish?.grants?.[0]).toMatch(/^final_after_/);
        const consequence = finish.grants?.[0];
        state = selectOption(finalReading, state, finish!.id);
        expect(state.node).toBe('after-case-finish');
        expect(state.flags).toContain(consequence);
        state = selectOption(finalReading, state, 'after-tea-return');
        expect(state.node).toBe('gathering');
        expect(state.flags).toContain('final_after_case_tea_done');
      });
    }
  }
});
