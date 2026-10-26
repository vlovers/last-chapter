import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

const callbacks = [
  ['mara-callback', 'mara-callback-back', 'mara_day_four_reflected', 'final_mara_heard'],
  ['eleanor-memory', 'eleanor-memory-back', 'eleanor_shared_shop_memory', 'final_eleanor_heard'],
  ['leo-memory', 'leo-memory-back', 'leo_shared_future_plan', 'final_leo_heard'],
  ['miller-memory', 'miller-memory-back', 'miller_observation_distinguished', 'final_miller_heard'],
] as const;

describe('Once-only finale memories', () => {
  it.each(callbacks)('%s is available once and remembers completion', (optionId, backId, prerequisite, completion) => {
    const morning = startDialogue(finalReading);
    const gathering = selectOption(finalReading, morning, 'open');
    expect(availableOptions(finalReading, gathering).some((option) => option.id === optionId)).toBe(false);
    let state = { ...gathering, flags: [prerequisite] as readonly string[] };
    expect(availableOptions(finalReading, state).some((option) => option.id === optionId)).toBe(true);
    state = selectOption(finalReading, state, optionId);
    state = selectOption(finalReading, state, backId);
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain(completion);
    expect(availableOptions(finalReading, state).some((option) => option.id === optionId)).toBe(false);
    const before = state;
    expect(() => selectOption(finalReading, before, optionId)).toThrow();
  });
});
