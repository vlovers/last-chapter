import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';

describe('Optional fifth-day ensemble debate', () => {
  it.each([
    ['shared-table-consent', 'final_shared_table_consent', 'не зараз'],
    ['shared-table-accountability', 'final_shared_table_accountability', 'помилилася'],
    ['shared-table-uncertainty', 'final_shared_table_uncertainty', 'прогалини'],
  ])('preserves distinct consequence for %s', (choice, flag, fragment) => {
    const start = startDialogue(finalReading);
    const gathering = selectOption(finalReading, start, 'open');
    const debate = selectOption(finalReading, gathering, 'shared-table');
    const answer = selectOption(finalReading, debate, choice);
    expect(answer.flags).toContain(flag);
    expect(currentNode(finalReading, answer).text).toContain(fragment);
    const returned = selectOption(finalReading, answer, 'shared-table-return');
    expect(returned.flags).toContain('final_shared_table_heard');
    expect(
      availableOptions(finalReading, returned).some((option) => option.id === 'shared-table'),
    ).toBe(false);
    expect(availableOptions(finalReading, returned).some((option) => option.id === 'close')).toBe(
      true,
    );
  });
});
