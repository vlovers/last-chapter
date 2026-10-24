import { describe, expect, it } from 'vitest';
import { millerVisit } from '../src/content/first-day';
import { maraVisit } from '../src/content/mara';
import { firstEvening } from '../src/content/evening';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { leoVisit } from '../src/content/leo';
import { availableOptions, selectOption, startDialogue, validateDialogue, type DialogueStory } from '../src/game/dialogue';

/**
 * Explores reachable dialogue states including accumulated flags.
 * Loops are bounded by unique node+flag combinations, not dialogue history.
 */
function audit(story: DialogueStory, inheritedFlags: readonly string[] = []) {
  const initial = { ...startDialogue(story), flags: inheritedFlags };
  const queue = [initial];
  const seen = new Set<string>();
  const reached = new Set<string>();
  const endings = new Set<string>();
  while (queue.length) {
    const state = queue.shift()!;
    const key = state.node + ':' + [...state.flags].sort().join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    expect(seen.size).toBeLessThan(5000);
    reached.add(state.node);
    const node = story.nodes.find((entry) => entry.id === state.node)!;
    const options = availableOptions(story, state);
    if (!node.options.length) endings.add(state.node);
    else expect(options.length, 'No available options at ' + node.id).toBeGreaterThan(0);
    for (const option of options) queue.push(selectOption(story, state, option.id));
  }
  return { reached, endings };
}

describe('cross-day narrative integrity', () => {
  const stories = [millerVisit, maraVisit, firstEvening, irisVisit, annaVisit, leoVisit];
  it('has valid scene references and reachable endings', () => {
    for (const story of stories) {
      expect(validateDialogue(story)).toEqual([]);
      const { endings } = audit(story, ['rumor_heard', 'saw_envelope', 'mara_talked_about_leo']);
      expect(endings.size).toBeGreaterThan(0);
    }
  });
  it('allows every conversation to finish without private information', () => {
    for (const story of stories) {
      const { endings } = audit(story);
      expect(endings.size).toBeGreaterThan(0);
    }
  });
  it('does not reveal gated options without evidence', () => {
    for (const story of stories) {
      for (const node of story.nodes) {
        for (const option of node.options) {
          if (!option.requires?.length) continue;
          const state = { ...startDialogue(story), node: node.id, flags: [] };
          expect(availableOptions(story, state).some((entry) => entry.id === option.id)).toBe(false);
        }
      }
    }
  });
});
