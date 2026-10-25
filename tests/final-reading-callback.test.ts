import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

describe('Final reading callbacks', () => {
  it('has valid dialogue references', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it('shows Mara callback only after her earlier reflection', () => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(availableOptions(finalReading, state).some((option) => option.id === 'mara-callback')).toBe(false);
    state = { ...state, flags: ['mara_day_four_reflected'] };
    expect(availableOptions(finalReading, state).some((option) => option.id === 'mara-callback')).toBe(true);
    state = selectOption(finalReading, state, 'mara-callback');
    state = selectOption(finalReading, state, 'mara-callback-back');
    expect(state.flags).toContain('final_mara_heard');
  });
});
