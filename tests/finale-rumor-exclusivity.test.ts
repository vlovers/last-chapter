import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

describe('Final rumor conversation is a single meaningful decision', () => {
  it.each([
    ['rumor-respect', 'final_respected_privacy', 'final_repaired_rumor'],
    ['rumor-apology', 'final_repaired_rumor', 'final_respected_privacy'],
  ] as const)(
    '%s closes the scene without granting the opposite outcome',
    (choice, granted, opposite) => {
      let state = selectOption(finalReading, startDialogue(finalReading), 'open');
      state = selectOption(finalReading, state, 'rumor');
      state = selectOption(finalReading, state, choice);
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(granted);
      expect(state.flags).not.toContain(opposite);
      expect(availableOptions(finalReading, state).some((option) => option.id === 'rumor')).toBe(
        false,
      );
      expect(() => selectOption(finalReading, state, 'rumor')).toThrow();
    },
  );
});
