import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('Final epilogue priority', () => {
  it.each([
    [
      ['final_mutual_conversation', 'final_repaired_rumor', 'final_iris_exhibition'],
      'Ніхто не питає',
    ],
    [
      ['final_accepted_consequences', 'final_respected_privacy', 'final_supported_iris'],
      'не обіцяючи пробачення',
    ],
    [
      ['final_letter_kept_private', 'final_repaired_rumor', 'final_iris_exhibition'],
      'не розгортаючи його',
    ],
  ] as const)(
    'does not erase the private letter consequence when other scenes were completed',
    (flags, phrase) => {
      let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
      state = { ...state, flags };
      state = selectOption(finalReading, state, 'close');
      expect(currentNode(finalReading, state).text).toContain(phrase);
    },
  );
});
