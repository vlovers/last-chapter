import { describe, expect, it } from 'vitest';
import type { DialogueStory } from './dialogue';
import { availableOptions, currentNode, selectOption, startDialogue, validateDialogue } from './dialogue';
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
      const witnessReplayFailures: { node: string; atChoice: string }[] = [];
      let witnessReplaySkippedLongPaths = 0;
      let witnessReplayVerifiedNodes = 0;
      for (const nodeId of report.reachableNodes.slice(0, 200)) {
        const path = report.witnessPaths[nodeId] ?? [];
        if (path.length > 60) {
          witnessReplaySkippedLongPaths++;
          continue;
        }
        let state = startDialogue(story);
        let failed = false;
        for (const choiceId of path) {
          if (!availableOptions(story, state).some((option) => option.id === choiceId)) {
            witnessReplayFailures.push({ node: nodeId, atChoice: choiceId });
            failed = true;
            break;
          }
          state = selectOption(story, state, choiceId);
        }
        if (!failed && state.node !== nodeId) {
          witnessReplayFailures.push({ node: nodeId, atChoice: '(destination mismatch)' });
        } else if (!failed) {
          witnessReplayVerifiedNodes++;
        }
      }
      return {
        story: name,
        nodes: story.nodes.length,
        exploredStates: report.exploredStates,
        reachableNodes: report.reachableNodes.length,
        potentiallyExternalOrUnreachableNodes: report.unreachableNodes.length,
        potentiallyExternalOrUnreachableEdges: report.unreachableEdges.length,
        impossibleEdges: report.impossibleEdges.length,
        truncated: report.truncated,
        witnessReplayFailures,
        witnessReplaySampledNodes: Math.min(report.reachableNodes.length, 200),
        witnessReplayVerifiedNodes,
        witnessReplaySkippedLongPaths,
        missingLocalPrerequisites: report.potentiallyExternalFlags,
      };
    });
    // Missing local prerequisites are not necessarily errors: flags may be granted in other stories.
    console.info('Narrative flag-feasibility inventory:', JSON.stringify(inventory, null, 2));
    expect(inventory).toHaveLength(stories.length);
    expect(inventory.every((item) => item.exploredStates !== 0)).toBe(true);
  });

  it('Mara remembers which of the three books was chosen', () => {
    const book = maraDecision.nodes.find((node) => node.id === 'book');
    const variants = book?.textWhen?.filter((entry) =>
      ['sold_station', 'sold_roads', 'sold_letters'].some((flag) => entry.requires.includes(flag)),
    ) ?? [];
    expect(variants).toHaveLength(3);
    expect(new Set(variants.map((entry) => entry.text)).size).toBe(3);
  });


  it('renders a different Mara gift memory for each saved book choice', () => {
    const flags = ['sold_station', 'sold_roads', 'sold_letters'] as const;
    const rendered = flags.map((flag) =>
      currentNode(maraDecision, {
        ...startDialogue(maraDecision),
        node: 'book',
        flags: [flag],
      }).text,
    );
    expect(new Set(rendered).size).toBe(flags.length);
    expect(rendered.every((text) => text.trim().length > 40)).toBe(true);
  });

  it('keeps Iris letter choices gated behind discovering the envelope', () => {
    const welcome = irisDecision.nodes.find((node) => node.id === 'welcome');
    const letterChoices = welcome?.options.filter((option) =>
      ['letter', 'iris-letter-feeling', 'iris-letter-ask'].includes(option.id),
    ) ?? [];
    expect(letterChoices).toHaveLength(3);
    for (const option of letterChoices) {
      expect(option.requires).toContain('saw_envelope');
    }
  });

  it('does not permit repeated pressure after Iris or Leo sets a boundary', () => {
    const irisWelcome = irisDecision.nodes.find((node) => node.id === 'welcome');
    const leoWelcome = leoDecision.nodes.find((node) => node.id === 'welcome');
    expect(irisWelcome?.options.find((option) => option.id === 'letter')?.unless)
      .toContain('iris_letter_pressured_day4');
    expect(leoWelcome?.options.find((option) => option.id === 'letter')?.unless)
      .toContain('leo_letter_pressured_day4');
  });

  it('requires actual timeline evidence before Leo discusses the booking', () => {
    const welcome = leoDecision.nodes.find((node) => node.id === 'welcome');
    expect(welcome?.options.find((option) => option.id === 'evidence')?.requires)
      .toContain('eleanor_timeline_checked');
  });

  it('keeps all three Mara gift callbacks specific to their book', () => {
    const book = maraDecision.nodes.find((node) => node.id === 'book');
    for (const flag of ['sold_station', 'sold_roads', 'sold_letters']) {
      const variant = book?.textWhen?.find((entry) => entry.requires.includes(flag));
      expect(variant, flag).toBeDefined();
      expect(variant?.text.trim().length).toBeGreaterThan(40);
    }
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
