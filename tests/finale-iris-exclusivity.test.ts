import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';

describe('Iris final artwork decision', () => {
  it.each([
    ['iris-choice', undefined, 'final_supported_iris', 'final_iris_exhibition'],
    ['iris-exhibit', 'exhibit-back', 'final_iris_exhibition', 'final_supported_iris'],
  ] as const)(
    '%s is a final choice rather than a repeatable alternative',
    (choice, back, expected, opposite) => {
      let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
      state = { ...state, flags: ['iris_offered_exhibition'] };
      state = selectOption(finalReading, state, 'iris');
      state = selectOption(finalReading, state, choice);
      if (back) state = selectOption(finalReading, state, back);
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(expected);
      expect(state.flags).not.toContain(opposite);
      expect(availableOptions(finalReading, state).some((option) => option.id === 'iris')).toBe(
        false,
      );
      expect(() => selectOption(finalReading, state, 'iris')).toThrow();
    },
  );
});
