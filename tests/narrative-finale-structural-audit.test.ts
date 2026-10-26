import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { validateDialogue } from '../src/game/dialogue';

describe('Final evening structural audit', () => {
  const nodes = finalReading.nodes;
  const options = nodes.flatMap((node) => node.options.map((option) => ({ node: node.id, option })));

  it('has unique node IDs and option IDs', () => {
    const nodeIds = nodes.map((node) => node.id);
    const optionIds = options.map(({ option }) => option.id);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(new Set(optionIds).size).toBe(optionIds.length);
  });

  it('all choices point to existing nodes and the full dialogue validates', () => {
    const ids = new Set(nodes.map((node) => node.id));
    for (const { node, option } of options) {
      expect(ids.has(option.next), `${node} -> ${option.next}`).toBe(true);
    }
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it('one-shot gathering options have an achievable completion grant', () => {
    const gathering = nodes.find((node) => node.id === 'gathering');
    expect(gathering).toBeDefined();
    const allGranted = new Set(options.flatMap(({ option }) => option.grants ?? []));
    for (const option of gathering!.options) {
      for (const flag of option.unless ?? []) {
        if (!flag.startsWith('final_')) continue;
        expect(allGranted.has(flag), `${option.id}: completion flag ${flag} cannot be granted`).toBe(true);
      }
    }
  });

  it('the player can always choose to end the evening', () => {
    const gathering = nodes.find((node) => node.id === 'gathering');
    const close = gathering?.options.find((option) => option.next === 'end');
    expect(close).toBeDefined();
    expect(close?.requires ?? []).toHaveLength(0);
    expect(close?.unless ?? []).toHaveLength(0);
  });

  it('shared scenes have an unconditional path back to gathering', () => {
    const scenes = [
      ['final-couple-conversation', 'final_couple_conversation_heard'],
      ['final-couple-anna-thomas', 'final_anna_thomas_heard'],
      ['final-iris-eleanor', 'final_iris_eleanor_heard'],
    ] as const;
    for (const [entry, completion] of scenes) {
      const visited = new Set<string>();
      const queue = [entry];
      let completed = false;
      while (queue.length > 0) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        const node = nodes.find((candidate) => candidate.id === id);
        expect(node, `missing node ${id}`).toBeDefined();
        for (const option of node!.options) {
          if (option.next === 'gathering' && option.grants?.includes(completion)) completed = true;
          if (option.next !== 'gathering') queue.push(option.next);
        }
      }
      expect(completed, `${entry} has no completion path`).toBe(true);
    }
  });
});
