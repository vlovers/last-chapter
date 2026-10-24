import { describe, expect, it } from 'vitest';
import { stageStory, type ChapterStage } from '../src/game/chapter';
import { availableOptions, selectOption, startDialogue, validateDialogue, type DialogueState, type DialogueStory } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

const playable: readonly ChapterStage[] = [
  'miller', 'mara', 'evening', 'iris', 'anna', 'leo', 'eleanor',
  'thomas', 'nora', 'book-club', 'day4-iris', 'day4-mara',
  'day4-leo', 'day5-reading',
];

/** Explore every reachable dialogue state with all prerequisite flags available.
 * State includes the node and accumulated grants so loops terminate without losing choices.
 */
function walk(story: DialogueStory): { visited: Set<string>; endings: number } {
  const prerequisiteFlags = [...new Set(story.nodes.flatMap((node) => node.options.flatMap((option) => option.requires ?? [])))];
  const initial: DialogueState = { ...startDialogue(story), flags: prerequisiteFlags };
  const pending: DialogueState[] = [initial];
  const seen = new Set<string>();
  const visited = new Set<string>();
  let endings = 0;
  while (pending.length) {
    const state = pending.shift()!;
    const signature = state.node + '|' + [...state.flags].sort().join(',');
    if (seen.has(signature)) continue;
    seen.add(signature);
    visited.add(state.node);
    const options = availableOptions(story, state);
    if (!options.length) {
      endings += 1;
      continue;
    }
    for (const option of options) {
      const next = selectOption(story, state, option.id);
      pending.push({ ...next, history: [] });
    }
    expect(seen.size).toBeLessThan(10000);
  }
  return { visited, endings };
}

describe('Complete five-day dialogue audit', () => {
  for (const stage of playable) {
    it(stage + ' has no broken destinations and can reach an ending', () => {
      const story = stageStory(stage);
      expect(validateDialogue(story)).toEqual([]);
      const result = walk(story);
      expect(result.endings).toBeGreaterThan(0);
      expect(result.visited.has(story.start)).toBe(true);
    });
  }
  it('rejects corrupted save flags without losing valid old saves', () => {
    const original = { stage: 'miller' as const, dialogue: { ...startDialogue(stageStory('miller')), flags: ['rumor_heard'] }, flags: ['rumor_heard'] };
    expect(decodeSave(encodeSave(original))).toEqual(original);
    const malformed = JSON.parse(encodeSave(original)) as Record<string, unknown>;
    malformed.flags = ['rumor_heard', 'rumor_heard'];
    expect(decodeSave(JSON.stringify(malformed))).toBeNull();
    malformed.flags = [''];
    expect(decodeSave(JSON.stringify(malformed))).toBeNull();
  });
});
