import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue } from '../src/game/dialogue';

const scenarios = [
  {
    title: 'after-case tea',
    entry: 'after-case-tea',
    flags: ['final_case_closure_complete'],
    groups: [
      {
        id: 'after-tea-help-group',
        node: 'after-case-tea-help',
        choices: ['after-tea-nora', 'after-tea-anna-new', 'after-tea-miller-new'],
      },
      {
        id: 'after-tea-talk-group',
        node: 'after-case-tea-talk',
        choices: ['after-tea-mara', 'after-tea-leo-new', 'after-tea-eleanor-new'],
      },
      {
        id: 'after-tea-corner-group',
        node: 'after-case-tea-corner',
        choices: ['after-tea-frank', 'after-tea-iris-new'],
      },
    ],
    direct: 'after-tea-quiet',
  },
  {
    title: 'bookshop tomorrow',
    entry: 'bookshop-tomorrow',
    flags: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
    groups: [
      {
        id: 'tomorrow-books-group',
        node: 'bookshop-tomorrow-books',
        choices: ['tomorrow-shelf', 'tomorrow-cards', 'tomorrow-window-new'],
      },
      {
        id: 'tomorrow-neighbors-group',
        node: 'bookshop-tomorrow-neighbors',
        choices: ['tomorrow-miller-new', 'tomorrow-iris-new', 'tomorrow-neighbors-new'],
      },
      {
        id: 'tomorrow-room-group',
        node: 'bookshop-tomorrow-room',
        choices: ['tomorrow-tea', 'tomorrow-frank-new'],
      },
    ],
    direct: 'tomorrow-later',
  },
] as const;

describe('Compact finale hubs preserve every original optional route', () => {
  for (const scenario of scenarios) {
    it(`${scenario.title}: exposes four choices and returns without consuming the group`, () => {
      const gathering = {
        ...startDialogue(finalReading),
        node: 'gathering',
        flags: [...scenario.flags],
      };
      const hub = selectOption(finalReading, gathering, scenario.entry);
      const rootChoices = availableOptions(finalReading, hub).map((option) => option.id);
      expect(rootChoices).toEqual([...scenario.groups.map((group) => group.id), scenario.direct]);
      expect(rootChoices).toHaveLength(4);

      for (const group of scenario.groups) {
        const entered = selectOption(finalReading, hub, group.id);
        expect(entered.node).toBe(group.node);
        const options = availableOptions(finalReading, entered);
        expect(options.length).toBeLessThanOrEqual(4);
        expect(options.map((option) => option.id)).toEqual(
          expect.arrayContaining([...group.choices]),
        );
        const back = options.find((option) => option.next === scenario.entry);
        expect(back?.suspend).toBe(true);
        expect(back?.repeatability).toBe('repeatable');

        const returned = selectOption(finalReading, entered, back!.id);
        expect(returned.node).toBe(scenario.entry);
        expect(returned.flags).toEqual(hub.flags);
        expect(availableOptions(finalReading, returned).map((option) => option.id)).toContain(
          group.id,
        );
        // Every original choice is still playable, not merely present in metadata.
        for (const choice of group.choices) {
          const fresh = selectOption(finalReading, hub, group.id);
          const next = selectOption(finalReading, fresh, choice);
          expect(next.node).not.toBe(group.node);
        }
      }
    });
  }
});
