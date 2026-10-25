import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Final reading callbacks', () => {
  it('has valid dialogue references', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it('keeps the letter private unless both people agree to talk', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: ['saw_envelope'] };
    state = selectOption(finalReading, state, 'letter');
    expect(availableOptions(finalReading, state).some((option) => option.id === 'mutual')).toBe(
      false,
    );
    state = {
      ...state,
      flags: ['saw_envelope', 'iris_letter_choice_respected', 'leo_open_to_conversation'],
    };
    expect(availableOptions(finalReading, state).some((option) => option.id === 'mutual')).toBe(
      true,
    );
    state = selectOption(finalReading, state, 'mutual');
    state = selectOption(finalReading, state, 'mutual-back');
    expect(state.flags).toContain('final_mutual_conversation');
  });

  it('offers accountability after admitting the opened letter', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    state = { ...state, flags: ['saw_envelope', 'iris_letter_breach_admitted'] };
    state = selectOption(finalReading, state, 'letter');
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'repair-trust'),
    ).toBe(true);
    state = selectOption(finalReading, state, 'repair-trust');
    state = selectOption(finalReading, state, 'repair-trust-back');
    expect(state.flags).toContain('final_accepted_consequences');
  });

  it('shows Miller callback only after separating facts from assumptions', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'miller-memory'),
    ).toBe(false);
    state = { ...state, flags: ['miller_observation_distinguished'] };
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'miller-memory'),
    ).toBe(true);
    state = selectOption(finalReading, state, 'miller-memory');
    state = selectOption(finalReading, state, 'miller-memory-back');
    expect(state.flags).toContain('final_miller_heard');
  });

  it('shows Leo callback only after his future plans', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(availableOptions(finalReading, state).some((option) => option.id === 'leo-memory')).toBe(
      false,
    );
    state = { ...state, flags: ['leo_shared_future_plan'] };
    expect(availableOptions(finalReading, state).some((option) => option.id === 'leo-memory')).toBe(
      true,
    );
    state = selectOption(finalReading, state, 'leo-memory');
    state = selectOption(finalReading, state, 'leo-memory-back');
    expect(state.flags).toContain('final_leo_heard');
  });

  it('shows Eleanor callback only after her shop memory', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'eleanor-memory'),
    ).toBe(false);
    state = { ...state, flags: ['eleanor_shared_shop_memory'] };
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'eleanor-memory'),
    ).toBe(true);
    state = selectOption(finalReading, state, 'eleanor-memory');
    state = selectOption(finalReading, state, 'eleanor-memory-back');
    expect(state.flags).toContain('final_eleanor_heard');
  });

  it('shows Mara callback only after her earlier reflection', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'mara-callback'),
    ).toBe(false);
    state = { ...state, flags: ['mara_day_four_reflected'] };
    expect(
      availableOptions(finalReading, state).some((option) => option.id === 'mara-callback'),
    ).toBe(true);
    state = selectOption(finalReading, state, 'mara-callback');
    state = selectOption(finalReading, state, 'mara-callback-back');
    expect(state.flags).toContain('final_mara_heard');
  });
});
