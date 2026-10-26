import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, type DialogueState } from '../src/game/dialogue';

const decisions = [
  ['final_shared_table_consent', 'shared-table-consent'],
  ['final_shared_table_accountability', 'shared-table-accountability'],
  ['final_shared_table_uncertainty', 'shared-table-uncertainty'],
] as const;

describe('Final evening shared-table decision', () => {
  for (const [flag, option] of decisions) {
    it(`selecting ${option} produces its own narrative consequence`, () => {
      const initial: DialogueState = { node: 'shared-table', flags: [], history: [] };
      const selected = selectOption(finalReading, initial, option);
      expect(selected.node).toBe('shared-table-answer');
      expect(selected.flags).toContain(flag);
      const variant = finalReading.nodes.find((node) => node.id === 'shared-table-answer')
        ?.textWhen?.find((entry) => entry.requires.includes(flag));
      expect(variant).toBeDefined();
      expect(currentNode(finalReading, selected).text).toBe(variant?.text);
      const returned = selectOption(finalReading, selected, 'shared-table-return');
      expect(returned.flags).toContain('final_shared_table_heard');
      expect(availableOptions(finalReading, returned).some((entry) => entry.id === 'shared-table')).toBe(false);
    });
  }

  it('does not allow the player to replay the shared-table discussion after completion', () => {
    const state: DialogueState = {
      node: 'gathering',
      flags: ['final_shared_table_heard'],
      history: ['shared-table-consent', 'shared-table-return'],
    };
    expect(availableOptions(finalReading, state).some((entry) => entry.next === 'shared-table')).toBe(false);
  });
});
