import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';

const payoffs = [
  ['iris', 'iris_day_four_boundary_heard', 'iris_day_four_respected_freedom', 'iris_day_four_supported_belonging'],
  ['mara', 'mara_day_four_own_story_heard', 'mara_day_four_chose_own_time', 'mara_day_four_named_own_needs'],
  ['leo', 'leo_day_four_future_heard', 'leo_day_four_chose_honesty', 'leo_day_four_respected_privacy'],
] as const;

describe('Day four decisions return in the finale', () => {
  it('keeps the complete finale graph valid', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it.each(payoffs)('%s callback appears only after its day-four scene', (person, completion, first, second) => {
    const initial = selectOption(finalReading, startDialogue(finalReading), 'open');
    const optionId = `day-four-${person}-callback`;
    expect(availableOptions(finalReading, initial).some((item) => item.id === optionId)).toBe(false);
    const texts: string[] = [];
    for (const decision of [first, second]) {
      let state = { ...initial, flags: [completion, decision] };
      expect(availableOptions(finalReading, state).some((item) => item.id === optionId)).toBe(true);
      state = selectOption(finalReading, state, optionId);
      texts.push(currentNode(finalReading, state).text);
      state = selectOption(finalReading, state, `day-four-${person}-back`);
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(`final_day_four_${person}_heard`);
      expect(availableOptions(finalReading, state).some((item) => item.id === optionId)).toBe(false);
    }
    expect(texts[0]).not.toBe(texts[1]);
  });
});
