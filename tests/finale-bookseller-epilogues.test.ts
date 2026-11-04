import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('Bookseller and Frank epilogues', () => {
  it.each([
    [
      ['bookseller_values_consent', 'bookseller_chose_silence'],
      'Решта розмов побуде між тими, хто їх почав',
    ],
    [['bookseller_values_agency', 'bookseller_chose_presence'], 'Ми його чекаємо?'],
    [['bookseller_values_change'], 'поки залишити його біля вікна'],
  ] as const)('reflects the player values in the final narration', (flags, phrase) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags };
    state = selectOption(finalReading, state, 'close');
    expect(currentNode(finalReading, state).text).toContain(phrase);
  });

  it('never overrides the resolved private letter with the player reflection', () => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = {
      ...state,
      flags: ['bookseller_values_change', 'final_accepted_consequences'],
    };
    state = selectOption(finalReading, state, 'close');
    expect(currentNode(finalReading, state).text).toContain('не обіцяючи пробачення');
  });
});
