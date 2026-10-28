import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, type DialogueState } from '../src/game/dialogue';

describe('Finale conditional narration integrity', () => {
  it('has no duplicate conditional requirements within a node', () => {
    for (const node of finalReading.nodes) {
      const signatures = (node.textWhen ?? []).map((variant) =>
        [...variant.requires].sort().join('|'),
      );
      expect(new Set(signatures).size, `duplicate requirements in ${node.id}`).toBe(
        signatures.length,
      );
    }
  });

  it('uses the joint Mara and Leo perspective only when both prerequisites are met', () => {
    const node = finalReading.nodes.find((entry) => entry.id === 'letter');
    expect(node).toBeDefined();
    const both = ['leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'];
    const match = node!.textWhen?.find(
      (entry) =>
        entry.requires.length === both.length &&
        both.every((flag) => entry.requires.includes(flag)),
    );
    expect(match).toBeDefined();
    const state: DialogueState = { node: 'letter', flags: both, history: [] };
    expect(currentNode(finalReading, state).text).toBe(match?.text);
    for (const single of both) {
      expect(currentNode(finalReading, { ...state, flags: [single] }).text).not.toBe(match?.text);
    }
  });
});
