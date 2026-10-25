import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

const reflections = [
  ['leo', 'leo_reflected_on_uncertainty'],
  ['iris', 'iris_reflected_on_identity'],
  ['anna', 'anna_reflected_on_care'],
  ['thomas', 'thomas_reflected_on_responsibility'],
  ['nora', 'nora_reflected_on_uncertainty'],
  ['eleanor', 'eleanor_reflected_on_legacy'],
] as const;

describe('Day five reflection payoffs', () => {
  it('preserves a valid finale graph', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it.each(reflections)('%s callback requires a previous personal conversation', (person, flag) => {
    let state = selectOption(finalReading, startDialogue(finalReading), 'open');
    expect(availableOptions(finalReading, state).some((option) => option.id === `${person}-reflection-callback`)).toBe(false);
    state = { ...state, flags: [flag] };
    expect(availableOptions(finalReading, state).some((option) => option.id === `${person}-reflection-callback`)).toBe(true);
    state = selectOption(finalReading, state, `${person}-reflection-callback`);
    state = selectOption(finalReading, state, `${person}-reflection-back`);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(`final_${person}_reflection_heard`);
    expect(availableOptions(finalReading, state).some((option) => option.id === `${person}-reflection-callback`)).toBe(false);
  });
});
