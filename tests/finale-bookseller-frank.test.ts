import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

function atGathering() {
  return selectOption(finalReading, startDialogue(finalReading), 'open');
}

describe('Frank and bookseller finale reflections', () => {
  it('keeps the extended finale graph valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it.each([
    ['frank-sit', 'frank-silence-back', 'bookseller_chose_silence'],
    ['frank-pet', 'frank-trust-back', 'bookseller_chose_presence'],
  ] as const)('Frank route %s returns to the gathering only once', (choice, back, flag) => {
    let state = atGathering();
    state = selectOption(finalReading, state, 'frank-evening');
    state = selectOption(finalReading, state, choice);
    state = selectOption(finalReading, state, back);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(flag);
    expect(state.flags).toContain('final_frank_evening_heard');
    expect(availableOptions(finalReading, state).some((item) => item.id === 'frank-evening')).toBe(
      false,
    );
  });

  it.each([
    ['bookseller-truth', 'bookseller-truth-back', 'bookseller_values_consent'],
    ['bookseller-care', 'bookseller-care-back', 'bookseller_values_agency'],
    ['bookseller-change', 'bookseller-change-back', 'bookseller_values_change'],
  ] as const)('player reflection %s records a distinct value', (choice, back, flag) => {
    let state = atGathering();
    state = selectOption(finalReading, state, 'bookseller-reflection');
    state = selectOption(finalReading, state, choice);
    state = selectOption(finalReading, state, back);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(flag);
    expect(state.flags).toContain('final_bookseller_reflection_heard');
    expect(
      availableOptions(finalReading, state).some((item) => item.id === 'bookseller-reflection'),
    ).toBe(false);
  });

  it('allows a direct ending without optional scenes', () => {
    const state = selectOption(finalReading, atGathering(), 'close');
    expect(state.node).toBe('end');
  });
});
