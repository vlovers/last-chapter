import { describe, expect, it } from 'vitest';
import { maraDecision } from '../src/content/day-four-mara';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Mara Day 4 callback', () => {
  it('is a valid graph', () => {
    expect(validateDialogue(maraDecision)).toEqual([]);
  });

  it('requires a previous conversation', () => {
    let state = startDialogue(maraDecision);
    state = selectOption(maraDecision, state, 'greet');
    expect(availableOptions(maraDecision, state).some((x) => x.id === 'remember-trust')).toBe(false);
    state = { ...state, flags: ['mara_discussed_forgiveness'] };
    expect(availableOptions(maraDecision, state).some((x) => x.id === 'remember-trust')).toBe(true);
  });
});
