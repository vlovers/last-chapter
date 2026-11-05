import { describe, expect, it } from 'vitest';
import type { DialogueStory } from './dialogue';
import { validateDialogue } from './dialogue';
import { analyzeDialogueReachability } from './dialogue-reachability';
import { millerVisit } from '../content/first-day';
import { maraVisit } from '../content/mara';
import { irisVisit } from '../content/iris';
import { annaVisit } from '../content/anna';
import { leoVisit } from '../content/leo';
import { thomasVisit } from '../content/thomas';
import { eleanorVisit } from '../content/eleanor';
import { bookClub } from '../content/book-club';
import { irisDecision } from '../content/day-four-iris';
import { maraDecision } from '../content/day-four-mara';
import { leoDecision } from '../content/day-four-leo';
import { finalReading } from '../content/day-five';
import { noraVisit } from '../content/nora';
import { firstEvening } from '../content/evening';
import { quietEvening } from '../content/quiet-evening';

const stories: readonly [string, DialogueStory][] = [
  ['day1/miller', millerVisit],
  ['day1/mara', maraVisit],
  ['day1/evening', firstEvening],
  ['day2/iris', irisVisit],
  ['day2/anna', annaVisit],
  ['day2/leo', leoVisit],
  ['day3/eleanor', eleanorVisit],
  ['day3/thomas', thomasVisit],
  ['day3/book-club', bookClub],
  ['day3/nora', noraVisit],
  ['day3/quiet-evening', quietEvening],
  ['day4/iris', irisDecision],
  ['day4/mara', maraDecision],
  ['day4/leo', leoDecision],
  ['day5/final-reading', finalReading],
];

describe('five-day narrative audit', () => {
  it('prints a reproducible per-story flag-feasibility inventory', () => {
    const inventory = stories.map(([name, story]) => {
      const report = analyzeDialogueReachability(story, [], 10000);
      return {
        story: name,
        nodes: story.nodes.length,
        exploredStates: report.exploredStates,
        reachableNodes: report.reachableNodes.length,
        potentiallyExternalOrUnreachableNodes: report.unreachableNodes.length,
        potentiallyExternalOrUnreachableEdges: report.unreachableEdges.length,
        impossibleEdges: report.impossibleEdges.length,
        truncated: report.truncated,
        missingLocalPrerequisites: [...new Set(story.nodes.flatMap((node) =>
          node.options.flatMap((option) => option.requires ?? []),
        ))].filter((flag) => !story.nodes.some((node) =>
          node.options.some((option) => (option.grants ?? []).includes(flag)),
        )),
      };
    });
    // Missing local prerequisites are not necessarily errors: flags may be granted in other stories.
    console.info('Narrative flag-feasibility inventory:', JSON.stringify(inventory, null, 2));
    expect(inventory).toHaveLength(stories.length);
    expect(inventory.every((item) => item.exploredStates !== 0)).toBe(true);
  });

  it.each(stories)('%s has structurally valid dialogue', (_name, story) => {
    expect(validateDialogue(story)).toEqual([]);
  });

  it.each(stories)('%s has no contradictory choice gates', (_name, story) => {
    const result = analyzeDialogueReachability(story, [], 10000);
    expect(result.impossibleEdges).toEqual([]);
  });

  it.each(stories)('%s has valid witness routes for locally reachable nodes', (_name, story) => {
    const report = analyzeDialogueReachability(story, [], 10000);
    const nodes = new Map(story.nodes.map((node) => [node.id, node]));
    for (const id of report.reachableNodes) {
      let current = story.start;
      const flags = new Set<string>();
      for (const choiceId of report.witnessPaths[id] ?? []) {
        const node = nodes.get(current);
        const option = node?.options.find((item) => item.id === choiceId);
        expect(option, `Missing choice ${current}/${choiceId}`).toBeDefined();
        expect((option?.requires ?? []).every((flag) => flags.has(flag))).toBe(true);
        expect((option?.unless ?? []).some((flag) => flags.has(flag))).toBe(false);
        for (const flag of option?.grants ?? []) flags.add(flag);
        current = option!.next;
      }
      expect(current).toBe(id);
    }
  });

  it.each(stories)('%s can enter its opening scene', (_name, story) => {
    const result = analyzeDialogueReachability(story, [], 10000);
    expect(result.reachableNodes).toContain(story.start);
    expect(result.witnessPaths[story.start]).toEqual([]);
  });
});
