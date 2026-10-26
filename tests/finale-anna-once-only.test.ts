import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue, type DialogueState } from '../src/game/dialogue';

describe('Anna final book club', () => {
  it.each([
    ['anna-back', undefined, undefined],
    ['anna-maps', 'maps-back', 'anna_chose_maps'],
    ['anna-mystery', 'mystery-back', 'anna_chose_mystery'],
  ] as const)('finishes once via %s', (first, back, prerequisite) => {
    let state: DialogueState = selectOption(finalReading, startDialogue(finalReading), 'open');
    if (prerequisite) state = { ...state, flags: [prerequisite] };
    state = selectOption(finalReading, state, 'anna');
    state = selectOption(finalReading, state, first);
    if (back) state = selectOption(finalReading, state, back);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_anna_club_heard');
    expect(availableOptions(finalReading, state).some((option) => option.id === 'anna')).toBe(false);
    expect(() => selectOption(finalReading, state, 'anna')).toThrow();
  });
});
