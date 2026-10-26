import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, type DialogueState } from '../src/game/dialogue';

const gathering = finalReading.nodes.find((node) => node.id === 'gathering');
if (!gathering) throw new Error('Missing gathering');

/** Find a playable return path using actual flag and option conditions. */
function findReturn(
  initial: DialogueState,
  completionFlags: readonly string[],
): DialogueState | undefined {
  const queue = [initial];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const state = queue.shift()!;
    if (
      state.node === 'gathering' &&
      (completionFlags.length === 0 || completionFlags.some((flag) => state.flags.includes(flag)))
    )
      return state;
    const key = `${state.node}:${[...state.flags].sort().join(',')}`;
    if (visited.has(key)) continue;
    visited.add(key);
    for (const option of availableOptions(finalReading, state)) {
      queue.push(selectOption(finalReading, state, option.id));
    }
    if (visited.size > 2000) throw new Error('Finale scene search exceeded 2000 states');
  }
  return undefined;
}

describe('Every optional finale scene has a playable return route', () => {
  for (const entry of gathering.options) {
    if (entry.id === 'close') continue;
    it(`${entry.id} returns to the gathering and honors completion conditions`, () => {
      const initial: DialogueState = {
        node: 'gathering',
        flags: [...(entry.requires ?? [])],
        history: [],
      };
      const available = availableOptions(finalReading, initial);
      expect(available.some((option) => option.id === entry.id)).toBe(true);
      const entered = selectOption(finalReading, initial, entry.id);
      const returned = findReturn(entered, entry.unless ?? []);
      expect(returned, `No playable completed return path from ${entry.id}`).toBeDefined();
      expect(returned?.node).toBe('gathering');
      if (entry.unless?.length) {
        expect(
          availableOptions(finalReading, returned!).some((option) => option.id === entry.id),
          `Scene ${entry.id} can be repeated immediately after completion`,
        ).toBe(false);
      }
      expect(
        availableOptions(finalReading, returned!).some((option) => option.id === 'close'),
      ).toBe(true);
    });
  }
});
