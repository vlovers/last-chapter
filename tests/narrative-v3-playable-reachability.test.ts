import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { annaVisit } from '../src/content/anna';
import { thomasVisit } from '../src/content/thomas';
import { noraVisit } from '../src/content/nora';
import { eleanorVisit } from '../src/content/eleanor';
import { availableOptions, selectOption, startDialogue, type DialogueState, type DialogueStory } from '../src/game/dialogue';

const cases: readonly [string, DialogueStory, string][] = [
  ['Mara', maraVisit, 'mara_own_morning_heard'],
  ['Leo', leoVisit, 'leo_honesty_discussed'],
  ['Iris', irisVisit, 'iris_art_boundaries_discussed'],
  ['Anna', annaVisit, 'anna_uncertainty_discussed'],
  ['Thomas', thomasVisit, 'thomas_listening_discussed'],
  ['Nora', noraVisit, 'nora_archive_ethics_discussed'],
  ['Eleanor', eleanorVisit, 'eleanor_change_discussed'],
];

/** Search actual playable options rather than merely scanning source grants. */
function shortestPathToFlag(story: DialogueStory, target: string): string[] | undefined {
  const queue: { state: DialogueState; path: string[] }[] = [
    { state: startDialogue(story), path: [] },
  ];
  const visited = new Set<string>();
  let cursor = 0;
  while (cursor < queue.length) {
    const current = queue[cursor++]!;
    if (current.state.flags.includes(target)) return current.path;
    const key = `${current.state.node}:${[...current.state.flags].sort().join(',')}`;
    if (visited.has(key)) continue;
    visited.add(key);
    for (const option of availableOptions(story, current.state)) {
      const next = selectOption(story, current.state, option.id);
      queue.push({ state: next, path: [...current.path, option.id] });
    }
    if (visited.size > 15000) throw new Error(`Excessive narrative state space for ${target}`);
  }
  return undefined;
}

describe('Character finale prerequisites are reachable through actual player choices', () => {
  for (const [name, story, flag] of cases) {
    it(`${name} can earn ${flag} from a fresh dialogue`, () => {
      const path = shortestPathToFlag(story, flag);
      expect(path, `No playable route to ${flag}`).toBeDefined();
      expect(path!.length).toBeGreaterThan(0);
    });
  }
});
