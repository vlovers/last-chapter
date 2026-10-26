import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';

const endings = [
  ['mutual', 'mutual-back', 'final_mutual_conversation'],
  ['repair-trust', 'repair-trust-back', 'final_accepted_consequences'],
  ['wait', 'wait-back', 'final_letter_kept_private'],
] as const;

describe('Private letter finale', () => {
  it.each(endings)('%s permanently resolves the letter without other outcomes', (choice, back, expected) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = {
      ...state,
      flags: ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation', 'iris_letter_breach_admitted'],
    };
    state = selectOption(finalReading, state, 'letter');
    state = selectOption(finalReading, state, choice);
    state = selectOption(finalReading, state, back);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(expected);
    for (const [, , outcome] of endings) {
      if (outcome !== expected) expect(state.flags).not.toContain(outcome);
    }
    expect(availableOptions(finalReading, state).some((option) => option.id === 'letter')).toBe(false);
    expect(() => selectOption(finalReading, state, 'letter')).toThrow();
  });

  it('lets the player return later when no resolution was chosen', () => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: ['saw_envelope'] };
    state = selectOption(finalReading, state, 'letter');
    state = selectOption(finalReading, state, 'letter-back');
    expect(availableOptions(finalReading, state).some((option) => option.id === 'letter')).toBe(true);
  });
});
